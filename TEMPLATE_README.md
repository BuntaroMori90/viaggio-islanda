# Travel App Template

Questo branch è la base riutilizzabile della PWA viaggio, separata dalla versione Islanda pubblicata su `main`.

## Obiettivo

Per ogni nuova destinazione si mantiene il motore dell'app e si sostituiscono soltanto i dati del viaggio: date, partecipanti, voli, alloggi, prenotazioni, giornate, utility locali, valuta, meteo, emergenze e budget.

## Workflow per una nuova destinazione

1. Duplicare questa base in una nuova repository o in un nuovo progetto.
2. Compilare `trip-config.example.js` con i dati reali.
3. Sostituire immagini/hero e palette solo se serve.
4. Adattare le utility alla destinazione.
5. Configurare i dati dinamici: meteo, valuta, eventuali strade/trasporti.
6. Collegare il backend con un `trip_id` dedicato, oppure usare un progetto Supabase separato.
7. Verificare PWA, offline, notifiche, tasto Indietro, bottom navigation e cache version.

## Cosa resta nel motore

- navigazione Home / Itinerario / Utility / Budget / Altro
- dashboard Home
- itinerario a giorni e apertura automatica del giorno corrente
- A6 / logica di riduzione del programma
- checklist
- note condivise
- spese di gruppo e saldi
- convertitore valuta
- meteo live / previsionale
- portafoglio viaggio
- service worker / PWA / cache
- notifiche

## Commercial core v0

È stato avviato anche il nucleo multi-cliente in `commercial/`.

La base commerciale prevede:

- Supabase Auth con Google OAuth e magic link email
- sessione persistente sul dispositivo
- più viaggi per account
- ruoli `owner`, `editor`, `traveler`
- creazione viaggio
- inviti con link/codice
- `trip_id` su tutti i dati operativi
- Row Level Security per separare i clienti
- tabelle dedicate a itinerario, alloggi, prenotazioni, checklist, note, spese e push

Vedi `commercial/README.md` per setup e architettura.

## Backend

Per la versione commerciale la soluzione scelta è un progetto Supabase dedicato, con autenticazione reale e isolamento RLS per `trip_id`. Il database Islanda non va riutilizzato come backend multi-cliente.

## Stato

`main` resta la PWA Islanda in uso. `travel-app-template` è il laboratorio riutilizzabile e può evolvere senza rischiare l'app del viaggio Islanda.
