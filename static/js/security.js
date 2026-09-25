/**
 * BAZAR TAFRAOUT - SCRIPT DI PROTEZIONE DI BASE (ANTI-TAMPER & INSPECTION SHIELD)
 * Protegge il codice sorgente da ispezioni accidentali o manomissioni non autorizzate.
 */

(function () {
  'use strict';

  function showSecurityNotice(message) {
    let toast = document.getElementById('anti-tamper-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'anti-tamper-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fas fa-shield-alt"></i> <span>${message || 'Area Protetta - Proprietà Riservata di Bazar Tafraout'}</span>`;
    toast.classList.add('show');
    
    if (window._securityToastTimeout) {
      clearTimeout(window._securityToastTimeout);
    }
    window._securityToastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 1. Disabilita il menu contestuale (tasto destro)
  document.addEventListener('contextmenu', function (e) {
    // Permetti l'interazione standard solo all'interno degli input del pannello di amministrazione
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
    showSecurityNotice('Contenuto protetto da copyright. Ispezione disabilitata.');
  }, false);

  // 2. Disabilita scorciatoie da tastiera comuni per Developer Tools
  document.addEventListener('keydown', function (e) {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      showSecurityNotice('Gli strumenti di sviluppo sono disabilitati.');
      return false;
    }

    // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault();
      showSecurityNotice('Funzione di ispezione disabilitata.');
      return false;
    }

    // Ctrl+U (Visualizza Sorgente Pagina)
    if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 117)) {
      e.preventDefault();
      showSecurityNotice('Visualizzazione del sorgente disabilitata.');
      return false;
    }

    // Ctrl+S (Salva Pagina)
    if (e.ctrlKey && (e.keyCode === 83 || e.keyCode === 115)) {
      e.preventDefault();
      return false;
    }
  }, false);

  // 3. Avviso console di sicurezza riservato
  try {
    const bannerStyle = 'color: #d4af37; font-size: 16px; font-weight: bold; background: #0d0f12; padding: 6px 12px; border-radius: 4px; border: 1px solid #d4af37;';
    const warningStyle = 'color: #ef4444; font-size: 13px; font-weight: bold;';
    console.log('%c BAZAR TAFRAOUT - SISTEMA DI SICUREZZA ', bannerStyle);
    console.log('%c ATTENZIONE: Questo sistema è protetto. Tentativi di manomissione o attacchi non autorizzati sono registrati.', warningStyle);
  } catch (err) {}

})();
