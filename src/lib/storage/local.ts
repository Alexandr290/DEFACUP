import type { Tournament, TournamentBundle } from "../types";

const INDEX_KEY = "defacup:index";
const BUNDLE_PREFIX = "defacup:bundle:";

function readIndex(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

export function listLocalTournaments(): Tournament[] {
  const ids = readIndex();
  const result: Tournament[] = [];
  for (const id of ids) {
    const raw = localStorage.getItem(BUNDLE_PREFIX + id);
    if (!raw) continue;
    try {
      const bundle = JSON.parse(raw) as TournamentBundle;
      result.push(bundle.tournament);
    } catch {
      /* skip */
    }
  }
  return result.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getLocalBundle(idOrSlug: string): TournamentBundle | null {
  const ids = readIndex();
  for (const id of ids) {
    const raw = localStorage.getItem(BUNDLE_PREFIX + id);
    if (!raw) continue;
    try {
      const bundle = JSON.parse(raw) as TournamentBundle;
      if (
        bundle.tournament.id === idOrSlug ||
        bundle.tournament.slug === idOrSlug
      ) {
        return bundle;
      }
    } catch {
      /* skip */
    }
  }
  // Direct id lookup
  const direct = localStorage.getItem(BUNDLE_PREFIX + idOrSlug);
  if (direct) {
    try {
      return JSON.parse(direct) as TournamentBundle;
    } catch {
      return null;
    }
  }
  return null;
}

export function saveLocalBundle(bundle: TournamentBundle): void {
  const updated: TournamentBundle = {
    ...bundle,
    tournament: {
      ...bundle.tournament,
      updated_at: new Date().toISOString(),
    },
  };
  localStorage.setItem(
    BUNDLE_PREFIX + updated.tournament.id,
    JSON.stringify(updated)
  );
  const ids = readIndex();
  if (!ids.includes(updated.tournament.id)) {
    writeIndex([updated.tournament.id, ...ids]);
  }
}

export function deleteLocalBundle(id: string): void {
  localStorage.removeItem(BUNDLE_PREFIX + id);
  writeIndex(readIndex().filter((x) => x !== id));
}

export function exportBundleJson(bundle: TournamentBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function importBundleJson(json: string): TournamentBundle {
  const parsed = JSON.parse(json) as TournamentBundle;
  if (!parsed.tournament?.id || !Array.isArray(parsed.teams)) {
    throw new Error("Invalid tournament JSON");
  }
  return parsed;
}
