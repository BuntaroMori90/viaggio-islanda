(() => {
  function enhance() {
    document.querySelectorAll('#daysContainer .day').forEach(day => {
      const n=Number(day.querySelector('.day-num')?.textContent.match(/G(\d+)/i)?.[1]);
      const body=day.querySelector('.day-body');
      if(!body||![4,5].includes(n)||body.querySelector('.hofn-route-card'))return;
      const card=document.createElement('aside');card.className='hofn-route-card';
      card.innerHTML=`<h3>Höfn · ponte a pedaggio e alternativa</h3><p>${n===4?'Nel percorso verso Stokksnes è previsto un passaggio sul nuovo ponte: 1.500 ISK per auto sotto 3,5 t. Il pedaggio è attivo dal 1° settembre 2026.':'Da Hoffell verso est non è necessario ripassare sul nuovo ponte. Il pedaggio si applica solo attraversando il portale: nessun secondo passaggio conteggiato automaticamente.'}</p><p>Alternativa gratuita: vecchio tracciato, ora strada 987 (Hornafjarðarvegur), con il giro a nord. È circa 12 km più lungo del nuovo tratto. Da Höfn/Stokksnes si può raggiungere Hoffell sul ramo orientale della 987 senza riattraversare il ponte.</p><p>Controllare le condizioni prima di scegliere: sulla vecchia strada la manutenzione invernale ordinaria non è prevista il martedì e il sabato. Per le auto a noleggio pagare il passaggio entro 12 ore.</p><div class="hofn-route-links"><a href="https://www.vegagerdin.is/media/2026/06/hornafjordur_kaflar-copy.pdf" target="_blank" rel="noopener noreferrer">Mappa ufficiale · giro alternativo ↗</a><a href="https://umferdin.is/en" target="_blank" rel="noopener noreferrer">Condizioni strade ↗</a><a href="https://www.spolur.is/en/faq" target="_blank" rel="noopener noreferrer">Pedaggio · info e pagamento ↗</a></div>`;
      body.append(card);
    });
  }
  const root=document.getElementById('daysContainer');if(root){new MutationObserver(enhance).observe(root,{childList:true,subtree:true});enhance();}
})();
