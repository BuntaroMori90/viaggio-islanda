(()=>{
  const trip=document.getElementById('tripView');
  const container=document.getElementById('daysContainer');
  if(!trip||!container)return;

  const dates={1:'30 SET',2:'01 OTT',3:'02 OTT',4:'03 OTT',5:'04 OTT',6:'05 OTT',7:'06 OTT',8:'07 OTT'};
  const fullDates={1:'30/09',2:'01/10',3:'02/10',4:'03/10',5:'04/10',6:'05/10',7:'06/10',8:'07/10'};
  const start='2026-09-30',end='2026-10-07',dayMs=86400000;

  const icelandDate=()=>{
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Reykjavik',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };
  const dayNumNow=()=>{
    const d=icelandDate();
    if(d<start)return 1;
    if(d>end)return 8;
    return Math.floor((Date.parse(`${d}T00:00:00Z`)-Date.parse(`${start}T00:00:00Z`))/dayMs)+1;
  };
  const duringTrip=()=>{const d=icelandDate();return d>=start&&d<=end;};
  const days=()=>[...container.querySelectorAll('.day')];
  const getNum=el=>{
    const m=(el.querySelector('.day-num')?.textContent||'').match(/G(\d+)/i);
    return m?+m[1]:null;
  };
  const getData=n=>{
    try{return typeof giorni!=='undefined'&&Array.isArray(giorni)?giorni.find(x=>x.num===n):null;}catch(_){return null;}
  };
  const mapsSearch=q=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  // Revisione operativa del 24/09: G4 anticipato alle 11:15 e partenza reale da Ásar.
  // Viene applicata dopo il bootstrap di push-notifications.js, che contiene ancora il vecchio orario.
  const applyProgramRevision=()=>{
    try{
      if(typeof giorni==='undefined'||!Array.isArray(giorni))return;
      const d4=giorni.find(x=>x.num===4);
      const d5=giorni.find(x=>x.num===5);
      if(d4){
        Object.assign(d4,{
          luogo:'Hoffell, Iceland',
          lat:64.39653,
          lon:-15.34179,
          storia:'Partenza alle 08:00 da Skaftártunguvegur Ásar. Prima del tour restano Fjaðrárgljúfur e una sosta rapida a Foss á Síðu; arrivo obiettivo al parcheggio principale di Jökulsárlón verso le 10:40–10:45. Il tour della grotta di ghiaccio parte alle 11:15. Dopo il tour: Diamond Beach, rifornimento a Höfn, Stokksnes/Vestrahorn e pernottamento al Glacier World - Hoffell Guesthouse.',
          schedule:[
            ['08:00','Partenza da The Holiday Houses by Stay in Iceland','Skaftártunguvegur Ásar, 881 Kirkjubæjarklaustur'],
            ['~08:20 – 08:50','Fjaðrárgljúfur','Circa 30 min: viewpoint e foto, senza allungare la passeggiata'],
            ['~09:10 – 09:20','Foss á Síðu','Sosta fotografica breve · prima tappa da comprimere se siamo in ritardo'],
            ['~10:40 – 10:45','Jökulsárlón · parcheggio principale','Arrivo obiettivo. Meeting point vicino ai servizi igienici; non usare il parcheggio alternativo'],
            ['11:15 – ~14:15','Jökulsárlón / Vatnajökull','Tour guidato della grotta di ghiaccio · 6 adulti · orario aggiornato'],
            ['~14:20 – 15:00','Diamond Beach','Laguna + spiaggia; è nello stesso complesso di Jökulsárlón'],
            ['~16:05','N1 Höfn','Pieno rapido sul percorso prima di Stokksnes'],
            ['~16:25 – 17:15','Stokksnes / Vestrahorn','Vestrahorn + villaggio vichingo'],
            ['~17:50','Glacier World - Hoffell Guesthouse','Check-in e pernottamento confermato · Hoffell 2B']
          ],
          must:['Ice Cave','Diamond Beach'],
          bonus:['Fjaðrárgljúfur','Stokksnes / Vestrahorn'],
          sac:['Foss á Síðu'],
          meta:{
            guida:'Ásar → Jökulsárlón → Stokksnes → Hoffell · ~3h40 di guida',
            benzina:'N1 Höfn · pieno dopo Diamond Beach / prima di Stokksnes',
            cibo:'colazione in casa + snack/pranzo a sacco; eventuale sosta a Höfn dopo il tour'
          },
          percorsoCompletoMaps:'https://www.google.com/maps/dir/?api=1&origin=Skaft%C3%A1rtunguvegur+%C3%81sar%2C+881+Kirkjub%C3%A6jarklaustur%2C+Iceland&destination=Glacier+World+-+Hoffell+Guesthouse%2C+Hoffell+2B%2C+781+H%C3%B6fn%2C+Iceland&waypoints=Fja%C3%B0r%C3%A1rglj%C3%BAfur%2C+Iceland%7CFoss+%C3%A1+S%C3%AD%C3%B0u%2C+Iceland%7CJ%C3%B6kuls%C3%A1rl%C3%B3n%2C+Iceland%7CStokksnes%2C+Iceland&travelmode=driving',
          trigger:'Ice Cave alle 11:15: arrivo obiettivo 10:40–10:45 al parcheggio principale di Jökulsárlón. Foss á Síðu è la prima tappa da ridurre se la mattina accumula ritardo. Dopo il tour, Stokksnes resta la tappa da eliminare se strada, meteo o tempi compromettono l’arrivo a Hoffell.',
          cutoffsReady:true,
          cutoffs:[
            {time:'08:55',condition:'Se siamo ancora a Fjaðrárgljúfur',action:'Ripartire subito; Foss á Síðu diventa una foto rapidissima o si salta',level:'reduce'},
            {time:'09:25',condition:'Se non abbiamo lasciato Foss á Síðu',action:'Diretto a Jökulsárlón senza altre soste',level:'direct'},
            {time:'10:50',condition:'Se non siamo ancora parcheggiati a Jökulsárlón',action:'Nessuna sosta: raggiungere subito il parcheggio principale e il meeting point',level:'direct'},
            {time:'16:45',condition:'Se non siamo ancora arrivati a Stokksnes',action:'Saltare Stokksnes e proseguire verso Glacier World - Hoffell Guesthouse',level:'reduce'},
            {time:'17:20',condition:'Se siamo ancora a Stokksnes',action:'Ripartire verso Hoffell',level:'direct'}
          ],
          checks:[
            {title:'Ice Cave · orario e meeting point',text:'Partenza tour 11:15. Meeting point nel parcheggio principale di Jökulsárlón, vicino ai servizi igienici. Non andare al parcheggio alternativo, che si trova circa 3 km più lontano.'},
            {title:'Mattina · margine',text:'Obiettivo Jökulsárlón 10:40–10:45. Fjaðrárgljúfur resta una visita breve; Foss á Síðu è la prima tappa da comprimere o eliminare se perdiamo tempo.'}
          ]
        });
      }
      if(d5&&Array.isArray(d5.schedule)&&d5.schedule.length){
        d5.schedule[0]=['08:30','Partenza da Glacier World - Hoffell Guesthouse','Hoffell 2B · pernottamento del Giorno 4'];
        d5.storia='Lunga traversata da Hoffell ad Akureyri. Partenza dal Glacier World - Hoffell Guesthouse; pernottamento confermato ad Acco Ice Apartments. Forest Lagoon confermata alle 19:30 per 6 persone.';
      }
    }catch(err){console.warn('[Islanda] Revisione G4 non applicata',err);}
  };

  const mbsHTML=g=>{
    const group=(label,items,cls)=>!Array.isArray(items)||!items.length?'':`<div class="mbs-col ${cls}"><div class="mbs-lbl">${label}</div><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`;
    return group('Must',g.must,'must')+group('Bonus',g.bonus,'bonus')+group('Sacrificabili',g.sac,'sac');
  };

  // Sincronizza il DOM se l'autologin ha renderizzato l'itinerario prima della revisione dati.
  const syncCoreDay=el=>{
    const n=getNum(el),g=getData(n);
    if(!n||!g)return;
    const title=el.querySelector('.day-title');
    const sub=el.querySelector('.day-sub');
    const story=el.querySelector('.story');
    if(title)title.textContent=g.titolo||'';
    if(sub)sub.textContent=g.sub||'';
    if(story)story.textContent=g.storia||'';

    const tbody=el.querySelector('.schedule tbody');
    if(tbody&&Array.isArray(g.schedule)){
      tbody.innerHTML=g.schedule.map(r=>`<tr><td class="t">${r[0]}</td><td><a class="act-link" target="_blank" href="${mapsSearch(r[1])}">${r[1]}</a></td><td class="n">${r[2]||''}</td></tr>`).join('');
    }

    const mbs=el.querySelector('.mbs');
    if(mbs)mbs.innerHTML=mbsHTML(g);

    const meta=el.querySelector('.meta-row');
    if(meta&&g.meta){
      meta.innerHTML=`<span>Guida: <b>${g.meta.guida||'—'}</b></span><span>Benzina: <b>${g.meta.benzina||'—'}</b></span><span>Cibo: <b>${g.meta.cibo||'—'}</b></span>`;
    }

    const trigger=el.querySelector('.trigger');
    if(trigger&&g.trigger)trigger.innerHTML=g.trigger;

    const weather=el.querySelector('.day-weather');
    if(weather){
      const weatherText=weather.querySelector(':scope > span');
      if(weatherText&&!weatherText.textContent.includes('°C'))weatherText.textContent=`Meteo ora a ${(g.luogo||'').split(',')[0]}: caricamento…`;
      const links=[...weather.querySelectorAll('.maps-link')];
      if(links[0])links[0].href=mapsSearch(g.luogo||'');
      const route=links.find(a=>(a.textContent||'').includes('Percorso Completo'));
      if(route&&g.percorsoCompletoMaps)route.href=g.percorsoCompletoMaps;
    }
  };

  const syncRenderedProgram=()=>{
    days().forEach(syncCoreDay);
    if(container.children.length){
      const marker=document.createComment('islanda-program-revision');
      container.appendChild(marker);
      marker.remove();
    }
  };

  const a6Info=(el,n)=>{
    const state=(el.querySelector('.decision-state')?.textContent||'').trim().toUpperCase();
    if(state){
      const tone=state.includes('RIDUCI')?'warn':state.includes('DIRETTO')?'danger':'ok';
      return {label:`A6 · ${state}`,tone};
    }
    return {label:`A6 · ${n===1?'PROGRAMMATO':'PRONTO'}`,tone:'ok'};
  };

  const decorateDay=el=>{
    const n=getNum(el);
    if(!n)return;
    el.dataset.dayNumber=String(n);
    const title=el.querySelector('.day-title');
    const wrap=title?.parentElement;
    if(!wrap)return;
    let summary=wrap.querySelector('.day-head-summary');
    if(!summary){
      summary=document.createElement('div');
      summary.className='day-head-summary';
      wrap.appendChild(summary);
    }
    const g=getData(n),a6=a6Info(el,n);
    const guide=String(g?.meta?.guida||'').trim();
    const html=`<span class="day-head-date">${fullDates[n]||''}</span>${guide?`<span class="day-head-guide">${guide}</span>`:''}<span class="day-head-a6" data-tone="${a6.tone}">${a6.label}</span>`;
    if(summary.innerHTML!==html)summary.innerHTML=html;
  };

  const setActiveTab=(n,{reveal=false}={})=>{
    document.querySelectorAll('#itineraryDayTabs .itinerary-day-tab').forEach(btn=>{
      const active=+btn.dataset.day===n;
      btn.classList.toggle('is-active',active);
      btn.setAttribute('aria-current',active?'true':'false');
      // Only move the horizontal day strip after an explicit day selection.
      // scrollIntoView also scrolls the page when a nested accordion changes.
      if(active&&reveal){
        const nav=btn.parentElement;
        nav.scrollTo({left:btn.offsetLeft-nav.offsetLeft-(nav.clientWidth-btn.offsetWidth)/2,behavior:'smooth'});
      }
    });
  };

  const selectDay=(n,{scroll=true}={})=>{
    const list=days();
    const target=list.find(el=>getNum(el)===n)||list[0];
    if(!target)return;
    list.forEach(el=>{if(el!==target)el.classList.remove('open');});
    if(!target.classList.contains('open')){
      const head=target.querySelector('.day-head');
      if(head)head.click();
      else target.classList.add('open');
    }
    setActiveTab(getNum(target)||n,{reveal:true});
    if(scroll)setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),35);
  };

  const ensureTabs=()=>{
    let nav=document.getElementById('itineraryDayTabs');
    if(nav)return nav;
    const section=[...trip.querySelectorAll(':scope > .section-title')].find(x=>(x.textContent||'').toLowerCase().includes('itinerario giorno per giorno'));
    if(!section)return null;
    nav=document.createElement('div');
    nav.id='itineraryDayTabs';
    nav.setAttribute('aria-label','Giorni del viaggio');
    nav.innerHTML=Array.from({length:8},(_,i)=>{
      const n=i+1;
      return `<button type="button" class="itinerary-day-tab" data-day="${n}"><strong>G${n}</strong><span>${dates[n]}</span></button>`;
    }).join('');
    section.insertAdjacentElement('afterend',nav);
    nav.addEventListener('click',e=>{
      const btn=e.target.closest('.itinerary-day-tab');
      if(btn)selectDay(+btn.dataset.day,{scroll:true});
    });
    return nav;
  };

  const refresh=()=>{
    ensureTabs();
    days().forEach(decorateDay);
    const open=days().find(el=>el.classList.contains('open'));
    setActiveTab(open?getNum(open):dayNumNow());
    const today=dayNumNow();
    document.querySelectorAll('#itineraryDayTabs .itinerary-day-tab').forEach(btn=>btn.classList.toggle('is-today',duringTrip()&&+btn.dataset.day===today));
  };

  const onItineraryEntry=()=>setTimeout(()=>selectDay(dayNumNow(),{scroll:false}),70);
  document.addEventListener('click',e=>{if(e.target.closest('.app-tab[data-tab="itinerario"]'))onItineraryEntry();});

  const observer=new MutationObserver(()=>refresh());
  observer.observe(container,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

  // push-notifications.js applica le sue correzioni al DOMContentLoaded; questa revisione deve vincere dopo quel passaggio.
  document.addEventListener('DOMContentLoaded',()=>{
    applyProgramRevision();
    syncRenderedProgram();
    refresh();
  },{once:true});

  refresh();
})();
