(()=>{
  const STORAGE_KEY='islanda2026_active_tab';
  const trip=document.getElementById('tripView');
  if(!trip)return;

  const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const sectionMap=[
    {match:'equipaggio',view:'home'},
    {match:'voli',view:'home'},
    {match:'meteo & vestiario',view:'home'},
    {match:'app utili per il viaggio',view:'utility'},
    {match:'cosa e consigliato avere con te',view:'utility'},
    {match:'la tua checklist personalizzabile',view:'utility'},
    {match:'note e commenti del gruppo',view:'altro'},
    {match:'spese di gruppo',view:'budget'},
    {match:'convertitore isk / eur',view:'utility'},
    {match:'itinerario giorno per giorno',view:'itinerario'},
    {match:'costi stimati a persona',view:'budget'},
    {match:'consigli extra',view:'utility'}
  ];

  const tabs=[
    {id:'home',label:'Home',icon:'<path d="M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'},
    {id:'itinerario',label:'Itinerario',icon:'<path d="M6 3v4M18 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/><path d="M8 13h3M8 17h6"/>'},
    {id:'utility',label:'Utility',icon:'<path d="M14.5 6.5 17.5 3.5M7 17l-4 4M6.5 8.5l9 9M4 4l5 2-3 3zM20 20l-5-2 3-3z"/>'},
    {id:'budget',label:'Budget',icon:'<path d="M4 7h16v12H4zM7 7V5h10v2M8 13h8M8 16h5"/>'},
    {id:'altro',label:'Altro',icon:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'}
  ];

  const getStored=()=>{try{return localStorage.getItem(STORAGE_KEY)||'home'}catch{return'home'}};
  const setStored=v=>{try{localStorage.setItem(STORAGE_KEY,v)}catch{}};
  const scrolls={};
  let active=getStored();
  if(!tabs.some(t=>t.id===active))active='home';

  const classify=()=>{
    let current='home';
    [...trip.children].forEach(node=>{
      if(node.id==='appBottomNav')return;
      if(node.classList?.contains('section-title')){
        const text=normalize(node.textContent);
        const found=sectionMap.find(x=>text.includes(normalize(x.match)));
        if(found)current=found.view;
      }
      if(node.id==='pushPanel')current='home';
      node.dataset.appView=current;
    });
  };

  const makeNav=()=>{
    if(document.getElementById('appBottomNav'))return document.getElementById('appBottomNav');
    const nav=document.createElement('nav');
    nav.id='appBottomNav';
    nav.className='app-bottom-nav';
    nav.setAttribute('aria-label','Navigazione principale');
    nav.innerHTML=tabs.map(t=>`<button type="button" class="app-tab" data-tab="${t.id}" aria-label="${t.label}"><svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg><span>${t.label}</span></button>`).join('');
    document.body.appendChild(nav);
    return nav;
  };

  const nav=makeNav();

  const updateNavState=()=>{
    nav.querySelectorAll('.app-tab').forEach(btn=>{
      const on=btn.dataset.tab===active;
      btn.classList.toggle('is-active',on);
      btn.setAttribute('aria-current',on?'page':'false');
    });
  };

  const applyView=(next,{restoreScroll=true}={})=>{
    if(!tabs.some(t=>t.id===next))next='home';
    scrolls[active]=window.scrollY;
    active=next;
    setStored(active);
    trip.dataset.activeView=active;
    [...trip.children].forEach(node=>{
      if(!node.dataset.appView)return;
      node.classList.toggle('app-view-hidden',node.dataset.appView!==active);
    });
    updateNavState();
    requestAnimationFrame(()=>{
      const y=restoreScroll?(scrolls[active]||0):0;
      window.scrollTo({top:y,left:0,behavior:'auto'});
    });
  };

  nav.addEventListener('click',ev=>{
    const btn=ev.target.closest('.app-tab');
    if(!btn)return;
    applyView(btn.dataset.tab);
  });

  const observer=new MutationObserver(()=>{
    classify();
    [...trip.children].forEach(node=>{
      if(node.dataset.appView)node.classList.toggle('app-view-hidden',node.dataset.appView!==active);
    });
  });
  observer.observe(trip,{childList:true});

  const syncVisibility=()=>{
    nav.classList.toggle('is-visible',!trip.classList.contains('hidden'));
  };
  new MutationObserver(syncVisibility).observe(trip,{attributes:true,attributeFilter:['class']});

  classify();
  syncVisibility();
  applyView(active,{restoreScroll:false});
})();