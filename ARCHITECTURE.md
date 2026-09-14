# FlorinGo Travel App — Architecture

## Reference stack

The commercial Travel App is now defined around this stack:

`GitHub → Vercel → Next.js → Supabase dedicated`

Islanda 2026 remains isolated on `main` and on its current Netlify/Supabase setup.

## Repository strategy

Current development laboratory: branch `travel-app-template`.

Short term:
- keep product definition, schema and the new Next.js shell in this branch;
- never merge experimental commercial work into `main`;
- use preview deployments for development and review.

Before production launch:
- extract the commercial Travel App into its own GitHub repository;
- connect that repository directly to a dedicated Vercel project;
- connect a dedicated Supabase project;
- keep Islanda as a reference implementation only.

## Frontend

Framework: Next.js App Router + TypeScript.

Principles:
- mobile first;
- app-like navigation;
- server/client boundaries kept explicit;
- no travel-specific hardcoded data in UI components;
- every trip resolved from `trip_id` / slug;
- destination modules activated by configuration;
- offline essentials designed from the beginning.

Primary areas:
- `/` account/trip dashboard;
- `/trip/[slug]` trip shell;
- `/trip/[slug]/itinerary`;
- `/trip/[slug]/utility`;
- `/trip/[slug]/budget`;
- `/trip/[slug]/more`;
- `/admin` FlorinGo backoffice, later phase.

## Backend

Supabase dedicated to the commercial product.

Core entities:
- profiles;
- trips;
- trip_members;
- trip_invites;
- days;
- day_items;
- lodgings;
- bookings;
- checklist_items;
- notes;
- expenses;
- push_subscriptions.

Rules:
- RLS on every user-facing table;
- all operational records scoped by `trip_id`;
- personal records additionally scoped by `user_id`;
- editorial trip content writable only by FlorinGo/Admin or explicitly authorized editors;
- no service-role key in browser code.

## Authentication

MVP:
- Google OAuth;
- email magic link / OTP;
- persistent session.

Future native client:
- Apple login;
- biometric/PIN quick unlock.

Authentication identity and quick-unlock mechanisms remain separate concepts.

## Deployment

Development flow:
1. feature work on GitHub;
2. Vercel preview deployment;
3. visual/functional review;
4. merge to commercial production branch/repository;
5. Vercel production deployment.

Environment variables live in Vercel, never committed with real values.

## Product boundary

Islanda validates UX and operational concepts. The commercial app must not become a copy of Islanda with different text.

Target flow:

`questionario → progettazione → trip_id → pubblicazione → accesso cliente → uso durante il viaggio`

The Travel Designer must eventually be able to create and update a trip without editing code.

## Flutter

Flutter is deliberately postponed.

If adopted later, the backend, auth model, data schema, roles, trip lifecycle and editorial logic remain valid. Only the client/UI layer is replaced or complemented by Flutter.
