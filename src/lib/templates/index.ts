import {
  EURO24_PAIRINGS,
  WC32_PAIRINGS,
  buildBracketSlots,
  type BracketPairing,
} from "../bracket";
import { WORLD_NATIONS, EURO_NATIONS, type SampleTeam } from "../sample-teams";
import {
  DEFAULT_SETTINGS,
  type Group,
  type GroupTeam,
  type Match,
  type Team,
  type Tournament,
  type TournamentBundle,
  type TournamentSettings,
} from "../types";
import { groupLetter, slugify, uid } from "../utils";

export interface TournamentTemplate {
  id: string;
  name: string;
  description: string;
  groupCount: number;
  teamsPerGroup: number;
  settings: Partial<TournamentSettings>;
  pairings: BracketPairing[];
  sampleTeams: SampleTeam[];
  badge: string;
}

function roundRobinPairs(n: number): Array<[number, number]>[] {
  // Circle method for even n; for odd add bye
  const teams = Array.from({ length: n }, (_, i) => i);
  const isOdd = n % 2 === 1;
  if (isOdd) teams.push(-1);
  const total = teams.length;
  const rounds: Array<[number, number]>[] = [];
  const arr = [...teams];

  for (let r = 0; r < total - 1; r++) {
    const pairs: Array<[number, number]> = [];
    for (let i = 0; i < total / 2; i++) {
      const a = arr[i];
      const b = arr[total - 1 - i];
      if (a !== -1 && b !== -1) {
        pairs.push(r % 2 === 0 ? [a, b] : [b, a]);
      }
    }
    rounds.push(pairs);
    // rotate
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }
  return rounds;
}

export const TEMPLATES: TournamentTemplate[] = [
  {
    id: "wc32",
    name: "World Cup 32",
    description: "8 groups of 4 · Round of 16 knockout · Classic FIFA format",
    groupCount: 8,
    teamsPerGroup: 4,
    settings: {
      qualify_count: 2,
      best_thirds_count: 0,
      allow_third_place: true,
    },
    pairings: WC32_PAIRINGS,
    sampleTeams: WORLD_NATIONS.slice(0, 32),
    badge: "WC",
  },
  {
    id: "wc48",
    name: "World Cup 48",
    description: "12 groups of 4 · 32 advance · Expanded modern format",
    groupCount: 12,
    teamsPerGroup: 4,
    settings: {
      qualify_count: 2,
      best_thirds_count: 8,
      allow_third_place: true,
    },
    pairings: [
      ...WC32_PAIRINGS,
      // Simplified R32-style pairings for demo (top 32 of 48)
      { home: { group: "I", place: 1 }, away: { group: "J", place: 2 } },
      { home: { group: "K", place: 1 }, away: { group: "L", place: 2 } },
      { home: { group: "J", place: 1 }, away: { group: "I", place: 2 } },
      { home: { group: "L", place: 1 }, away: { group: "K", place: 2 } },
      { home: { group: "A", place: 2 }, away: { group: "C", place: 2 } },
      { home: { group: "E", place: 2 }, away: { group: "G", place: 2 } },
      { home: { group: "B", place: 2 }, away: { group: "D", place: 2 } },
      { home: { group: "F", place: 2 }, away: { group: "H", place: 2 } },
    ],
    sampleTeams: WORLD_NATIONS.slice(0, 48),
    badge: "48",
  },
  {
    id: "euro24",
    name: "Euro 24",
    description: "6 groups of 4 · Best 3rds advance · 16-team knockout",
    groupCount: 6,
    teamsPerGroup: 4,
    settings: {
      qualify_count: 2,
      best_thirds_count: 4,
      allow_third_place: false,
    },
    pairings: EURO24_PAIRINGS,
    sampleTeams: EURO_NATIONS,
    badge: "EU",
  },
  {
    id: "afcon24",
    name: "AFCON 24",
    description: "6 groups of 4 · Best 3rds · African Cup of Nations",
    groupCount: 6,
    teamsPerGroup: 4,
    settings: {
      qualify_count: 2,
      best_thirds_count: 4,
      allow_third_place: true,
    },
    pairings: EURO24_PAIRINGS,
    sampleTeams: [
      { name: "Morocco", short_code: "MAR", crest_color: "#c1272d" },
      { name: "Senegal", short_code: "SEN", crest_color: "#00853f" },
      { name: "Egypt", short_code: "EGY", crest_color: "#ce1126" },
      { name: "Nigeria", short_code: "NGA", crest_color: "#008751" },
      { name: "Cameroon", short_code: "CMR", crest_color: "#007a5e" },
      { name: "Ghana", short_code: "GHA", crest_color: "#006b3f" },
      { name: "Ivory Coast", short_code: "CIV", crest_color: "#f77f00" },
      { name: "Algeria", short_code: "ALG", crest_color: "#006233" },
      { name: "Tunisia", short_code: "TUN", crest_color: "#e70013" },
      { name: "Mali", short_code: "MLI", crest_color: "#14b53a" },
      { name: "South Africa", short_code: "RSA", crest_color: "#007a4d" },
      { name: "DR Congo", short_code: "COD", crest_color: "#007fff" },
      { name: "Burkina Faso", short_code: "BFA", crest_color: "#ef2b2d" },
      { name: "Guinea", short_code: "GUI", crest_color: "#ce1126" },
      { name: "Cape Verde", short_code: "CPV", crest_color: "#003893" },
      { name: "Equatorial Guinea", short_code: "EQG", crest_color: "#3e9a00" },
      { name: "Gabon", short_code: "GAB", crest_color: "#009e60" },
      { name: "Zambia", short_code: "ZAM", crest_color: "#198a00" },
      { name: "Angola", short_code: "ANG", crest_color: "#c8102e" },
      { name: "Mauritania", short_code: "MTN", crest_color: "#00a95c" },
      { name: "Namibia", short_code: "NAM", crest_color: "#003580" },
      { name: "Tanzania", short_code: "TAN", crest_color: "#1eb53a" },
      { name: "Gambia", short_code: "GAM", crest_color: "#3a7728" },
      { name: "Mozambique", short_code: "MOZ", crest_color: "#007168" },
    ],
    badge: "CAF",
  },
  {
    id: "copa16",
    name: "Copa América 16",
    description: "4 groups of 4 · Quarter-finals onward",
    groupCount: 4,
    teamsPerGroup: 4,
    settings: {
      qualify_count: 2,
      best_thirds_count: 0,
      allow_third_place: true,
    },
    pairings: [
      { home: { group: "A", place: 1 }, away: { group: "B", place: 2 } },
      { home: { group: "B", place: 1 }, away: { group: "A", place: 2 } },
      { home: { group: "C", place: 1 }, away: { group: "D", place: 2 } },
      { home: { group: "D", place: 1 }, away: { group: "C", place: 2 } },
    ],
    sampleTeams: [
      { name: "Argentina", short_code: "ARG", crest_color: "#75aadb" },
      { name: "Brazil", short_code: "BRA", crest_color: "#009c3b" },
      { name: "Uruguay", short_code: "URU", crest_color: "#0038a8" },
      { name: "Colombia", short_code: "COL", crest_color: "#fcd116" },
      { name: "Ecuador", short_code: "ECU", crest_color: "#ffdd00" },
      { name: "Chile", short_code: "CHI", crest_color: "#d52b1e" },
      { name: "Peru", short_code: "PER", crest_color: "#d91023" },
      { name: "Paraguay", short_code: "PAR", crest_color: "#0038a8" },
      { name: "USA", short_code: "USA", crest_color: "#002868" },
      { name: "Mexico", short_code: "MEX", crest_color: "#006847" },
      { name: "Canada", short_code: "CAN", crest_color: "#ff0000" },
      { name: "Costa Rica", short_code: "CRC", crest_color: "#002b7f" },
      { name: "Panama", short_code: "PAN", crest_color: "#005293" },
      { name: "Jamaica", short_code: "JAM", crest_color: "#009b3a" },
      { name: "Venezuela", short_code: "VEN", crest_color: "#cf142b" },
      { name: "Bolivia", short_code: "BOL", crest_color: "#007a33" },
    ],
    badge: "CONMEBOL",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Configure any number of groups and teams",
    groupCount: 4,
    teamsPerGroup: 4,
    settings: {
      qualify_count: 2,
      best_thirds_count: 0,
      allow_third_place: true,
    },
    pairings: [
      { home: { group: "A", place: 1 }, away: { group: "B", place: 2 } },
      { home: { group: "B", place: 1 }, away: { group: "A", place: 2 } },
      { home: { group: "C", place: 1 }, away: { group: "D", place: 2 } },
      { home: { group: "D", place: 1 }, away: { group: "C", place: 2 } },
    ],
    sampleTeams: [],
    badge: "★",
  },
];

export function getTemplate(id: string): TournamentTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function createTournamentFromTemplate(opts: {
  name: string;
  seasonLabel: string;
  templateId: string;
  ownerId?: string | null;
  groupCount?: number;
  teamsPerGroup?: number;
  seedSampleTeams?: boolean;
  visibility?: Tournament["visibility"];
}): TournamentBundle {
  const template = getTemplate(opts.templateId);
  const groupCount = opts.groupCount ?? template.groupCount;
  const teamsPerGroup = opts.teamsPerGroup ?? template.teamsPerGroup;
  const tournamentId = uid();
  const now = new Date().toISOString();
  const baseSlug = slugify(opts.name) || "tournament";
  const slug = `${baseSlug}-${tournamentId.slice(0, 6)}`;

  const settings: TournamentSettings = {
    ...DEFAULT_SETTINGS,
    ...template.settings,
  };

  // Adjust pairings for custom group counts
  let pairings = template.pairings;
  if (opts.templateId === "custom" || groupCount !== template.groupCount) {
    pairings = [];
    for (let i = 0; i < groupCount; i += 2) {
      const g1 = groupLetter(i);
      const g2 = groupLetter(Math.min(i + 1, groupCount - 1));
      pairings.push({
        home: { group: g1, place: 1 },
        away: { group: g2, place: 2 },
      });
      if (i + 1 < groupCount) {
        pairings.push({
          home: { group: g2, place: 1 },
          away: { group: g1, place: 2 },
        });
      }
    }
    // Ensure power-of-2 knockout
    while (pairings.length > 1 && (pairings.length & (pairings.length - 1)) !== 0) {
      pairings.pop();
    }
    if (pairings.length < 2) {
      pairings = [
        { home: { group: "A", place: 1 }, away: { group: "B", place: 2 } },
        { home: { group: "B", place: 1 }, away: { group: "A", place: 2 } },
      ];
    }
  }

  const tournament: Tournament = {
    id: tournamentId,
    owner_id: opts.ownerId ?? null,
    name: opts.name,
    slug,
    season_label: opts.seasonLabel,
    status: "draft",
    visibility: opts.visibility ?? "unlisted",
    logo_url: null,
    template_id: template.id,
    settings,
    created_at: now,
    updated_at: now,
  };

  const groups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
    id: uid(),
    tournament_id: tournamentId,
    name: groupLetter(i),
    sort_order: i,
  }));

  const teams: Team[] = [];
  const groupTeams: GroupTeam[] = [];

  if (opts.seedSampleTeams && template.sampleTeams.length > 0) {
    const needed = groupCount * teamsPerGroup;
    const samples = template.sampleTeams.slice(0, needed);
    samples.forEach((s, idx) => {
      const team: Team = {
        id: uid(),
        tournament_id: tournamentId,
        name: s.name,
        short_code: s.short_code,
        crest_color: s.crest_color,
        crest_url: null,
        fair_play: 0,
        pot: s.pot ?? null,
      };
      teams.push(team);
      const g = groups[Math.floor(idx / teamsPerGroup)];
      if (g) groupTeams.push({ group_id: g.id, team_id: team.id });
    });
  }

  const groupMatches: Match[] = [];
  for (const g of groups) {
    const teamIds = groupTeams
      .filter((gt) => gt.group_id === g.id)
      .map((gt) => gt.team_id);
    // If no teams yet, create placeholder fixtures later when teams assigned
    if (teamIds.length >= 2) {
      const rounds = roundRobinPairs(teamIds.length);
      rounds.forEach((pairs, dayIdx) => {
        pairs.forEach(([hi, ai]) => {
          groupMatches.push({
            id: uid(),
            tournament_id: tournamentId,
            stage: "group",
            group_id: g.id,
            home_team_id: teamIds[hi],
            away_team_id: teamIds[ai],
            home_score: null,
            away_score: null,
            home_penalties: null,
            away_penalties: null,
            status: "scheduled",
            match_day: dayIdx + 1,
            kickoff_at: null,
            venue: null,
            bracket_position: null,
            label: `MD${dayIdx + 1}`,
          });
        });
      });
    }
  }

  const { slots, matches: koMatches } = buildBracketSlots(
    tournamentId,
    pairings,
    settings.allow_third_place
  );

  const matches: Match[] = [
    ...groupMatches,
    ...koMatches.map((m) => ({ ...m, id: uid() })),
  ];

  return {
    tournament,
    teams,
    groups,
    groupTeams,
    matches,
    bracketSlots: slots,
  };
}

export function regenerateGroupFixtures(
  bundle: TournamentBundle
): Match[] {
  const nonGroup = bundle.matches.filter((m) => m.stage !== "group");
  const groupMatches: Match[] = [];

  for (const g of bundle.groups) {
    const teamIds = bundle.groupTeams
      .filter((gt) => gt.group_id === g.id)
      .map((gt) => gt.team_id);
    if (teamIds.length < 2) continue;
    const rounds = roundRobinPairs(teamIds.length);
    rounds.forEach((pairs, dayIdx) => {
      pairs.forEach(([hi, ai]) => {
        groupMatches.push({
          id: uid(),
          tournament_id: bundle.tournament.id,
          stage: "group",
          group_id: g.id,
          home_team_id: teamIds[hi],
          away_team_id: teamIds[ai],
          home_score: null,
          away_score: null,
          home_penalties: null,
          away_penalties: null,
          status: "scheduled",
          match_day: dayIdx + 1,
          kickoff_at: null,
          venue: null,
          bracket_position: null,
          label: `MD${dayIdx + 1}`,
        });
      });
    });
  }
  return [...groupMatches, ...nonGroup];
}

export function shuffleIntoGroups(
  teams: Team[],
  groups: Group[]
): GroupTeam[] {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const result: GroupTeam[] = [];
  shuffled.forEach((t, i) => {
    const g = groups[i % groups.length];
    result.push({ group_id: g.id, team_id: t.id });
  });
  return result;
}

export function balanceByPots(
  teams: Team[],
  groups: Group[]
): GroupTeam[] {
  const pots = new Map<number, Team[]>();
  for (const t of teams) {
    const p = t.pot ?? 99;
    if (!pots.has(p)) pots.set(p, []);
    pots.get(p)!.push(t);
  }
  for (const arr of pots.values()) {
    arr.sort(() => Math.random() - 0.5);
  }
  const result: GroupTeam[] = [];
  const sortedPots = [...pots.keys()].sort((a, b) => a - b);
  for (const pot of sortedPots) {
    const potTeams = pots.get(pot)!;
    potTeams.forEach((t, i) => {
      result.push({ group_id: groups[i % groups.length].id, team_id: t.id });
    });
  }
  return result;
}
