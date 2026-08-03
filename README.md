# DEFACUP

Advanced football championship tables — World Cup–style group stages, live standings, and knockout brackets.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Auth, Postgres, RLS, Realtime)
- Zustand + localStorage (works offline / without Supabase keys)
- Framer Motion

## Quick start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, the app runs fully in **local mode** (browser storage). Add your Supabase URL and anon key to enable cloud sync and auth.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Put URL + anon key in `.env.local`
3. Run the SQL in [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) in the SQL editor
4. Enable Email auth (and optionally confirmations)

## Features

- Templates: World Cup 32/48, Euro 24, AFCON, Copa América 16, Custom
- Teams: add/edit, bulk CSV import, pots, drag-and-drop group draw, shuffle/pot draw
- Group tables: Pld/W/D/L/GF/GA/GD/Pts, form, qualification zones, best thirds
- Tiebreakers: points → GD → GF → H2H → fair play → lots (reorderable)
- Match center with live/finished/clear, what-if simulation
- Knockout bracket with template seeding, ET/pens, auto-advance, champion
- Share view `/t/[slug]`, JSON export, print, dark/light theme

## Scripts

```bash
npm run dev
npm run build
npm run lint
node --experimental-strip-types scripts/test-standings.mjs
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/dashboard` | Your tournaments |
| `/templates` | Format picker |
| `/login` `/signup` | Supabase auth |
| `/t/[slug]` | Public / share view |
| `/t/[slug]/edit` | Full editor |
