(()=>{
  const trip=document.getElementById('tripView');
  if(!trip)return;

  const bookings=[
    {at:'2026-09-30T09:00:00Z',name:'Blue Car Rental',meta:'Ritiro auto · KEF'},
    {at:'2026-10-03T12:30:00Z',name:'Ice Cave · Vatnajökull',meta:'Jökulsárlón · 6 adulti'},
    {at:'2026-10-04T19:30:00Z',name:'Forest Lagoon',meta:'Akureyri · 19:30'},
    {at:'2026-10-05T09:00:00Z',name:'Whale Watching',meta:'Húsavík · 09:00–12:00'},
    {at:'2026-10-05T18:00:00Z',name:'Earth Lagoon Mývatn',meta:'18:00–20:00'},
    {at:'2026-10-08T08:30:00Z',name:'Blue Car Rental',meta:'Riconsegna auto · KEF'}
  ];

  const lodgings=[
    {d:'30/09',n:'Guesthouse Pavi',p:'+3545613553',pd:'+354 561 3553',a:'Brautarholt 4, 105 Reykjavík'},
    {d:'01/10',n:'Hellatún Guest House!',p:'+3546162563',pd:'+354 616 2563',a:'Hellatún, 851 Hella'},
    {d:'02/10',n:'The Holiday Houses',p:'+3547875599',pd:'+354 787 5599',a:'Skaftártunguvegur Ásar, 881 Kirkjubæjarklaustur'},
    {d:'03/10',n:'Glacier World - Hoffell',p:'+3548945566',pd:'+354 894 5566',a:'Hoffell 2B, 781 Höfn'},
    {d:'04–05/10',n:'Acco Ice Apartments',p:'+3545472226',pd:'+354 547 2226',a:'Hafnarstræti 106, 600 Akureyri'},
    {d:'06/10',n:'Green House Apartments',p:null,pd:null,a:'Borgarbraut 9, 350 Grundarfjörður'},
    {d:'07/10',n:'Hótel Hafnir',p:null,pd:null,a:'Hafnir · indirizzo/telefono da riconciliare con la prenotazione'}
  ];

  const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const fmt=iso=>new Intl.DateTimeFormat('it-IT',{timeZone:'Atlantic/Reykjavik',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso)).replace(',',' ·');
  const nextBooking=()=>bookings.find(x=>Date.parse(x.at)>=Date.now())||bookings.at(-1);
  const noteCount=()=>document.querySelectorAll('#notesList > *').length;

  const toggleDetails=id=>{
    const el=document.getElementById(id);
    if(!el)return;
    const open=!el.classList.contains('is-open');
    el.classList.toggle('is-open',open);
    el.querySelector(':scope > button')?.setAttribute('aria-expanded',String(open));
  };

  const ensureWallet=()=>{
    if(document.getElementById('travelWallet'))return;
    const noteTitle=[...trip.querySelectorAll(':scope > .section-title')].find(x=>normalize(x.textContent).includes('note e commenti del gruppo'));
    if(!noteTitle)return;

    const title=document.createElement('div');
    title.className='section-title';
    title.textContent='Portafoglio viaggio';

    const block=document.createElement('div');
    block.id='travelWalletBlock';
    const n=nextBooking();
    block.innerHTML=`
      <div id="travelWallet">
        <a class="travel-wallet-card is-emergency" href="tel:112">
          <span class="wallet-kicker">EMERGENZA</span>
          <strong>112</strong>
          <span class="wallet-meta">Polizia · ambulanza · soccorso</span>
        </a>
        <a class="travel-wallet-card is-safety" href="https://safetravel.is/" target="_blank" rel="noopener noreferrer">
          <span class="wallet-kicker">SICUREZZA</span>
          <strong>SafeTravel</strong>
          <span class="wallet-meta">Allerte e condizioni ufficiali</span>
        </a>
        <button type="button" class="travel-wallet-card is-booking" data-open="walletBookings">
          <span class="wallet-kicker">PROSSIMA PRENOTAZIONE</span>
          <strong id="walletNextBooking">${n?.name||'—'}</strong>
          <span class="wallet-meta" id="walletNextBookingMeta">${n?fmt(n.at):''}</span>
        </button>
        <button type="button" class="travel-wallet-card is-notes" id="walletNotesButton">
          <span class="wallet-kicker">NOTE DI GRUPPO</span>
          <strong id="walletNotesCount">${noteCount()}</strong>
          <span class="wallet-meta">Vai alle note condivise</span>
        </button>
      </div>

      <div class="travel-wallet-details" id="walletBookings">
        <button type="button" aria-expanded="false"><span>Prenotazioni confermate</span><span>⌄</span></button>
        <div class="travel-wallet-details-body">
          ${bookings.map(b=>`<div class="travel-wallet-row"><div><strong>${b.name}</strong><small>${fmt(b.at)} · ${b.meta}</small></div><span></span></div>`).join('')}
        </div>
      </div>

      <div class="travel-wallet-details" id="walletLodgings">
        <button type="button" aria-expanded="false"><span>Alloggi & contatti</span><span>⌄</span></button>
        <div class="travel-wallet-details-body">
          ${lodgings.map(l=>`<div class="travel-wallet-row"><div><strong>${l.d} · ${l.n}</strong><small>${l.a}${l.pd?` · ${l.pd}`:''}</small></div>${l.p?`<a href="tel:${l.p}">CHIAMA</a>`:'<span></span>'}</div>`).join('')}
        </div>
      </div>

      <div class="travel-wallet-details" id="walletEmergency">
        <button type="button" aria-expanded="false"><span>Numeri utili & sicurezza</span><span>⌄</span></button>
        <div class="travel-wallet-details-body">
          <div class="travel-wallet-row"><div><strong>Emergenze · 112</strong><small>Numero nazionale di emergenza, attivo 24/7.</small></div><a href="tel:112">CHIAMA</a></div>
          <div class="travel-wallet-row"><div><strong>Backup emergenze</strong><small>Se 112 non si connette: +354 599 0112.</small></div><a href="tel:+3545990112">CHIAMA</a></div>
          <div class="travel-wallet-row"><div><strong>Informazioni sanitarie</strong><small>Servizio sanitario 24/7: +354 513 1700.</small></div><a href="tel:+3545131700">CHIAMA</a></div>
          <div class="wallet-emergency-note">In caso di dubbio sull'emergenza usa 112. Per condizioni stradali e allerte apri SafeTravel / Umferdin prima di partire.</div>
        </div>
      </div>

      <div class="travel-wallet-details" id="walletInsurance">
        <button type="button" aria-expanded="false"><span>Assicurazione & documenti</span><span>⌄</span></button>
        <div class="travel-wallet-details-body">
          <div class="travel-wallet-row"><div><strong>Heymondo</strong><small>Assicurazione viaggio già conteggiata nel budget · €44 a persona. Numero polizza e assistenza non sono ancora salvati nell'app.</small></div><span></span></div>
          <div class="travel-wallet-row"><div><strong>Documenti offline</strong><small>Prima della partenza conserva sul telefono carte d'imbarco, passaporto/ID, ETA UK e conferme principali.</small></div><span></span></div>
        </div>
      </div>`;

    trip.insertBefore(title,noteTitle);
    title.insertAdjacentElement('afterend',block);

    block.querySelectorAll('[data-open]').forEach(btn=>btn.addEventListener('click',()=>toggleDetails(btn.dataset.open)));
    block.querySelectorAll('.travel-wallet-details > button').forEach(btn=>btn.addEventListener('click',()=>toggleDetails(btn.parentElement.id)));
    document.getElementById('walletNotesButton')?.addEventListener('click',()=>noteTitle.scrollIntoView({behavior:'smooth',block:'start'}));

    const obs=new MutationObserver(()=>{
      const c=document.getElementById('walletNotesCount');
      if(c)c.textContent=String(noteCount());
    });
    const notes=document.getElementById('notesList');
    if(notes)obs.observe(notes,{childList:true,subtree:true});
  };

  const observer=new MutationObserver(()=>ensureWallet());
  observer.observe(trip,{childList:true});
  ensureWallet();
})();
