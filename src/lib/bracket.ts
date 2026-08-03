import type {
  BracketSlot,
  Group,
  Match,
  MatchStage,
  StandingRow,
  Team,
  TournamentBundle,
} from "./types";
import { uid } from "./utils";

export interface BracketPairing {
  home: { group: string; place: number };
  away: { group: string; place: number };
}

/** Classic WC 32 knockout pairings (1A vs 2B, etc.) */
export const WC32_PAIRINGS: BracketPairing[] = [
  { home: { group: "A", place: 1 }, away: { group: "B", place: 2 } },
  { home: { group: "C", place: 1 }, away: { group: "D", place: 2 } },
  { home: { group: "E", place: 1 }, away: { group: "F", place: 2 } },
  { home: { group: "G", place: 1 }, away: { group: "H", place: 2 } },
  { home: { group: "B", place: 1 }, away: { group: "A", place: 2 } },
  { home: { group: "D", place: 1 }, away: { group: "C", place: 2 } },
  { home: { group: "F", place: 1 }, away: { group: "E", place: 2 } },
  { home: { group: "H", place: 1 }, away: { group: "G", place: 2 } },
];

export const EURO24_PAIRINGS: BracketPairing[] = [
  { home: { group: "A", place: 1 }, away: { group: "C", place: 2 } },
  { home: { group: "B", place: 1 }, away: { group: "A", place: 2 } },
  { home: { group: "C", place: 1 }, away: { group: "F", place: 3 } },
  { home: { group: "D", place: 1 }, away: { group: "E", place: 3 } },
  { home: { group: "E", place: 1 }, away: { group: "D", place: 2 } },
  { home: { group: "F", place: 1 }, away: { group: "E", place: 2 } },
  { home: { group: "A", place: 2 }, away: { group: "B", place: 2 } },
  { home: { group: "D", place: 2 }, away: { group: "C", place: 3 } },
];

export function buildBracketSlots(
  tournamentId: string,
  pairings: BracketPairing[],
  allowThirdPlace: boolean
): { slots: BracketSlot[]; matches: Omit<Match, "id">[] } {
  const slots: BracketSlot[] = [];
  const matches: Omit<Match, "id">[] = [];
  const r16Count = pairings.length;

  pairings.forEach((p, i) => {
    const pos = i + 1;
    slots.push({
      id: uid(),
      tournament_id: tournamentId,
      round: "r16",
      position: pos,
      side: "home",
      source_type: "group_pos",
      source_ref: { group: p.home.group, place: p.home.place },
    });
    slots.push({
      id: uid(),
      tournament_id: tournamentId,
      round: "r16",
      position: pos,
      side: "away",
      source_type: "group_pos",
      source_ref: { group: p.away.group, place: p.away.place },
    });
    matches.push({
      tournament_id: tournamentId,
      stage: "r16",
      group_id: null,
      home_team_id: null,
      away_team_id: null,
      home_score: null,
      away_score: null,
      home_penalties: null,
      away_penalties: null,
      status: "scheduled",
      match_day: null,
      kickoff_at: null,
      venue: null,
      bracket_position: pos,
      label: `R16-${pos}`,
    });
  });

  const qfCount = r16Count / 2;
  for (let i = 0; i < qfCount; i++) {
    const pos = i + 1;
    const srcA = i * 2 + 1;
    const srcB = i * 2 + 2;
    slots.push(
      {
        id: uid(),
        tournament_id: tournamentId,
        round: "qf",
        position: pos,
        side: "home",
        source_type: "match_winner",
        source_ref: { round: "r16", match_position: srcA },
      },
      {
        id: uid(),
        tournament_id: tournamentId,
        round: "qf",
        position: pos,
        side: "away",
        source_type: "match_winner",
        source_ref: { round: "r16", match_position: srcB },
      }
    );
    matches.push({
      tournament_id: tournamentId,
      stage: "qf",
      group_id: null,
      home_team_id: null,
      away_team_id: null,
      home_score: null,
      away_score: null,
      home_penalties: null,
      away_penalties: null,
      status: "scheduled",
      match_day: null,
      kickoff_at: null,
      venue: null,
      bracket_position: pos,
      label: `QF-${pos}`,
    });
  }

  const sfCount = qfCount / 2;
  for (let i = 0; i < sfCount; i++) {
    const pos = i + 1;
    slots.push(
      {
        id: uid(),
        tournament_id: tournamentId,
        round: "sf",
        position: pos,
        side: "home",
        source_type: "match_winner",
        source_ref: { round: "qf", match_position: i * 2 + 1 },
      },
      {
        id: uid(),
        tournament_id: tournamentId,
        round: "sf",
        position: pos,
        side: "away",
        source_type: "match_winner",
        source_ref: { round: "qf", match_position: i * 2 + 2 },
      }
    );
    matches.push({
      tournament_id: tournamentId,
      stage: "sf",
      group_id: null,
      home_team_id: null,
      away_team_id: null,
      home_score: null,
      away_score: null,
      home_penalties: null,
      away_penalties: null,
      status: "scheduled",
      match_day: null,
      kickoff_at: null,
      venue: null,
      bracket_position: pos,
      label: `SF-${pos}`,
    });
  }

  slots.push(
    {
      id: uid(),
      tournament_id: tournamentId,
      round: "final",
      position: 1,
      side: "home",
      source_type: "match_winner",
      source_ref: { round: "sf", match_position: 1 },
    },
    {
      id: uid(),
      tournament_id: tournamentId,
      round: "final",
      position: 1,
      side: "away",
      source_type: "match_winner",
      source_ref: { round: "sf", match_position: 2 },
    }
  );
  matches.push({
    tournament_id: tournamentId,
    stage: "final",
    group_id: null,
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    home_penalties: null,
    away_penalties: null,
    status: "scheduled",
    match_day: null,
    kickoff_at: null,
    venue: null,
    bracket_position: 1,
    label: "Final",
  });

  if (allowThirdPlace && sfCount >= 2) {
    slots.push(
      {
        id: uid(),
        tournament_id: tournamentId,
        round: "third",
        position: 1,
        side: "home",
        source_type: "match_loser",
        source_ref: { round: "sf", match_position: 1 },
      },
      {
        id: uid(),
        tournament_id: tournamentId,
        round: "third",
        position: 1,
        side: "away",
        source_type: "match_loser",
        source_ref: { round: "sf", match_position: 2 },
      }
    );
    matches.push({
      tournament_id: tournamentId,
      stage: "third",
      group_id: null,
      home_team_id: null,
      away_team_id: null,
      home_score: null,
      away_score: null,
      home_penalties: null,
      away_penalties: null,
      status: "scheduled",
      match_day: null,
      kickoff_at: null,
      venue: null,
      bracket_position: 1,
      label: "3rd Place",
    });
  }

  return { slots, matches };
}

export function matchWinner(m: Match): string | null {
  if (m.status !== "finished" || m.home_score == null || m.away_score == null)
    return null;
  if (m.home_score > m.away_score) return m.home_team_id;
  if (m.away_score > m.home_score) return m.away_team_id;
  if (m.home_penalties != null && m.away_penalties != null) {
    if (m.home_penalties > m.away_penalties) return m.home_team_id;
    if (m.away_penalties > m.home_penalties) return m.away_team_id;
  }
  return null;
}

export function matchLoser(m: Match): string | null {
  const w = matchWinner(m);
  if (!w) return null;
  return w === m.home_team_id ? m.away_team_id : m.home_team_id;
}

export function resolveBracketTeam(
  slot: BracketSlot,
  groups: Group[],
  groupStandings: Map<string, StandingRow[]>,
  matches: Match[],
  bestThirds?: StandingRow[]
): string | null {
  const ref = slot.source_ref;
  if (slot.source_type === "manual" && ref.team_id) return ref.team_id;

  if (slot.source_type === "group_pos" && ref.group && ref.place) {
    if (ref.place === 3 && bestThirds) {
      // Best-third placeholders: leave null until seeded manually or via best thirds map
      const g = groups.find((x) => x.name === ref.group);
      if (!g) return null;
      const rows = groupStandings.get(g.id);
      return rows?.[2]?.teamId ?? null;
    }
    const g = groups.find((x) => x.name === ref.group);
    if (!g) return null;
    const rows = groupStandings.get(g.id);
    return rows?.[ref.place - 1]?.teamId ?? null;
  }

  if (
    (slot.source_type === "match_winner" ||
      slot.source_type === "match_loser") &&
    ref.round &&
    ref.match_position
  ) {
    const m = matches.find(
      (x) => x.stage === ref.round && x.bracket_position === ref.match_position
    );
    if (!m) return null;
    return slot.source_type === "match_winner" ? matchWinner(m) : matchLoser(m);
  }

  return null;
}

export function seedKnockoutFromGroups(
  bundle: TournamentBundle,
  groupStandings: Map<string, StandingRow[]>
): Match[] {
  const { matches, bracketSlots, groups } = bundle;
  return matches.map((m) => {
    if (m.stage === "group") return m;
    const homeSlot = bracketSlots.find(
      (s) =>
        s.round === m.stage &&
        s.position === m.bracket_position &&
        s.side === "home"
    );
    const awaySlot = bracketSlots.find(
      (s) =>
        s.round === m.stage &&
        s.position === m.bracket_position &&
        s.side === "away"
    );
    if (!homeSlot || !awaySlot) return m;
    const home = resolveBracketTeam(homeSlot, groups, groupStandings, matches);
    const away = resolveBracketTeam(awaySlot, groups, groupStandings, matches);
    return {
      ...m,
      home_team_id: home,
      away_team_id: away,
    };
  });
}

export function advanceKnockout(matches: Match[]): Match[] {
  const byKey = (stage: MatchStage, pos: number) =>
    matches.find((m) => m.stage === stage && m.bracket_position === pos);

  return matches.map((m) => {
    if (m.stage === "group" || m.stage === "r16") return m;

    const homeSlotRound: MatchStage =
      m.stage === "qf"
        ? "r16"
        : m.stage === "sf"
          ? "qf"
          : m.stage === "final" || m.stage === "third"
            ? "sf"
            : "r16";

    if (m.stage === "qf" && m.bracket_position) {
      const a = byKey("r16", (m.bracket_position - 1) * 2 + 1);
      const b = byKey("r16", (m.bracket_position - 1) * 2 + 2);
      return {
        ...m,
        home_team_id: a ? matchWinner(a) : m.home_team_id,
        away_team_id: b ? matchWinner(b) : m.away_team_id,
      };
    }
    if (m.stage === "sf" && m.bracket_position) {
      const a = byKey("qf", (m.bracket_position - 1) * 2 + 1);
      const b = byKey("qf", (m.bracket_position - 1) * 2 + 2);
      return {
        ...m,
        home_team_id: a ? matchWinner(a) : m.home_team_id,
        away_team_id: b ? matchWinner(b) : m.away_team_id,
      };
    }
    if (m.stage === "final") {
      const a = byKey("sf", 1);
      const b = byKey("sf", 2);
      return {
        ...m,
        home_team_id: a ? matchWinner(a) : m.home_team_id,
        away_team_id: b ? matchWinner(b) : m.away_team_id,
      };
    }
    if (m.stage === "third") {
      const a = byKey("sf", 1);
      const b = byKey("sf", 2);
      return {
        ...m,
        home_team_id: a ? matchLoser(a) : m.home_team_id,
        away_team_id: b ? matchLoser(b) : m.away_team_id,
      };
    }
    void homeSlotRound;
    return m;
  });
}

export function getChampion(matches: Match[]): string | null {
  const final = matches.find((m) => m.stage === "final");
  return final ? matchWinner(final) : null;
}

export function teamPathToFinal(
  teamId: string,
  matches: Match[]
): Match[] {
  const knockout = matches
    .filter(
      (m) =>
        m.stage !== "group" &&
        m.status === "finished" &&
        (m.home_team_id === teamId || m.away_team_id === teamId)
    )
    .sort((a, b) => {
      const order = ["r16", "qf", "sf", "third", "final"];
      return order.indexOf(a.stage) - order.indexOf(b.stage);
    });
  return knockout;
}

export function slotLabel(slot: BracketSlot, teams: Team[]): string {
  if (slot.source_type === "manual" && slot.source_ref.team_id) {
    return teams.find((t) => t.id === slot.source_ref.team_id)?.short_code ?? "TBD";
  }
  if (slot.source_type === "group_pos") {
    return `${slot.source_ref.place}${slot.source_ref.group}`;
  }
  if (slot.source_type === "match_winner") {
    return `W ${slot.source_ref.round?.toUpperCase()}-${slot.source_ref.match_position}`;
  }
  if (slot.source_type === "match_loser") {
    return `L ${slot.source_ref.round?.toUpperCase()}-${slot.source_ref.match_position}`;
  }
  return "TBD";
}
