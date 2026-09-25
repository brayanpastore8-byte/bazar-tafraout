/**
 * BAZAR TAFRAOUT - GESTIONE STATO DINAMICO IN TEMPO REALE 24/7
 * Calcolo automatico orari negozio con precisione al secondo,
 * sincronizzazione con override del moderatore ed aggiornamento widget fluttuante.
 */

(function () {
  'use strict';

  let serverStatusData = null;

  const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const MESI = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Calcolo locale orario e stato
  function computeLocalStatus(now) {
    // Se c'è un override attivo dal server
    if (serverStatusData && serverStatusData.is_override) {
      return {
        color: serverStatusData.color,
        label: serverStatusData.label,
        message: serverStatusData.message,
        isOverride: true
      };
    }

    const day = now.getDay(); // 0: Dom, 1: Lun, ..., 6: Sab
    const hour = now.getHours();
    const min = now.getMinutes();
    const totalMinutes = hour * 60 + min;

    // Lunedì - Venerdì (1 - 5)
    if (day >= 1 && day <= 5) {
      const openMin = 8 * 60 + 30;    // 08:30 = 510 min
      const closeMin = 20 * 60 + 50;  // 20:50 = 1250 min
      const warnMin = closeMin - 10;  // 20:40 = 1240 min

      if (totalMinutes < openMin) {
        return {
          color: 'red',
          label: 'Chiuso',
          message: 'Il negozio è chiuso. Riapertura oggi alle 08:30.',
          isOverride: false
        };
      } else if (totalMinutes >= openMin && totalMinutes < warnMin) {
        return {
          color: 'green',
          label: 'Aperto',
          message: 'Negozio aperto! Ti aspettiamo in Via S. Giovanni Battista la Salle 9/F.',
          isOverride: false
        };
      } else if (totalMinutes >= warnMin && totalMinutes < closeMin) {
        return {
          color: 'orange',
          label: 'In Chiusura',
          message: 'Il negozio è in fase di chiusura, passa domani mattina.',
          isOverride: false
        };
      } else {
        const nextMsg = day === 5 ? 'Riapertura Sabato alle 09:00.' : 'Riapertura domani mattina alle 08:30.';
        return {
          color: 'red',
          label: 'Chiuso',
          message: `Negozio chiuso per oggi. ${nextMsg}`,
          isOverride: false
        };
      }
    }

    // Sabato (6)
    if (day === 6) {
      const openMin = 9 * 60;         // 09:00 = 540 min
      const closeMin = 20 * 60 + 30;  // 20:30 = 1230 min
      const warnMin = closeMin - 10;  // 20:20 = 1220 min

      if (totalMinutes < openMin) {
        return {
          color: 'red',
          label: 'Chiuso',
          message: 'Il negozio è chiuso. Riapertura oggi alle 09:00.',
          isOverride: false
        };
      } else if (totalMinutes >= openMin && totalMinutes < warnMin) {
        return {
          color: 'green',
          label: 'Aperto',
          message: 'Negozio aperto! Ti aspettiamo in Via S. Giovanni Battista la Salle 9/F.',
          isOverride: false
        };
      } else if (totalMinutes >= warnMin && totalMinutes < closeMin) {
        return {
          color: 'orange',
          label: 'In Chiusura',
          message: 'Il negozio è in fase di chiusura, passa domani mattina.',
          isOverride: false
        };
      } else {
        return {
          color: 'red',
          label: 'Chiuso',
          message: 'Chiuso per fine settimana. Riapertura Lunedì alle ore 08:30.',
          isOverride: false
        };
      }
    }

    // Domenica (0)
    return {
      color: 'red',
      label: 'Chiuso',
      message: 'Domenica: Chiuso per riposo settimanale. Vi aspettiamo Lunedì alle 08:30.',
      isOverride: false
    };
  }

  function updateDisplay() {
    const now = new Date();

    // Formattazione Orologio
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hh}:${mm}:${ss}`;

    // Formattazione Giorno e Data
    const giornoStr = GIORNI[now.getDay()];
    const dateString = `${giornoStr} ${now.getDate()} ${MESI[now.getMonth()]}`;

    const status = computeLocalStatus(now);

    // 1. Aggiorna Widget Fluttuante in basso a destra
    const widgetClock = document.getElementById('widget-clock');
    const widgetDate = document.getElementById('widget-date');
    const widgetState = document.getElementById('widget-state');
    const widgetDot = document.getElementById('widget-dot');

    if (widgetClock) widgetClock.textContent = timeString;
    if (widgetDate) widgetDate.textContent = dateString;

    if (widgetState) {
      widgetState.textContent = status.label;
      widgetState.className = `status-widget-state status-state-${status.color}`;
    }

    if (widgetDot) {
      widgetDot.className = `status-indicator-dot status-dot-${status.color}`;
    }

    // 2. Aggiorna Banner / Badge Header
    const headerStatusDot = document.getElementById('header-status-dot');
    const headerStatusText = document.getElementById('header-status-text');

    if (headerStatusDot) {
      headerStatusDot.className = `status-indicator-dot status-dot-${status.color}`;
    }
    if (headerStatusText) {
      headerStatusText.textContent = status.label;
    }

    // 3. Aggiorna Popover dettagli
    const popoverMsg = document.getElementById('popover-status-message');
    const popoverTime = document.getElementById('popover-current-time');
    if (popoverMsg) popoverMsg.textContent = status.message;
    if (popoverTime) popoverTime.textContent = `${dateString} • ${timeString}`;
  }

  // Interroga il server per sincronizzare orari ed eventuali override del moderatore
  async function fetchServerStatus() {
    try {
      const resp = await fetch('/api/status', { cache: 'no-store' });
      if (resp.ok) {
        serverStatusData = await resp.json();
        updateDisplay();
      }
    } catch (e) {
      // Usa calcolo locale offline
    }
  }

  // Inizializza
  document.addEventListener('DOMContentLoaded', function () {
    updateDisplay();
    // Aggiorna orologio ogni secondo
    setInterval(updateDisplay, 1000);

    // Controlla API ogni 25 secondi per recepire eventuali cambi manuali o scadenze
    fetchServerStatus();
    setInterval(fetchServerStatus, 25000);

    // Toggle popover al click sul widget
    const floatingWidget = document.getElementById('live-status-widget');
    const popover = document.getElementById('status-popover');
    if (floatingWidget && popover) {
      floatingWidget.addEventListener('click', function (e) {
        e.stopPropagation();
        popover.classList.toggle('active');
      });

      document.addEventListener('click', function (e) {
        if (!popover.contains(e.target) && e.target !== floatingWidget) {
          popover.classList.remove('active');
        }
      });
    }
  });

})();
