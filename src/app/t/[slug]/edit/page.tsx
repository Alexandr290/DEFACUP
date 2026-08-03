"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  FlaskConical,
  Printer,
  Save,
  Swords,
} from "lucide-react";
import { KnockoutBracket } from "@/components/bracket/KnockoutBracket";
import { MatchCenter } from "@/components/matches/MatchCenter";
import { GroupTable } from "@/components/tables/GroupTable";
import { GroupDrawPanel, TeamsPanel } from "@/components/teams/TeamsPanel";
import { SettingsPanel } from "@/components/tournament/SettingsPanel";
import { Button } from "@/components/ui/Button";
import { computeBestThirds, computeStandings } from "@/lib/standings";
import { exportBundleJson } from "@/lib/storage/local";
import { useTournamentStore } from "@/lib/storage/store";
import { cn } from "@/lib/utils";

type Tab =
  | "overview"
  | "teams"
  | "draw"
  | "matches"
  | "knockout"
  | "settings";

export default function EditTournamentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tab, setTab] = useState<Tab>("overview");
  const [savedFlash, setSavedFlash] = useState(false);

  const {
    current,
    loadBySlug,
    loading,
    whatIf,
    whatIfEnabled,
    updateTournament,
    updateSettings,
    addTeam,
    updateTeam,
    removeTeam,
    bulkImportTeams,
    setGroupTeams,
    drawGroups,
    regenerateFixtures,
    updateMatch,
    setWhatIf,
    setWhatIfScore,
    seedKnockout,
    save,
  } = useTournamentStore();

  useEffect(() => {
    loadBySlug(slug);
  }, [slug, loadBySlug]);

  const groupStandings = useMemo(() => {
    if (!current) return [];
    return current.groups.map((g) => {
      const teamIds = current.groupTeams
        .filter((gt) => gt.group_id === g.id)
        .map((gt) => gt.team_id);
      const matches = current.matches.filter(
        (m) => m.stage === "group" && m.group_id === g.id
      );
      const rows = computeStandings(
        teamIds,
        matches,
        current.teams,
        current.tournament.settings,
        whatIfEnabled ? { whatIfScores: whatIf } : undefined
      );
      return { group: g, rows };
    });
  }, [current, whatIf, whatIfEnabled]);

  const bestThirds = useMemo(() => {
    if (!current) return [];
    return computeBestThirds(
      groupStandings.map((g) => ({ groupName: g.group.name, rows: g.rows })),
      current.tournament.settings
    );
  }, [current, groupStandings]);

  if (loading && !current) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-mist">Loading tournament…</div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <h1 className="font-display text-4xl">Tournament not found</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-accent">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const t = current.tournament;
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Tables" },
    { id: "teams", label: "Teams" },
    { id: "draw", label: "Draw" },
    { id: "matches", label: "Matches" },
    { id: "knockout", label: "Knockout" },
    { id: "settings", label: "Settings" },
  ];

  const handleSave = async () => {
    await save();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleExport = () => {
    const json = exportBundleJson(current);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent">
            {t.template_id} · {t.status} · /{t.slug}
          </p>
          <h1 className="font-display text-5xl tracking-wide">{t.name}</h1>
          <p className="text-mist">{t.season_label}</p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button
            size="sm"
            variant={whatIfEnabled ? "gold" : "secondary"}
            onClick={() => setWhatIf(!whatIfEnabled)}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            What-if
          </Button>
          <Button size="sm" variant="secondary" onClick={seedKnockout}>
            <Swords className="h-3.5 w-3.5" />
            Seed knockout
          </Button>
          <Button size="sm" variant="secondary" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Link href={`/t/${t.slug}`} target="_blank">
            <Button size="sm" variant="secondary">
              <ExternalLink className="h-3.5 w-3.5" />
              Share view
            </Button>
          </Link>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            {savedFlash ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {whatIfEnabled && (
        <div className="mt-4 rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm">
          What-if mode is on — simulated scores affect tables only until you turn it off.
          Real results are unchanged.
        </div>
      )}

      <div className="no-print mt-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-surface text-accent border border-border border-b-surface -mb-px"
                : "text-mist hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && (
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
              <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
                <h3 className="font-display text-2xl tracking-wide">
                  Best third places
                </h3>
                <p className="text-sm text-mist mb-3">
                  Top {t.settings.best_thirds_count} thirds advance
                </p>
                <div className="flex flex-wrap gap-2">
                  {bestThirds.map((row) => {
                    const team = current.teams.find((x) => x.id === row.teamId);
                    return (
                      <span
                        key={row.teamId}
                        className="rounded border border-border bg-surface px-3 py-1.5 text-sm"
                      >
                        {team?.name} · {row.points} pts · GD{" "}
                        {row.goalDifference > 0 ? "+" : ""}
                        {row.goalDifference}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "teams" && (
          <TeamsPanel
            teams={current.teams}
            onAdd={() => addTeam()}
            onUpdate={updateTeam}
            onRemove={removeTeam}
            onBulkImport={bulkImportTeams}
          />
        )}

        {tab === "draw" && (
          <GroupDrawPanel
            teams={current.teams}
            groups={current.groups}
            groupTeams={current.groupTeams}
            onAssign={setGroupTeams}
            onDraw={drawGroups}
            onRegenerate={regenerateFixtures}
          />
        )}

        {tab === "matches" && (
          <MatchCenter
            title="Group stage fixtures"
            matches={current.matches.filter((m) => m.stage === "group")}
            teams={current.teams}
            editable
            whatIfEnabled={whatIfEnabled}
            whatIf={whatIf}
            onUpdate={updateMatch}
            onWhatIf={setWhatIfScore}
          />
        )}

        {tab === "knockout" && (
          <KnockoutBracket
            matches={current.matches}
            teams={current.teams}
            slots={current.bracketSlots}
            editable
            onUpdate={updateMatch}
          />
        )}

        {tab === "settings" && (
          <SettingsPanel
            tournament={t}
            onUpdate={updateTournament}
            onSettings={updateSettings}
          />
        )}
      </div>
    </div>
  );
}
