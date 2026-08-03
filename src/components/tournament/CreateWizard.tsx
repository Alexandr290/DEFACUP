"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { TEMPLATES } from "@/lib/templates";
import { useTournamentStore } from "@/lib/storage/store";
import { cn } from "@/lib/utils";

export function CreateWizard({
  defaultTemplateId,
}: {
  defaultTemplateId?: string;
}) {
  const router = useRouter();
  const create = useTournamentStore((s) => s.create);
  const [name, setName] = useState("World Cup");
  const [season, setSeason] = useState(String(new Date().getFullYear()));
  const [templateId, setTemplateId] = useState(defaultTemplateId ?? "wc32");
  const [groupCount, setGroupCount] = useState(8);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [seed, setSeed] = useState(true);
  const [loading, setLoading] = useState(false);

  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const isCustom = templateId === "custom";

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
        <h2 className="font-display text-4xl tracking-wide">New tournament</h2>
        <p className="mt-1 text-mist">
          Pick a World Cup–style template, seed nations, and start building tables.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTemplateId(t.id);
              setGroupCount(t.groupCount);
              setTeamsPerGroup(t.teamsPerGroup);
            }}
            className={cn(
              "rounded-lg border p-4 text-left transition-all",
              templateId === t.id
                ? "border-accent bg-accent/10"
                : "border-border bg-surface/40 hover:border-accent/40"
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              {t.badge}
            </span>
            <p className="font-display mt-1 text-2xl tracking-wide">{t.name}</p>
            <p className="mt-1 text-sm text-mist">{t.description}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Tournament name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Season / edition</Label>
          <Input value={season} onChange={(e) => setSeason(e.target.value)} />
        </div>
        {isCustom && (
          <>
            <div>
              <Label>Groups</Label>
              <Input
                type="number"
                min={2}
                max={16}
                value={groupCount}
                onChange={(e) => setGroupCount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Teams per group</Label>
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
          <Label>Visibility</Label>
          <Select defaultValue="unlisted" disabled>
            <option value="unlisted">Unlisted (shareable link)</option>
          </Select>
          <p className="mt-1 text-xs text-mist">
            Change visibility later in tournament settings.
          </p>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={seed}
              onChange={(e) => setSeed(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Seed sample teams from template
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface/30 px-4 py-3 text-sm text-mist">
        {template.groupCount} groups · {template.teamsPerGroup} teams each ·{" "}
        {template.settings.qualify_count} qualify
        {(template.settings.best_thirds_count ?? 0) > 0 &&
          ` · ${template.settings.best_thirds_count} best thirds`}{" "}
        · Knockout bracket auto-built
      </div>

      <Button size="lg" onClick={submit} disabled={loading || !name.trim()}>
        {loading ? "Creating…" : "Create tournament"}
      </Button>
    </div>
  );
}
