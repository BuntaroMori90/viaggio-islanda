(()=>{
  const mapsSearch = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  const parkingTargets = {
    'Þingvellir · P1 Hakið': [
      ['P1', 'Þingvellir P1 Hakið Parking, Iceland'],
      ['P2', 'Þingvellir P2 Efri-Vellir Parking, Iceland'],
      ['P5', 'Þingvellir P5 Valhöll Parking, Iceland']
    ],
    'Brúarfoss · parcheggio nuovo': [['Apri parcheggio','Brúarfoss Parking, Iceland']],
    'Geysir · parcheggio principale': [['Apri parcheggio','Geysir Parking, Haukadalur, Iceland']],
    'Gullfoss · Upper Parking': [['Apri parcheggio','Gullfoss Upper Parking, Iceland']],
    'Faxi / Faxafoss': [['Apri parcheggio','Faxi Waterfall Parking, Iceland']],
    'Urriðafoss': [['Apri parcheggio','Urriðafoss Parking, Iceland']],
    'Seljalandsfoss': [['Apri parcheggio','Seljalandsfoss Parking, Iceland']],
    'Gljúfrabúi': [['Usa Seljalandsfoss','Seljalandsfoss Parking, Iceland']],
    'Skógafoss': [['Apri parcheggio','Skógafoss Parking, Iceland']],
    'Kvernufoss': [['Apri parcheggio','Kvernufoss Parking, Skógar Museum, Iceland']],
    'Sólheimasandur Plane Wreck': [['Apri parcheggio','Sólheimasandur Plane Wreck Parking, Iceland']],
    'Dyrhólaey · Lower + Upper': [
      ['Lower', 'Dyrhólaey Viewpoint Parking, Iceland'],
      ['Upper', 'Dyrhólaey Lighthouse Parking, Iceland']
    ],
    'Reynisfjara · P1 Lower': [['P1 Lower','Reynisfjara Parking, Iceland']],
    'Fjaðrárgljúfur': [['Apri parcheggio','Fjaðrárgljúfur Parking, Iceland']],
    'Skaftafell': [['Apri parcheggio','Skaftafell Visitor Centre Parking, Iceland']],
    'Jökulsárlón + Diamond Beach': [
      ['Jökulsárlón','Jökulsárlón Main Parking, Iceland'],
      ['Diamond Beach','Diamond Beach Parking, Iceland']
    ],
    'Egilsstaðir': [['Parcheggi centro','Egilsstaðir public parking, Iceland']],
    'Seyðisfjörður': [['Zona porto','Seyðisfjörður Ferry Terminal Parking, Iceland']],
    'Goðafoss': [['Fosshóll','Goðafoss Fosshóll Parking, Iceland']],
    'Húsavík · porto': [['Zona porto','Húsavík Harbour Parking, Iceland']],
    'Dettifoss · lato ovest 862': [['West 862','Dettifoss West Side Parking, Iceland']],
    'Hverir': [['Apri parcheggio','Hverir Parking, Iceland']],
    'Dimmuborgir': [['Apri parcheggio','Dimmuborgir Parking, Iceland']],
    'Grjótagjá': [['Apri parcheggio','Grjótagjá Parking, Iceland']],
    'Siglufjörður': [['Gránugata / porto','Gránugata Parking, Siglufjörður, Iceland']],
    'Grafarkirkja / Gröf': [['Apri parcheggio','Grafarkirkja Parking, Gröf, Iceland']],
    'Hvammstangi': [['Seal Center','Icelandic Seal Center Parking, Hvammstangi, Iceland']],
    'Stykkishólmur · P1 porto': [['P1 porto','Stykkishólmur P1 Parking, Iceland']],
    'Kirkjufell / Kirkjufellsfoss': [['Apri parcheggio','Kirkjufellsfoss Parking, Iceland']],
    'Rauðfeldsgjá': [['Apri parcheggio','Rauðfeldsgjá Parking, Iceland']],
    'Arnarstapi · Cliff/Bárður area': [['Cliff/Bárður','Arnarstapi Cliff Viewpoint Parking, Iceland']],
    'Búðakirkja': [['Apri parcheggio','Búðakirkja Parking, Iceland']],
    'Ytri Tunga': [['Apri parcheggio','Ytri Tunga Parking, Iceland']]
  };

  function normalize(s){
    return String(s||'').replace(/\s+/g,' ').trim();
  }

  function injectStyle(){
    if(document.getElementById('parkingMapsStyle')) return;
    const style=document.createElement('style');
    style.id='parkingMapsStyle';
    style.textContent=`
      .parking-map-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
      .parking-map-link{display:inline-flex;align-items:center;gap:4px;padding:6px 9px;border:1px solid rgba(79,211,232,.18);border-radius:999px;background:rgba(79,211,232,.055);color:#86e6f2;text-decoration:none;font-size:8.5px;line-height:1;white-space:nowrap}
      .parking-map-link:hover{border-color:rgba(79,211,232,.38);background:rgba(79,211,232,.10)}
    `;
    document.head.appendChild(style);
  }

  function enrichRows(){
    const section=document.getElementById('siteCostsSection');
    if(!section) return;
    injectStyle();
    section.querySelectorAll('.site-cost-row').forEach(row=>{
      if(row.dataset.parkingMapReady==='1') return;
      const nameEl=row.querySelector('.site-cost-main b');
      const name=normalize(nameEl?.textContent);
      const targets=parkingTargets[name];
      if(!targets) return;
      const wrap=document.createElement('div');
      wrap.className='parking-map-links';
      targets.forEach(([label,query])=>{
        const a=document.createElement('a');
        a.className='parking-map-link';
        a.href=mapsSearch(query);
        a.target='_blank';
        a.rel='noopener noreferrer';
        a.textContent=`📍 ${label}`;
        wrap.appendChild(a);
      });
      row.querySelector('.site-cost-main')?.appendChild(wrap);
      row.dataset.parkingMapReady='1';
    });
  }

  function boot(){
    enrichRows();
    const root=document.getElementById('siteCostsSection') || document.getElementById('tripView');
    if(root) new MutationObserver(enrichRows).observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
