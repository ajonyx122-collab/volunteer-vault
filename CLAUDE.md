# VolunteerVault — Project Brief

This file gives you (Claude Code) full context on the VolunteerVault project. Read it before writing any code. The founder is AJ, a high school student. Design and strategy were developed in prior planning sessions; this document is the source of truth.

## What VolunteerVault is

A platform where people find volunteer opportunities and build a **verified record of their service**. Two-sided (volunteers + organizations) with a third grassroots layer (community-organized projects like beach cleanups posted by regular users).

**One-line pitch:** VolunteerVault is the verified home for your service story — find opportunities, check in with a scan, and build a service record that colleges and employers can trust.

**Hero tagline (locked):** "Unlock your community."

## Positioning and audience

- Primary launch audience: **high school and college students** who need service hours (NHS, graduation requirements, college apps). Adults and orgs come later.
- Think GitHub/Strava for service: activity → identity → verifiable record.
- Differentiators vs. incumbents (JustServe, Idealist, VolunteerHub):
  1. **The shareable vault link** — every user gets `volunteervault.org/username`, a public verified service transcript (hours, causes, badges, photos, org confirmations).
  2. **QR check-in verification** — orgs display a QR code; volunteers scan in/out; hours log automatically and are org-verified. This is the trust moat.
  3. **Honest reviews** — post-event recaps with photos and "vibe ratings" (organized? welcoming? impactful?) plus practical tips ("bring a hoodie").
  4. **Social layer** — RSVP button says "Count me in"; friends see your RSVPs; crews attend together. #1 predictor of showing up is a friend going.
  5. **Gamification** — streaks (weekly), badges ("First cleanup", "100 hours", "Animal advocate"), school-vs-school leaderboards ("School showdown"). School competition is the growth engine.

## Build phases (roadmap — don't build far ahead, but the app has grown past a strict MVP)

**Current state (July 2026):** The Vite→Next.js migration and the SEO/SSR foundation above are done. Routes now exist across several phases — home, `browse`, `opportunities/[id]`, `signup`/`login` (+ `forgot-password`/`reset-password`), org `dashboard`, `post-opportunity`, `profile`/vault and public `u/[username]`, `certificate/[username]`, plus `community`, `map`, `leaderboards`, and `admin`. Treat later-phase surfaces as **in progress, not finished** — confirm against the code (and Supabase schema) before assuming a given feature is complete or wired up end to end.

- **Phase 1 (MVP):** browse/filter opportunities by interest + location; orgs create listings; user profiles with hours logging. Pages: home, browse/search, opportunity detail, org dashboard, profile/vault, sign-up.
- **Phase 2:** org verification, QR check-in + hours confirmation loop, reviews + photo walls, shareable public vault link, certificate PDF export.
- **Phase 3:** community posts (any user posts a project: what/where/when/headcount/what to bring), map view, RSVP caps, flagging/reporting.
- **Phase 4:** leaderboards, badges, streaks, seasonal challenges, crews.

## Tech stack (agreed)

- Framework: **Next.js 15 (App Router)**, deployed on Vercel. Migrated from the original React + Vite SPA — that migration is **done**; there is no Vite build anymore. (`dev-launcher.mjs` still accepts the old vite-style `--port` flags and translates them to `next dev`/`next start`, so `.claude/launch.json` keeps working.)
- Rendering: the public, SEO-critical pages (home, browse, opportunity detail) are **server-rendered** with ISR (`export const revalidate`), so listings ship in the initial HTML and are indexable. Interactive/auth surfaces (e.g. `community`) are client components (`'use client'`).
- SEO foundation is in place — keep it working when you touch these pages:
  - Dynamic `sitemap.xml` and `robots.txt` — `src/app/sitemap.js`, `src/app/robots.js`
  - Per-page metadata via `generateMetadata` (title/description/canonical/OG)
  - `schema.org/Event` + `BreadcrumbList` JSON-LD on opportunity pages — `src/lib/jsonLd.js`, rendered in `src/app/opportunities/[id]/page.jsx`
- Backend: Supabase (auth, Postgres, storage for photos). Server reads for SSR pages go through `src/lib/api.server.js`; client reads through `src/lib/api.js`; the snake_case↔camelCase mapping is shared in `src/lib/opportunityMapping.js`.
- Keep it beginner-maintainable. No over-engineering.

## Brand and design language

The design must feel **warm, friendly, and fun — not AI-generated or corporate**. Attractive to high schoolers and college students.

### Colors
- Cream page background: `#FDF8EE` (never stark white pages)
- Deep brand green (primary, nav/buttons/footers): `#1B4A30` and `#1B5E38`
- Warm gold/orange accent (CTAs, highlights): `#E8983E`, text on it `#4A2B05`
- Coral accent: `#D85A30`
- Card surfaces: white `#FFFFFF` with soft borders `#EDE6D4`
- Category pastels (chip bg / text): environment `#DFF0E6`/`#0F5132`, sports/food `#FDEBD2`/`#8A5410`, art `#FBE4EC`/`#94305C`, music `#E4EEFB`/`#1D5B9E`, medicine `#FBE7E4`/`#A03A28`, animals `#F0EAFB`/`#5B3E9E`
- Cream text on green: `#FFF7E8`, muted `#B9D4C2`

### Shape and tone
- Pill-shaped buttons (border-radius 999px), 14–16px card radius, generous whitespace
- Small hand-drawn touches (e.g., an orange squiggle underline under key words in the hero)
- Microcopy sounds like a person, not a company: "Your people are already out here. Come find them." / "12 going already" / "School showdown" / "chill first-timer pick"
- Primary CTA verb everywhere: **"Count me in"**
- Verified org badge (checkmark), pending states shown honestly
- Logo: green sun/rays circle with heart center; wordmark "Volunteer" (green) + "VAULT" (orange). PNG assets exist; place in `/public/brand/`.

## Page blueprints (wireframed and approved)

1. **Home:** nav (Browse / Community / Leaderboards / Join free) → hero "Unlock your community" + search (interest + location) + trust stats pills → colorful category chips with icons → "Happening near you" cards (mix org listings + community posts; show friends going, spots left, vibe rating) → dark green "Your vault = your proof" strip with share link + stats (hours/streak/badges) → 3-step how-it-works (Find it / Scan in / Vault it) → school showdown leaderboard teaser → org CTA band.
2. **Profile/vault:** green header with avatar, name, school, "Share my vault" + "Certificate" buttons → stat cards (verified hours, streak, badges, causes) → badge shelf incl. locked next badge ("200 hrs to go") → "Where the hours went" stacked cause bar → recent activity list with Verified/Pending pills.
3. **Browse:** search bar + filter chips (distance, date, verified only, good for crews) → horizontal scan-fast list cards (icon, title, verified check, vibe rating, org · time · distance · age · review quote, Count me in) → small map preview with pins + "Open full map" → streak alert sidebar card ("Volunteer by Sunday to keep your 9-week streak alive").
4. **Opportunity detail, org dashboard, sign-up:** not yet wireframed — follow the same design language.

## Data model starting point (Phase 1)

> The list below is the original Phase 1 sketch. The live schema has since grown (e.g. `opportunities` also has `city/state/zip`, `is_online`, `is_ongoing`, `external_url`/`signup_link`, `tags`, `what_to_bring`; orgs have directory fields). Source of truth is the SQL in `supabase/` (migrations + `schema.sql`) and the field mapping in `src/lib/opportunityMapping.js` — check there before relying on this list.

- `profiles`: id, username, display_name, school, grad_year, avatar_url, created_at
- `organizations`: id, name, verified (bool), description, location
- `opportunities`: id, org_id, title, category, description, starts_at, duration_hours, lat/lng + address, capacity, min_age
- `signups`: id, user_id, opportunity_id, status (rsvp / attended / no_show)
- `hour_logs`: id, user_id, opportunity_id, hours, status (pending / verified), verified_by

## Rules for you (Claude Code)

- Ship the smallest working version of each feature; resist Phase 3/4 features during Phase 1.
- Keep the warm design language on every page; never regress to generic white/gray/blue template styling.
- All copy in the friendly student voice described above.
- The platform will have minor users: no DMs between users in any phase, and keep any location display coarse (never show a minor's precise location publicly).
