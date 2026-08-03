"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/context";
import { templateDescKey, templateNameKey } from "@/lib/i18n/keys";
import { TEMPLATES } from "@/lib/templates";
import { useTournamentStore } from "@/lib/storage/store";
import { cn } from "@/lib/utils";

export function CreateWizard({
  defaultTemplateId,
}: {
  defaultTemplateId?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const create = useTournamentStore((s) => s.create);
  const [name, setName] = useState(t("wizard.defaultName"));
  const [season, setSeason] = useState(String(new Date().getFullYear()));
  const [templateId, setTemplateId] = useState(defaultTemplateId ?? "wc32");
  const [groupCount, setGroupCount] = useState(8);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [seed, setSeed] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName((prev) =>
      prev === "World Cup" || prev === "Чемпионат мира"
        ? t("wizard.defaultName")
        : prev
    );
  }, [t]);

  const template = TEMPLATES.find((item) => item.id === templateId)!;
  const isCustom = templateId === "custom";
  const groups = isCustom ? groupCount : template.groupCount;
  const teams = isCustom ? teamsPerGroup : template.teamsPerGroup;
  const thirds = template.settings.best_thirds_count ?? 0;

  const submit = async () => {
    setLoading(true);
    try {
      const bundle = await create({
        name,
        seasonLabel: season,
        templateId,
        groupCount: isCustom ? groupCount : undefined,
        teamsPerGroup: isCustom ? teamsPerGroup : undefined,
        seedSampleTeams: seed,
      });
      router.push(`/t/${bundle.tournament.slug}/edit`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl tracking-wide">
          {t("wizard.title")}
        </h2>
        <p className="mt-1 text-mist">{t("wizard.subtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTemplateId(item.id);
              setGroupCount(item.groupCount);
              setTeamsPerGroup(item.teamsPerGroup);
            }}
            className={cn(
              "rounded-lg border p-4 text-left transition-all",
              templateId === item.id
                ? "border-accent bg-accent/10"
                : "border-border bg-surface/40 hover:border-accent/40"
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              {item.badge}
            </span>
            <p className="font-display mt-1 text-2xl tracking-wide">
              {t(templateNameKey(item.id))}
            </p>
            <p className="mt-1 text-sm text-mist">
              {t(templateDescKey(item.id))}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{t("wizard.name")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>{t("wizard.season")}</Label>
          <Input value={season} onChange={(e) => setSeason(e.target.value)} />
        </div>
        {isCustom && (
          <>
            <div>
              <Label>{t("wizard.groups")}</Label>
              <Input
                type="number"
                min={2}
                max={16}
                value={groupCount}
                onChange={(e) => setGroupCount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>{t("wizard.teamsPerGroup")}</Label>
              <Input
                type="number"
                min={3}
                max={8}
                value={teamsPerGroup}
                onChange={(e) => setTeamsPerGroup(Number(e.target.value))}
              />
            </div>
          </>
        )}
        <div>
          <Label>{t("wizard.visibility")}</Label>
          <Select defaultValue="unlisted" disabled>
            <option value="unlisted">{t("wizard.visibilityUnlisted")}</option>
          </Select>
          <p className="mt-1 text-xs text-mist">{t("wizard.visibilityHint")}</p>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={seed}
              onChange={(e) => setSeed(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            {t("wizard.seedSample")}
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface/30 px-4 py-3 text-sm text-mist">
        {t("wizard.summary", {
          groups,
          teams,
          qualify: template.settings.qualify_count ?? 2,
          thirds:
            thirds > 0 ? t("wizard.thirdsPart", { count: thirds }) : "",
        })}
      </div>

      <Button size="lg" onClick={submit} disabled={loading || !name.trim()}>
        {loading ? t("wizard.creating") : t("wizard.create")}
      </Button>
    </div>
  );
}
