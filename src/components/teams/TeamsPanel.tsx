"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import type { Group, GroupTeam, Team } from "@/lib/types";
import { shortCodeFromName } from "@/lib/utils";

export function TeamsPanel({
  teams,
  onAdd,
  onUpdate,
  onRemove,
  onBulkImport,
}: {
  teams: Team[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<Team>) => void;
  onRemove: (id: string) => void;
  onBulkImport: (
    rows: Array<{ name: string; short_code: string; crest_color: string }>
  ) => void;
}) {
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const parseBulk = () => {
    const rows = bulk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, code, color] = line.split(",").map((s) => s.trim());
        return {
          name: name || "Team",
          short_code: (code || shortCodeFromName(name || "TM")).slice(0, 3),
          crest_color: color || "#14a85c",
        };
      });
    if (rows.length) {
      onBulkImport(rows);
      setBulk("");
      setShowBulk(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-2xl tracking-wide">
          Teams ({teams.length})
        </h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowBulk((v) => !v)}>
            Bulk import
          </Button>
          <Button size="sm" onClick={onAdd}>
            Add team
          </Button>
        </div>
      </div>

      {showBulk && (
        <div className="rounded-lg border border-border bg-surface/50 p-4 space-y-3">
          <Label>Paste CSV — Name,CODE,#hex (one per line)</Label>
          <Textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={"Brazil,BRA,#009c3b\nArgentina,ARG,#75aadb"}
          />
          <Button size="sm" onClick={parseBulk}>
            Import {bulk.split("\n").filter(Boolean).length || 0} teams
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {teams.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-1 gap-2 rounded-md border border-border/70 bg-night/20 p-3 sm:grid-cols-[auto_1fr_80px_100px_70px_auto] sm:items-center"
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded text-xs font-bold text-white"
              style={{ background: t.crest_color }}
            >
              {t.short_code}
            </span>
            <Input
              value={t.name}
              onChange={(e) => onUpdate(t.id, { name: e.target.value })}
            />
            <Input
              value={t.short_code}
              maxLength={3}
              onChange={(e) =>
                onUpdate(t.id, {
                  short_code: e.target.value.toUpperCase().slice(0, 3),
                })
              }
            />
            <Input
              type="color"
              value={t.crest_color}
              onChange={(e) => onUpdate(t.id, { crest_color: e.target.value })}
              className="h-10 p-1"
            />
            <Select
              value={t.pot ?? ""}
              onChange={(e) =>
                onUpdate(t.id, {
                  pot: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <option value="">Pot</option>
              {[1, 2, 3, 4].map((p) => (
                <option key={p} value={p}>
                  Pot {p}
                </option>
              ))}
            </Select>
            <Button variant="ghost" size="sm" onClick={() => onRemove(t.id)}>
              Remove
            </Button>
          </div>
        ))}
        {teams.length === 0 && (
          <p className="text-sm text-mist">
            No teams yet. Add manually, bulk import, or recreate from a template
            with sample nations.
          </p>
        )}
      </div>
    </div>
  );
}

export function GroupDrawPanel({
  teams,
  groups,
  groupTeams,
  onAssign,
  onDraw,
  onRegenerate,
}: {
  teams: Team[];
  groups: Group[];
  groupTeams: GroupTeam[];
  onAssign: (groupTeams: GroupTeam[]) => void;
  onDraw: (mode: "shuffle" | "pots") => void;
  onRegenerate: () => void;
}) {
  const [dragTeam, setDragTeam] = useState<string | null>(null);

  const unassigned = useMemo(() => {
    const assigned = new Set(groupTeams.map((gt) => gt.team_id));
    return teams.filter((t) => !assigned.has(t.id));
  }, [teams, groupTeams]);

  const teamsInGroup = (groupId: string) =>
    groupTeams
      .filter((gt) => gt.group_id === groupId)
      .map((gt) => teams.find((t) => t.id === gt.team_id))
      .filter(Boolean) as Team[];

  const moveToGroup = (teamId: string, groupId: string) => {
    const next = groupTeams.filter((gt) => gt.team_id !== teamId);
    next.push({ group_id: groupId, team_id: teamId });
    onAssign(next);
  };

  const removeFromGroups = (teamId: string) => {
    onAssign(groupTeams.filter((gt) => gt.team_id !== teamId));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-2xl tracking-wide">Group draw</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => onDraw("shuffle")}>
            Shuffle draw
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onDraw("pots")}>
            Pot draw
          </Button>
          <Button size="sm" onClick={onRegenerate}>
            Generate fixtures
          </Button>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div className="rounded-lg border border-dashed border-border p-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-mist">
            Unassigned ({unassigned.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((t) => (
              <button
                key={t.id}
                type="button"
                draggable
                onDragStart={() => setDragTeam(t.id)}
                className="rounded border border-border bg-surface px-2 py-1 text-sm"
                style={{ borderLeftColor: t.crest_color, borderLeftWidth: 3 }}
              >
                {t.short_code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g) => (
          <div
            key={g.id}
            className="min-h-36 rounded-lg border border-border bg-surface/40 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragTeam) {
                moveToGroup(dragTeam, g.id);
                setDragTeam(null);
              }
            }}
          >
            <p className="font-display text-xl tracking-wide mb-2">
              Group {g.name}
            </p>
            <div className="space-y-1.5">
              {teamsInGroup(g.id).map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragTeam(t.id)}
                  className="flex items-center justify-between rounded bg-night/40 px-2 py-1.5 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: t.crest_color }}
                    />
                    {t.name}
                  </span>
                  <button
                    type="button"
                    className="text-mist hover:text-danger text-xs"
                    onClick={() => removeFromGroups(t.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {teamsInGroup(g.id).length === 0 && (
                <p className="text-xs text-mist">Drop teams here</p>
              )}
            </div>
            {unassigned[0] && (
              <Select
                className="mt-2 h-8 text-xs"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) moveToGroup(e.target.value, g.id);
                  e.target.value = "";
                }}
              >
                <option value="">Add team…</option>
                {unassigned.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
