/* Installation is controlled by the browser; never promise a WebAPK in Edge. */
(() => {
  const host = document.getElementById('pwa-install');
  if (!host || host.dataset.ready) return;
  host.dataset.ready = 'true';
  const display = window.matchMedia('(display-mode: standalone)');
  const fullscreen = window.matchMedia('(display-mode: fullscreen)');
  const android = /Android/i.test(navigator.userAgent);
  const edgeAndroid = android && /EdgA\//i.test(navigator.userAgent);
  let installed = display.matches || fullscreen.matches || navigator.standalone === true;
  let deferredPrompt = null;
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('pwa-install-dismissed') === '1'; } catch {}
  const panel = document.createElement('section');
  panel.setAttribute('aria-label', 'Installazione app');
  panel.style.cssText = 'position:relative;z-index:10;box-sizing:border-box;max-width:640px;margin:8px auto;padding:10px 14px;border:1px solid #455468;border-radius:12px;background:#101722;color:#edf4ff;font:14px/1.5 system-ui,sans-serif;';
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;';
  const installButton = document.createElement('button');
  installButton.type = 'button';
  installButton.style.cssText = 'border:0;border-radius:8px;padding:8px 12px;background:#d7e6e8;color:#101722;font:inherit;cursor:pointer;';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Chiudi';
  close.setAttribute('aria-label', 'Nascondi il suggerimento di installazione');
  close.style.cssText = 'border:0;background:transparent;color:inherit;padding:8px;font:inherit;cursor:pointer;';
  const help = document.createElement('p');
  help.id = 'pwa-install-help';
  help.hidden = true;
  help.style.cssText = 'margin:10px 0 0;';
  help.setAttribute('role', 'status');
  installButton.setAttribute('aria-controls', help.id);
  installButton.setAttribute('aria-expanded', 'false');
  actions.append(installButton, close);
  panel.append(actions, help);
  host.append(panel);

  function render() {
    panel.hidden = installed || dismissed || (!android && !deferredPrompt);
    installButton.textContent = deferredPrompt && !edgeAndroid ? 'Installa app' : 'Come installare l’app';
    installButton.disabled = false;
  }
  function showHelp(message) {
    help.textContent = message;
    help.hidden = false;
    installButton.setAttribute('aria-expanded', 'true');
  }
  const instructions = edgeAndroid
    ? 'Edge su Android può creare un collegamento con il badge del browser. Per installare l’app con un’icona autonoma, apri questo sito in Chrome e scegli dal menu “Aggiungi a schermata Home” → “Installa”, quando disponibile. Dopo aver verificato la nuova app, puoi rimuovere il vecchio collegamento Edge.'
    : 'Apri il menu del browser e cerca “Installa app” oppure “Aggiungi a schermata Home” → “Installa”. Se compare soltanto “Crea collegamento”, l’installazione completa non è disponibile in questo momento. Su Android prova Chrome aggiornato.';

  window.addEventListener('beforeinstallprompt', (event) => {
    if (installed || dismissed) return;
    event.preventDefault();
    deferredPrompt = event;
    render();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    render();
  });
  const onDisplayChange = () => {
    installed = display.matches || fullscreen.matches || navigator.standalone === true;
    render();
  };
  display.addEventListener('change', onDisplayChange);
  fullscreen.addEventListener('change', onDisplayChange);
  close.addEventListener('click', () => {
    dismissed = true;
    deferredPrompt = null;
    try { sessionStorage.setItem('pwa-install-dismissed', '1'); } catch {}
    render();
  });
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt || edgeAndroid) {
      showHelp(instructions);
      return;
    }
    const prompt = deferredPrompt;
    deferredPrompt = null;
    installButton.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        dismissed = true;
      } else {
        showHelp('Installazione annullata. Puoi riprovare dal menu del browser.');
      }
    } catch {
      showHelp(instructions);
    } finally {
      render();
    }
  });
  render();
})();
