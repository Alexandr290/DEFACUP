"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Copy, Plus, Trash2, Upload } from "lucide-react";
import { CreateWizard } from "@/components/tournament/CreateWizard";
import { Button } from "@/components/ui/Button";
import { importBundleJson, saveLocalBundle } from "@/lib/storage/local";
import { useTournamentStore } from "@/lib/storage/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function DashboardPage() {
  const { list, hydrate, remove, duplicate, hydrated, refreshList } =
    useTournamentStore();
  const [showCreate, setShowCreate] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-wide">Dashboard</h1>
          <p className="mt-1 text-mist">
            Your championships
            {!isSupabaseConfigured() && " · local browser storage"}
            {isSupabaseConfigured() && " · synced with Supabase when signed in"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const bundle = importBundleJson(text);
                saveLocalBundle(bundle);
                await refreshList();
              } catch {
                alert("Invalid tournament JSON");
              }
              e.target.value = "";
            }}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
          <Button onClick={() => setShowCreate((v) => !v)}>
            <Plus className="h-4 w-4" />
            New tournament
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="mt-10 rounded-xl border border-border bg-surface/40 p-6">
          <CreateWizard />
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-border bg-surface/50 p-5 transition-colors hover:border-accent/40"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-accent">
                  {t.template_id} · {t.status}
                </p>
                <h2 className="font-display mt-1 text-3xl tracking-wide">
                  {t.name}
                </h2>
                <p className="text-sm text-mist">{t.season_label}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/t/${t.slug}/edit`}>
                <Button size="sm">Edit</Button>
              </Link>
              <Link href={`/t/${t.slug}`}>
                <Button size="sm" variant="secondary">
                  View
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  const copy = await duplicate(t.id);
                  if (copy) window.location.href = `/t/${copy.tournament.slug}/edit`;
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm("Delete this tournament?")) remove(t.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-danger" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 && !showCreate && (
        <div className="mt-16 text-center">
          <p className="font-display text-3xl tracking-wide text-mist">
            No tournaments yet
          </p>
          <p className="mt-2 text-mist">
            Create a World Cup–style championship to get started.
          </p>
          <Button className="mt-6" onClick={() => setShowCreate(true)}>
            Create your first
          </Button>
        </div>
      )}
    </div>
  );
}
