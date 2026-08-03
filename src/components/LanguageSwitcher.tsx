"use client";

import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface/60 p-0.5",
        className
      )}
      role="group"
      aria-label={t("nav.language")}
    >
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setLocale(item.id as Locale)}
          className={cn(
            "rounded px-2 py-1 text-xs font-bold tracking-wide transition-colors",
            locale === item.id
              ? "bg-accent text-white"
              : "text-mist hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
