(() => {
  const ONESIGNAL_APP_ID = "b41b92ae-d914-41fe-946d-617765922f46";
  const ONESIGNAL_SAFARI_WEB_ID = "web.onesignal.auto.2c53d929-118c-4db5-ba77-650d97dbe49e";
  const PUSH_REGISTRATION_URL = "https://zjwntpjpigmmnymeekxf.supabase.co/functions/v1/islanda-register-push";

  let oneSignalInstance = null;
  let initialized = false;

  const ui = {
    box: null,
    status: null,
    detail: null,
    button: null,
  };

  function participantExternalId(name) {
    return `islanda-2026:${String(name || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  function isStandalone() {
    return (
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true
    );
  }

  function setStatus(label, detail, tone = "muted") {
    if (!ui.status || !ui.detail) return;

    const colors = {
      ok: "var(--aurora-1)",
      warn: "var(--ember)",
      muted: "var(--ice-dim)",
    };

    ui.status.textContent = label;
    ui.status.style.color = colors[tone] || colors.muted;
    ui.detail.textContent = detail || "";
  }

  function buildPanel() {
    if (document.getElementById("pushPanel")) return;

    const tripView = document.getElementById("tripView");
    const topRow = tripView?.querySelector(".top-row");
    if (!tripView || !topRow) return;

    const wrapper = document.createElement("div");
    wrapper.id = "pushPanel";
    wrapper.innerHTML = `
      <div class="section-title">Notifiche</div>
      <div class="panel" style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
        <div style="min-width:0;flex:1;">
          <div id="pushStatus" style="font-size:14px;font-weight:600;">Controllo notifiche…</div>
          <div id="pushDetail" style="margin-top:4px;font-size:12px;line-height:1.5;color:var(--ice-dim);">Verifico browser, subscription e identità.</div>
        </div>
        <button id="pushEnableButton" type="button" class="btn-send" style="margin-top:0;white-space:nowrap;">Attiva notifiche</button>
      </div>
    `;

    topRow.insertAdjacentElement("afterend", wrapper);

    ui.box = wrapper;
    ui.status = document.getElementById("pushStatus");
    ui.detail = document.getElementById("pushDetail");
    ui.button = document.getElementById("pushEnableButton");

    ui.button?.addEventListener("click", activatePush);
  }

  async function registerCurrentSubscription(OneSignal, participant) {
    const subscriptionId = OneSignal.User.PushSubscription.id;
    if (!participant || !subscriptionId) return false;

    const response = await fetch(PUSH_REGISTRATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant,
        subscription_id: subscriptionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`push_registration_failed:${response.status}`);
    }

    return true;
  }

  async function identifyCurrentUser(OneSignal) {
    const participant = window.currentUser;
    if (!participant) return null;

    const externalId = participantExternalId(participant);
    await OneSignal.login(externalId);
    OneSignal.User.addTag("username", participant);
    OneSignal.User.addTag("trip", "islanda-2026");

    if (OneSignal.User.PushSubscription.id) {
      await registerCurrentSubscription(OneSignal, participant);
    }

    return externalId;
  }

  async function refreshStatus() {
    buildPanel();

    if (!initialized || !oneSignalInstance) {
      setStatus(
        "Servizio push in inizializzazione",
        "Attendi qualche secondo e riprova.",
        "muted"
      );
      return;
    }

    const OneSignal = oneSignalInstance;
    const supported = OneSignal.Notifications.isPushSupported();

    if (!supported) {
      setStatus(
        "Notifiche non supportate",
        "Questo browser o questa modalità di navigazione non supporta le Web Push.",
        "warn"
      );
      if (ui.button) ui.button.disabled = true;
      return;
    }

    if (isIOS() && !isStandalone()) {
      setStatus(
        "Installa prima la web app",
        "Su iPhone/iPad aggiungi Islanda 2026 alla schermata Home, poi aprila dall’icona e attiva le notifiche.",
        "warn"
      );
      if (ui.button) ui.button.disabled = false;
      return;
    }

    if (typeof Notification !== "undefined" && Notification.permission === "denied") {
      setStatus(
        "Notifiche bloccate dal browser",
        "Riabilita le notifiche nelle impostazioni del sito del browser, poi ricarica Islanda 2026.",
        "warn"
      );
      if (ui.button) {
        ui.button.textContent = "Permesso bloccato";
        ui.button.disabled = true;
      }
      return;
    }

    const permission = OneSignal.Notifications.permission;
    const optedIn = OneSignal.User.PushSubscription.optedIn;
    const subscriptionId = OneSignal.User.PushSubscription.id;
    const expectedExternalId = window.currentUser
      ? participantExternalId(window.currentUser)
      : null;
    const currentExternalId = OneSignal.User.externalId;

    if (permission && optedIn && subscriptionId) {
      if (expectedExternalId && currentExternalId !== expectedExternalId) {
        setStatus(
          "Notifiche attive, identità da sincronizzare",
          `Subscription ${subscriptionId.slice(0, 8)}… attiva. Premi per collegarla a ${window.currentUser}.`,
          "warn"
        );
        if (ui.button) {
          ui.button.textContent = "Sincronizza identità";
          ui.button.disabled = false;
        }
        return;
      }

      setStatus(
        "Notifiche attive",
        `Dispositivo registrato e associato a ${window.currentUser || "questo utente"} (${subscriptionId.slice(0, 8)}…).`,
        "ok"
      );
      if (ui.button) {
        ui.button.textContent = "Notifiche attive";
        ui.button.disabled = true;
      }
      return;
    }

    if (permission && !optedIn) {
      setStatus(
        "Permesso concesso, subscription non attiva",
        "Premi il pulsante per completare la registrazione del dispositivo.",
        "warn"
      );
      if (ui.button) {
        ui.button.textContent = "Completa attivazione";
        ui.button.disabled = false;
      }
      return;
    }

    setStatus(
      "Notifiche non ancora attive",
      "Premi il pulsante: il browser ti chiederà il permesso solo in quel momento.",
      "muted"
    );
    if (ui.button) {
      ui.button.textContent = "Attiva notifiche";
      ui.button.disabled = false;
    }
  }

  async function activatePush() {
    if (!initialized || !oneSignalInstance) {
      await refreshStatus();
      return;
    }

    const OneSignal = oneSignalInstance;

    try {
      if (!OneSignal.Notifications.isPushSupported()) {
        await refreshStatus();
        return;
      }

      if (isIOS() && !isStandalone()) {
        await refreshStatus();
        return;
      }

      if (!window.currentUser) {
        setStatus(
          "Utente non identificato",
          "Rientra inserendo il tuo nome e riprova.",
          "warn"
        );
        return;
      }

      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        await refreshStatus();
        return;
      }

      if (ui.button) {
        ui.button.disabled = true;
        ui.button.textContent = "Attivazione…";
      }

      await identifyCurrentUser(OneSignal);
      await OneSignal.User.PushSubscription.optIn();
      await identifyCurrentUser(OneSignal);
      await refreshStatus();
    } catch (error) {
      console.error("[Islanda Push] Errore attivazione:", error);
      setStatus(
        "Attivazione non riuscita",
        "Controlla i permessi del browser e riprova. L’errore è visibile nella console.",
        "warn"
      );
      if (ui.button) {
        ui.button.disabled = false;
        ui.button.textContent = "Riprova";
      }
    }
  }

  async function handleSubscriptionChange() {
    if (!oneSignalInstance) return;

    try {
      if (window.currentUser && oneSignalInstance.User.PushSubscription.id) {
        await identifyCurrentUser(oneSignalInstance);
      }
    } catch (error) {
      console.error("[Islanda Push] Errore sincronizzazione identità:", error);
    }

    await refreshStatus();
  }

  window.IslandaPush = {
    refresh: refreshStatus,
    identify: async (participant) => {
      window.currentUser = participant;
      if (!initialized || !oneSignalInstance) return;
      await identifyCurrentUser(oneSignalInstance);
      await refreshStatus();
    },
  };

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: ONESIGNAL_SAFARI_WEB_ID,
        serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/push/onesignal/" },
        autoResubscribe: true,
      });

      oneSignalInstance = OneSignal;
      initialized = true;

      OneSignal.Notifications.addEventListener("permissionChange", refreshStatus);
      OneSignal.User.PushSubscription.addEventListener("change", handleSubscriptionChange);
      OneSignal.User.addEventListener("change", refreshStatus);

      if (window.currentUser) {
        await identifyCurrentUser(OneSignal);
      }

      await refreshStatus();
      console.info("[Islanda Push] OneSignal inizializzato");
    } catch (error) {
      initialized = false;
      console.error("[Islanda Push] Inizializzazione OneSignal fallita:", error);
      buildPanel();
      setStatus(
        "Servizio push non disponibile",
        "L’inizializzazione OneSignal è fallita. Controlla configurazione e service worker.",
        "warn"
      );
    }
  });

  document.addEventListener("DOMContentLoaded", buildPanel);
})();
