"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Moon, Sun, Trophy } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/Button";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function SiteNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("defacup:theme") as "dark" | "light" | null;
    const next = stored ?? "dark";
    setTheme(next);
    document.documentElement.setAttribute(
      "data-theme",
      next === "light" ? "light" : ""
    );
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("defacup:theme", next);
    document.documentElement.setAttribute(
      "data-theme",
      next === "light" ? "light" : ""
    );
  };

  const links = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/templates", label: t("nav.templates") },
  ];

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-accent text-white">
            <Trophy className="h-4 w-4" />
          </span>
          <span className="font-brand text-xl tracking-wide group-hover:text-accent transition-colors">
            DEFACUP
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname.startsWith(l.href)
                  ? "text-accent"
                  : "text-mist hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md p-2 text-mist hover:text-foreground hover:bg-white/5"
            aria-label={t("nav.toggleTheme")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          {email ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                {email.split("@")[0]}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  {t("nav.signIn")}
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">{t("nav.openApp")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
