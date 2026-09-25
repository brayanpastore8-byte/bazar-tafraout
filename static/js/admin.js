/**
 * BAZAR TAFRAOUT - SCRIPT GESTIONE PANNELLO MODERATORE
 * Grafico visite interattivo Chart.js, Override Manuale orari e rimozione automatica alla scadenza.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 1. GRAFICO VISITE CON CHART.JS
  const chartCanvas = document.getElementById('visitsChart');
  if (chartCanvas && window.Chart) {
    const rawLabels = chartCanvas.getAttribute('data-labels');
    const rawData = chartCanvas.getAttribute('data-values');
    
    let labels = [];
    let values = [];

    try {
      labels = JSON.parse(rawLabels || '[]');
      values = JSON.parse(rawData || '[]');
    } catch (e) {
      labels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
      values = [0, 0, 0, 0, 0, 0, 0];
    }

    const ctx = chartCanvas.getContext('2d');
    
    // Gradiente oro sfumato per il grafico
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(212, 175, 55, 0.45)');
    gradient.addColorStop(1, 'rgba(212, 175, 55, 0.02)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Visite Uniche',
          data: values,
          borderColor: '#d4af37',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#d4af37',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(18, 22, 31, 0.95)',
            titleColor: '#d4af37',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function (ctx) {
                return `Visite: ${ctx.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Outfit', size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Outfit', size: 12 },
              precision: 0
            }
          }
        }
      }
    });
  }

  // 2. MODIFICA OVERRIDE STATO NEGOZIO
  const overrideForm = document.getElementById('override-status-form');
  const alertFeedback = document.getElementById('override-feedback');
  const disableOverrideBtn = document.getElementById('btn-disable-override');

  if (overrideForm) {
    overrideForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const color = document.querySelector('input[name="status_color"]:checked')?.value || 'green';
      const notice = document.getElementById('override_notice').value.trim();
      const startDate = document.getElementById('override_start').value;
      const expiresAt = document.getElementById('override_expires').value;

      if (!expiresAt) {
        showFeedback('Specificare la data e l\'ora di fine validità dell\'override.', 'error');
        return;
      }

      const submitBtn = overrideForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvataggio...';

      try {
        const resp = await fetch('/api/admin/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            color: color,
            notice: notice,
            start_date: startDate,
            expires_at: expiresAt
          })
        });

        const data = await resp.json();
        if (resp.ok && data.success) {
          showFeedback('Stato straordinario salvato con successo! Alla scadenza impostata tornerà automaticamente in modalità orari ordinari.', 'success');
          setTimeout(() => location.reload(), 1500);
        } else {
          showFeedback(data.message || 'Errore durante l\'aggiornamento.', 'error');
        }
      } catch (err) {
        showFeedback('Errore di comunicazione con il server.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Applica Modifica Stato';
      }
    });
  }

  // 3. RIPRISTINO ORARI AUTOMATICI (DISATTIVAZIONE OVERRIDE)
  if (disableOverrideBtn) {
    disableOverrideBtn.addEventListener('click', async function () {
      if (!confirm('Sei sicuro di voler ripristinare subito la gestione automatica degli orari ordinari?')) {
        return;
      }

      disableOverrideBtn.disabled = true;
      disableOverrideBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ripristino in corso...';

      try {
        const resp = await fetch('/api/admin/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'disable' })
        });

        const data = await resp.json();
        if (resp.ok && data.success) {
          showFeedback('Gestione automatica degli orari ripristinata con successo!', 'success');
          setTimeout(() => location.reload(), 1200);
        } else {
          showFeedback(data.message || 'Errore durante il ripristino.', 'error');
        }
      } catch (err) {
        showFeedback('Errore di rete durante il ripristino.', 'error');
      } finally {
        disableOverrideBtn.disabled = false;
        disableOverrideBtn.innerHTML = '<i class="fas fa-undo"></i> Ripristina Orari Automatici';
      }
    });
  }

  // 4. LOGOUT MODERATORE
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/';
      } catch (err) {
        window.location.href = '/';
      }
    });
  }

  function showFeedback(text, type) {
    if (!alertFeedback) return;
    alertFeedback.style.display = 'block';
    alertFeedback.className = `alert-box alert-${type}`;
    alertFeedback.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> <span>${text}</span>`;
  }

});
