"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="no-print border-t border-border mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-brand text-lg tracking-wide text-mist">DEFACUP</p>
        <p className="text-sm text-mist">{t("footer.tagline")}</p>
        <div className="flex gap-4 text-sm text-mist">
          <Link href="/templates" className="hover:text-accent">
            {t("nav.templates")}
          </Link>
          <Link href="/dashboard" className="hover:text-accent">
            {t("nav.dashboard")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
