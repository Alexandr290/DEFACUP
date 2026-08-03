import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-border mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display text-lg tracking-wide text-mist">DEFACUP</p>
        <p className="text-sm text-mist">
          Advanced football championship tables — groups, knockouts, and live standings.
        </p>
        <div className="flex gap-4 text-sm text-mist">
          <Link href="/templates" className="hover:text-accent">
            Templates
          </Link>
          <Link href="/dashboard" className="hover:text-accent">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
