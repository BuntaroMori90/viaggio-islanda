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

  // Carmen resta nel gruppo e nelle spese registrate, ma è esclusa da ogni ripartizione.
  // Le spese eventualmente pagate da Carmen restano visibili ma non entrano nei saldi condivisi,
  // così il suo saldo rimane sempre esattamente a zero.
  const EXPENSE_EXCLUDED='Carmen';
  const activeExpenseParticipants=()=>typeof partecipanti!=='undefined'
    ? partecipanti.filter(p=>String(p).toLowerCase()!==EXPENSE_EXCLUDED.toLowerCase())
    : [];
  const round2=x=>Math.round((Number(x)||0)*100)/100;

  async function renderExpenseSplitWithoutCarmen(){
    if(typeof sb==='undefined'||typeof partecipanti==='undefined')return;
    const box=document.getElementById('balancesBox');
    const settlBox=document.getElementById('settlementsBox');
    if(!box||!settlBox)return;

    const {data:spese,error}=await sb.from('expenses').select('amount,paid_by');
    if(error){console.error('Errore ricalcolo divisione spese:',error.message);return;}

    const active=activeExpenseParticipants();
    const balances=Object.fromEntries(partecipanti.map(p=>[p,0]));
    let totaleDiviso=0;

    (spese||[]).forEach(s=>{
      const amount=Number(s.amount)||0;
      if(!active.includes(s.paid_by))return;
      balances[s.paid_by]=(balances[s.paid_by]||0)+amount;
      totaleDiviso+=amount;
    });

    const quota=active.length?totaleDiviso/active.length:0;
    active.forEach(p=>{balances[p]=(balances[p]||0)-quota;});
    balances[EXPENSE_EXCLUDED]=0;

    box.innerHTML=partecipanti.map(p=>{
      const excluded=String(p).toLowerCase()===EXPENSE_EXCLUDED.toLowerCase();
      const v=excluded?0:round2(balances[p]);
      const segno=excluded||v===0?'':(v>0?'+':'');
      const colore=excluded?'var(--ice-dim)':(v>=0?'var(--aurora-1)':'var(--ember)');
      return `<div>${esc(p)}: <b style="color:${colore}">${segno}${v.toFixed(2)} €</b>${excluded?' <span style="font-size:11px;color:var(--ice-dim)">· esclusa dalla divisione</span>':''}</div>`;
    }).join('');

    const creditori=active
      .map(p=>({nome:p,saldo:round2(balances[p])}))
      .filter(b=>b.saldo>0.01)
      .sort((a,b)=>b.saldo-a.saldo);
    const debitori=active
      .map(p=>({nome:p,saldo:round2(balances[p])}))
      .filter(b=>b.saldo<-0.01)
      .sort((a,b)=>a.saldo-b.saldo);

    const trasferimenti=[];
    let i=0,j=0;
    while(i<debitori.length&&j<creditori.length){
      const d=debitori[i],c=creditori[j];
      const importo=round2(Math.min(-d.saldo,c.saldo));
      if(importo>0.01)trasferimenti.push({da:d.nome,a:c.nome,importo});
      d.saldo=round2(d.saldo+importo);
      c.saldo=round2(c.saldo-importo);
      if(Math.abs(d.saldo)<0.02)i++;
      if(Math.abs(c.saldo)<0.02)j++;
    }

    settlBox.innerHTML=trasferimenti.length===0?'':
      '<div style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:var(--ice-dim); margin-bottom:8px; font-family:\'JetBrains Mono\',monospace;">Chi deve dare a chi</div>'+
      trasferimenti.map(t=>`<div style="font-size:13px;padding:4px 0"><b>${esc(t.da)}</b> → <b>${esc(t.a)}</b>: ${t.importo.toFixed(2)} €</div>`).join('');
  }

  function patchExpenseLoader(){
    if(typeof caricaSpese!=='function'||caricaSpese.__carmenExcluded)return;
    const original=caricaSpese;
    const patched=async function(...args){
      const result=await original.apply(this,args);
      await renderExpenseSplitWithoutCarmen();
      return result;
    };
    patched.__carmenExcluded=true;
    caricaSpese=patched;
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
  patchExpenseLoader();
  document.addEventListener('DOMContentLoaded',()=>{patchExpenseLoader();void renderExpenseSplitWithoutCarmen();boot();},{once:true});
})();
