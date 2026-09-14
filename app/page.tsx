const sections = [
  {
    title: 'Home',
    text: 'Destinazione, countdown, prossimo evento, booking, meteo e alert operativi.',
  },
  {
    title: 'Itinerario',
    text: 'Giornate, timeline, Must / Bonus / Sacrificabili, cut-off, alloggi e prenotazioni.',
  },
  {
    title: 'Utility',
    text: 'Cambio valuta, checklist, app locali e consigli specifici della destinazione.',
  },
  {
    title: 'Budget',
    text: 'Costo noto, spese di gruppo, pagamenti e saldi tra partecipanti.',
  },
  {
    title: 'Altro',
    text: 'Documenti, emergenze, assicurazione, note e gestione partecipanti.',
  },
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">FLORINGO · TRAVEL APP</div>
        <h1>Il viaggio progettato, sempre con te.</h1>
        <p>
          Base commerciale separata da Islanda. Questa app diventerà il punto unico tra
          Travel Designer, cliente e compagni di viaggio.
        </p>
        <div className="status-row">
          <span>Next.js</span>
          <span>Vercel</span>
          <span>Supabase dedicato</span>
          <span>Multi-trip</span>
        </div>
      </section>

      <section className="block">
        <div className="section-head">
          <div>
            <span className="kicker">REFERENCE FLOW</span>
            <h2>Struttura validata con Islanda</h2>
          </div>
          <span className="badge">MVP</span>
        </div>

        <div className="grid">
          {sections.map((section, index) => (
            <article className="card" key={section.title}>
              <span className="number">0{index + 1}</span>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="block flow-card">
        <span className="kicker">CLIENT FLOW</span>
        <h2>Da progetto a viaggio pubblicato</h2>
        <div className="flow">
          <span>Questionario</span>
          <b>→</b>
          <span>Progettazione FlorinGo</span>
          <b>→</b>
          <span>Pubblicazione</span>
          <b>→</b>
          <span>Accesso cliente</span>
        </div>
      </section>

      <section className="block split">
        <article className="panel">
          <span className="kicker">CLIENTE</span>
          <h2>App di viaggio</h2>
          <p>
            Consulta e usa il viaggio. Non può alterare accidentalmente il progetto editoriale
            preparato da FlorinGo.
          </p>
        </article>
        <article className="panel">
          <span className="kicker">FLORINGO</span>
          <h2>Backoffice futuro</h2>
          <p>
            Crea, duplica, aggiorna e pubblica viaggi senza modificare codice o duplicare
            repository.
          </p>
        </article>
      </section>
    </main>
  );
}
