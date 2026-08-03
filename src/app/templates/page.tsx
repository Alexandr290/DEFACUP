"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CreateWizard } from "@/components/tournament/CreateWizard";
import { Button } from "@/components/ui/Button";
import { TEMPLATES } from "@/lib/templates";

function TemplatesInner() {
  const params = useSearchParams();
  const preset = params.get("t") ?? undefined;
  const [creating, setCreating] = useState(Boolean(preset));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide">Templates</h1>
      <p className="mt-2 max-w-2xl text-mist">
        Start from a proven championship format. Each template builds groups,
        round-robin fixtures, and a knockout bracket with the right seeding paths.
      </p>

      {!creating ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-lg border border-border bg-surface/40 p-5"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                {t.badge}
              </span>
              <h2 className="font-display mt-2 text-3xl tracking-wide">{t.name}</h2>
              <p className="mt-2 flex-1 text-sm text-mist">{t.description}</p>
              <ul className="mt-4 space-y-1 text-xs text-mist">
                <li>
                  {t.groupCount} groups × {t.teamsPerGroup} teams
                </li>
                <li>
                  Qualify: {t.settings.qualify_count}/group
                  {(t.settings.best_thirds_count ?? 0) > 0 &&
                    ` + ${t.settings.best_thirds_count} best 3rds`}
                </li>
                <li>{t.pairings.length} knockout openers</li>
              </ul>
              <Button
                className="mt-5"
                onClick={() => {
                  setCreating(true);
                  window.history.replaceState(null, "", `?t=${t.id}`);
                }}
              >
                Use template
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <Button variant="ghost" className="mb-4" onClick={() => setCreating(false)}>
            ← All templates
          </Button>
          <CreateWizard defaultTemplateId={preset ?? "wc32"} />
        </div>
      )}

      <p className="mt-12 text-sm text-mist">
        Prefer the dashboard?{" "}
        <Link href="/dashboard" className="text-accent hover:underline">
          Open dashboard
        </Link>
      </p>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-mist">Loading…</div>}>
      <TemplatesInner />
    </Suspense>
  );
}
