(()=>{
  const trip=document.getElementById('tripView');
  if(!trip)return;

  const START='2026-09-30', END='2026-10-07', REFRESH_MS=30*60*1000;
  const stops=[
    {name:'Reykjavík',lat:64.1466,lon:-21.9426},
    {name:'Hella',lat:63.8348,lon:-20.4008},
    {name:'Kirkjubæjarklaustur',lat:63.791,lon:-18.056},
    {name:'Hoffell',lat:64.3965,lon:-15.3418},
    {name:'Akureyri',lat:65.6835,lon:-18.0878},
    {name:'Mývatn',lat:65.6039,lon:-16.9961},
    {name:'Grundarfjörður',lat:64.9259,lon:-23.2528},
    {name:'Hafnir',lat:63.9345,lon:-22.6879}
  ];
  let timer=null;
  const status={weather:null,fx:null};

  const icelandDate=()=>{
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Reykjavik',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };

  const currentStop=()=>{
    const d=icelandDate();
    if(d<START)return stops[0];
    if(d>END)return stops.at(-1);
    const n=Math.floor((Date.parse(`${d}T00:00:00Z`)-Date.parse(`${START}T00:00:00Z`))/86400000);
    return stops[Math.min(Math.max(n,0),stops.length-1)];
  };

  const fmtTime=ms=>new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'}).format(new Date(ms));
  const sunsetTime=s=>String(s||'').split('T')[1]?.slice(0,5)||'—';

  function ensureOps(){
    let root=document.getElementById('opsLive');
    if(root)return root;
    const row=document.querySelector('#tripView .meteo-row');
    const panel=row?.closest('.panel');
    if(!panel)return null;
    root=document.createElement('div');
    root.id='opsLive';
    root.innerHTML=`
      <div class="ops-live-weather">
        <span class="ops-kicker">METEO OPERATIVO</span>
        <strong id="opsWeatherValue">Caricamento…</strong>
        <span id="opsWeatherMeta">Situazione attuale</span>
      </div>
      <a class="ops-road-link" href="https://umferdin.is/en" target="_blank" rel="noopener noreferrer">
        <span class="ops-kicker">STATO STRADE</span>
        <strong>Apri live</strong>
        <small>Umferdin · ufficiale</small>
      </a>
      <div id="opsSyncStatus" data-online="${navigator.onLine}">Dati live in inizializzazione</div>`;
    const note=panel.querySelector('.offline-note');
    if(note)panel.insertBefore(root,note);
    else panel.appendChild(root);
    updateStatus();
    return root;
  }

  function updateStatus(){
    const el=document.getElementById('opsSyncStatus');
    if(!el)return;
    el.dataset.online=String(navigator.onLine);
    if(!navigator.onLine){el.textContent='OFFLINE · mostro gli ultimi dati disponibili';return;}
    const bits=['ONLINE'];
    if(status.weather?.at)bits.push(`meteo ${fmtTime(status.weather.at)}`);
    if(status.fx?.at)bits.push(`cambio ${fmtTime(status.fx.at)}`);
    el.textContent=bits.join(' · ');
  }

  async function updateWeather(){
    const root=ensureOps();
    if(!root)return;
    const stop=currentStop();
    const val=document.getElementById('opsWeatherValue');
    const meta=document.getElementById('opsWeatherMeta');
    try{
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${stop.lat}&longitude=${stop.lon}&current=temperature_2m,wind_gusts_10m&daily=precipitation_probability_max,sunset&forecast_days=1&timezone=Atlantic%2FReykjavik`;
      const res=await fetch(url,{cache:'no-store'});
      if(!res.ok)throw new Error(`weather_${res.status}`);
      const j=await res.json();
      const temp=Math.round(Number(j.current?.temperature_2m));
      const gust=Math.round(Number(j.current?.wind_gusts_10m));
      const rain=Math.round(Number(j.daily?.precipitation_probability_max?.[0]));
      const sunset=sunsetTime(j.daily?.sunset?.[0]);
      if(val)val.textContent=`${Number.isFinite(temp)?temp:'—'}° · ${Number.isFinite(rain)?rain:'—'}% · ${Number.isFinite(gust)?gust:'—'} km/h`;
      if(meta)meta.textContent=`${stop.name} · tramonto ${sunset}`;
      status.weather={at:Date.now(),ok:true};
    }catch(err){
      console.warn('[Islanda Ops] meteo operativo non disponibile',err);
      if(val)val.textContent='Dato non disponibile';
      if(meta)meta.textContent=`${stop.name} · apri Meteo per il dettaglio`;
      status.weather={at:Date.now(),ok:false};
    }
    updateStatus();
  }

  window.addEventListener('islanda:data-status',e=>{
    const d=e.detail||{};
    if(d.source==='fx')status.fx={at:d.at||Date.now(),ok:d.ok!==false};
    updateStatus();
  });
  window.addEventListener('online',()=>{updateStatus();updateWeather();});
  window.addEventListener('offline',updateStatus);

  function boot(){
    ensureOps();
    updateWeather();
    if(!timer)timer=setInterval(updateWeather,REFRESH_MS);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateWeather();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
