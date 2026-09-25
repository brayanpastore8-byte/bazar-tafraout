/**
 * BAZAR TAFRAOUT - SCRIPT PRINCIPALE
 * Gestione Splash Screen (2 secondi esatti), Sidebar Hamburger,
 * Modali prodotti e Autenticazione Rapida Moderatore.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 1. SPLASH SCREEN (2 SECONDI ESATTI)
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    setTimeout(function () {
      splashScreen.classList.add('fade-out');
      setTimeout(function () {
        splashScreen.remove();
      }, 500);
    }, 2000);
  }

  // 2. SIDEBAR HAMBURGER DRAWER
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarDrawer = document.getElementById('sidebar-drawer');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

  function openSidebar() {
    if (sidebarDrawer && sidebarOverlay) {
      sidebarDrawer.classList.add('active');
      sidebarOverlay.classList.add('active');
      hamburgerBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSidebar() {
    if (sidebarDrawer && sidebarOverlay) {
      sidebarDrawer.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      if (hamburgerBtn) hamburgerBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Chiudi sidebar quando si clicca un link interno
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function () {
      if (!this.classList.contains('admin-trigger')) {
        closeSidebar();
      }
    });
  });

  // 3. MODALE DETTAGLI PRODOTTI
  const productModal = document.getElementById('product-details-modal');
  const modalImg = document.getElementById('modal-product-img');
  const modalCategory = document.getElementById('modal-product-category');
  const modalTitle = document.getElementById('modal-product-title');
  const modalDesc = document.getElementById('modal-product-desc');
  const modalCloseBtn = document.getElementById('product-modal-close');

  const productData = {
    tappeti: {
      category: 'Artigianato & Comfort',
      title: 'Tappeti raffinati di qualità',
      img: '/static/images/tappeti.jpg',
      desc: 'Selezione esclusiva di tappeti artigianali marocchini e berberi (Beni Ourain, Azilal, Kilim). Annodati con lane vergini pregiate e filati naturali ad alta resistenza. Disponibili in vari formati, trame geometriche tradizionali e nuances eleganti per impreziosire saloni, ingressi e camere da letto.'
    },
    bicchieri: {
      category: 'Oggettistica & Decor',
      title: 'Bicchieri e oggettistica marocchina',
      img: '/static/images/bicchieri.jpg',
      desc: 'Autentici bicchieri da tè tradizionali decorati a mano con filigrana dorata e motivi arabescati, lanterne intagliate in ferro battuto, portacandele in ottone cesellato e ceramiche ornamentali per creare un’atmosfera calda, magica ed accogliente nella tua casa.'
    },
    teiere: {
      category: 'Tradizione & Cucina',
      title: 'Servizi per il tè e accessori cucina',
      img: '/static/images/teiere.jpg',
      desc: 'Il cuore della ritualità marocchina: teiere in ottone placcato e acciaio inossidabile decorate a sbalzo, vassoi rotondi cesellati artigianalmente, filtri di precisione e contenitori per menta, tè verde gunpowder e zuccheri aromatici.'
    },
    coperte: {
      category: 'Tessili & Biancheria',
      title: 'Coperte morbide e calde',
      img: '/static/images/coperte.jpg',
      desc: 'Coperte morbide in lana pesante, piumotti termici e plaid con pompon in puro stile berbero. Calde, avvolgenti e traspiranti, perfette per le fredde serate invernali e curate per durare nel tempo mantenendo morbidezza e lucentezza.'
    },
    cucina: {
      category: 'Casa & Gastronomia',
      title: 'Piatti, padelle, forni e articoli per la casa',
      img: '/static/images/cucina.jpg',
      desc: 'Tutto per la cucina quotidiana e le grandi occasioni: pentole in terracotta (Tajine da cottura e da portata smaltate senza piombo), couscoussier in alluminio e acciaio, padelle antiaderenti professionali, fornetti elettrici e stoviglie robuste per la casa.'
    },
    abbigliamento: {
      category: 'Moda & Tradizione',
      title: 'Abbigliamento e giubbotti',
      img: '/static/images/abbigliamento.jpg',
      desc: 'Capi eleganti e comodi per uomo, donna e bambino: Djellaba tradizionali in tessuti leggeri estivi o caldi invernali, tuniche da festa ricamate, gandore, kaftani raffinati e un vasto assortimento di giubbotti moderni protettivi e pratici.'
    }
  };

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function () {
      const key = this.getAttribute('data-product-key');
      const item = productData[key];
      if (item && productModal) {
        modalImg.src = item.img;
        modalImg.alt = item.title;
        modalCategory.textContent = item.category;
        modalTitle.textContent = item.title;
        modalDesc.textContent = item.desc;
        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeProductModal() {
    if (productModal) {
      productModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
  if (productModal) {
    productModal.addEventListener('click', function (e) {
      if (e.target === productModal) closeProductModal();
    });
  }

  // 4. MODALE LOGIN MODERATORE (PASSWORD: Torino_2026)
  const adminLoginModal = document.getElementById('admin-login-modal');
  const adminTriggers = document.querySelectorAll('.admin-trigger');
  const adminModalClose = document.getElementById('admin-login-modal-close');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminPasswordInput = document.getElementById('admin-password-input');
  const adminLoginError = document.getElementById('admin-login-error');

  function openAdminModal(e) {
    if (e) e.preventDefault();
    closeSidebar();
    if (adminLoginModal) {
      adminLoginModal.classList.add('active');
      if (adminLoginError) adminLoginError.textContent = '';
      if (adminPasswordInput) {
        adminPasswordInput.value = '';
        setTimeout(() => adminPasswordInput.focus(), 200);
      }
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAdminModal() {
    if (adminLoginModal) {
      adminLoginModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  adminTriggers.forEach(btn => btn.addEventListener('click', openAdminModal));
  if (adminModalClose) adminModalClose.addEventListener('click', closeAdminModal);
  if (adminLoginModal) {
    adminLoginModal.addEventListener('click', function (e) {
      if (e.target === adminLoginModal) closeAdminModal();
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const pwd = adminPasswordInput.value.trim();
      const submitBtn = document.getElementById('admin-submit-btn');

      if (!pwd) {
        adminLoginError.textContent = 'Inserisci la password di sicurezza.';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifica in corso...';
      adminLoginError.textContent = '';

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd })
        });
        const result = await response.json();

        if (response.ok && result.success) {
          window.location.href = result.redirect || '/admin';
        } else {
          adminLoginError.textContent = result.message || 'Password errata. Accesso non autorizzato.';
          adminPasswordInput.value = '';
          adminPasswordInput.focus();
        }
      } catch (err) {
        adminLoginError.textContent = 'Errore di connessione con il server. Riprova.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-key"></i> Accedi al Pannello';
      }
    });
  }

  // Tasto ESC per chiudere i modali aperti
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeProductModal();
      closeAdminModal();
      closeSidebar();
    }
  });

});
