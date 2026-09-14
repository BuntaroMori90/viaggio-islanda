(()=>{
  const DEPARTURE = new Date('2026-09-29T21:00:00+02:00').getTime();
  let timer=null;

  const pad=n=>String(n).padStart(2,'0');

  const enhanceCountdown=(top)=>{
    const countdown=top.querySelector('.countdown');
    if(!countdown||countdown.dataset.liveCountdown==='1') return;
    countdown.dataset.liveCountdown='1';
    countdown.classList.add('countdown-live');
    countdown.innerHTML=`
      <div class="countdown-kicker">PARTENZA TRA</div>
      <div class="countdown-grid" aria-label="Conto alla rovescia alla partenza">
        <div class="countdown-unit countdown-days"><strong id="daysLeft">--</strong><span>Giorni</span></div>
        <div class="countdown-unit"><strong id="hoursLeft">--</strong><span>Ore</span></div>
        <div class="countdown-unit"><strong id="minutesLeft">--</strong><span>Min</span></div>
        <div class="countdown-unit"><strong id="secondsLeft">--</strong><span>Sec</span></div>
      </div>`;

    const update=()=>{
      const remaining=Math.max(0,DEPARTURE-Date.now());
      const days=Math.floor(remaining/86400000);
      const hours=Math.floor((remaining%86400000)/3600000);
      const minutes=Math.floor((remaining%3600000)/60000);
      const seconds=Math.floor((remaining%60000)/1000);
      const d=document.getElementById('daysLeft');
      const h=document.getElementById('hoursLeft');
      const m=document.getElementById('minutesLeft');
      const s=document.getElementById('secondsLeft');
      if(d)d.textContent=String(days);
      if(h)h.textContent=pad(hours);
      if(m)m.textContent=pad(minutes);
      if(s)s.textContent=pad(seconds);
      if(remaining===0&&timer){clearInterval(timer);timer=null;}
    };
    update();
    if(!timer)timer=setInterval(update,1000);
  };

  const enhanceHero=()=>{
    const trip=document.getElementById('tripView');
    const top=trip?.querySelector(':scope > .top-row');
    const title=trip?.querySelector(':scope > h1');
    if(!trip||!top||!title) return false;

    if(top.dataset.heroEnhanced!=='1'){
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
    }

    enhanceCountdown(top);
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
