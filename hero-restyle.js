(()=>{
  const enhanceHero=()=>{
    const trip=document.getElementById('tripView');
    const top=trip?.querySelector(':scope > .top-row');
    const title=trip?.querySelector(':scope > h1');
    if(!trip||!top||!title||top.dataset.heroEnhanced==='1') return false;

    top.dataset.heroEnhanced='1';
    top.classList.add('hero-card');

    if(!trip.querySelector(':scope > .hero-subtitle')){
      const subtitle=document.createElement('div');
      subtitle.className='hero-subtitle';
      subtitle.textContent='Il viaggio progettato, sempre con te.';
      title.insertAdjacentElement('afterend',subtitle);
    }

    if(!top.querySelector('.hero-meta')){
      let people='6 persone';
      let stages='8 tappe';
      try{
        if(typeof partecipanti!=='undefined'&&Array.isArray(partecipanti)) people=`${partecipanti.length} persone`;
        if(typeof giorni!=='undefined'&&Array.isArray(giorni)) stages=`${giorni.length} tappe`;
      }catch(_){}

      const meta=document.createElement('div');
      meta.className='hero-meta';
      meta.innerHTML=`
        <div class="hero-meta-kicker">ROAD TRIP · ISLANDA</div>
        <div class="hero-meta-dates"><span>30 SET</span><i>→</i><span>8 OTT 2026</span></div>
        <div class="hero-meta-facts"><span>${stages}</span><span>${people}</span></div>`;
      top.prepend(meta);
    }

    return true;
  };

  const boot=()=>{
    if(enhanceHero()) return;
    const observer=new MutationObserver(()=>{if(enhanceHero()) observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
