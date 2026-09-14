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

## Backend

Per evitare che viaggi diversi condividano per errore note, checklist o spese, la soluzione consigliata è aggiungere `trip_id` alle tabelle dinamiche. In alternativa si può usare un backend separato per ogni viaggio.

## Stato

Questo branch nasce dalla versione stabile Islanda v21. Non è il branch pubblicato per il viaggio Islanda e può essere evoluto senza rischiare la PWA in uso.
