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
    summary.innerHTML=`<span class="day-head-date">${fullDates[n]||''}</span>${guide?`<span class="day-head-guide">${guide}</span>`:''}<span class="day-head-a6" data-tone="${a6.tone}">${a6.label}</span>`;
  };

  const setActiveTab=n=>{
    document.querySelectorAll('#itineraryDayTabs .itinerary-day-tab').forEach(btn=>{
      const active=+btn.dataset.day===n;
      btn.classList.toggle('is-active',active);
      btn.setAttribute('aria-current',active?'true':'false');
      if(active)btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
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
    setActiveTab(getNum(target)||n);
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

  refresh();
})();
