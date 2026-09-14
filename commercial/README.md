# FlorinGo Travel App · commercial core v0

Questa cartella contiene il primo nucleo multi-cliente della Travel App. È separata dalla PWA Islanda pubblicata su `main`.

## Cosa è già pronto

- login con Google tramite Supabase Auth
- login passwordless via magic link email
- sessione persistente sul dispositivo
- un utente può avere più viaggi
- ruoli `owner`, `editor`, `traveler`
- creazione viaggio
- inviti tramite codice/link
- accettazione automatica dell'invito dopo il login
- isolamento dei dati con `trip_id`
- RLS Supabase per separare i clienti
- tabelle già previste per itinerario, alloggi, prenotazioni, checklist, note, spese e push
- data client JS pronto per collegare il motore grafico esistente

## File

- `index.html` — prototipo login + dashboard viaggi
- `commercial.css` — UI dark/orange coerente con la Travel App
- `commercial-auth.js` — Google OAuth, magic link, sessione, creazione/inviti
- `travel-data.js` — accesso ai dati separati per viaggio
- `config.js` — configurazione del futuro progetto Supabase
- `supabase-schema.sql` — schema, RPC e RLS del backend commerciale

## Attivazione su un progetto Supabase dedicato

1. Creare un nuovo progetto Supabase dedicato a FlorinGo Travel App.
2. Eseguire `supabase-schema.sql` come migration.
3. Copiare Project URL e Publishable/Anon Key in `config.js`.
4. In Supabase Auth abilitare Email passwordless.
5. Abilitare il provider Google e configurare Client ID + Client Secret.
6. Nel progetto Google OAuth autorizzare il callback Supabase del progetto (`https://<project-ref>.supabase.co/auth/v1/callback`).
7. In Supabase configurare Site URL e Redirect URLs con l'URL reale in cui verrà pubblicata `commercial/index.html`.
8. Testare: Google, magic link, logout, creazione viaggio, link invito, accesso con secondo utente e isolamento RLS.

## Modello commerciale

Il primo utente che crea un viaggio diventa `owner`. L'owner può generare inviti. Un invito può assegnare il ruolo `traveler` oppure `editor`. I partecipanti vedono esclusivamente i viaggi a cui appartengono.

Il PIN a 4 cifre usato dall'app Islanda non viene usato come autenticazione primaria commerciale: in futuro potrà essere aggiunto come sblocco rapido locale dopo l'autenticazione account.

## Prossima fase tecnica

Collegare l'attuale motore visuale della PWA (Home / Itinerario / Utility / Budget / Altro) a `travel-data.js`, eliminando progressivamente i dati Islanda hardcoded. A quel punto una nuova destinazione diventa principalmente caricamento/configurazione dati invece di sviluppo di una nuova app.
