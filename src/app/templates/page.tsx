"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CreateWizard } from "@/components/tournament/CreateWizard";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";
import { templateDescKey, templateNameKey } from "@/lib/i18n/keys";
import { TEMPLATES } from "@/lib/templates";

function TemplatesInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const preset = params.get("t") ?? undefined;
  const [creating, setCreating] = useState(Boolean(preset));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide">
        {t("templates.title")}
      </h1>
      <p className="mt-2 max-w-2xl text-mist">{t("templates.subtitle")}</p>

      {!creating ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-lg border border-border bg-surface/40 p-5"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                {item.badge}
              </span>
              <h2 className="font-display mt-2 text-3xl tracking-wide">
                {t(templateNameKey(item.id))}
              </h2>
              <p className="mt-2 flex-1 text-sm text-mist">
                {t(templateDescKey(item.id))}
              </p>
              <ul className="mt-4 space-y-1 text-xs text-mist">
                <li>
                  {t("templates.groupsTeams", {
                    groups: item.groupCount,
                    teams: item.teamsPerGroup,
                  })}
                </li>
                <li>
                  {t("templates.qualify", {
                    count: item.settings.qualify_count ?? 2,
                  })}
                  {(item.settings.best_thirds_count ?? 0) > 0 &&
                    t("templates.bestThirds", {
                      count: item.settings.best_thirds_count ?? 0,
                    })}
                </li>
                <li>
                  {t("templates.knockoutOpeners", {
                    count: item.pairings.length,
                  })}
                </li>
              </ul>
              <Button
                className="mt-5"
                onClick={() => {
                  setCreating(true);
                  window.history.replaceState(null, "", `?t=${item.id}`);
                }}
              >
                {t("templates.useTemplate")}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setCreating(false)}
          >
            {t("templates.allTemplates")}
          </Button>
          <CreateWizard defaultTemplateId={preset ?? "wc32"} />
        </div>
      )}

      <p className="mt-12 text-sm text-mist">
        {t("templates.preferDashboard")}{" "}
        <Link href="/dashboard" className="text-accent hover:underline">
          {t("templates.openDashboard")}
        </Link>
      </p>
    </div>
  );
}

export default function TemplatesPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-10 text-mist">{t("public.loading")}</div>}>
      <TemplatesInner />
    </Suspense>
  );
}
