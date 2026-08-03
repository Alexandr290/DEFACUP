"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { KnockoutBracket } from "@/components/bracket/KnockoutBracket";
import { MatchCenter } from "@/components/matches/MatchCenter";
import { GroupTable } from "@/components/tables/GroupTable";
import { Button } from "@/components/ui/Button";
import { computeBestThirds, computeStandings } from "@/lib/standings";
import { useTournamentStore } from "@/lib/storage/store";
import { cn } from "@/lib/utils";

export default function PublicTournamentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { current, loadBySlug, loading } = useTournamentStore();
  const [view, setView] = useState<"tables" | "matches" | "knockout">("tables");

  useEffect(() => {
    loadBySlug(slug);
  }, [slug, loadBySlug]);

  // Realtime when Supabase configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !current) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`tournament-${current.tournament.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${current.tournament.id}`,
        },
        () => {
          loadBySlug(slug);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [current?.tournament.id, loadBySlug, slug, current]);

  const groupStandings = useMemo(() => {
    if (!current) return [];
    return current.groups.map((g) => {
      const teamIds = current.groupTeams
        .filter((gt) => gt.group_id === g.id)
        .map((gt) => gt.team_id);
      const matches = current.matches.filter(
        (m) => m.stage === "group" && m.group_id === g.id
      );
      return {
        group: g,
        rows: computeStandings(
          teamIds,
          matches,
          current.teams,
          current.tournament.settings
        ),
      };
    });
  }, [current]);

  const bestThirds = useMemo(() => {
    if (!current) return [];
    return computeBestThirds(
      groupStandings.map((g) => ({ groupName: g.group.name, rows: g.rows })),
      current.tournament.settings
    );
  }, [current, groupStandings]);

  if (loading && !current) {
    return <div className="p-10 text-mist">Loading…</div>;
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="font-display text-4xl">Tournament not found</h1>
        <p className="mt-2 text-mist">
          This link may be private or the tournament was deleted.
        </p>
        <Link href="/" className="mt-4 inline-block text-accent">
          Go home
        </Link>
      </div>
    );
  }

  const t = current.tournament;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent">
            {t.season_label} · {t.status}
          </p>
          <h1 className="font-display text-5xl tracking-wide sm:text-6xl">
            {t.name}
          </h1>
        </div>
        <div className="flex gap-2 no-print">
          <Link href={`/t/${t.slug}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      <div className="no-print mt-6 flex gap-2">
        {(
          [
            ["tables", "Tables"],
            ["matches", "Matches"],
            ["knockout", "Knockout"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium",
              view === id
                ? "bg-accent text-white"
                : "bg-surface text-mist hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {view === "tables" && (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {groupStandings.map(({ group, rows }) => (
                <GroupTable
                  key={group.id}
                  title={group.name}
                  standings={rows}
                  teams={current.teams}
                  qualifyCount={t.settings.qualify_count}
                  bestThirdHighlight={t.settings.best_thirds_count > 0}
                />
              ))}
            </div>
            {bestThirds.length > 0 && (
              <div className="rounded-lg border border-gold/30 p-4">
                <h3 className="font-display text-2xl">Best thirds</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bestThirds.map((row) => {
                    const team = current.teams.find((x) => x.id === row.teamId);
                    return (
                      <span
                        key={row.teamId}
                        className="rounded border border-border px-3 py-1 text-sm"
                      >
                        {team?.name} ({row.points} pts)
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "matches" && (
          <MatchCenter
            matches={current.matches.filter((m) => m.stage === "group")}
            teams={current.teams}
          />
        )}

        {view === "knockout" && (
          <KnockoutBracket
            matches={current.matches}
            teams={current.teams}
            slots={current.bracketSlots}
          />
        )}
      </div>

      </div>
  );
}
