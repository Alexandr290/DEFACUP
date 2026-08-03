"use client";

import { useEffect } from "react";
import { useTournamentStore } from "@/lib/storage/store";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useTournamentStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return <>{children}</>;
}
