"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  dictionaries,
  interpolate,
  type Dictionary,
  type Locale,
} from "./dictionaries";

type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Record<string, string>
    ? `${K}.${keyof T[K] & string}`
    : never;
}[keyof T & string];

export type TranslationKey = NestedKeyOf<Dictionary>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  dict: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "defacup:locale";

function getByPath(dict: Dictionary, key: TranslationKey): string {
  const [section, field] = key.split(".") as [keyof Dictionary, string];
  const block = dict[section] as Record<string, string> | undefined;
  return block?.[field] ?? key;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "en" || stored === "ru") {
      setLocaleState(stored);
    } else if (navigator.language.toLowerCase().startsWith("ru")) {
      setLocaleState("ru");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const dict = dictionaries[locale];

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const raw = getByPath(dict, key);
      return vars ? interpolate(raw, vars) : raw;
    },
    [dict]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, dict }),
    [locale, setLocale, t, dict]
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}
