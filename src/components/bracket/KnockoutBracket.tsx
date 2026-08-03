"use client";

import { motion } from "framer-motion";
import { getChampion, matchWinner, slotLabel } from "@/lib/bracket";
import type { BracketSlot, Match, MatchStage, Team } from "@/lib/types";
import { stageLabel } from "@/lib/utils";
import { MatchScoreRow } from "@/components/matches/MatchCenter";

const ROUND_ORDER: MatchStage[] = ["r16", "qf", "sf", "third", "final"];

export function KnockoutBracket({
  matches,
  teams,
  slots,
  editable,
  onUpdate,
}: {
  matches: Match[];
  teams: Team[];
  slots: BracketSlot[];
  editable?: boolean;
  onUpdate?: (id: string, patch: Partial<Match>) => void;
}) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const knockout = matches.filter((m) => m.stage !== "group");
  const rounds = ROUND_ORDER.filter((r) =>
    knockout.some((m) => m.stage === r)
  );

  const championId = getChampion(matches);
  const champion = championId ? teamMap.get(championId) : undefined;

  return (
    <div className="space-y-8">
      {champion && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gold/40 bg-gold/10 px-6 py-5 text-center"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Champion</p>
          <p className="font-display mt-1 text-4xl tracking-wide">{champion.name}</p>
        </motion.div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-6">
          {rounds.map((round) => {
            const roundMatches = knockout
              .filter((m) => m.stage === round)
              .sort(
                (a, b) => (a.bracket_position ?? 0) - (b.bracket_position ?? 0)
              );
            return (
              <div key={round} className="w-[300px] shrink-0 space-y-3">
                <h4 className="font-display text-xl tracking-wide text-accent">
                  {stageLabel(round)}
                </h4>
                {roundMatches.map((m, i) => {
                  const homeSlot = slots.find(
                    (s) =>
                      s.round === m.stage &&
                      s.position === m.bracket_position &&
                      s.side === "home"
                  );
                  const awaySlot = slots.find(
                    (s) =>
                      s.round === m.stage &&
                      s.position === m.bracket_position &&
                      s.side === "away"
                  );
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="space-y-1"
                    >
                      {!m.home_team_id && homeSlot && (
                        <p className="text-[10px] text-mist px-1">
                          {slotLabel(homeSlot, teams)} vs{" "}
                          {awaySlot ? slotLabel(awaySlot, teams) : "TBD"}
                        </p>
                      )}
                      <MatchScoreRow
                        match={m}
                        teams={teams}
                        editable={editable}
                        onSave={(patch) => onUpdate?.(m.id, patch)}
                      />
                      {matchWinner(m) && (
                        <p className="px-1 text-[11px] text-accent">
                          → {teamMap.get(matchWinner(m)!)?.short_code} advances
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
