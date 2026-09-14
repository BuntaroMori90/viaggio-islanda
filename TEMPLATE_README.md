# FlorinGo Travel App — Development Lab

Questo branch è il laboratorio della Travel App commerciale FlorinGo. È separato dalla PWA Islanda pubblicata su `main`.

## Stack scelto

`GitHub → Vercel → Next.js → Supabase dedicato`

Flutter resta una possibile evoluzione futura del client, non una decisione necessaria adesso.

## Regola principale

`main` = Islanda 2026 stabile e in uso.

`travel-app-template` = sviluppo commerciale, esperimenti, architettura e nuova UI.

Le modifiche della Travel App non devono essere riportate su `main` salvo decisione esplicita.

## Obiettivo prodotto

Arrivare a un flusso in cui FlorinGo possa:

`creare viaggio → inserire/progettare dati → pubblicare → cliente accede`

senza duplicare repository o modificare codice per ogni destinazione.

## Frontend nuovo

È stata avviata una base Next.js + TypeScript nella root del branch:

- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `package.json`
- `tsconfig.json`
- `next.config.ts`

La prima pagina è un product shell di riferimento, non ancora la Travel App completa.

## Backend commerciale

Il database Islanda non va riutilizzato.

La Travel App avrà un progetto Supabase dedicato con:

- Supabase Auth;
- Google OAuth + email magic link / OTP;
- utenti multi-trip;
- ruoli `owner`, `editor`, `traveler`;
- `trip_id` su tutti i dati operativi;
- RLS per isolamento completo dei clienti;
- tabelle per itinerario, alloggi, prenotazioni, checklist, note, spese e notifiche.

Il lavoro precedente in `commercial/` resta materiale di riferimento per schema e flussi, ma il frontend commerciale nuovo viene sviluppato in Next.js.

## Vercel

Quando collegheremo il branch/repository al progetto Vercel:

- ogni sviluppo avrà una Preview Deployment;
- il backend userà variabili d'ambiente Vercel;
- nessuna chiave reale verrà committata;
- prima del lancio commerciale il progetto verrà idealmente estratto in una repository dedicata.

## Documenti di riferimento

- `TRAVEL_APP_PRODUCT_SPEC.md` — definizione del prodotto e MVP.
- `ARCHITECTURE.md` — architettura tecnica e strategia deployment.
- `commercial/schema.sql` — prima base dello schema multi-cliente.
- `.env.example` — variabili previste, senza valori reali.

## Prossimi blocchi di lavoro

1. creare/collegare Supabase commerciale dedicato;
2. impostare autenticazione reale;
3. trasformare il product shell in dashboard account;
4. introdurre modello `trip_id` / slug;
5. costruire il primo viaggio demo completo;
6. aggiungere backoffice FlorinGo progressivamente;
7. valutare Flutter solo dopo aver validato il prodotto web commerciale.
