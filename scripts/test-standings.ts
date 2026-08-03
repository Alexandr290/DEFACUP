import assert from "node:assert/strict";
import { computeStandings } from "../src/lib/standings";
import { DEFAULT_SETTINGS, type Match, type Team } from "../src/lib/types";

const teams: Team[] = [
  {
    id: "a",
    tournament_id: "t",
    name: "Alpha",
    short_code: "ALP",
    crest_color: "#000",
    crest_url: null,
    fair_play: 0,
    pot: 1,
  },
  {
    id: "b",
    tournament_id: "t",
    name: "Beta",
    short_code: "BET",
    crest_color: "#000",
    crest_url: null,
    fair_play: 0,
    pot: 1,
  },
  {
    id: "c",
    tournament_id: "t",
    name: "Gamma",
    short_code: "GAM",
    crest_color: "#000",
    crest_url: null,
    fair_play: 0,
    pot: 1,
  },
];

const matches: Match[] = [
  {
    id: "1",
    tournament_id: "t",
    stage: "group",
    group_id: "g",
    home_team_id: "a",
    away_team_id: "b",
    home_score: 2,
    away_score: 1,
    home_penalties: null,
    away_penalties: null,
    status: "finished",
    match_day: 1,
    kickoff_at: null,
    venue: null,
    bracket_position: null,
    label: null,
  },
  {
    id: "2",
    tournament_id: "t",
    stage: "group",
    group_id: "g",
    home_team_id: "a",
    away_team_id: "c",
    home_score: 1,
    away_score: 1,
    home_penalties: null,
    away_penalties: null,
    status: "finished",
    match_day: 2,
    kickoff_at: null,
    venue: null,
    bracket_position: null,
    label: null,
  },
  {
    id: "3",
    tournament_id: "t",
    stage: "group",
    group_id: "g",
    home_team_id: "b",
    away_team_id: "c",
    home_score: 0,
    away_score: 0,
    home_penalties: null,
    away_penalties: null,
    status: "finished",
    match_day: 3,
    kickoff_at: null,
    venue: null,
    bracket_position: null,
    label: null,
  },
];

const rows = computeStandings(
  ["a", "b", "c"],
  matches,
  teams,
  DEFAULT_SETTINGS
);

assert.equal(rows[0].teamId, "a");
assert.equal(rows[0].points, 4);
assert.equal(rows[0].goalDifference, 1);
console.log("standings tests passed");
