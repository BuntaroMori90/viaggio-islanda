(()=>{
  const CACHE_KEY='islanda2026_fx_isk_eur';
  const REFRESH_MS=6*60*60*1000;
  let rate=null;
  let rateDate=null;
  let timer=null;

  const input=()=>document.getElementById('iskInput');
  const output=()=>document.getElementById('eurOutput');

  function dispatch(ok){
    window.dispatchEvent(new CustomEvent('islanda:data-status',{detail:{source:'fx',ok,at:Date.now()}}));
  }

  function ensureMeta(){
    if(document.getElementById('fxLiveMeta'))return document.getElementById('fxLiveMeta');
    const i=input();
    const panel=i?.parentElement;
    if(!panel)return null;
    const meta=document.createElement('div');
    meta.id='fxLiveMeta';
    meta.className='fx-live-meta';
    panel.insertAdjacentElement('afterend',meta);
    return meta;
  }

  function readCache(){
    try{
      const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
      if(c&&Number.isFinite(Number(c.rate))){rate=Number(c.rate);rateDate=c.date||null;return true;}
    }catch(_){}
    return false;
  }

  function writeCache(){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify({rate,date:rateDate,ts:Date.now()}));}catch(_){}
  }

  function render(){
    const i=input(),o=output(),m=ensureMeta();
    if(!i||!o)return;
    const amount=parseFloat(i.value)||0;
    const effective=Number.isFinite(rate)?rate:(1/144);
    o.textContent=`€ ${(amount*effective).toFixed(2)}`;
    if(m){
      const inverse=1/effective;
      m.textContent=Number.isFinite(rate)
        ? `Cambio online · 1 EUR ≈ ${inverse.toFixed(1)} ISK · riferimento ${rateDate||'ultimo disponibile'}`
        : `Cambio offline di fallback · 1 EUR ≈ ${inverse.toFixed(1)} ISK`;
    }
  }

  async function refresh(){
    try{
      const res=await fetch('https://api.frankfurter.dev/v2/rate/isk/eur',{cache:'no-store'});
      if(!res.ok)throw new Error(`fx_${res.status}`);
      const j=await res.json();
      const r=Number(j.rate);
      if(!Number.isFinite(r)||r<=0)throw new Error('fx_invalid');
      rate=r;
      rateDate=j.date||null;
      writeCache();
      render();
      dispatch(true);
    }catch(err){
      console.warn('[Islanda FX] cambio online non disponibile',err);
      readCache();
      render();
      dispatch(false);
    }
  }

  function boot(){
    readCache();
    render();
    input()?.addEventListener('input',render);
    refresh();
    if(!timer)timer=setInterval(refresh,REFRESH_MS);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
