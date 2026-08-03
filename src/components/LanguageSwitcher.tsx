"use client";

import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border-2 border-accent/60 bg-surface p-0.5 shadow-sm",
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
            "min-w-9 rounded px-2.5 py-1.5 text-xs font-bold tracking-wider transition-colors",
            locale === item.id
              ? "bg-accent text-white"
              : "text-foreground/70 hover:bg-accent/15 hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
