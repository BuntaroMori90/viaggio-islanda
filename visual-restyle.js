(()=>{
  const enhancePushPanel=()=>{
    const host=document.getElementById('pushPanel');
    const top=document.querySelector('#tripView > .top-row');
    if(!host||!top||host.dataset.compactified==='1') return false;

    const card=host.querySelector(':scope > .panel');
    if(!card) return false;

    host.dataset.compactified='1';
    host.classList.add('push-compact');
    host.querySelector(':scope > .section-title')?.remove();
    card.classList.add('push-popover');

    const bell=document.createElement('button');
    bell.type='button';
    bell.id='pushBellButton';
    bell.className='push-bell';
    bell.setAttribute('aria-controls','pushPanel');
    bell.setAttribute('aria-expanded','false');
    bell.setAttribute('aria-label','Apri notifiche');
    bell.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><span class="push-bell-dot" aria-hidden="true"></span>`;
    top.appendChild(bell);

    const close=()=>{
      host.classList.remove('is-open');
      bell.setAttribute('aria-expanded','false');
      bell.setAttribute('aria-label','Apri notifiche');
    };
    const open=()=>{
      host.classList.add('is-open');
      bell.setAttribute('aria-expanded','true');
      bell.setAttribute('aria-label','Chiudi notifiche');
    };

    bell.addEventListener('click',(ev)=>{
      ev.stopPropagation();
      host.classList.contains('is-open')?close():open();
    });
    document.addEventListener('click',(ev)=>{
      if(host.classList.contains('is-open')&&!host.contains(ev.target)&&ev.target!==bell&&!bell.contains(ev.target)) close();
    });
    document.addEventListener('keydown',(ev)=>{if(ev.key==='Escape') close();});

    const statusEl=document.getElementById('pushStatus');
    const updateState=()=>{
      const text=(statusEl?.textContent||'').toLowerCase();
      const warn=text.includes('blocc')||text.includes('non disponibile')||text.includes('non support')||text.includes('non riuscita')||text.includes('sincronizzare');
      const ok=!warn&&text.includes('notifiche attive');
      host.classList.toggle('push-ok',ok);
      host.classList.toggle('push-warn',warn);
      bell.title=ok?'Notifiche attive':warn?'Controlla notifiche':'Notifiche';
    };
    updateState();
    if(statusEl) new MutationObserver(updateState).observe(statusEl,{childList:true,subtree:true,characterData:true});
    return true;
  };

  const boot=()=>{
    if(enhancePushPanel()) return;
    const observer=new MutationObserver(()=>{if(enhancePushPanel()) observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
