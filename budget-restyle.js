(()=>{
  const trip=document.getElementById('tripView');
  const expenses=document.getElementById('expensesList');
  const costsPanel=document.getElementById('costsPanel');
  if(!trip||!expenses||!costsPanel)return;

  const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const parseEuro=s=>{
    const raw=String(s||'').replace(/\s/g,'').replace(/\./g,'').replace(',','.');
    const m=raw.match(/-?\d+(?:\.\d+)?/);
    return m?Number(m[0]):0;
  };
  const fmt=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:n%1?2:0}).format(n);

  const getCosts=()=>{
    try{
      if(typeof costi!=='undefined'&&Array.isArray(costi))return costi;
    }catch(_){}
    return [...costsPanel.querySelectorAll('.cost-row')].map(row=>({
      voce:(row.firstElementChild?.childNodes?.[0]?.textContent||row.firstElementChild?.textContent||'').trim(),
      note:row.querySelector('.c')?.textContent||'',
      valore:row.querySelector('.v')?.textContent||''
    }));
  };

  const totalKnown=()=>{
    const rows=getCosts();
    const total=rows.find(x=>normalize(x.voce).includes('totale a persona'));
    return total?.valore||'€ 1.774';
  };

  const groupExpenseTotal=()=>[...expenses.querySelectorAll('.exp-row')].reduce((cents,row)=>{const amount=Number(row.dataset.amount);return cents+(Number.isFinite(amount)?Math.round(amount*100):0);},0)/100;
  const peopleCount=()=>{
    try{if(typeof partecipanti!=='undefined'&&Array.isArray(partecipanti)&&partecipanti.length)return partecipanti.length;}catch(_){}
    return 6;
  };

  const macroRows=()=>getCosts().filter(x=>!normalize(x.voce).includes('totale a persona'));

  const ensureOverview=()=>{
    let overview=document.getElementById('budgetOverview');
    if(overview)return overview;
    const title=[...trip.querySelectorAll(':scope > .section-title')].find(x=>normalize(x.textContent).includes('spese di gruppo'));
    if(!title)return null;

    overview=document.createElement('div');
    overview.id='budgetOverview';
    overview.innerHTML=`
      <div class="budget-hero">
        <span class="budget-kicker">BUDGET NOTO · A PERSONA</span>
        <strong id="budgetKnownTotal">€ 1.774</strong>
        <small>Stima aggiornata · quote a persona</small>
      </div>
      <div class="budget-stat">
        <span class="budget-stat-label">SPESE GRUPPO</span>
        <strong id="budgetGroupTotal">€ 0</strong>
        <small>Registrate in tempo reale</small>
      </div>
      <div class="budget-stat">
        <span class="budget-stat-label">QUOTA MEDIA</span>
        <strong id="budgetGroupShare">€ 0</strong>
        <small id="budgetPeopleLabel">su 6 persone</small>
      </div>`;

    const macro=document.createElement('div');
    macro.id='budgetMacroGrid';
    title.insertAdjacentElement('afterend',overview);
    overview.insertAdjacentElement('afterend',macro);
    return overview;
  };

  const updateOverview=()=>{
    if(!ensureOverview())return;
    const total=totalKnown();
    const group=groupExpenseTotal();
    const people=peopleCount();
    const known=document.getElementById('budgetKnownTotal');
    const groupEl=document.getElementById('budgetGroupTotal');
    const share=document.getElementById('budgetGroupShare');
    const peopleEl=document.getElementById('budgetPeopleLabel');
    if(known)known.textContent=total;
    if(groupEl)groupEl.textContent=fmt(group);
    if(share)share.textContent=fmt(people?group/people:0);
    if(peopleEl)peopleEl.textContent=`su ${people} persone`;

    const macro=document.getElementById('budgetMacroGrid');
    if(macro){
      const html=macroRows().map(row=>{
        const variable=!parseEuro(row.valore);
        return `<div class="budget-macro${variable?' is-variable':''}"><span>${row.voce}</span><strong>${row.valore||'—'}</strong></div>`;
      }).join('');
      if(macro.innerHTML!==html)macro.innerHTML=html;
    }
  };

  const makeDetailFold=()=>{
    const title=costsPanel.previousElementSibling;
    if(!title||!title.classList.contains('section-title')||title.dataset.budgetFold==='1')return;
    title.dataset.budgetFold='1';
    title.classList.add('budget-detail-title');
    costsPanel.classList.add('budget-detail-panel');
    title.setAttribute('role','button');
    title.setAttribute('tabindex','0');
    const arrow=document.createElement('span');
    arrow.className='budget-detail-arrow';
    arrow.textContent='⌄';
    title.appendChild(arrow);

    let open=false;
    try{open=localStorage.getItem('islanda_budget_detail_open')==='1';}catch(_){}
    const apply=()=>{
      title.classList.toggle('is-open',open);
      costsPanel.classList.toggle('is-open',open);
      title.setAttribute('aria-expanded',String(open));
    };
    const toggle=()=>{
      open=!open;
      apply();
      try{localStorage.setItem('islanda_budget_detail_open',open?'1':'0');}catch(_){}
    };
    title.addEventListener('click',toggle);
    title.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
    apply();
  };

  let queued=false;
  const schedule=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;updateOverview();makeDetailFold();});
  };

  new MutationObserver(schedule).observe(expenses,{childList:true,subtree:true});
  new MutationObserver(schedule).observe(costsPanel,{childList:true,subtree:true});

  ensureOverview();
  makeDetailFold();
  updateOverview();
})();
