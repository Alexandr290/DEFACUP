"use client";

import { create } from "zustand";
import { advanceKnockout, seedKnockoutFromGroups } from "../bracket";
import { computeStandings } from "../standings";
import {
  deleteLocalBundle,
  getLocalBundle,
  listLocalTournaments,
  saveLocalBundle,
} from "./local";
import { createClient, isSupabaseConfigured } from "../supabase/client";
import {
  balanceByPots,
  createTournamentFromTemplate,
  regenerateGroupFixtures,
  shuffleIntoGroups,
} from "../templates";
import type {
  Match,
  Team,
  Tournament,
  TournamentBundle,
  TournamentSettings,
} from "../types";
import { shortCodeFromName, uid } from "../utils";

interface TournamentStore {
  list: Tournament[];
  current: TournamentBundle | null;
  whatIf: Record<string, { home: number; away: number }>;
  whatIfEnabled: boolean;
  loading: boolean;
  userId: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  refreshList: () => Promise<void>;
  loadBySlug: (slug: string) => Promise<TournamentBundle | null>;
  create: (opts: {
    name: string;
    seasonLabel: string;
    templateId: string;
    groupCount?: number;
    teamsPerGroup?: number;
    seedSampleTeams?: boolean;
  }) => Promise<TournamentBundle>;
  save: (bundle?: TournamentBundle) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setCurrent: (bundle: TournamentBundle | null) => void;
  updateTournament: (patch: Partial<Tournament>) => void;
  updateSettings: (patch: Partial<TournamentSettings>) => void;
  addTeam: (partial?: Partial<Team>) => void;
  updateTeam: (id: string, patch: Partial<Team>) => void;
  removeTeam: (id: string) => void;
  bulkImportTeams: (
    rows: Array<{ name: string; short_code: string; crest_color: string }>
  ) => void;
  setGroupTeams: (groupTeams: TournamentBundle["groupTeams"]) => void;
  drawGroups: (mode: "shuffle" | "pots") => void;
  regenerateFixtures: () => void;
  updateMatch: (id: string, patch: Partial<Match>) => void;
  setWhatIf: (enabled: boolean) => void;
  setWhatIfScore: (
    matchId: string,
    scores: { home: number; away: number } | null
  ) => void;
  seedKnockout: () => void;
  advanceBracket: () => void;
  duplicate: (id: string) => Promise<TournamentBundle | null>;
}

async function syncBundleToSupabase(bundle: TournamentBundle) {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const t = { ...bundle.tournament, owner_id: user.id };
  const { error } = await supabase.from("tournaments").upsert({
    id: t.id,
    owner_id: t.owner_id,
    name: t.name,
    slug: t.slug,
    season_label: t.season_label,
    status: t.status,
    visibility: t.visibility,
    logo_url: t.logo_url,
    template_id: t.template_id,
    settings: t.settings,
    created_at: t.created_at,
    updated_at: t.updated_at,
  });
  if (error) {
    console.warn("Supabase tournament upsert:", error.message);
    return;
  }

  // Replace children for simplicity
  await supabase.from("matches").delete().eq("tournament_id", t.id);
  await supabase.from("bracket_slots").delete().eq("tournament_id", t.id);
  await supabase.from("group_teams").delete().in(
    "group_id",
    bundle.groups.map((g) => g.id)
  );
  await supabase.from("teams").delete().eq("tournament_id", t.id);
  await supabase.from("groups").delete().eq("tournament_id", t.id);

  if (bundle.teams.length)
    await supabase.from("teams").insert(bundle.teams);
  if (bundle.groups.length)
    await supabase.from("groups").insert(bundle.groups);
  if (bundle.groupTeams.length)
    await supabase.from("group_teams").insert(bundle.groupTeams);
  if (bundle.matches.length)
    await supabase.from("matches").insert(bundle.matches);
  if (bundle.bracketSlots.length)
    await supabase.from("bracket_slots").insert(bundle.bracketSlots);
}

async function fetchBundleFromSupabase(
  slug: string
): Promise<TournamentBundle | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!tournament) return null;

  const tid = tournament.id as string;
  const [teams, groups, matches, slots] = await Promise.all([
    supabase.from("teams").select("*").eq("tournament_id", tid),
    supabase.from("groups").select("*").eq("tournament_id", tid),
    supabase.from("matches").select("*").eq("tournament_id", tid),
    supabase.from("bracket_slots").select("*").eq("tournament_id", tid),
  ]);

  const groupIds = (groups.data ?? []).map((g) => g.id);
  const { data: groupTeams } = groupIds.length
    ? await supabase.from("group_teams").select("*").in("group_id", groupIds)
    : { data: [] };

  return {
    tournament: {
      ...tournament,
      settings: tournament.settings,
    } as Tournament,
    teams: (teams.data ?? []) as Team[],
    groups: (groups.data ?? []) as TournamentBundle["groups"],
    groupTeams: (groupTeams ?? []) as TournamentBundle["groupTeams"],
    matches: (matches.data ?? []) as Match[],
    bracketSlots: (slots.data ?? []) as TournamentBundle["bracketSlots"],
  };
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  list: [],
  current: null,
  whatIf: {},
  whatIfEnabled: false,
  loading: false,
  userId: null,
  hydrated: false,

  hydrate: async () => {
    let userId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        userId = data.user?.id ?? null;
      } catch {
        /* local mode */
      }
    }
    set({ userId, hydrated: true });
    await get().refreshList();
  },

  refreshList: async () => {
    const local = listLocalTournaments();
    let cloud: Tournament[] = [];
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("tournaments")
          .select("*")
          .order("updated_at", { ascending: false });
        cloud = (data ?? []) as Tournament[];
      } catch {
        /* ignore */
      }
    }
    const map = new Map<string, Tournament>();
    [...cloud, ...local].forEach((t) => map.set(t.id, t));
    set({
      list: [...map.values()].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
    });
  },

  loadBySlug: async (slug) => {
    set({ loading: true });
    let bundle = getLocalBundle(slug);
    if (!bundle) {
      bundle = await fetchBundleFromSupabase(slug);
      if (bundle) saveLocalBundle(bundle);
    }
    set({ current: bundle, loading: false, whatIf: {}, whatIfEnabled: false });
    return bundle;
  },

  create: async (opts) => {
    const bundle = createTournamentFromTemplate({
      ...opts,
      ownerId: get().userId,
    });
    saveLocalBundle(bundle);
    await syncBundleToSupabase(bundle);
    set({ current: bundle });
    await get().refreshList();
    return bundle;
  },

  save: async (bundle) => {
    const b = bundle ?? get().current;
    if (!b) return;
    saveLocalBundle(b);
    set({ current: { ...b, tournament: { ...b.tournament, updated_at: new Date().toISOString() } } });
    await syncBundleToSupabase(b);
    await get().refreshList();
  },

  remove: async (id) => {
    deleteLocalBundle(id);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("tournaments").delete().eq("id", id);
      } catch {
        /* ignore */
      }
    }
    if (get().current?.tournament.id === id) set({ current: null });
    await get().refreshList();
  },

  setCurrent: (bundle) => set({ current: bundle }),

  updateTournament: (patch) => {
    const cur = get().current;
    if (!cur) return;
    const next = {
      ...cur,
      tournament: { ...cur.tournament, ...patch },
    };
    set({ current: next });
    saveLocalBundle(next);
  },

  updateSettings: (patch) => {
    const cur = get().current;
    if (!cur) return;
    const next = {
      ...cur,
      tournament: {
        ...cur.tournament,
        settings: { ...cur.tournament.settings, ...patch },
      },
    };
    set({ current: next });
    saveLocalBundle(next);
  },

  addTeam: (partial) => {
    const cur = get().current;
    if (!cur) return;
    const name = partial?.name ?? `Team ${cur.teams.length + 1}`;
    const team: Team = {
      id: uid(),
      tournament_id: cur.tournament.id,
      name,
      short_code: partial?.short_code ?? shortCodeFromName(name),
      crest_color: partial?.crest_color ?? "#14a85c",
      crest_url: partial?.crest_url ?? null,
      fair_play: partial?.fair_play ?? 0,
      pot: partial?.pot ?? null,
    };
    const next = { ...cur, teams: [...cur.teams, team] };
    set({ current: next });
    saveLocalBundle(next);
  },

  updateTeam: (id, patch) => {
    const cur = get().current;
    if (!cur) return;
    const next = {
      ...cur,
      teams: cur.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    };
    set({ current: next });
    saveLocalBundle(next);
  },

  removeTeam: (id) => {
    const cur = get().current;
    if (!cur) return;
    const next: TournamentBundle = {
      ...cur,
      teams: cur.teams.filter((t) => t.id !== id),
      groupTeams: cur.groupTeams.filter((gt) => gt.team_id !== id),
      matches: cur.matches.map((m) => ({
        ...m,
        home_team_id: m.home_team_id === id ? null : m.home_team_id,
        away_team_id: m.away_team_id === id ? null : m.away_team_id,
      })),
    };
    set({ current: next });
    saveLocalBundle(next);
  },

  bulkImportTeams: (rows) => {
    const cur = get().current;
    if (!cur) return;
    const teams: Team[] = rows.map((r) => ({
      id: uid(),
      tournament_id: cur.tournament.id,
      name: r.name,
      short_code: r.short_code.slice(0, 3).toUpperCase(),
      crest_color: r.crest_color || "#14a85c",
      crest_url: null,
      fair_play: 0,
      pot: null,
    }));
    const next = { ...cur, teams: [...cur.teams, ...teams] };
    set({ current: next });
    saveLocalBundle(next);
  },

  setGroupTeams: (groupTeams) => {
    const cur = get().current;
    if (!cur) return;
    const next = { ...cur, groupTeams };
    set({ current: next });
    saveLocalBundle(next);
  },

  drawGroups: (mode) => {
    const cur = get().current;
    if (!cur) return;
    const groupTeams =
      mode === "pots"
        ? balanceByPots(cur.teams, cur.groups)
        : shuffleIntoGroups(cur.teams, cur.groups);
    const withGroups = { ...cur, groupTeams };
    const matches = regenerateGroupFixtures(withGroups);
    const next = { ...withGroups, matches };
    set({ current: next });
    saveLocalBundle(next);
  },

  regenerateFixtures: () => {
    const cur = get().current;
    if (!cur) return;
    const matches = regenerateGroupFixtures(cur);
    const next = { ...cur, matches };
    set({ current: next });
    saveLocalBundle(next);
  },

  updateMatch: (id, patch) => {
    const cur = get().current;
    if (!cur) return;
    let matches = cur.matches.map((m) =>
      m.id === id ? { ...m, ...patch } : m
    );
    matches = advanceKnockout(matches);
    const next = { ...cur, matches };
    set({ current: next });
    saveLocalBundle(next);
  },

  setWhatIf: (enabled) => set({ whatIfEnabled: enabled, whatIf: enabled ? get().whatIf : {} }),

  setWhatIfScore: (matchId, scores) => {
    const whatIf = { ...get().whatIf };
    if (!scores) delete whatIf[matchId];
    else whatIf[matchId] = scores;
    set({ whatIf });
  },

  seedKnockout: () => {
    const cur = get().current;
    if (!cur) return;
    const standingsMap = new Map(
      cur.groups.map((g) => {
        const teamIds = cur.groupTeams
          .filter((gt) => gt.group_id === g.id)
          .map((gt) => gt.team_id);
        const groupMatches = cur.matches.filter(
          (m) => m.stage === "group" && m.group_id === g.id
        );
        return [
          g.id,
          computeStandings(
            teamIds,
            groupMatches,
            cur.teams,
            cur.tournament.settings
          ),
        ] as const;
      })
    );
    let matches = seedKnockoutFromGroups(cur, standingsMap);
    matches = advanceKnockout(matches);
    const next = {
      ...cur,
      matches,
      tournament: { ...cur.tournament, status: "knockout" as const },
    };
    set({ current: next });
    saveLocalBundle(next);
  },

  advanceBracket: () => {
    const cur = get().current;
    if (!cur) return;
    const matches = advanceKnockout(cur.matches);
    const next = { ...cur, matches };
    set({ current: next });
    saveLocalBundle(next);
  },

  duplicate: async (id) => {
    const src = getLocalBundle(id);
    if (!src) return null;
    const newId = uid();
    const idMap = new Map<string, string>();
    idMap.set(src.tournament.id, newId);
    src.teams.forEach((t) => idMap.set(t.id, uid()));
    src.groups.forEach((g) => idMap.set(g.id, uid()));
    src.matches.forEach((m) => idMap.set(m.id, uid()));
    src.bracketSlots.forEach((s) => idMap.set(s.id, uid()));

    const remap = (x: string | null) => (x ? idMap.get(x) ?? x : null);
    const bundle: TournamentBundle = {
      tournament: {
        ...src.tournament,
        id: newId,
        name: `${src.tournament.name} (copy)`,
        slug: `${src.tournament.slug}-copy-${newId.slice(0, 4)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: get().userId,
      },
      teams: src.teams.map((t) => ({
        ...t,
        id: idMap.get(t.id)!,
        tournament_id: newId,
      })),
      groups: src.groups.map((g) => ({
        ...g,
        id: idMap.get(g.id)!,
        tournament_id: newId,
      })),
      groupTeams: src.groupTeams.map((gt) => ({
        group_id: idMap.get(gt.group_id)!,
        team_id: idMap.get(gt.team_id)!,
      })),
      matches: src.matches.map((m) => ({
        ...m,
        id: idMap.get(m.id)!,
        tournament_id: newId,
        group_id: remap(m.group_id),
        home_team_id: remap(m.home_team_id),
        away_team_id: remap(m.away_team_id),
      })),
      bracketSlots: src.bracketSlots.map((s) => ({
        ...s,
        id: idMap.get(s.id)!,
        tournament_id: newId,
      })),
    };
    saveLocalBundle(bundle);
    await syncBundleToSupabase(bundle);
    await get().refreshList();
    return bundle;
  },
}));
