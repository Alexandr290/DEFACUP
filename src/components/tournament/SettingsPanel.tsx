"use client";

import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import type { Tournament, TournamentSettings, Tiebreaker } from "@/lib/types";

const TB_OPTIONS: { id: Tiebreaker; label: string }[] = [
  { id: "points", label: "Points" },
  { id: "goal_difference", label: "Goal difference" },
  { id: "goals_for", label: "Goals for" },
  { id: "head_to_head", label: "Head-to-head" },
  { id: "fair_play", label: "Fair play" },
  { id: "drawing_of_lots", label: "Drawing of lots" },
];

export function SettingsPanel({
  tournament,
  onUpdate,
  onSettings,
}: {
  tournament: Tournament;
  onUpdate: (patch: Partial<Tournament>) => void;
  onSettings: (patch: Partial<TournamentSettings>) => void;
}) {
  const s = tournament.settings;

  return (
    <div className="space-y-6">
      <h3 className="font-display text-2xl tracking-wide">Settings</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input
            value={tournament.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>
        <div>
          <Label>Season</Label>
          <Input
            value={tournament.season_label}
            onChange={(e) => onUpdate({ season_label: e.target.value })}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={tournament.status}
            onChange={(e) =>
              onUpdate({
                status: e.target.value as Tournament["status"],
              })
            }
          >
            <option value="draft">Draft</option>
            <option value="group">Group stage</option>
            <option value="knockout">Knockout</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
        <div>
          <Label>Visibility</Label>
          <Select
            value={tournament.visibility}
            onChange={(e) =>
              onUpdate({
                visibility: e.target.value as Tournament["visibility"],
              })
            }
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </Select>
        </div>
        <div>
          <Label>Points for win</Label>
          <Input
            type="number"
            value={s.points_win}
            onChange={(e) => onSettings({ points_win: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Points for draw</Label>
          <Input
            type="number"
            value={s.points_draw}
            onChange={(e) =>
              onSettings({ points_draw: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>Qualify per group</Label>
          <Input
            type="number"
            min={1}
            max={4}
            value={s.qualify_count}
            onChange={(e) =>
              onSettings({ qualify_count: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>Best thirds count</Label>
          <Input
            type="number"
            min={0}
            max={8}
            value={s.best_thirds_count}
            onChange={(e) =>
              onSettings({ best_thirds_count: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.allow_third_place}
            onChange={(e) =>
              onSettings({ allow_third_place: e.target.checked })
            }
            className="accent-[var(--accent)]"
          />
          3rd place match
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.knockout_et}
            onChange={(e) => onSettings({ knockout_et: e.target.checked })}
            className="accent-[var(--accent)]"
          />
          Extra time
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.knockout_pens}
            onChange={(e) => onSettings({ knockout_pens: e.target.checked })}
            className="accent-[var(--accent)]"
          />
          Penalties
        </label>
      </div>

      <div>
        <Label>Tiebreaker order</Label>
        <div className="mt-2 space-y-1">
          {s.tiebreakers.map((tb, idx) => (
            <div key={tb} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-mist">{idx + 1}.</span>
              <span>{TB_OPTIONS.find((o) => o.id === tb)?.label ?? tb}</span>
              <Button
                size="sm"
                variant="ghost"
                disabled={idx === 0}
                onClick={() => {
                  const next = [...s.tiebreakers];
                  [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                  onSettings({ tiebreakers: next });
                }}
              >
                ↑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={idx === s.tiebreakers.length - 1}
                onClick={() => {
                  const next = [...s.tiebreakers];
                  [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                  onSettings({ tiebreakers: next });
                }}
              >
                ↓
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
