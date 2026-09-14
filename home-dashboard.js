(()=>{
  const trip=document.getElementById('tripView');
  if(!trip)return;

  const TRIP_START='2026-09-30';
  const TRIP_END='2026-10-07';
  const DAY_MS=86400000;
  let refreshTimer=null;

  const flightEvents=[
    {at:'2026-09-29T21:00:00+02:00',label:'29 SET · 21:00',title:'Napoli → Londra',meta:'Ryanair FR5456 · 21:00'},
    {at:'2026-09-30T06:15:00+01:00',label:'30 SET · 06:15',title:'Londra Luton → Keflavík',meta:'easyJet EZY2635 · 06:15'},
    {at:'2026-10-08T10:15:00Z',label:'8 OTT · 10:15',title:'Keflavík → Milano Malpensa',meta:'easyJet EJU3970 · 10:15'},
    {at:'2026-10-08T21:25:00+02:00',label:'8 OTT · 21:25',title:'Milano Malpensa → Napoli',meta:'Ryanair FR5972 · 21:25'}
  ];

  const reservations=[
    {at:'2026-09-30T09:00:00Z',title:'Blue Car Rental',meta:'Ritiro auto · KEF'},
    {at:'2026-10-03T12:30:00Z',title:'Ice Cave · Vatnajökull',meta:'Jökulsárlón · 6 adulti'},
    {at:'2026-10-04T19:30:00Z',title:'Forest Lagoon',meta:'Akureyri · ingresso 19:30'},
    {at:'2026-10-05T09:00:00Z',title:'Whale Watching',meta:'Húsavík · 09:00–12:00'},
    {at:'2026-10-05T18:00:00Z',title:'Earth Lagoon Mývatn',meta:'Ingresso 18:00'},
    {at:'2026-10-08T08:30:00Z',title:'Blue Car Rental',meta:'Riconsegna auto · 08:30'}
  ];

  const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const dateToUtc=d=>Date.parse(`${d}T00:00:00Z`);

  const icelandNow=()=>{
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{
      timeZone:'Atlantic/Reykjavik',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
    }).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return {date:`${p.year}-${p.month}-${p.day}`,min:(+p.hour*60)+(+p.minute),time:`${p.hour}:${p.minute}`};
  };

  const relevantDay=()=>{
    const now=icelandNow();
    if(now.date<TRIP_START)return 1;
    if(now.date>TRIP_END)return 8;
    return Math.floor((dateToUtc(now.date)-dateToUtc(TRIP_START))/DAY_MS)+1;
  };

  const formatDateTime=(iso)=>{
    const d=new Date(iso);
    const parts=new Intl.DateTimeFormat('it-IT',{
      timeZone:'Atlantic/Reykjavik',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false
    }).formatToParts(d);
    const o=Object.fromEntries(parts.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return `${o.day} ${String(o.month||'').toUpperCase()} · ${o.hour}:${o.minute}`;
  };

  const nextGlobalEvent=()=>{
    const now=Date.now();
    const all=[...flightEvents,...reservations].map(x=>({...x,ms:Date.parse(x.at)})).sort((a,b)=>a.ms-b.ms);
    return all.find(x=>x.ms>=now)||all.at(-1);
  };

  const parseStartMin=s=>{
    const m=String(s||'').match(/(\d{1,2}):(\d{2})/);
    return m?(+m[1]*60)+(+m[2]):null;
  };

  const nextTripStop=()=>{
    const now=icelandNow();
    const dayNum=relevantDay();
    const inTrip=now.date>=TRIP_START&&now.date<=TRIP_END;
    if(!inTrip){
      const e=nextGlobalEvent();
      return {kicker:'PROSSIMO EVENTO',title:e?.title||'Partenza',meta:e?.label||'29 SET · 21:00',day:1};
    }

    try{
      if(typeof giorni==='undefined'||!Array.isArray(giorni))throw new Error('giorni unavailable');
      const g=giorni.find(x=>x.num===dayNum);
      const rows=(g?.schedule||[]).map(r=>({row:r,min:parseStartMin(r?.[0])})).filter(x=>x.min!==null);
      const next=rows.find(x=>x.min>=now.min)||rows.at(-1);
      if(next){
        return {kicker:`G${dayNum} · PROSSIMA TAPPA`,title:String(next.row[1]||g.titolo),meta:`${String(next.row[0]||'').replace(/^~/,'')} · ${String(next.row[2]||'').trim()||g.sub||''}`,day:dayNum};
      }
      return {kicker:`G${dayNum} · OGGI`,title:g?.titolo||'Giornata',meta:g?.sub||'',day:dayNum};
    }catch(_){
      return {kicker:`G${dayNum} · OGGI`,title:'Itinerario del giorno',meta:'Apri il programma completo',day:dayNum};
    }
  };

  const nextReservation=()=>{
    const now=Date.now();
    const r=reservations.map(x=>({...x,ms:Date.parse(x.at)})).find(x=>x.ms>=now)||reservations.at(-1);
    return {...r,label:formatDateTime(r.at)};
  };

  const a6State=()=>{
    const dayNum=relevantDay();
    const now=icelandNow();
    let g=null;
    try{ if(typeof giorni!=='undefined'&&Array.isArray(giorni))g=giorni.find(x=>x.num===dayNum); }catch(_){}
    const cutoffs=(g?.cutoffs||[]).map(c=>({...c,min:parseStartMin(c.time)})).filter(c=>c.min!==null).sort((a,b)=>a.min-b.min);
    const isToday=now.date>=TRIP_START&&now.date<=TRIP_END;

    if(!cutoffs.length){
      return {label:now.date<TRIP_START?'PROGRAMMATO':'NORMALE',title:`G${dayNum} · Nessuna soglia critica`,meta:g?.cutoffEmpty||'Giornata flessibile. Segui programma, meteo e condizioni reali.',tone:'ok',day:dayNum};
    }
    if(!isToday){
      const f=cutoffs[0];
      return {label:'PROGRAMMATO',title:`G${dayNum} · Prima soglia ${f.time}`,meta:`${f.condition||''}${f.action?` → ${f.action}`:''}`,tone:'ok',day:dayNum};
    }

    const passed=cutoffs.filter(c=>c.min<=now.min);
    const latest=passed.at(-1);
    const upcoming=cutoffs.find(c=>c.min>now.min);
    if(!latest){
      const f=cutoffs[0];
      return {label:'NORMALE',title:`Prossima soglia · ${f.time}`,meta:`${f.condition||''}${f.action?` → ${f.action}`:''}`,tone:'ok',day:dayNum};
    }
    if(latest.level==='direct'){
      return {label:'DIRETTO',title:latest.action||'Vai diretto',meta:latest.condition||'Ultima soglia superata',tone:'danger',day:dayNum};
    }
    return {label:'RIDUCI',title:`Soglia ${latest.time} superata`,meta:`${latest.action||'Riduci il programma'}${upcoming?` · prossima ${upcoming.time}`:''}`,tone:'warn',day:dayNum};
  };

  const currentMap=()=>{
    const dayNum=relevantDay();
    try{
      if(typeof giorni!=='undefined'&&Array.isArray(giorni)){
        const g=giorni.find(x=>x.num===dayNum);
        if(g?.percorsoCompletoMaps)return g.percorsoCompletoMaps;
        if(g?.luogo)return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.luogo)}`;
      }
    }catch(_){}
    return 'https://www.google.com/maps/search/?api=1&query=Iceland';
  };

  const openRelevantDay=()=>{
    const dayNum=relevantDay();
    requestAnimationFrame(()=>setTimeout(()=>{
      const days=[...document.querySelectorAll('#daysContainer .day')];
      if(!days.length)return;
      const target=days.find(el=>new RegExp(`G${dayNum}(?:\\D|$)`,'i').test(el.querySelector('.day-num')?.textContent||''))||days[0];
      days.forEach(el=>{if(el!==target)el.classList.remove('open');});
      const head=target.querySelector('.day-head');
      if(head&&!target.classList.contains('open'))head.click();
      setTimeout(()=>target.scrollIntoView({behavior:'auto',block:'start'}),20);
    },40));
  };

  const goItinerary=()=>{
    document.querySelector('.app-tab[data-tab="itinerario"]')?.click();
    openRelevantDay();
  };

  const makeFold=(match,key)=>{
    const title=[...trip.querySelectorAll(':scope > .section-title')].find(x=>normalize(x.textContent).includes(match));
    if(!title||title.dataset.homeFold==='1')return;
    const content=title.nextElementSibling;
    if(!content)return;
    title.dataset.homeFold='1';
    title.classList.add('home-fold-title');
    content.classList.add('home-fold-content');
    title.setAttribute('role','button');
    title.setAttribute('tabindex','0');
    const arrow=document.createElement('span');
    arrow.className='home-fold-arrow';
    arrow.textContent='⌄';
    title.appendChild(arrow);
    let open=false;
    try{open=localStorage.getItem(`islanda_home_fold_${key}`)==='1';}catch(_){}
    const apply=()=>{
      title.classList.toggle('is-open',open);
      content.classList.toggle('is-open',open);
      title.setAttribute('aria-expanded',String(open));
    };
    const toggle=()=>{
      open=!open;apply();
      try{localStorage.setItem(`islanda_home_fold_${key}`,open?'1':'0');}catch(_){}
    };
    title.addEventListener('click',toggle);
    title.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
    apply();
  };

  const reorderHome=()=>{
    if(trip.dataset.homeReordered==='1')return;
    const titles=[...trip.querySelectorAll(':scope > .section-title')];
    const equip=titles.find(x=>normalize(x.textContent).includes('equipaggio'));
    const meteo=titles.find(x=>normalize(x.textContent).includes('meteo & vestiario'));
    const meteoPanel=meteo?.nextElementSibling;
    if(equip&&meteo&&meteoPanel){
      trip.insertBefore(meteo,equip);
      trip.insertBefore(meteoPanel,equip);
      trip.dataset.homeReordered='1';
    }
  };

  const ensureDashboard=()=>{
    if(document.getElementById('homeDashboard'))return document.getElementById('homeDashboard');
    const meteoTitle=[...trip.querySelectorAll(':scope > .section-title')].find(x=>normalize(x.textContent).includes('meteo & vestiario'));
    const anchor=meteoTitle?.nextElementSibling;
    if(!anchor)return null;

    const title=document.createElement('div');
    title.className='section-title home-dashboard-title';
    title.textContent='In viaggio';
    const dash=document.createElement('div');
    dash.id='homeDashboard';
    dash.className='home-dashboard';
    dash.innerHTML=`
      <button type="button" class="home-dash-card home-next-card" data-action="itinerary">
        <span class="home-dash-kicker" id="dashNextKicker">PROSSIMO EVENTO</span>
        <strong id="dashNextTitle">Caricamento…</strong>
        <span class="home-dash-meta" id="dashNextMeta"></span>
      </button>
      <div class="home-dash-card home-booking-card">
        <span class="home-dash-kicker">PROSSIMA PRENOTAZIONE</span>
        <strong id="dashBookingTitle">Caricamento…</strong>
        <span class="home-dash-meta" id="dashBookingMeta"></span>
        <span class="home-dash-badge">PRENOTATO</span>
      </div>
      <button type="button" class="home-dash-card home-a6-card" id="dashA6Card" data-action="itinerary">
        <span class="home-dash-kicker">A6 · STATO GIORNATA</span>
        <span class="home-a6-state" id="dashA6State">PROGRAMMATO</span>
        <strong id="dashA6Title">Caricamento…</strong>
        <span class="home-dash-meta" id="dashA6Meta"></span>
      </button>
      <div class="home-quick-actions">
        <a href="https://umferdin.is/en" target="_blank" rel="noopener noreferrer">STRADE</a>
        <a href="https://en.vedur.is/" target="_blank" rel="noopener noreferrer">METEO</a>
        <a id="dashMapsLink" href="https://www.google.com/maps/search/?api=1&query=Iceland" target="_blank" rel="noopener noreferrer">MAPS</a>
      </div>`;
    anchor.insertAdjacentElement('afterend',title);
    title.insertAdjacentElement('afterend',dash);
    dash.querySelectorAll('[data-action="itinerary"]').forEach(x=>x.addEventListener('click',goItinerary));
    return dash;
  };

  const updateDashboard=()=>{
    const dash=ensureDashboard();
    if(!dash)return;
    const next=nextTripStop();
    const booking=nextReservation();
    const a6=a6State();
    const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text||'';};
    set('dashNextKicker',next.kicker);
    set('dashNextTitle',next.title);
    set('dashNextMeta',next.meta);
    set('dashBookingTitle',booking.title);
    set('dashBookingMeta',`${booking.label} · ${booking.meta}`);
    set('dashA6State',a6.label);
    set('dashA6Title',a6.title);
    set('dashA6Meta',a6.meta);
    const card=document.getElementById('dashA6Card');
    if(card)card.dataset.tone=a6.tone;
    const maps=document.getElementById('dashMapsLink');
    if(maps)maps.href=currentMap();
  };

  const init=()=>{
    reorderHome();
    makeFold('equipaggio','equipaggio');
    makeFold('voli','voli');
    ensureDashboard();
    updateDashboard();
    if(!refreshTimer)refreshTimer=setInterval(updateDashboard,60000);

    document.addEventListener('click',e=>{
      if(e.target.closest('.app-tab[data-tab="itinerario"]'))openRelevantDay();
    });

    const obs=new MutationObserver(()=>{
      makeFold('equipaggio','equipaggio');
      makeFold('voli','voli');
      ensureDashboard();
      updateDashboard();
    });
    obs.observe(trip,{childList:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
