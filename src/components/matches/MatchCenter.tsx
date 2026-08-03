"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Match, Team } from "@/lib/types";
import { cn } from "@/lib/utils";

function TeamChip({ team }: { team: Team | undefined }) {
  if (!team) {
    return <span className="text-mist">TBD</span>;
  }
  return (
    <span className="flex items-center gap-2 font-semibold">
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-[9px] font-bold text-white"
        style={{ background: team.crest_color }}
      >
        {team.short_code.slice(0, 3)}
      </span>
      {team.name}
    </span>
  );
}

export function MatchScoreRow({
  match,
  teams,
  editable,
  whatIf,
  whatIfScore,
  onSave,
  onWhatIf,
}: {
  match: Match;
  teams: Team[];
  editable?: boolean;
  whatIf?: boolean;
  whatIfScore?: { home: number; away: number };
  onSave?: (patch: Partial<Match>) => void;
  onWhatIf?: (scores: { home: number; away: number } | null) => void;
}) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const home = match.home_team_id ? teamMap.get(match.home_team_id) : undefined;
  const away = match.away_team_id ? teamMap.get(match.away_team_id) : undefined;

  const [hs, setHs] = useState(
    String(whatIfScore?.home ?? match.home_score ?? "")
  );
  const [as, setAs] = useState(
    String(whatIfScore?.away ?? match.away_score ?? "")
  );
  const [hp, setHp] = useState(String(match.home_penalties ?? ""));
  const [ap, setAp] = useState(String(match.away_penalties ?? ""));
  const [showPens, setShowPens] = useState(
    match.home_penalties != null || match.away_penalties != null
  );

  useEffect(() => {
    setHs(String(whatIfScore?.home ?? match.home_score ?? ""));
    setAs(String(whatIfScore?.away ?? match.away_score ?? ""));
    setHp(String(match.home_penalties ?? ""));
    setAp(String(match.away_penalties ?? ""));
  }, [match, whatIfScore]);

  const commit = (status: Match["status"] = "finished") => {
    const homeScore = hs === "" ? null : Number(hs);
    const awayScore = as === "" ? null : Number(as);
    if (whatIf && onWhatIf) {
      if (homeScore == null || awayScore == null) onWhatIf(null);
      else onWhatIf({ home: homeScore, away: awayScore });
      return;
    }
    onSave?.({
      home_score: homeScore,
      away_score: awayScore,
      home_penalties:
        showPens && hp !== "" ? Number(hp) : null,
      away_penalties:
        showPens && ap !== "" ? Number(ap) : null,
      status:
        homeScore == null || awayScore == null ? "scheduled" : status,
    });
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md border border-border/70 bg-night/30 px-3 py-2.5",
        match.status === "live" && "border-accent/60",
        whatIf && "border-gold/40"
      )}
    >
      <div className="justify-self-end text-right">
        <TeamChip team={home} />
      </div>
      <div className="flex flex-col items-center gap-1">
        {editable ? (
          <div className="flex items-center gap-1">
            <input
              className="h-9 w-10 rounded border border-border bg-surface text-center text-lg font-bold tabular-nums outline-none focus:border-accent"
              inputMode="numeric"
              value={hs}
              onChange={(e) => setHs(e.target.value.replace(/[^\d]/g, ""))}
              onBlur={() => commit()}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
              }}
            />
            <span className="text-mist">–</span>
            <input
              className="h-9 w-10 rounded border border-border bg-surface text-center text-lg font-bold tabular-nums outline-none focus:border-accent"
              inputMode="numeric"
              value={as}
              onChange={(e) => setAs(e.target.value.replace(/[^\d]/g, ""))}
              onBlur={() => commit()}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
              }}
            />
          </div>
        ) : (
          <div className="font-display text-2xl tabular-nums tracking-wide">
            {match.home_score ?? "–"} : {match.away_score ?? "–"}
            {match.home_penalties != null && match.away_penalties != null && (
              <span className="ml-1 text-sm text-mist">
                ({match.home_penalties}–{match.away_penalties}p)
              </span>
            )}
          </div>
        )}
        {editable && match.stage !== "group" && (
          <button
            type="button"
            className="text-[10px] uppercase tracking-wider text-mist hover:text-accent"
            onClick={() => setShowPens((v) => !v)}
          >
            {showPens ? "Hide pens" : "Pens / ET"}
          </button>
        )}
        {editable && showPens && match.stage !== "group" && (
          <div className="flex items-center gap-1">
            <input
              className="h-7 w-8 rounded border border-border bg-surface text-center text-sm tabular-nums"
              value={hp}
              onChange={(e) => setHp(e.target.value.replace(/[^\d]/g, ""))}
              onBlur={() => commit()}
              placeholder="P"
            />
            <span className="text-xs text-mist">pens</span>
            <input
              className="h-7 w-8 rounded border border-border bg-surface text-center text-sm tabular-nums"
              value={ap}
              onChange={(e) => setAp(e.target.value.replace(/[^\d]/g, ""))}
              onBlur={() => commit()}
              placeholder="P"
            />
          </div>
        )}
        {editable && !whatIf && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px]"
              onClick={() => commit("live")}
            >
              Live
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px]"
              onClick={() =>
                onSave?.({
                  home_score: null,
                  away_score: null,
                  home_penalties: null,
                  away_penalties: null,
                  status: "scheduled",
                })
              }
            >
              Clear
            </Button>
          </div>
        )}
        {match.label && (
          <span className="text-[10px] uppercase tracking-wider text-mist">
            {match.label}
            {match.status === "live" && " · LIVE"}
          </span>
        )}
      </div>
      <div className="justify-self-start">
        <TeamChip team={away} />
      </div>
    </div>
  );
}

export function MatchCenter({
  matches,
  teams,
  editable,
  whatIfEnabled,
  whatIf,
  onUpdate,
  onWhatIf,
  title,
}: {
  matches: Match[];
  teams: Team[];
  editable?: boolean;
  whatIfEnabled?: boolean;
  whatIf?: Record<string, { home: number; away: number }>;
  onUpdate?: (id: string, patch: Partial<Match>) => void;
  onWhatIf?: (
    matchId: string,
    scores: { home: number; away: number } | null
  ) => void;
  title?: string;
}) {
  const byDay = new Map<number | string, Match[]>();
  for (const m of matches) {
    const key = m.match_day ?? m.stage;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(m);
  }

  return (
    <div className="space-y-6">
      {title && (
        <h3 className="font-display text-2xl tracking-wide">{title}</h3>
      )}
      {[...byDay.entries()].map(([day, list]) => (
        <div key={String(day)} className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-mist">
            {typeof day === "number" ? `Matchday ${day}` : String(day)}
          </p>
          {list.map((m) => (
            <MatchScoreRow
              key={m.id}
              match={m}
              teams={teams}
              editable={editable}
              whatIf={whatIfEnabled}
              whatIfScore={whatIf?.[m.id]}
              onSave={(patch) => onUpdate?.(m.id, patch)}
              onWhatIf={(scores) => onWhatIf?.(m.id, scores)}
            />
          ))}
        </div>
      ))}
      {matches.length === 0 && (
        <p className="text-sm text-mist">
          No fixtures yet. Assign teams to groups and generate fixtures.
        </p>
      )}
    </div>
  );
}
