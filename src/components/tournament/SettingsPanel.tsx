"use client";

import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/context";
import type { Tournament, TournamentSettings, Tiebreaker } from "@/lib/types";

const TB_KEYS: Record<Tiebreaker, TranslationKey> = {
  points: "settings.tb_points",
  goal_difference: "settings.tb_goal_difference",
  goals_for: "settings.tb_goals_for",
  head_to_head: "settings.tb_head_to_head",
  fair_play: "settings.tb_fair_play",
  drawing_of_lots: "settings.tb_drawing_of_lots",
};

export function SettingsPanel({
  tournament,
  onUpdate,
  onSettings,
}: {
  tournament: Tournament;
  onUpdate: (patch: Partial<Tournament>) => void;
  onSettings: (patch: Partial<TournamentSettings>) => void;
}) {
  const { t } = useI18n();
  const s = tournament.settings;

  return (
    <div className="space-y-6">
      <h3 className="font-display text-2xl tracking-wide">
        {t("settings.title")}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{t("settings.name")}</Label>
          <Input
            value={tournament.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>
        <div>
          <Label>{t("settings.season")}</Label>
          <Input
            value={tournament.season_label}
            onChange={(e) => onUpdate({ season_label: e.target.value })}
          />
        </div>
        <div>
          <Label>{t("settings.status")}</Label>
          <Select
            value={tournament.status}
            onChange={(e) =>
              onUpdate({
                status: e.target.value as Tournament["status"],
              })
            }
          >
            <option value="draft">{t("settings.statusDraft")}</option>
            <option value="group">{t("settings.statusGroup")}</option>
            <option value="knockout">{t("settings.statusKnockout")}</option>
            <option value="completed">{t("settings.statusCompleted")}</option>
          </Select>
        </div>
        <div>
          <Label>{t("settings.visibility")}</Label>
          <Select
            value={tournament.visibility}
            onChange={(e) =>
              onUpdate({
                visibility: e.target.value as Tournament["visibility"],
              })
            }
          >
            <option value="private">{t("settings.private")}</option>
            <option value="unlisted">{t("settings.unlisted")}</option>
            <option value="public">{t("settings.public")}</option>
          </Select>
        </div>
        <div>
          <Label>{t("settings.pointsWin")}</Label>
          <Input
            type="number"
            value={s.points_win}
            onChange={(e) => onSettings({ points_win: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>{t("settings.pointsDraw")}</Label>
          <Input
            type="number"
            value={s.points_draw}
            onChange={(e) =>
              onSettings({ points_draw: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>{t("settings.qualifyPerGroup")}</Label>
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
          <Label>{t("settings.bestThirdsCount")}</Label>
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
          {t("settings.thirdPlaceMatch")}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.knockout_et}
            onChange={(e) => onSettings({ knockout_et: e.target.checked })}
            className="accent-[var(--accent)]"
          />
          {t("settings.extraTime")}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.knockout_pens}
            onChange={(e) => onSettings({ knockout_pens: e.target.checked })}
            className="accent-[var(--accent)]"
          />
          {t("settings.penalties")}
        </label>
      </div>

      <div>
        <Label>{t("settings.tiebreakerOrder")}</Label>
        <div className="mt-2 space-y-1">
          {s.tiebreakers.map((tb, idx) => (
            <div key={tb} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-mist">{idx + 1}.</span>
              <span>{t(TB_KEYS[tb])}</span>
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
