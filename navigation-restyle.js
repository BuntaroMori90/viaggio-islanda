(()=>{
  const STORAGE_KEY='islanda2026_active_tab';
  const HISTORY_KEY='islanda2026Tab';
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
    {match:'portafoglio viaggio',view:'altro'},
    {match:'note e commenti del gruppo',view:'altro'},
    {match:'spese di gruppo',view:'budget'},
    {match:'convertitore isk / eur',view:'utility'},
    {match:'itinerario giorno per giorno',view:'itinerario'},
    {match:'costi stimati a persona',view:'budget'},
    {match:'consigli extra',view:'utility'}
  ];

  const utilityOrder=[
    'convertitore isk / eur',
    'cosa e consigliato avere con te',
    'la tua checklist personalizzabile',
    'app utili per il viaggio',
    'consigli extra'
  ];
  let reorderingUtility=false;

  const utilityTitleFor=label=>[...trip.children].find(node=>
    node.classList?.contains('section-title')&&normalize(node.textContent).includes(normalize(label))
  );

  const reorderUtilitySections=()=>{
    if(reorderingUtility)return;
    const titles=utilityOrder.map(utilityTitleFor);
    if(titles.some(t=>!t))return;

    const utilityTitlesInDom=[...trip.children].filter(node=>
      node.classList?.contains('section-title')&&utilityOrder.some(label=>normalize(node.textContent).includes(normalize(label)))
    );
    const alreadyOrdered=utilityTitlesInDom.length===utilityOrder.length&&utilityOrder.every((label,i)=>
      normalize(utilityTitlesInDom[i]?.textContent).includes(normalize(label))
    );
    if(alreadyOrdered)return;

    reorderingUtility=true;
    try{
      const children=[...trip.children];
      const first=titles.reduce((best,node)=>children.indexOf(node)<children.indexOf(best)?node:best,titles[0]);
      const blocks=titles.map(title=>{
        const nodes=[title];
        let next=title.nextElementSibling;
        while(next&&!next.classList?.contains('section-title')&&next.id!=='pushPanel'){
          nodes.push(next);
          next=next.nextElementSibling;
        }
        return nodes;
      });
      const marker=document.createComment('utility-order');
      trip.insertBefore(marker,first);
      const fragment=document.createDocumentFragment();
      blocks.flat().forEach(node=>fragment.appendChild(node));
      marker.after(fragment);
      marker.remove();
    }finally{
      reorderingUtility=false;
    }
  };

  const tabs=[
    {id:'home',label:'Home',icon:'<path d="M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'},
    {id:'itinerario',label:'Itinerario',icon:'<path d="M6 3v4M18 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/><path d="M8 13h3M8 17h6"/>'},
    {id:'utility',label:'Utility',icon:'<path d="M14.5 6.5 17.5 3.5M7 17l-4 4M6.5 8.5l9 9M4 4l5 2-3 3zM20 20l-5-2 3-3z"/>'},
    {id:'budget',label:'Budget',icon:'<path d="M4 7h16v12H4zM7 7V5h10v2M8 13h8M8 16h5"/>'},
    {id:'altro',label:'Altro',icon:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'}
  ];

  const isValidTab=v=>tabs.some(t=>t.id===v);
  const getStored=()=>{try{return localStorage.getItem(STORAGE_KEY)||'home'}catch{return'home'}};
  const setStored=v=>{try{localStorage.setItem(STORAGE_KEY,v)}catch{}};
  const scrolls={};
  const stateTab=history.state?.[HISTORY_KEY];
  let active=isValidTab(stateTab)?stateTab:getStored();
  if(!isValidTab(active))active='home';

  const classify=()=>{
    let current='home';
    [...trip.children].forEach(node=>{
      if(node.id==='appBottomNav'||node.id==='appViewHeading')return;
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
  const viewHeading=document.createElement('h1');
  viewHeading.id='appViewHeading';
  viewHeading.className='sr-only';
  trip.prepend(viewHeading);

  const updateNavState=()=>{
    viewHeading.textContent=tabs.find(t=>t.id===active)?.label||'Home';
    viewHeading.hidden=active==='home';
    nav.querySelectorAll('.app-tab').forEach(btn=>{
      const on=btn.dataset.tab===active;
      btn.classList.toggle('is-active',on);
      btn.setAttribute('aria-current',on?'page':'false');
    });
  };

  const applyView=(next,{restoreScroll=true}={})=>{
    if(!isValidTab(next))next='home';
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

  const pushTab=(next)=>{
    if(!isValidTab(next)||next===active)return;
    const nextState={...(history.state||{}),[HISTORY_KEY]:next};
    history.pushState(nextState,'',location.href);
    applyView(next);
  };

  nav.addEventListener('click',ev=>{
    const btn=ev.target.closest('.app-tab');
    if(!btn)return;
    pushTab(btn.dataset.tab);
  });

  window.addEventListener('popstate',ev=>{
    const next=ev.state?.[HISTORY_KEY];
    if(isValidTab(next))applyView(next);
  });

  const observer=new MutationObserver(()=>{
    reorderUtilitySections();
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

  reorderUtilitySections();
  classify();
  syncVisibility();
  history.replaceState({...(history.state||{}),[HISTORY_KEY]:active},'',location.href);
  applyView(active,{restoreScroll:false});
})();