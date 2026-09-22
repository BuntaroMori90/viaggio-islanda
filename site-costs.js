(()=>{
  const PEOPLE = 6;
  const FX_CACHE_KEY = 'islanda2026_fx_isk_eur';
  const FALLBACK_RATE = 1 / 144;

  const parkingItems = [
    {day:1,name:'Parcheggio alloggio Reykjavík',eur:12.50,kind:'Parcheggio',pay:'fascia oraria',note:'Costo indicato nel piano del 30/09.'},
    {day:2,name:'Þingvellir · P1 Hakið',isk:1200,kind:'Parcheggio',pay:'Check-it / macchina',note:'Categoria 6–9 posti. Un pagamento vale P1, P2 e P5 fino a mezzanotte.'},
    {day:2,name:'Brúarfoss · parcheggio nuovo',isk:750,kind:'Parcheggio',pay:'Parka',note:'Circa 5 minuti a piedi dalla cascata; tariffa verificata 2026.'},
    {day:2,name:'Geysir · parcheggio principale',isk:1000,kind:'Parcheggio',pay:'Parka',note:'Parcheggio e servizi; tariffa operativa 2026.'},
    {day:2,name:'Gullfoss · Upper Parking',isk:0,kind:'Parcheggio',pay:'—',note:'Gratuito; il più pratico per visitor center e servizi.'},
    {day:2,name:'Faxi / Faxafoss',isk:700,kind:'Parcheggio',pay:'sul posto',note:'Parcheggio vicino al viewpoint.'},
    {day:2,name:'Urriðafoss',isk:750,kind:'Parcheggio',pay:'Parka',note:'Sosta >10 minuti; tariffa 2 ore.'},
    {day:3,name:'Seljalandsfoss',isk:900,kind:'Parcheggio',pay:'Check-it / macchina',note:'Categoria 6–8 posti; WC inclusi.'},
    {day:3,name:'Gljúfrabúi',isk:0,kind:'Parcheggio',pay:'stesso ticket',note:'Non spostare l’auto: usare Seljalandsfoss.'},
    {day:3,name:'Skógafoss',isk:1300,kind:'Parcheggio',pay:'Parka',note:'Tariffa ufficiale 2026 per veicolo 6–9 posti.'},
    {day:3,name:'Kvernufoss',isk:750,kind:'Parcheggio',pay:'Parka',note:'Trailhead presso Skógar Museum; WC museo inclusi negli orari di apertura.'},
    {day:3,name:'Sólheimasandur Plane Wreck',isk:750,kind:'Parcheggio',pay:'Parka / sul posto',note:'Solo parcheggio; la navetta è facoltativa ed esclusa dal totale ingressi.'},
    {day:3,name:'Dyrhólaey · Lower + Upper',isk:1000,kind:'Parcheggio',pay:'Parka',note:'Categoria 6–9 posti. Un solo pagamento per i due parcheggi.'},
    {day:3,name:'Reynisfjara · P1 Lower',isk:1300,kind:'Parcheggio',pay:'Parka',note:'Categoria 6–9 posti; P1 scelto per rapidità e servizi.'},
    {day:4,name:'Fjaðrárgljúfur',isk:1300,kind:'Parcheggio',pay:'Parka',note:'Categoria 6–9 posti; parcheggio principale.'},
    {day:4,name:'Skaftafell',isk:1440,kind:'Parcheggio',pay:'Parka',note:'Categoria 6–9 posti. Primo parcheggio Vatnajökull della giornata.'},
    {day:4,name:'Jökulsárlón + Diamond Beach',isk:720,kind:'Parcheggio',pay:'Parka',note:'Secondo sito Vatnajökull nello stesso giorno: applicato sconto 50% su 1.440 ISK.'},
    {day:4,name:'Hornafjarðarfljót · nuovo ponte',isk:1500,kind:'Pedaggio',pay:'Spölur · entro 12 h',note:'Stima: 1 passaggio verso Höfn/Stokksnes. 1.500 ISK per auto sotto 3,5 t. Adeguare l’importo ai passaggi effettivi; nessun pedaggio se si evita il portale tramite la 987.'},
    {day:5,name:'Egilsstaðir',isk:0,kind:'Parcheggio',pay:'—',note:'Parcheggi pubblici centrali generalmente gratuiti.'},
    {day:5,name:'Seyðisfjörður',isk:0,kind:'Parcheggio',pay:'—',note:'Area porto/centro: gratuito.'},
    {day:5,name:'Goðafoss',isk:0,kind:'Parcheggio',pay:'—',note:'Lato Fosshóll: gratuito.'},
    {day:6,name:'Húsavík · porto',isk:0,kind:'Parcheggio',pay:'—',note:'Nel vostro viaggio di ottobre la stagione comunale a pagamento è terminata.'},
    {day:6,name:'Dettifoss · lato ovest 862',isk:0,kind:'Parcheggio',pay:'—',note:'Gratuito; lato ovest consigliato per il vostro periodo.'},
    {day:6,name:'Hverir',isk:1400,kind:'Parcheggio',pay:'EasyPark / QR',note:'Tariffa auto 2026.'},
    {day:6,name:'Dimmuborgir',isk:1000,kind:'Parcheggio',pay:'sul posto / QR',note:'Tariffa rilevata a settembre 2026; controllare il cartello sul posto.'},
    {day:6,name:'Grjótagjá',isk:0,kind:'Parcheggio',pay:'—',note:'Gratuito.'},
    {day:6,name:'Vaðlaheiðargöng ×2',isk:4432,kind:'Pedaggio',pay:'tunnel.is',note:'2 × 2.216 ISK per veicolo sotto 3,5 t. Pagamento entro ±24 h.'},
    {day:7,name:'Siglufjörður',isk:0,kind:'Parcheggio',pay:'—',note:'Zona porto: gratuito.'},
    {day:7,name:'Grafarkirkja / Gröf',isk:0,kind:'Parcheggio',pay:'—',note:'Piccolo parcheggio gratuito.'},
    {day:7,name:'Hvammstangi',isk:0,kind:'Parcheggio',pay:'—',note:'Zona Seal Center/porto: gratuito.'},
    {day:7,name:'Stykkishólmur · P1 porto',isk:0,kind:'Parcheggio',pay:'—',note:'A ottobre la tariffazione stagionale è terminata.'},
    {day:8,name:'Kirkjufell / Kirkjufellsfoss',isk:1400,maxIsk:1800,kind:'Parcheggio',pay:'EasyPark / QR',note:'Base: auto normale 1.400 ISK. Se il veicolo viene classificato “medio”: 1.800 ISK.'},
    {day:8,name:'Rauðfeldsgjá',isk:0,kind:'Parcheggio',pay:'—',note:'Gratuito.'},
    {day:8,name:'Arnarstapi · Cliff/Bárður area',isk:0,kind:'Parcheggio',pay:'—',note:'Usare il pubblico gratuito, non il parcheggio hotel.'},
    {day:8,name:'Búðakirkja',isk:0,kind:'Parcheggio',pay:'—',note:'Parcheggio dedicato gratuito.'},
    {day:8,name:'Ytri Tunga',isk:1100,kind:'Parcheggio',pay:'Check-it / macchina',note:'Categoria 6–9 posti; valido tutto il giorno.'}
  ];

  const entryItems = [
    {day:1,name:'Harpa Concert Hall',isk:0,perPerson:true,kind:'Ingresso',note:'Accesso all’edificio gratuito.'},
    {day:2,name:'Þingvellir National Park',isk:0,perPerson:true,kind:'Ingresso',note:'Ingresso al parco gratuito; si paga solo il parcheggio.'},
    {day:2,name:'Kerið',isk:700,perPerson:true,kind:'Ingresso',note:'Ingresso; parcheggio incluso.'},
    {day:4,name:'Stokksnes / Vestrahorn',isk:1100,perPerson:true,kind:'Ingresso',note:'Accesso alla proprietà e parcheggi interni inclusi.'}
  ];

  const optionalItems = [
    {day:1,name:'Hallgrímskirkja · torre',eur:10.45,perPerson:true,kind:'Facoltativo',note:'Da decidere sul posto. Escluso completamente dal totale.'},
    {day:1,name:'Museo Fallologico',eur:24,perPerson:true,kind:'Facoltativo',note:'Da decidere sul posto. Escluso completamente dal totale.'},
    {day:1,name:'Perlan',eur:48,perPerson:true,kind:'Facoltativo',note:'Da decidere sul posto. Escluso completamente dal totale.'},
    {day:3,name:'Plane Wreck · navetta',eur:20,perPerson:true,kind:'Facoltativo',note:'Da valutare in base a tempo e meteo. Escluso completamente dal totale.'}
  ];

  for(const [group,items] of [['parking',parkingItems],['entries',entryItems],['optional',optionalItems]]) {
    items.forEach(item=>{
      item.key=`site:${group}:${item.day}:${item.name}`;
      window.IslandaCosts.register({key:item.key,name:item.name,amount:item.eur??item.isk??0,currency:item.eur!==undefined?'EUR':'ISK',perPerson:!!item.perPerson,referenceNote:item.pay||item.kind});
    });
  }
  function effective(item){
    const amount=window.IslandaCosts.override(item.key);
    if(amount===null)return item;
    return {...item,[item.eur!==undefined?'eur':'isk']:amount,maxIsk:undefined};
  }

  const fmtEUR = n => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  const fmtISK = n => `${new Intl.NumberFormat('it-IT',{maximumFractionDigits:0}).format(Math.round(n))} ISK`;

  function currentRate(){
    try{
      const cached=JSON.parse(localStorage.getItem(FX_CACHE_KEY)||'null');
      const r=Number(cached?.rate);
      if(Number.isFinite(r)&&r>0)return {rate:r,date:cached.date||null,live:true};
    }catch(_){}
    return {rate:FALLBACK_RATE,date:null,live:false};
  }

  function itemGroupEUR(item,rate,useMax=false){
    item=effective(item);
    const qty=item.perPerson?PEOPLE:1;
    const isk=useMax&&Number.isFinite(item.maxIsk)?item.maxIsk:(item.isk||0);
    return ((isk*rate)+(item.eur||0))*qty;
  }

  function totals(rate,useMax=false){
    const parking=parkingItems.reduce((s,x)=>s+itemGroupEUR(x,rate,useMax),0);
    const entries=entryItems.reduce((s,x)=>s+itemGroupEUR(x,rate,useMax),0);
    return {parking,entries,total:parking+entries};
  }

  function totalsISK(items,useMax=false){
    return items.reduce((sum,item)=>{
      item=effective(item);
    const qty=item.perPerson?PEOPLE:1;
      const amount=useMax&&Number.isFinite(item.maxIsk)?item.maxIsk:(item.isk||0);
      return sum+amount*qty;
    },0);
  }

  function insertSection(){
    if(document.getElementById('siteCostsSection'))return document.getElementById('siteCostsSection');
    const costsPanel=document.getElementById('costsPanel');
    if(!costsPanel)return null;
    const section=document.createElement('section');
    section.id='siteCostsSection';
    section.innerHTML=`
      <div class="section-title site-costs-title">Parcheggi, pedaggi e ingressi</div>
      <div class="site-costs-summary" id="siteCostsSummary"></div>
      <div class="site-costs-meta" id="siteCostsMeta"></div>
      <div class="site-costs-tabs" role="group" aria-label="Dettaglio costi sul posto">
        <button type="button" class="is-active" aria-pressed="true" data-cost-tab="parking">Parcheggi + pedaggi</button>
        <button type="button" aria-pressed="false" data-cost-tab="entries">Ingressi inclusi</button>
        <button type="button" aria-pressed="false" data-cost-tab="optional">Facoltativi · esclusi</button>
      </div>
      <div class="site-costs-detail" id="siteCostsDetail"></div>
      <div class="site-costs-note">Il totale usa 1 auto da 6–9 posti e 6 adulti. Forest Lagoon ed Earth Lagoon non compaiono qui perché già pagate; Blue Lagoon è esclusa perché non prevista. Torre di Hallgrímskirkja, Museo Fallologico, Perlan e navetta Plane Wreck sono riportati solo come promemoria e non entrano in alcun totale. Le commissioni eventuali di Parka/EasyPark non sono incluse.</div>`;
    costsPanel.parentElement.insertBefore(section,costsPanel.nextElementSibling);
    section.querySelectorAll('[data-cost-tab]').forEach(btn=>btn.addEventListener('click',()=>{
      section.querySelectorAll('[data-cost-tab]').forEach(x=>{x.classList.toggle('is-active',x===btn);x.setAttribute('aria-pressed',String(x===btn));});
      renderDetail(btn.dataset.costTab);
    }));
    return section;
  }

  function summaryCard(label,value,sub,accent=''){
    return `<div class="site-cost-card ${accent}"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`;
  }

  function renderSummary(){
    const section=insertSection();
    if(!section)return;
    const fx=currentRate();
    const base=totals(fx.rate,false);
    const max=totals(fx.rate,true);
    const pIsk=totalsISK(parkingItems,false);
    const eIsk=totalsISK(entryItems,false);
    const entriesEur=entryItems.reduce((s,x)=>s+(effective(x).eur||0)*(x.perPerson?PEOPLE:1),0);
    const parkingEur=parkingItems.reduce((s,x)=>s+(effective(x).eur||0),0);
    const summary=document.getElementById('siteCostsSummary');
    const parkingRange=Math.abs(max.parking-base.parking)>.01 ? `${fmtEUR(base.parking)}–${fmtEUR(max.parking)}` : fmtEUR(base.parking);
    summary.innerHTML=
      summaryCard('PARCHEGGI + PEDAGGI',parkingRange,`${fmtISK(pIsk)} + ${fmtEUR(parkingEur)} · gruppo`,'parking')+
      summaryCard('INGRESSI INCLUSI',fmtEUR(base.entries),`${fmtISK(eIsk)} + ${fmtEUR(entriesEur)} · gruppo`,'entries')+
      summaryCard('TOTALE SUL POSTO',Math.abs(max.total-base.total)>.01?`${fmtEUR(base.total)}–${fmtEUR(max.total)}`:fmtEUR(base.total),Math.abs(max.total-base.total)>.01?`${fmtEUR(base.total/PEOPLE)}–${fmtEUR(max.total/PEOPLE)} a persona`:`${fmtEUR(base.total/PEOPLE)} a persona`,'total');

    const meta=document.getElementById('siteCostsMeta');
    meta.innerHTML=`<span>Cambio: <b>1 EUR ≈ ${(1/fx.rate).toFixed(1)} ISK</b>${fx.live&&fx.date?` · ${fx.date}`:' · fallback offline'}</span><span>Veicolo: <b>6–9 posti</b></span><span>Persone: <b>${PEOPLE}</b></span><span>Facoltativi: <b>esclusi dal totale</b></span>`;
    patchMacroBudget(base.parking/PEOPLE);
  }

  function groupByDay(items){
    return items.reduce((acc,item)=>{(acc[item.day] ||= []).push(item);return acc;},{});
  }

  function itemPriceText(item,rate){
    item=effective(item);
    const unit=[];
    if(item.isk||item.isk===0)unit.push(item.isk===0?'gratis':fmtISK(item.isk));
    if(item.eur)unit.push(fmtEUR(item.eur));
    const group=itemGroupEUR(item,rate,false);
    const max=itemGroupEUR(item,rate,true);
    const groupTxt=item.perPerson&&group>0?`${fmtEUR(group)} gruppo`:group>0?fmtEUR(group):'gratis';
    const alt=Number.isFinite(item.maxIsk)&&max>group?` · max ${fmtEUR(max)}`:'';
    return {unit:unit.join(' + '),group:`${groupTxt}${alt}`};
  }

  function renderDetail(tab='parking'){
    const detail=document.getElementById('siteCostsDetail');
    if(!detail)return;
    const fx=currentRate();
    const items=tab==='entries'?entryItems:tab==='optional'?optionalItems:parkingItems;
    const grouped=groupByDay(items);
    const opened=new Set([...detail.querySelectorAll('.site-cost-day.is-open .site-cost-day-head > span')].map(x=>x.textContent));
    detail.innerHTML=Object.entries(grouped).map(([day,rows])=>{
      const body=rows.map(item=>{
        const price=itemPriceText(item,fx.rate);
        return `<div class="site-cost-row">
          <div class="site-cost-main"><span class="site-cost-kind">${item.kind}</span><b>${item.name}</b><small>${item.note}</small><small class="cost-reference">Riferimento: ${item.eur!==undefined?fmtEUR(item.eur):fmtISK(item.isk||0)}${window.IslandaCosts.override(item.key)!==null?" · importo aggiornato dal gruppo":""}</small>${window.IslandaCosts.button(item.key)}</div>
          <div class="site-cost-price"><strong>${price.unit}</strong><span>${price.group}</span>${item.pay?`<em>${item.pay}</em>`:''}</div>
        </div>`;
      }).join('');
      return `<div class="site-cost-day"><button type="button" class="site-cost-day-head" aria-expanded="false"><span>G${day}</span><b>${dayLabel(Number(day))}</b><i>⌄</i></button><div class="site-cost-day-body">${body}</div></div>`;
    }).join('');

    detail.querySelectorAll('.site-cost-day-head').forEach(btn=>{
      if(opened.has(btn.querySelector('span').textContent)){btn.parentElement.classList.add('is-open');btn.setAttribute('aria-expanded','true');}
    });
    detail.querySelectorAll('.site-cost-day-head').forEach(btn=>btn.addEventListener('click',()=>{
      const box=btn.parentElement;
      const open=box.classList.toggle('is-open');
      btn.setAttribute('aria-expanded',String(open));
    }));
  }

  function dayLabel(day){
    return {
      1:'Reykjavík',2:'Golden Circle',3:'Costa Sud',4:'Vatnajökull + Höfn',
      5:'Fiordi Est + Akureyri',6:'Húsavík + Mývatn',7:'Nord + Snæfellsnes',8:'Snæfellsnes + rientro'
    }[day]||`Giorno ${day}`;
  }

  function patchMacroBudget(parkingPerPerson){
    const panel=document.getElementById('costsPanel');
    if(!panel)return;
    const rows=[...panel.querySelectorAll('.cost-row')];
    if(!rows.length)return;
    let total=0;
    rows.forEach(row=>{
      const label=(row.firstElementChild?.childNodes?.[0]?.textContent||'').trim().toLowerCase();
      const val=row.querySelector('.v');
      if(!val)return;
      if(label.startsWith('parcheggi')){
        const next=fmtEUR(parkingPerPerson);
        if(val.textContent!==next)val.textContent=next;
        const note=row.querySelector('.c');
        if(note&&note.textContent!=='quota 1/6 · parcheggi + pedaggi')note.textContent='quota 1/6 · parcheggi + pedaggi';
        total+=parkingPerPerson;
      }else if(label.startsWith('totale a persona')){
      }else{
        const raw=val.textContent.replace(/\s/g,'').replace(/\./g,'').replace(',','.');
        const m=raw.match(/-?\d+(?:\.\d+)?/);
        if(m)total+=Number(m[0]);
      }
    });
    const totalRow=rows.find(row=>(row.firstElementChild?.childNodes?.[0]?.textContent||'').trim().toLowerCase().startsWith('totale a persona'));
    if(totalRow){
      const val=totalRow.querySelector('.v');
      const next=`${fmtEUR(total)} circa`;
      if(val&&val.textContent!==next)val.textContent=next;
    }
    const macro=[...document.querySelectorAll('#budgetMacroGrid .budget-macro')].find(el=>el.querySelector('span')?.textContent.trim().toLowerCase()==='parcheggi');
    if(macro){
      const strong=macro.querySelector('strong');
      const next=fmtEUR(parkingPerPerson);
      if(strong&&strong.textContent!==next)strong.textContent=next;
    }
    if(typeof costi!=='undefined'){const parking=costi.find(x=>x.voce==='Parcheggi'),totalCost=costi.find(x=>x.voce==='Totale a persona');if(parking)parking.valore=fmtEUR(parkingPerPerson);if(totalCost)totalCost.valore=`${fmtEUR(total)} circa`;}
    const hero=document.getElementById('budgetKnownTotal');
    const heroNext=`${fmtEUR(total)} circa`;
    if(hero&&hero.textContent!==heroNext)hero.textContent=heroNext;
  }

  function boot(){
    insertSection();
    renderSummary();
    renderDetail('parking');
    const costsPanel=document.getElementById('costsPanel');
    if(costsPanel)new MutationObserver(()=>renderSummary()).observe(costsPanel,{childList:true,subtree:true});
    const macro=document.getElementById('budgetMacroGrid');
    if(macro)new MutationObserver(()=>{const fx=currentRate();patchMacroBudget(totals(fx.rate,false).parking/PEOPLE);}).observe(macro,{childList:true,subtree:true});
    window.addEventListener('islanda:costs-changed',()=>{renderSummary();renderDetail(document.querySelector('[data-cost-tab].is-active')?.dataset.costTab||'parking');});
    window.addEventListener('islanda:data-status',e=>{if(e.detail?.source==='fx'){renderSummary();const active=document.querySelector('[data-cost-tab].is-active')?.dataset.costTab||'parking';renderDetail(active);}});
    window.addEventListener('storage',e=>{if(e.key===FX_CACHE_KEY){renderSummary();const active=document.querySelector('[data-cost-tab].is-active')?.dataset.costTab||'parking';renderDetail(active);}});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();