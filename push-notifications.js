(() => {
  const ONESIGNAL_APP_ID = "b41b92ae-d914-41fe-946d-617765922f46";
  const ONESIGNAL_SAFARI_WEB_ID = "web.onesignal.auto.2c53d929-118c-4db5-ba77-650d97dbe49e";
  const PUSH_REGISTRATION_URL = "https://zjwntpjpigmmnymeekxf.supabase.co/functions/v1/islanda-register-push";
  const SAVED_PARTICIPANT_KEY = "islanda2026_participant";

  let oneSignalInstance = null;
  let initialized = false;

  const ui = {
    box: null,
    status: null,
    detail: null,
    button: null,
    changeUserButton: null,
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

  function rememberParticipant(name) {
    try {
      if (name) localStorage.setItem(SAVED_PARTICIPANT_KEY, String(name));
    } catch (error) {
      console.warn("[Islanda] Impossibile memorizzare il partecipante:", error);
    }
  }

  function getRememberedParticipant() {
    try {
      return localStorage.getItem(SAVED_PARTICIPANT_KEY) || "";
    } catch {
      return "";
    }
  }

  function forgetParticipant() {
    try {
      localStorage.removeItem(SAVED_PARTICIPANT_KEY);
    } catch {}
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

  async function changeUser() {
    forgetParticipant();
    window.currentUser = null;

    try {
      if (oneSignalInstance) await oneSignalInstance.logout();
    } catch (error) {
      console.warn("[Islanda Push] Logout OneSignal non riuscito:", error);
    }

    window.location.reload();
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
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <button id="pushEnableButton" type="button" class="btn-send" style="margin-top:0;white-space:nowrap;">Attiva notifiche</button>
          <button id="pushChangeUserButton" type="button" style="margin:0;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:transparent;color:var(--ice-dim);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap;">Cambia utente</button>
        </div>
      </div>
    `;

    topRow.insertAdjacentElement("afterend", wrapper);

    ui.box = wrapper;
    ui.status = document.getElementById("pushStatus");
    ui.detail = document.getElementById("pushDetail");
    ui.button = document.getElementById("pushEnableButton");
    ui.changeUserButton = document.getElementById("pushChangeUserButton");

    ui.button?.addEventListener("click", activatePush);
    ui.changeUserButton?.addEventListener("click", changeUser);
  }

  function tryRememberedLogin() {
    if (window.currentUser) return;

    const remembered = getRememberedParticipant();
    if (!remembered) return;

    const input = document.getElementById("nameInput");
    if (!input || typeof window.checkAccess !== "function") return;

    input.value = remembered;
    window.checkAccess();

    const gateView = document.getElementById("gateView");
    if (!gateView?.classList.contains("hidden")) {
      forgetParticipant();
    }
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

    rememberParticipant(participant);

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
      rememberParticipant(participant);
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

  function syncConfirmedReservations() {
    if (typeof voli !== "undefined" && Array.isArray(voli) && voli.length >= 4) {
      Object.assign(voli[0], {
        tratta: "Napoli → Londra (Luton)",
        compagnia: "Ryanair",
        numero: "FR5456 · PNR 06TYUX",
        orario: "29/09: 21:00 – 22:55",
      });
      Object.assign(voli[1], {
        tratta: "Londra (Luton) → Keflavík",
        compagnia: "easyJet",
        numero: "EZY2635 · PNR KC9P3GG",
        orario: "30/09: 06:15 – 08:20",
      });
      Object.assign(voli[2], {
        tratta: "Keflavík → Milano Malpensa",
        compagnia: "easyJet",
        numero: "EJU3970 · PNR KC9P58J",
        orario: "08/10: 10:15 – 16:30",
      });
      Object.assign(voli[3], {
        tratta: "Milano Malpensa → Napoli",
        compagnia: "Ryanair",
        numero: "FR5972 · PNR NPGBXR",
        orario: "08/10: 21:25 – 22:55",
      });
    }
  }

  function syncItineraryWithSchedule() {
    if (typeof giorni === "undefined" || !Array.isArray(giorni)) return;

    const byDay = Object.fromEntries(giorni.map((day) => [day.num, day]));

    const day1 = byDay[1];
    if (day1) {
      day1.schedule = [
        ["08:20", "Arrivo a Keflavík", "easyJet EZY2635 da Londra Luton"],
        ["09:00", "Blue Car Rental", "Ritiro Kia Sorento automatica + box da tetto · prenotazione #6EQ2LW"],
        ["Mattina", "Trasferimento a Reykjavík", "Check-in, centro storico e Laugavegur"],
        ["Pomeriggio", "Visita culturale", "Harpa Concert Hall, Sólfar, Perlan"],
        ["Sera", "Libera", "Faro di Grótta e cena"],
      ];
      day1.meta = {
        guida: "KEF → Reykjavík",
        benzina: "auto ritirata alle 09:00",
        cibo: "centro Reykjavík",
      };
      day1.trigger = "Auto confermata: Kia Sorento automatica, box da tetto, conducente aggiuntivo e coperture TP/GP/SCDW/CDW. Riconsegna l'08/10 alle 08:30 a Keflavík.";
    }

    const day2 = byDay[2];
    if (day2) {
      day2.luogo = "Hvolsvollur, Iceland";
      day2.lat = 63.7517;
      day2.lon = -20.2233;
      day2.storia = "Golden Circle e arrivo a Hvolsvöllur. Pernottamento confermato al Forest Cabin #11, con self check-in e jacuzzi esterna privata.";
      if (Array.isArray(day2.schedule) && day2.schedule.length) {
        day2.schedule[day2.schedule.length - 1] = ["18:00 – 18:30", "Forest Cabin #11 · Hvolsvöllur", "Pernottamento · Booking 5987380838"];
      }
    }

    const day4 = byDay[4];
    if (day4) {
      day4.luogo = "Hoffell, Iceland";
      day4.lat = 64.39653;
      day4.lon = -15.34179;
      day4.storia = "Giornata dedicata al Vatnajökull. Il tour della grotta di ghiaccio è confermato alle 12:30 da Jökulsárlón; pernottamento al Glacier World - Hoffell Guesthouse.";
      day4.schedule = [
        ["8:30", "Partenza da Vík", ""],
        ["8:50 – 9:25", "Fjaðrárgljúfur", "Canyon panoramico"],
        ["10:00 – 10:20", "Foss á Síðu", ""],
        ["11:45", "Jökulsárlón", "Arrivo con margine per il tour"],
        ["12:30 – 15:30", "Jökulsárlón / Vatnajökull", "Tour guidato grotta di ghiaccio · 6 adulti · priorità del giorno"],
        ["15:45 – 16:15", "Diamond Beach", ""],
        ["17:45 – 18:30", "Stokksnes", "Sacrificabile se in ritardo"],
        ["19:00", "Glacier World - Hoffell Guesthouse", "Pernottamento · Booking 6790375495"],
      ];
      day4.must = ["Tour Ice Cave 12:30", "Diamond Beach"];
      day4.bonus = ["Fjaðrárgljúfur"];
      day4.sac = ["Stokksnes", "Foss á Síðu"];
      day4.trigger = "Vincolo fisso: tour grotta di ghiaccio alle 12:30 a Jökulsárlón. <b>Piano B:</b> tagliare Fjaðrárgljúfur e Foss á Síðu se il margine si riduce. <b>Piano C:</b> eliminare Stokksnes.";
    }

    const day5 = byDay[5];
    if (day5) {
      day5.luogo = "Akureyri, Iceland";
      day5.lat = 65.6835;
      day5.lon = -18.0878;
      day5.storia = "Lunga traversata dall'area di Hoffell ad Akureyri. Pernottamento ad Akureyri: considerare esclusivamente Acco ICE. Forest Lagoon confermata alle 19:30 per 6 persone.";
      if (Array.isArray(day5.schedule) && day5.schedule.length) {
        day5.schedule[0] = ["8:30", "Partenza da Hoffell", "Glacier World - Hoffell Guesthouse"];
        const akIndex = day5.schedule.findIndex((row) => String(row?.[1] || "").toLowerCase() === "akureyri");
        if (akIndex >= 0) day5.schedule[akIndex] = ["17:45", "Akureyri · Acco ICE", "Check-in e pernottamento"];
        const forestIndex = day5.schedule.findIndex((row) => String(row?.[1] || "").toLowerCase().includes("forest lagoon"));
        if (forestIndex >= 0) day5.schedule[forestIndex] = ["19:30", "Forest Lagoon", "Ingresso confermato · 6 ospiti"];
      }
      day5.trigger = "Vincolo fisso: Forest Lagoon alle 19:30. Se il viaggio accumula ritardo, Seyðisfjörður resta la prima tappa da eliminare. Pernottamento: Acco ICE.";
    }

    const day6 = byDay[6];
    if (day6) {
      day6.luogo = "Akureyri, Iceland";
      day6.lat = 65.6835;
      day6.lon = -18.0878;
      day6.storia = "Seconda notte ad Akureyri presso Acco ICE. Whale watching a Húsavík confermato alle 09:00 e Earth Lagoon Mývatn confermata alle 18:00, entrambi per 6 adulti.";
      day6.schedule = [
        ["7:30", "Partenza da Akureyri · Acco ICE", ""],
        ["8:30", "Húsavík", "Arrivo e check-in tour"],
        ["9:00 – 12:00", "Whale Watching Húsavík", "Tour confermato · 6 adulti"],
        ["14:15 – 15:15", "Dettifoss", "Solo se strada/meteo consentono · usare Road 862"],
        ["16:00", "Hverir", "Zona fumarole"],
        ["16:20 – 17:00", "Dimmuborgir", "Formazioni laviche"],
        ["17:15 – 17:35", "Grjótagjá Cave", ""],
        ["18:00 – 20:00", "Earth Lagoon Mývatn", "Ingresso confermato · 6 adulti · booking ABK00150467"],
        ["+1h", "Rientro Akureyri · Acco ICE", "Secondo pernottamento"],
      ];
      day6.must = ["Whale Watching 09:00", "Earth Lagoon 18:00"];
      day6.meta = {
        guida: "4h 30min circa",
        benzina: "Akureyri o Húsavík",
        cibo: "Mývatn o scorta",
      };
      day6.trigger = "Due vincoli fissi: whale watching 09:00 e Earth Lagoon 18:00. <b>Piano B:</b> saltare Dettifoss se meteo, strada o tempi non sono favorevoli. <b>Piano C:</b> ridurre le soste nell'area Mývatn.";
    }

    const day7 = byDay[7];
    if (day7) {
      day7.luogo = "Miðhraun, Iceland";
      day7.lat = 64.86113;
      day7.lon = -22.66663;
      day7.storia = "Lunga traversata verso ovest con pernottamento confermato al Miðhraun - Lava Resort & Restaurant. La struttura è il punto di arrivo reale della giornata.";
      if (Array.isArray(day7.schedule) && day7.schedule.length) {
        day7.schedule[0] = ["8:00", "Partenza da Akureyri · Acco ICE", ""],
        day7.schedule[day7.schedule.length - 1] = ["Sera", "Miðhraun - Lava Resort & Restaurant", "Pernottamento · Booking 5042449149"];
      }
      day7.must = ["Arrivare a Miðhraun"];
      day7.trigger = "Pernottamento reale: Miðhraun - Lava Resort. Siglufjörður resta sacrificabile in caso di meteo avverso o ritardo.";
    }

    const day8 = byDay[8];
    if (day8) {
      day8.luogo = "Hafnir, Iceland";
      day8.lat = 63.9345;
      day8.lon = -22.6879;
      day8.storia = "Ultimo giorno nello Snæfellsnes con partenza dal Miðhraun - Lava Resort e trasferimento finale a Hafnir. La mattina successiva: riconsegna auto a Keflavík alle 08:30 e volo easyJet alle 10:15.";
      if (Array.isArray(day8.schedule) && day8.schedule.length) {
        day8.schedule[0] = ["8:00", "Partenza da Miðhraun - Lava Resort", ""],
        const hafnirIndex = day8.schedule.findIndex((row) => String(row?.[1] || "").toLowerCase().includes("hafnir"));
        if (hafnirIndex >= 0) day8.schedule[hafnirIndex] = ["16:30 – 18:50", "Hafnir", "Pernottamento finale"];
      }
      if (day8.meta) {
        day8.meta.benzina = "pieno finale prima della riconsegna auto";
        day8.meta.cibo = "pranzo a sacco; cena in zona Keflavík/Hafnir";
      }
      day8.trigger = "8 ottobre: riconsegna Blue Car Rental a KEF alle 08:30; volo easyJet KEF→MXP alle 10:15. Il programma del giorno 8 va chiuso senza ritardi e con serbatoio conforme alle condizioni di noleggio.";
    }
  }

  function initializePageHelpers() {
    syncConfirmedReservations();
    syncItineraryWithSchedule();
    buildPanel();
    tryRememberedLogin();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePageHelpers);
  } else {
    initializePageHelpers();
  }
})();
