import type { Match, StandingRow, Team, TournamentSettings } from "./types";

interface StandingAcc {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: Array<"W" | "D" | "L">;
  fairPlay: number;
}

function emptyAcc(teamId: string, fairPlay: number): StandingAcc {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    form: [],
    fairPlay,
  };
}

function h2hCompare(
  aId: string,
  bId: string,
  matches: Match[],
  settings: TournamentSettings
): number {
  const relevant = matches.filter(
    (m) =>
      m.status === "finished" &&
      m.home_score != null &&
      m.away_score != null &&
      ((m.home_team_id === aId && m.away_team_id === bId) ||
        (m.home_team_id === bId && m.away_team_id === aId))
  );
  if (relevant.length === 0) return 0;

  const mini = new Map<string, StandingAcc>();
  mini.set(aId, emptyAcc(aId, 0));
  mini.set(bId, emptyAcc(bId, 0));

  for (const m of relevant) {
    const home = mini.get(m.home_team_id!)!;
    const away = mini.get(m.away_team_id!)!;
    const hs = m.home_score!;
    const as = m.away_score!;
    home.played += 1;
    away.played += 1;
    home.goalsFor += hs;
    home.goalsAgainst += as;
    away.goalsFor += as;
    away.goalsAgainst += hs;
    if (hs > as) {
      home.won += 1;
      home.points += settings.points_win;
      away.lost += 1;
      away.points += settings.points_loss;
    } else if (hs < as) {
      away.won += 1;
      away.points += settings.points_win;
      home.lost += 1;
      home.points += settings.points_loss;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += settings.points_draw;
      away.points += settings.points_draw;
    }
  }

  const a = mini.get(aId)!;
  const b = mini.get(bId)!;
  if (a.points !== b.points) return b.points - a.points;
  const agd = a.goalsFor - a.goalsAgainst;
  const bgd = b.goalsFor - b.goalsAgainst;
  if (agd !== bgd) return bgd - agd;
  if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
  return 0;
}

function compareTeams(
  a: StandingAcc,
  b: StandingAcc,
  matches: Match[],
  settings: TournamentSettings
): number {
  for (const tb of settings.tiebreakers) {
    let diff = 0;
    switch (tb) {
      case "points":
        diff = b.points - a.points;
        break;
      case "goal_difference":
        diff =
          b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
        break;
      case "goals_for":
        diff = b.goalsFor - a.goalsFor;
        break;
      case "head_to_head":
        diff = h2hCompare(a.teamId, b.teamId, matches, settings);
        break;
      case "fair_play":
        diff = a.fairPlay - b.fairPlay;
        break;
      case "drawing_of_lots":
        diff = a.teamId.localeCompare(b.teamId);
        break;
    }
    if (diff !== 0) return diff;
  }
  return a.teamId.localeCompare(b.teamId);
}

export function computeStandings(
  teamIds: string[],
  matches: Match[],
  teams: Team[],
  settings: TournamentSettings,
  options?: { whatIfScores?: Record<string, { home: number; away: number }> }
): StandingRow[] {
  const fairMap = new Map(teams.map((t) => [t.id, t.fair_play]));
  const map = new Map<string, StandingAcc>();
  for (const id of teamIds) {
    map.set(id, emptyAcc(id, fairMap.get(id) ?? 0));
  }

  const finished = matches.filter((m) => {
    if (m.stage !== "group") return false;
    if (!m.home_team_id || !m.away_team_id) return false;
    if (!teamIds.includes(m.home_team_id) || !teamIds.includes(m.away_team_id))
      return false;

    const override = options?.whatIfScores?.[m.id];
    if (override) return true;
    return (
      m.status === "finished" && m.home_score != null && m.away_score != null
    );
  });

  for (const m of finished) {
    const override = options?.whatIfScores?.[m.id];
    const hs = override?.home ?? m.home_score!;
    const as = override?.away ?? m.away_score!;
    const home = map.get(m.home_team_id!)!;
    const away = map.get(m.away_team_id!)!;

    home.played += 1;
    away.played += 1;
    home.goalsFor += hs;
    home.goalsAgainst += as;
    away.goalsFor += as;
    away.goalsAgainst += hs;

    if (hs > as) {
      home.won += 1;
      home.points += settings.points_win;
      home.form.push("W");
      away.lost += 1;
      away.points += settings.points_loss;
      away.form.push("L");
    } else if (hs < as) {
      away.won += 1;
      away.points += settings.points_win;
      away.form.push("W");
      home.lost += 1;
      home.points += settings.points_loss;
      home.form.push("L");
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += settings.points_draw;
      away.points += settings.points_draw;
      home.form.push("D");
      away.form.push("D");
    }
    if (home.form.length > 5) home.form = home.form.slice(-5);
    if (away.form.length > 5) away.form = away.form.slice(-5);
  }

  const sorted = [...map.values()].sort((a, b) =>
    compareTeams(a, b, finished, settings)
  );

  return sorted.map((row, idx) => ({
    teamId: row.teamId,
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalsFor - row.goalsAgainst,
    points: row.points,
    form: row.form,
    fairPlay: row.fairPlay,
    rank: idx + 1,
    qualified: idx < settings.qualify_count,
    bestThirdCandidate:
      settings.best_thirds_count > 0 && idx === settings.qualify_count,
  }));
}

export function computeBestThirds(
  groupStandings: Array<{ groupName: string; rows: StandingRow[] }>,
  settings: TournamentSettings
): StandingRow[] {
  if (settings.best_thirds_count <= 0) return [];
  const thirds = groupStandings
    .map((g) => g.rows[settings.qualify_count])
    .filter(Boolean) as StandingRow[];

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return thirds.slice(0, settings.best_thirds_count).map((r, i) => ({
    ...r,
    rank: i + 1,
    qualified: true,
    bestThirdCandidate: true,
  }));
}
