(() => {
  const TABLE='trip_cost_overrides', CACHE='islanda2026_cost_overrides_v1';
  const definitions=new Map();
  let records=new Map(), loading=false, ready=false, dialog=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=(n,currency='EUR')=>n===null?'Da definire':new Intl.NumberFormat('it-IT',{style:'currency',currency,maximumFractionDigits:currency==='ISK'?0:2}).format(n);
  try { const saved=JSON.parse(localStorage.getItem(CACHE)||'[]'); if(Array.isArray(saved))records=new Map(saved.map(r=>[r.key,r])); } catch {}
  const notify=()=>window.dispatchEvent(new CustomEvent('islanda:costs-changed'));
  const cache=()=>{try{localStorage.setItem(CACHE,JSON.stringify([...records.values()]));}catch{}};
  function override(key){const r=records.get(key);return r&&r.amount!==null&&Number.isFinite(Number(r.amount))?Number(r.amount):null;}
  async function refresh(){
    if(loading||!window.currentUser||!navigator.onLine)return;
    loading=true;
    try{
      const {data,error}=await sb.from(TABLE).select('key,amount,revision,updated_at,updated_by');
      if(error)throw error;
      const changed=JSON.stringify([...records.values()])!==JSON.stringify(data);
      records=new Map(data.map(r=>[r.key,r]));ready=true;cache();if(changed)notify();
      document.querySelectorAll('.cost-sync-status').forEach(el=>el.textContent='Importi condivisi · aggiornati online');
    }catch{
      document.querySelectorAll('.cost-sync-status').forEach(el=>el.textContent='Aggiornamento non disponibile · ultimi importi salvati');
    }finally{loading=false;}
  }
  function amountDialog({title,amount,currency='EUR',reference,detail,reset=false,save}){
    if(dialog?.open)return;
    const previous=document.activeElement;
    dialog=document.createElement('dialog');dialog.className='cost-edit-dialog';dialog.setAttribute('aria-labelledby','costEditTitle');
    dialog.innerHTML=`<form><h2 id="costEditTitle">${esc(title)}</h2><p>${esc(detail)}</p>${reference?`<p class="cost-reference">${esc(reference)}</p>`:''}<label for="costEditAmount">Importo in ${esc(currency)}</label><input id="costEditAmount" name="amount" type="number" min="0" max="999999999" step="${currency==='ISK'?'1':'0.01'}" required inputmode="decimal"><p class="cost-edit-error" role="alert"></p><div class="cost-edit-actions"><button type="button" data-cancel>Annulla</button>${reset?'<button type="button" data-reset>Ripristina riferimento</button>':''}<button type="submit">Salva importo</button></div></form>`;
    document.body.append(dialog);
    const input=dialog.querySelector('input'),form=dialog.querySelector('form'),errorEl=dialog.querySelector('[role=alert]');
    input.value=amount===null?'':String(amount);
    let busy=false;
    const close=()=>{if(!busy)dialog.close();};
    dialog.querySelector('[data-cancel]').addEventListener('click',close);
    dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
    dialog.addEventListener('close',()=>{dialog.remove();dialog=null;if(previous?.isConnected)previous.focus();});
    async function submit(value){
      if(busy)return;
      if(!navigator.onLine){errorEl.textContent='Sei offline. Riconnettiti per salvare per tutto il gruppo.';return;}
      busy=true;errorEl.textContent='';form.querySelectorAll('button').forEach(b=>b.disabled=true);
      try {await save(value);busy=false;dialog.close();}
      catch(error){errorEl.textContent=error.message||'Salvataggio non riuscito. Riprova.';}
      finally{busy=false;if(dialog)form.querySelectorAll('button').forEach(b=>b.disabled=false);}
    }
    form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const n=Number(input.value);if(!Number.isFinite(n)||n<0||n>999999999)return;void submit(n);});
    dialog.querySelector('[data-reset]')?.addEventListener('click',()=>void submit(null));
    dialog.showModal();input.focus();input.select();
  }
  async function edit(key){
    const def=definitions.get(key);if(!def)return;
    await refresh();const record=records.get(key);
    if(!ready||!record){window.alert('Impossibile caricare gli importi condivisi. Riconnettiti e riprova.');return;}
    amountDialog({title:`Modifica ${def.name}`,amount:override(key)??def.amount,currency:def.currency,
      reference:`Riferimento: ${money(def.amount,def.currency)}${def.referenceNote?' · '+def.referenceNote:''}`,
      detail:def.perPerson?'Importo a persona. Il totale viene ricalcolato per tutti.':'Importo per il gruppo/veicolo. Il totale viene ricalcolato per tutti.',reset:true,
      save:async amount=>{
        const {data,error}=await sb.from(TABLE).update({amount,updated_by:window.currentUser}).eq('key',key).eq('revision',record.revision).select('key,amount,revision,updated_at,updated_by').maybeSingle();
        if(error)throw new Error('Salvataggio non riuscito. I dati inseriti sono ancora qui: riprova.');
        if(!data){await refresh();throw new Error('Un altro partecipante ha aggiornato questa voce. Chiudi e riapri per vedere il nuovo importo.');}
        records.set(key,data);cache();notify();
      }});
  }
  function editExpense(expense){
    amountDialog({title:`Modifica ${expense.description}`,amount:Number(expense.amount),reference:null,
      detail:`Spesa di gruppo pagata da ${expense.paid_by}. Saldi e quote saranno ricalcolati.`,save:async amount=>{
        if(amount<=0)throw new Error('Per una spesa registrata inserisci un importo maggiore di zero.');
        const {data,error}=await sb.from('expenses').update({amount}).eq('id',expense.id).eq('amount',expense.amount).eq('description',expense.description).eq('paid_by',expense.paid_by).select('id').maybeSingle();
        if(error)throw new Error('Salvataggio non riuscito. Riprova.');
        if(!data)throw new Error('Questa spesa è stata modificata o eliminata. Chiudi e aggiorna la lista prima di riprovare.');
        await caricaSpese();
      }});
  }
  function register(def){definitions.set(def.key,{currency:'EUR',...def});}
  function button(key){return `<button type="button" class="cost-edit-button" data-edit-cost="${esc(key)}" aria-label="Modifica importo ${esc(definitions.get(key)?.name||'')}">Modifica</button>`;}
  document.addEventListener('click',event=>{const b=event.target.closest('[data-edit-cost]');if(b)void edit(b.dataset.editCost);});
  window.IslandaCosts={register,override,button,editExpense,esc,money};
  const budgetKeys=['volo','alloggi','trasporto','pasti','parcheggi','attivita','assicurazione'];
  const budgetDefaults=[];
  function applyBudget(){
    if(!budgetDefaults.length)return;
    budgetDefaults.forEach((base,i)=>{
      if(i===4)return;
      const amount=override('budget:'+budgetKeys[i]);
      costi[i].valore=amount===null?base.valore:money(amount);
      costi[i].note=amount===null?base.note:'Importo aggiornato dal gruppo';
      const row=document.querySelectorAll('#costsPanel .cost-row')[i];
      if(row&&i!==4){const value=row.querySelector('.v'),note=row.querySelector('.c');if(value&&value.textContent!==costi[i].valore)value.textContent=costi[i].valore;if(note&&note.textContent!==costi[i].note)note.textContent=costi[i].note;}
    });
    document.querySelectorAll('#budgetMacroGrid .budget-macro').forEach((tile,i)=>{
      if(i===4||!budgetKeys[i])return; // Parking is calculated from the individual tariffs.
      if(!tile.querySelector('[data-edit-cost]'))tile.insertAdjacentHTML('beforeend',button('budget:'+budgetKeys[i]));
    });
  }
  function boot(){
    if(typeof costi!=='undefined')costi.slice(0,7).forEach((row,i)=>{
      budgetDefaults.push({...row});if(i===4)return;
      const match=row.valore.replace(/\./g,'').replace(',','.').match(/\d+(?:\.\d+)?/);
      register({key:'budget:'+budgetKeys[i],name:row.voce,amount:match?Number(match[0]):null,perPerson:true,referenceNote:row.note});
    });
    const panel=document.getElementById('costsPanel');
    if(panel){const status=document.createElement('p');status.className='cost-sync-status';status.setAttribute('role','status');status.textContent='Importi condivisi · caricamento…';panel.after(status);}
    new MutationObserver(applyBudget).observe(document.getElementById('budgetMacroGrid'),{childList:true});
    window.addEventListener('islanda:costs-changed',applyBudget);
    applyBudget();void refresh();
    new MutationObserver(()=>{if(window.currentUser)void refresh();}).observe(document.getElementById('tripView'),{attributes:true,attributeFilter:['class']});
    const sync=()=>{if(!document.hidden&&window.currentUser){void refresh();if(navigator.onLine)void caricaSpese();}};
    document.addEventListener('visibilitychange',sync);window.addEventListener('online',sync);setInterval(sync,30000);
  }
  document.addEventListener('DOMContentLoaded',boot,{once:true});
})();
