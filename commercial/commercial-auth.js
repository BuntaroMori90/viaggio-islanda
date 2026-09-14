(()=>{
  const cfg=window.FLORINGO_TRAVEL_CONFIG||{};
  const PENDING_INVITE='floringo_pending_invite';
  let client=null;
  let currentUser=null;

  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function setStatus(text,tone=''){
    const el=$('#authStatus');
    if(!el)return;
    el.textContent=text||'';
    el.dataset.tone=tone;
  }

  function configured(){return !!(cfg.supabaseUrl&&cfg.supabaseAnonKey);}

  function initClient(){
    if(client)return client;
    if(!configured()||!window.supabase?.createClient)return null;
    client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    window.FlorinGoTravel={...(window.FlorinGoTravel||{}),client};
    return client;
  }

  function rememberInviteFromUrl(){
    const q=new URLSearchParams(location.search);
    const code=(q.get('invite')||'').trim();
    if(code){
      try{localStorage.setItem(PENDING_INVITE,code);}catch(_){ }
      q.delete('invite');
      const clean=location.pathname+(q.toString()?`?${q}`:'')+location.hash;
      history.replaceState({},'',clean);
    }
  }

  function pendingInvite(){try{return localStorage.getItem(PENDING_INVITE)||''}catch(_){return''}}
  function clearPendingInvite(){try{localStorage.removeItem(PENDING_INVITE)}catch(_){}}

  async function googleLogin(){
    const c=initClient();
    if(!c)return setupMissing();
    setStatus('Apro Google…');
    const {error}=await c.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:cfg.redirectUrl||location.origin+location.pathname}
    });
    if(error)setStatus(error.message,'error');
  }

  async function emailLogin(){
    const c=initClient();
    if(!c)return setupMissing();
    const email=$('#emailInput')?.value.trim();
    if(!email||!email.includes('@'))return setStatus('Inserisci un indirizzo email valido.','error');
    setStatus('Invio il link di accesso…');
    const {error}=await c.auth.signInWithOtp({
      email,
      options:{emailRedirectTo:cfg.redirectUrl||location.origin+location.pathname,shouldCreateUser:true}
    });
    if(error)return setStatus(error.message,'error');
    setStatus('Controlla la tua email: ti ho inviato il link di accesso.','ok');
  }

  async function signOut(){
    const c=initClient();
    if(!c)return;
    await c.auth.signOut();
  }

  function setupMissing(){
    $('#authView')?.classList.remove('hidden');
    $('#appView')?.classList.add('hidden');
    setStatus('Template pronto: collega un progetto Supabase dedicato in commercial/config.js.','warn');
  }

  function authView(){
    $('#authView')?.classList.remove('hidden');
    $('#appView')?.classList.add('hidden');
  }

  function appView(){
    $('#authView')?.classList.add('hidden');
    $('#appView')?.classList.remove('hidden');
  }

  async function acceptPendingInvite(){
    const code=pendingInvite();
    if(!code||!window.TravelData)return;
    try{
      const tripId=await window.TravelData.acceptInvite(code);
      clearPendingInvite();
      setAppNotice(`Invito accettato. Sei entrato nel viaggio ${tripId.slice(0,8)}…`,'ok');
    }catch(err){
      console.warn('[FlorinGo] invite',err);
      setAppNotice('Non sono riuscito ad accettare l’invito. Potrebbe essere scaduto o già esaurito.','error');
    }
  }

  function setAppNotice(text,tone=''){
    const el=$('#appNotice');
    if(!el)return;
    el.textContent=text||'';
    el.dataset.tone=tone;
  }

  async function renderTrips(){
    const host=$('#tripsList');
    if(!host||!window.TravelData)return;
    host.innerHTML='<div class="loading-row">Carico i tuoi viaggi…</div>';
    try{
      const trips=await window.TravelData.listTrips();
      if(!trips.length){
        host.innerHTML='<div class="empty-state"><strong>Nessun viaggio ancora</strong><span>Crea il primo viaggio oppure entra con un codice invito.</span></div>';
        return;
      }
      host.innerHTML=trips.map(t=>`
        <article class="trip-card" data-trip-id="${t.id}">
          <div class="trip-card-top"><span class="trip-role">${esc(t.role)}</span><span class="trip-status">${esc(t.status)}</span></div>
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.destination)}</p>
          <div class="trip-dates">${esc(t.start_date||'Date da definire')}${t.end_date?` → ${esc(t.end_date)}`:''}</div>
          <div class="trip-actions">
            <button type="button" data-action="open">Apri</button>
            ${['owner','editor'].includes(t.role)?'<button type="button" data-action="invite" class="secondary">Invita</button>':''}
          </div>
        </article>`).join('');
      host.querySelectorAll('[data-action="open"]').forEach(btn=>btn.addEventListener('click',()=>openTrip(btn.closest('.trip-card').dataset.tripId)));
      host.querySelectorAll('[data-action="invite"]').forEach(btn=>btn.addEventListener('click',()=>createInvite(btn.closest('.trip-card').dataset.tripId)));
    }catch(err){
      console.error('[FlorinGo] trips',err);
      host.innerHTML='<div class="empty-state is-error">Non riesco a caricare i viaggi.</div>';
    }
  }

  async function openTrip(tripId){
    try{
      const bundle=await window.TravelData.loadTrip(tripId);
      try{localStorage.setItem('floringo_active_trip',tripId)}catch(_){ }
      const t=bundle.trip;
      const drawer=$('#tripPreview');
      drawer.classList.remove('hidden');
      drawer.innerHTML=`
        <div class="preview-head"><div><span>VIAGGIO ATTIVO</span><h2>${esc(t.title)}</h2><p>${esc(t.destination)}</p></div><button type="button" id="closePreview">×</button></div>
        <div class="preview-stats"><div><strong>${bundle.days.length}</strong><span>giorni</span></div><div><strong>${bundle.lodgings.length}</strong><span>alloggi</span></div><div><strong>${bundle.bookings.length}</strong><span>prenotazioni</span></div><div><strong>${bundle.members.length}</strong><span>partecipanti</span></div></div>
        <div class="preview-note">Il motore visuale Home / Itinerario / Utility / Budget / Altro verrà collegato a questo <code>trip_id</code> nella fase successiva. L’isolamento dei dati è già pronto.</div>`;
      $('#closePreview')?.addEventListener('click',()=>drawer.classList.add('hidden'));
    }catch(err){
      console.error('[FlorinGo] open trip',err);
      setAppNotice('Non riesco ad aprire il viaggio.','error');
    }
  }

  async function createInvite(tripId){
    try{
      const code=await window.TravelData.createInvite(tripId,{role:'traveler'});
      const base=cfg.redirectUrl||location.origin+location.pathname;
      const url=`${base}${base.includes('?')?'&':'?'}invite=${encodeURIComponent(code)}`;
      const modal=$('#inviteModal');
      modal.classList.remove('hidden');
      modal.innerHTML=`<div class="modal-card"><span class="modal-kicker">INVITA PARTECIPANTE</span><h2>Link pronto</h2><p>Chi apre questo link potrà entrare nel viaggio dopo il login.</p><input id="inviteLink" readonly value="${esc(url)}"><div class="modal-actions"><button type="button" id="copyInvite">Copia link</button><button type="button" class="secondary" id="closeInvite">Chiudi</button></div></div>`;
      $('#copyInvite')?.addEventListener('click',async()=>{
        try{await navigator.clipboard.writeText(url);$('#copyInvite').textContent='Copiato';}catch(_){$('#inviteLink')?.select();}
      });
      $('#closeInvite')?.addEventListener('click',()=>modal.classList.add('hidden'));
    }catch(err){
      console.error('[FlorinGo] create invite',err);
      setAppNotice('Non riesco a creare l’invito. Controlla il tuo ruolo.','error');
    }
  }

  async function createTripFromForm(e){
    e.preventDefault();
    const title=$('#tripTitle').value.trim();
    const destination=$('#tripDestination').value.trim();
    if(!title||!destination)return setAppNotice('Titolo e destinazione sono obbligatori.','error');
    try{
      const id=await window.TravelData.createTrip({title,destination,startDate:$('#tripStart').value||null,endDate:$('#tripEnd').value||null});
      e.target.reset();
      setAppNotice(`Viaggio creato · ${id.slice(0,8)}…`,'ok');
      await renderTrips();
    }catch(err){
      console.error('[FlorinGo] create trip',err);
      setAppNotice('Creazione viaggio non riuscita.','error');
    }
  }

  async function joinTripFromForm(e){
    e.preventDefault();
    const code=$('#inviteCode').value.trim();
    if(!code)return;
    try{
      await window.TravelData.acceptInvite(code);
      e.target.reset();
      setAppNotice('Invito accettato.','ok');
      await renderTrips();
    }catch(err){
      console.error('[FlorinGo] join trip',err);
      setAppNotice('Codice non valido, scaduto o esaurito.','error');
    }
  }

  async function onSignedIn(user){
    currentUser=user;
    appView();
    const name=user.user_metadata?.full_name||user.user_metadata?.name||user.email||'Viaggiatore';
    $('#userName').textContent=name;
    $('#userEmail').textContent=user.email||'';
    $('#userAvatar').textContent=name.split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();
    await acceptPendingInvite();
    await renderTrips();
  }

  function onSignedOut(){
    currentUser=null;
    authView();
    setStatus('Accedi per vedere i tuoi viaggi.');
  }

  async function boot(){
    rememberInviteFromUrl();
    $('#googleLogin')?.addEventListener('click',googleLogin);
    $('#emailLogin')?.addEventListener('click',emailLogin);
    $('#emailInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')emailLogin();});
    $('#logoutButton')?.addEventListener('click',signOut);
    $('#createTripForm')?.addEventListener('submit',createTripFromForm);
    $('#joinTripForm')?.addEventListener('submit',joinTripFromForm);

    const c=initClient();
    if(!c)return setupMissing();
    setStatus('Controllo la sessione…');
    c.auth.onAuthStateChange((_event,session)=>{
      if(session?.user)void onSignedIn(session.user);
      else onSignedOut();
    });
    const {data,error}=await c.auth.getSession();
    if(error){setStatus(error.message,'error');return;}
    if(data.session?.user)await onSignedIn(data.session.user); else onSignedOut();
  }

  window.CommercialAuth={googleLogin,emailLogin,signOut};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
