# FlorinGo Travel App — Product Definition

## 1. Prodotto

FlorinGo Travel App è il livello operativo del viaggio progettato da FlorinGo.

Non è un generatore di itinerari e non è una lista di luoghi. Il cliente riceve un viaggio già progettato e lo usa prima e durante la partenza da un'unica app.

Principio di prodotto:

> Progettiamo viaggi. Non liste di posti.

La Travel App deve trasformare il progetto del Travel Designer in uno strumento quotidiano: chiaro, rapido, offline quando possibile e utile soprattutto durante il viaggio.

## 2. Obiettivo MVP

Consegnare a ogni cliente una app personale di viaggio con:

- itinerario giorno per giorno;
- priorità Must / Bonus / Sacrificabile;
- orari, prenotazioni e alloggi;
- logica operativa e cut-off della giornata;
- meteo e informazioni live dove disponibili;
- valuta e utility locali;
- checklist personale;
- note condivise;
- spese di gruppo;
- notifiche;
- accesso per tutti i partecipanti;
- funzionamento offline per i contenuti essenziali.

L'MVP non deve permettere al cliente di distruggere o riscrivere accidentalmente l'itinerario progettato da FlorinGo.

## 3. Ruoli

### FlorinGo Admin / Travel Designer

- crea il viaggio;
- compila itinerario, alloggi, voli, prenotazioni e utility;
- aggiorna contenuti operativi;
- pubblica il viaggio;
- può modificare sempre i dati editoriali del viaggio;
- può inviare notifiche ai partecipanti.

### Trip Owner

È il cliente principale.

- accede al viaggio acquistato;
- invita o rimuove partecipanti;
- usa checklist, note e spese;
- gestisce alcune preferenze del gruppo;
- non modifica l'itinerario editoriale salvo permessi espliciti.

### Traveler

- consulta tutto il viaggio;
- usa la propria checklist;
- partecipa a note e spese;
- riceve notifiche;
- non modifica i contenuti progettati da FlorinGo.

Un eventuale ruolo Editor resta disponibile per collaboratori FlorinGo o casi speciali.

## 4. Accesso

Per il prodotto commerciale l'autenticazione deve essere reale.

Metodi previsti:

- Google;
- email con magic link / OTP;
- Apple in una futura app iOS nativa.

Dopo il primo accesso la sessione resta memorizzata sul dispositivo. PIN o biometria potranno essere aggiunti come accesso rapido, non come identità primaria.

## 5. Flusso cliente

1. Il cliente acquista un servizio FlorinGo.
2. Compila il questionario viaggio.
3. FlorinGo progetta l'itinerario.
4. Viene creato un `trip_id` dedicato.
5. Il Travel Designer pubblica il viaggio.
6. Il cliente riceve un link: `Apri il tuo viaggio`.
7. Effettua login con Google o email.
8. Diventa Trip Owner.
9. Invita i compagni tramite link, QR o codice.
10. Tutti ritrovano lo stesso viaggio sui propri dispositivi.
11. FlorinGo può aggiornare il viaggio fino alla partenza e, se necessario, durante il viaggio.

## 6. Navigazione principale

La struttura validata con Islanda resta il riferimento:

### Home

- destinazione e date;
- countdown prima della partenza;
- prossimo evento durante il viaggio;
- prossimo booking;
- meteo sintetico;
- alert operativo;
- accesso rapido a mappe / trasporti / emergenze.

### Itinerario

- giornate;
- timeline;
- racconto sintetico;
- Must / Bonus / Sacrificabili;
- cut-off / logica di riduzione programma;
- alloggio;
- prenotazioni;
- costi locali e pedaggi;
- carburante o trasporti quando rilevanti;
- mappe e azioni rapide.

### Utility

Ordine di riferimento:

1. convertitore valuta;
2. checklist essenziale;
3. checklist personale;
4. app utili della destinazione;
5. consigli extra.

Le utility cambiano per destinazione e non devono diventare mini-app inutili.

### Budget

- costo noto del viaggio;
- spese di gruppo;
- chi ha pagato;
- saldi fra partecipanti;
- categorie di spesa.

### Altro

- portafoglio viaggio;
- documenti / riferimenti prenotazioni;
- alloggi;
- emergenze;
- assicurazione;
- note del gruppo;
- impostazioni viaggio e partecipanti.

## 7. Modello itinerario

Ogni giornata deve poter contenere:

- numero giorno;
- data;
- titolo;
- zona geografica;
- coordinate;
- timeline;
- descrizione;
- Must;
- Bonus;
- Sacrificabili;
- cut-off;
- prenotazioni;
- alloggio;
- mobilità;
- carburante;
- parcheggi / pedaggi / ingressi;
- pasti / note food;
- link mappa;
- note operative;
- eventuale `nextMorning`.

La logica Must / Bonus / Sacrificabile è una caratteristica distintiva FlorinGo e deve restare parte del prodotto.

## 8. Multi-trip

Un utente può avere più viaggi nello stesso account:

- Islanda 2026;
- Giappone 2027;
- USA 2028.

La dashboard account mostra soltanto i viaggi di cui l'utente è membro.

Ogni contenuto dinamico deve essere associato a `trip_id` e, quando personale, anche a `user_id`.

## 9. Dati e sicurezza

Backend previsto: Supabase dedicato alla Travel App commerciale.

Entità principali:

- profiles;
- trips;
- trip_members;
- trip_invites;
- days;
- lodgings;
- bookings;
- checklist_items;
- notes;
- expenses;
- push_subscriptions.

Requisiti:

- RLS attiva;
- isolamento completo tra viaggi;
- autenticazione Supabase Auth;
- nessuna chiave sensibile nel frontend;
- contenuti editoriali modificabili solo da FlorinGo/Admin o ruoli autorizzati.

## 10. Offline-first

Devono restare disponibili senza rete:

- itinerario;
- orari;
- indirizzi;
- prenotazioni già sincronizzate;
- alloggi;
- emergenze;
- checklist locale sincronizzabile;
- informazioni operative statiche.

Richiedono rete e devono dichiararlo chiaramente:

- meteo live;
- cambio valuta aggiornato;
- stato voli;
- stato strade;
- sincronizzazione gruppo;
- mappe online esterne.

L'assenza di rete non deve bloccare l'apertura dell'app.

## 11. Servizi live

Ogni destinazione può attivare moduli diversi:

- meteo;
- valuta;
- strade;
- trasporto pubblico;
- carburante;
- stato voli;
- allerte locali;
- mappe.

I dati live non devono mai essere presentati come certi quando la fonte non permette una verifica affidabile.

## 12. Notifiche

Casi d'uso:

- cambio importante dell'itinerario;
- promemoria booking;
- alert operativo;
- comunicazione FlorinGo;
- avviso al gruppo.

Le notifiche non devono essere necessarie per usare l'app.

## 13. Backoffice futuro

FlorinGo deve avere un pannello separato dal frontend cliente per:

- creare un viaggio;
- duplicare un template;
- importare il questionario cliente;
- generare una prima bozza con AI;
- modificare giornate;
- aggiungere booking / alloggi / voli;
- scegliere utility e moduli live;
- pubblicare;
- invitare il cliente;
- inviare notifiche;
- aggiornare il viaggio senza toccare codice.

Questo è il vero passaggio da progetto personalizzato a prodotto scalabile.

## 14. Relazione con il sito FlorinGo

La Travel App deve poter ricevere in futuro dati già raccolti dal sito FlorinGo / Supabase:

questionario cliente → profilo viaggio → bozza itinerario → revisione Travel Designer → pubblicazione Travel App.

Il cliente non deve reinserire informazioni già fornite.

## 15. Tecnologia frontend

La definizione del prodotto resta indipendente dalla tecnologia.

Fase attuale:

- PWA come prototipo validato;
- backend commerciale separato;
- modello dati e flussi definiti.

Decisione successiva:

- mantenere frontend web/PWA;
- oppure sviluppare il client commerciale in Flutter.

Se si sceglierà Flutter, backend, schema dati, ruoli, `trip_id`, contenuti e flussi definiti qui resteranno validi. Verrà riscritto principalmente il livello UI/client.

## 16. MVP commerciale — confine

### Dentro MVP

- Google + email login;
- lista viaggi;
- inviti partecipanti;
- Home;
- Itinerario;
- Utility;
- Budget;
- Altro;
- checklist;
- note;
- spese;
- notifiche;
- offline essenziale;
- configurazione per destinazione.

### Dopo MVP

- Flutter;
- Apple login;
- biometria;
- chat interna;
- AI conversazionale nel viaggio;
- stato voli integrato premium;
- mappe completamente native;
- backoffice visuale completo;
- acquisto in-app;
- marketplace itinerari.

## 17. Principio di sviluppo

Islanda resta il riferimento funzionale e UX, ma non deve più essere il database o il codice da modificare per creare ogni viaggio.

La Travel App commerciale deve arrivare a questo flusso:

`crea viaggio → inserisci dati → pubblica → cliente accede`

senza duplicare manualmente repository o riscrivere codice per ogni destinazione.
