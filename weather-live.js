(()=>{
  const TRIP_DATES=['2026-09-30','2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07'];
  const REFRESH_MS=30*60*1000;
  let refreshTimer=null;

  const mean=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null;
  const round=n=>Math.round(Number(n));

  function daylightHours(lat,dateString){
    const date=new Date(dateString+'T12:00:00Z');
    const start=new Date(Date.UTC(date.getUTCFullYear(),0,0));
    const day=Math.floor((date-start)/86400000);
    const gamma=2*Math.PI/365*(day-1);
    const decl=0.006918
      -0.399912*Math.cos(gamma)
      +0.070257*Math.sin(gamma)
      -0.006758*Math.cos(2*gamma)
      +0.000907*Math.sin(2*gamma)
      -0.002697*Math.cos(3*gamma)
      +0.00148*Math.sin(3*gamma);
    const phi=Number(lat)*Math.PI/180;
    const zenith=90.833*Math.PI/180;
    const cosH=(Math.cos(zenith)/(Math.cos(phi)*Math.cos(decl)))-(Math.tan(phi)*Math.tan(decl));
    if(cosH<=-1)return 24;
    if(cosH>=1)return 0;
    const H=Math.acos(cosH);
    return 24*H/Math.PI;
  }

  function formatDuration(hours){
    const total=Math.round(hours*60);
    const h=Math.floor(total/60);
    const m=total%60;
    return `${h}h ${String(m).padStart(2,'0')}min`;
  }

  function getUi(){
    const row=document.querySelector('#tripView .meteo-row');
    if(!row)return null;
    const stats=[...row.querySelectorAll('.meteo-stat')];
    if(stats.length<4)return null;
    return {
      row,
      panel:row.closest('.panel'),
      values:stats.map(s=>s.querySelector('.v')),
      labels:stats.map(s=>s.querySelector('.l')),
      note:row.closest('.panel')?.querySelector('.offline-note')||null
    };
  }

  function getDays(){
    try{
      if(typeof giorni!=='undefined'&&Array.isArray(giorni)&&giorni.length>=8){
        return giorni.slice(0,8).map((g,i)=>({lat:Number(g.lat),lon:Number(g.lon),date:TRIP_DATES[i]}));
      }
    }catch(_){}
    return [
      {lat:64.1466,lon:-21.9426,date:TRIP_DATES[0]},
      {lat:63.8348,lon:-20.4008,date:TRIP_DATES[1]},
      {lat:63.791,lon:-18.056,date:TRIP_DATES[2]},
      {lat:64.3965,lon:-15.3418,date:TRIP_DATES[3]},
      {lat:65.6835,lon:-18.0878,date:TRIP_DATES[4]},
      {lat:65.6835,lon:-18.0878,date:TRIP_DATES[5]},
      {lat:64.9259,lon:-23.2528,date:TRIP_DATES[6]},
      {lat:63.9345,lon:-22.6879,date:TRIP_DATES[7]}
    ];
  }

  function setInitial(ui,days){
    const light=mean(days.map(d=>daylightHours(d.lat,d.date)));
    if(ui.values[0])ui.values[0].textContent='—';
    if(ui.values[1])ui.values[1].textContent='—';
    if(ui.values[2])ui.values[2].textContent='—';
    if(ui.values[3])ui.values[3].textContent=formatDuration(light);
    if(ui.labels[0])ui.labels[0].textContent='caricamento meteo';
    if(ui.labels[1])ui.labels[1].textContent='caricamento meteo';
    if(ui.labels[2])ui.labels[2].textContent='caricamento meteo';
    if(ui.labels[3])ui.labels[3].textContent='luce media · intero viaggio';
    if(ui.note)ui.note.textContent='Carico la situazione attuale e le previsioni disponibili. La durata della luce è già calcolata sulle date reali del viaggio.';
  }

  function currentSnapshot(payload){
    const rows=[];
    payload.forEach(p=>{
      const temp=Number(p?.current?.temperature_2m);
      const gust=Number(p?.current?.wind_gusts_10m);
      const currentTime=String(p?.current?.time||'').slice(0,13);
      const idx=p?.hourly?.time?.findIndex(t=>String(t).slice(0,13)===currentTime)??-1;
      const rain=idx>=0?Number(p?.hourly?.precipitation_probability?.[idx]):NaN;
      if(Number.isFinite(temp)&&Number.isFinite(gust))rows.push({temp,gust,rain});
    });
    return rows;
  }

  async function updateWeather(){
    const ui=getUi();
    if(!ui)return;
    const days=getDays();
    setInitial(ui,days);

    const lat=days.map(d=>d.lat).join(',');
    const lon=days.map(d=>d.lon).join(',');
    const daily='temperature_2m_min,temperature_2m_max,precipitation_probability_max,wind_gusts_10m_max';
    const current='temperature_2m,wind_gusts_10m';
    const hourly='precipitation_probability';
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=${current}&hourly=${hourly}&daily=${daily}&forecast_days=16&timezone=Atlantic%2FReykjavik`;

    try{
      const response=await fetch(url,{cache:'no-store'});
      if(!response.ok)throw new Error('weather_http_'+response.status);
      const json=await response.json();
      const payload=Array.isArray(json)?json:[json];
      const covered=[];

      days.forEach((day,i)=>{
        const dailyData=payload[i]?.daily;
        if(!dailyData?.time)return;
        const idx=dailyData.time.indexOf(day.date);
        if(idx<0)return;
        const tmin=Number(dailyData.temperature_2m_min?.[idx]);
        const tmax=Number(dailyData.temperature_2m_max?.[idx]);
        const rain=Number(dailyData.precipitation_probability_max?.[idx]);
        const gust=Number(dailyData.wind_gusts_10m_max?.[idx]);
        if([tmin,tmax,rain,gust].every(Number.isFinite))covered.push({tmin,tmax,rain,gust});
      });

      const light=mean(days.map(d=>daylightHours(d.lat,d.date)));
      if(ui.values[3])ui.values[3].textContent=formatDuration(light);

      if(covered.length){
        const avgMin=mean(covered.map(d=>d.tmin));
        const avgMax=mean(covered.map(d=>d.tmax));
        const rainMax=Math.max(...covered.map(d=>d.rain));
        const gustMax=Math.max(...covered.map(d=>d.gust));
        if(ui.values[0])ui.values[0].textContent=`${round(avgMin)}° / ${round(avgMax)}°`;
        if(ui.values[1])ui.values[1].textContent=`${round(rainMax)}%`;
        if(ui.values[2])ui.values[2].textContent=`${round(gustMax)} km/h`;
        if(ui.labels[0])ui.labels[0].textContent=`previsione viaggio · ${covered.length}/8 giorni`;
        if(ui.labels[1])ui.labels[1].textContent=`pioggia max · ${covered.length}/8 giorni`;
        if(ui.labels[2])ui.labels[2].textContent=`raffica max · ${covered.length}/8 giorni`;
      }else{
        const currentRows=currentSnapshot(payload);
        if(currentRows.length){
          const temps=currentRows.map(x=>x.temp);
          const gusts=currentRows.map(x=>x.gust);
          const rains=currentRows.map(x=>x.rain).filter(Number.isFinite);
          if(ui.values[0])ui.values[0].textContent=`${round(Math.min(...temps))}° / ${round(Math.max(...temps))}°`;
          if(ui.values[1])ui.values[1].textContent=rains.length?`${round(Math.max(...rains))}%`:'—';
          if(ui.values[2])ui.values[2].textContent=`${round(Math.max(...gusts))} km/h`;
          if(ui.labels[0])ui.labels[0].textContent='adesso · lungo il percorso';
          if(ui.labels[1])ui.labels[1].textContent='probabilità max · adesso';
          if(ui.labels[2])ui.labels[2].textContent='raffica max · adesso';
        }else{
          if(ui.labels[0])ui.labels[0].textContent='fuori dal range previsionale';
          if(ui.labels[1])ui.labels[1].textContent='fuori dal range previsionale';
          if(ui.labels[2])ui.labels[2].textContent='fuori dal range previsionale';
        }
      }

      const now=new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'}).format(new Date());
      if(ui.note){
        ui.note.textContent=covered.length
          ? `Previsioni del viaggio disponibili per ${covered.length}/8 giorni. La copertura cresce automaticamente fino a comprendere tutto il viaggio. Luce calcolata su tutte le tappe. Aggiornato alle ${now}.`
          : `Le date del viaggio non sono ancora nella finestra previsionale: mostro la situazione meteo attuale lungo le tappe, non una previsione del viaggio. Appena le date entrano nei 16 giorni il riepilogo passa automaticamente alle previsioni. Aggiornato alle ${now}.`;
      }
    }catch(err){
      console.warn('[Islanda Meteo] riepilogo non disponibile',err);
      if(ui.note)ui.note.textContent='Meteo non disponibile in questo momento: serve connessione. La durata della luce resta calcolata sulle date e sulle tappe del viaggio.';
    }
  }

  function boot(){
    updateWeather();
    if(!refreshTimer)refreshTimer=setInterval(updateWeather,REFRESH_MS);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateWeather();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
