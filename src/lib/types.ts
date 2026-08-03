export type TournamentStatus = "draft" | "group" | "knockout" | "completed";
export type Visibility = "private" | "unlisted" | "public";
export type MatchStage = "group" | "r16" | "qf" | "sf" | "third" | "final";
export type MatchStatus = "scheduled" | "live" | "finished";
export type Tiebreaker =
  | "points"
  | "goal_difference"
  | "goals_for"
  | "head_to_head"
  | "fair_play"
  | "drawing_of_lots";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface TournamentSettings {
  points_win: number;
  points_draw: number;
  points_loss: number;
  qualify_count: number;
  best_thirds_count: number;
  allow_third_place: boolean;
  knockout_et: boolean;
  knockout_pens: boolean;
  tiebreakers: Tiebreaker[];
}

export interface Tournament {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  season_label: string;
  status: TournamentStatus;
  visibility: Visibility;
  logo_url: string | null;
  template_id: string;
  settings: TournamentSettings;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  short_code: string;
  crest_color: string;
  crest_url: string | null;
  fair_play: number;
  pot: number | null;
}

export interface Group {
  id: string;
  tournament_id: string;
  name: string;
  sort_order: number;
}

export interface GroupTeam {
  group_id: string;
  team_id: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  stage: MatchStage;
  group_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  home_penalties: number | null;
  away_penalties: number | null;
  status: MatchStatus;
  match_day: number | null;
  kickoff_at: string | null;
  venue: string | null;
  bracket_position: number | null;
  label: string | null;
}

export type BracketSourceType = "group_pos" | "match_winner" | "match_loser" | "manual";

export interface BracketSlot {
  id: string;
  tournament_id: string;
  round: MatchStage;
  position: number;
  side: "home" | "away";
  source_type: BracketSourceType;
  source_ref: {
    group?: string;
    place?: number;
    match_position?: number;
    round?: MatchStage;
    team_id?: string;
  };
}

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<"W" | "D" | "L">;
  fairPlay: number;
  rank: number;
  qualified: boolean;
  bestThirdCandidate: boolean;
}

export interface TournamentBundle {
  tournament: Tournament;
  teams: Team[];
  groups: Group[];
  groupTeams: GroupTeam[];
  matches: Match[];
  bracketSlots: BracketSlot[];
}

export const DEFAULT_SETTINGS: TournamentSettings = {
  points_win: 3,
  points_draw: 1,
  points_loss: 0,
  qualify_count: 2,
  best_thirds_count: 0,
  allow_third_place: true,
  knockout_et: true,
  knockout_pens: true,
  tiebreakers: [
    "points",
    "goal_difference",
    "goals_for",
    "head_to_head",
    "fair_play",
    "drawing_of_lots",
  ],
};
