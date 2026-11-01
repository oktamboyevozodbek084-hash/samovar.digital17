import { store } from './store.js';
import { initClientApp, renderClientProducts, renderStickyCartBar, renderCartDrawer, updateTableInfoPill } from './client.js';
import { initAdminApp, renderTopStats, renderAdminSection } from './admin.js';
import { closeThermalReceiptModal } from './receipt.js';
import { closeProductModal } from './admin.js';

let enteredPin = '';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize applications
  initClientApp();
  initAdminApp();

  // Apply initial view (Default is Client QR Menu)
  applyView(store.currentView);

  // Setup live clock in admin topbar
  startLiveClock();

  // Wire Admin login PIN modal
  setupAdminAuth();

  // Wire global modals
  setupGlobalModals();

  // Subscribe to reactive store changes
  store.subscribe((event, payload) => {
    if (event === 'products-updated') {
      renderClientProducts();
      renderAdminSection();
      renderTopStats();
    } else if (event === 'orders-updated') {
      renderAdminSection();
      renderTopStats();
    } else if (event === 'cart-updated') {
      renderClientProducts();
      renderStickyCartBar();
      renderCartDrawer();
    } else if (event === 'category-changed' || event === 'search-changed') {
      renderClientProducts();
    } else if (event === 'table-guests-updated') {
      updateTableInfoPill();
      renderCartDrawer();
    } else if (event === 'order-placed') {
      showToastNotification(`🔔 Yangi Buyurtma: ${payload.table} (${payload.guestCount} kishi) - ${new Intl.NumberFormat('uz-UZ').format(payload.total)} so'm`);
    } else if (event === 'view-changed') {
      applyView(store.currentView);
    }
  });
});

function applyView(view) {
  if (view === 'admin') {
    document.body.classList.add('view-admin');
    renderAdminSection();
    renderTopStats();
  } else {
    document.body.classList.remove('view-admin');
  }
}

// ============================================================================
// ADMIN PIN CODE AUTHENTICATION (STRICTLY "1234")
// ============================================================================

function setupAdminAuth() {
  const openLoginBtn = document.getElementById('btn-open-admin-login');
  const loginModal = document.getElementById('admin-login-modal');
  const closeLoginBtn = document.getElementById('btn-close-admin-login');
  const cancelLoginBtn = document.getElementById('btn-cancel-admin-login');
  const exitAdminBtn = document.getElementById('btn-exit-admin');
  const pinError = document.getElementById('admin-pin-error');

  // Open Login Modal
  if (openLoginBtn) {
    openLoginBtn.onclick = () => {
      resetPinInput();
      if (loginModal) loginModal.classList.add('active');
    };
  }

  // Close Login Modal
  if (closeLoginBtn) {
    closeLoginBtn.onclick = () => {
      if (loginModal) loginModal.classList.remove('active');
    };
  }
  if (cancelLoginBtn) {
    cancelLoginBtn.onclick = () => {
      if (loginModal) loginModal.classList.remove('active');
    };
  }

  // Exit Admin Button (Return to Client QR Menu)
  if (exitAdminBtn) {
    exitAdminBtn.onclick = () => {
      store.logoutAdmin();
      showToastNotification('Mijoz menyusiga qaytildi.');
    };
  }

  // Touch Keypad for PIN
  document.querySelectorAll('.pin-keypad-btn').forEach(btn => {
    btn.onclick = () => {
      const key = btn.getAttribute('data-key');
      handlePinKeyPress(key);
    };
  });

  // Physical Keyboard listener when modal is open
  document.addEventListener('keydown', (e) => {
    if (!loginModal || !loginModal.classList.contains('active')) return;

    if (e.key >= '0' && e.key <= '9') {
      handlePinKeyPress(e.key);
    } else if (e.key === 'Backspace') {
      handlePinKeyPress('clear');
    } else if (e.key === 'Enter') {
      handlePinKeyPress('enter');
    } else if (e.key === 'Escape') {
      loginModal.classList.remove('active');
    }
  });
}

function handlePinKeyPress(key) {
  const pinError = document.getElementById('admin-pin-error');
  if (pinError) pinError.style.display = 'none';

  if (key === 'clear') {
    enteredPin = '';
    renderPinBoxes();
  } else if (key === 'enter') {
    verifyAdminPin();
  } else if (enteredPin.length < 4) {
    enteredPin += key;
    renderPinBoxes();
    if (enteredPin.length === 4) {
      setTimeout(verifyAdminPin, 150);
    }
  }
}

function renderPinBoxes() {
  const boxes = document.querySelectorAll('.pin-digit-box');
  boxes.forEach((box, i) => {
    if (i < enteredPin.length) {
      box.textContent = '●';
      box.classList.add('filled');
    } else {
      box.textContent = '';
      box.classList.remove('filled');
    }
  });
}

function resetPinInput() {
  enteredPin = '';
  renderPinBoxes();
  const pinError = document.getElementById('admin-pin-error');
  if (pinError) pinError.style.display = 'none';
}

function verifyAdminPin() {
  const success = store.loginAdmin(enteredPin);
  const loginModal = document.getElementById('admin-login-modal');
  const pinError = document.getElementById('admin-pin-error');

  if (success) {
    if (loginModal) loginModal.classList.remove('active');
    resetPinInput();
    showToastNotification('✓ Xush kelibsiz, Administrator! Kassa va boshqaruv faol.');
  } else {
    if (pinError) {
      pinError.style.display = 'block';
      pinError.textContent = "PIN kod noto'g'ri! Qayta urinib ko'ring.";
    }
    // Shake effect
    const boxContainer = document.querySelector('.pin-display-container');
    if (boxContainer) {
      boxContainer.style.transform = 'translateX(-8px)';
      setTimeout(() => boxContainer.style.transform = 'translateX(8px)', 80);
      setTimeout(() => boxContainer.style.transform = 'translateX(-4px)', 160);
      setTimeout(() => boxContainer.style.transform = 'translateX(0)', 240);
    }
    setTimeout(resetPinInput, 800);
  }
}

function setupGlobalModals() {
  // Thermal receipt modal close
  const closeReceiptBtn = document.getElementById('btn-close-receipt-modal');
  const receiptOverlay = document.getElementById('thermal-receipt-modal');
  if (closeReceiptBtn) closeReceiptBtn.onclick = closeThermalReceiptModal;
  if (receiptOverlay) {
    receiptOverlay.onclick = (e) => {
      if (e.target === receiptOverlay) closeThermalReceiptModal();
    };
  }

  // Product modal close
  const closeProdBtn = document.getElementById('btn-close-product-modal');
  const cancelProdBtn = document.getElementById('btn-cancel-product-modal');
  const prodOverlay = document.getElementById('product-modal');
  if (closeProdBtn) closeProdBtn.onclick = closeProductModal;
  if (cancelProdBtn) cancelProdBtn.onclick = closeProductModal;
  if (prodOverlay) {
    prodOverlay.onclick = (e) => {
      if (e.target === prodOverlay) closeProductModal();
    };
  }

  // Order status modal close
  const orderModal = document.getElementById('order-status-modal');
  const closeOrderBtn = document.getElementById('btn-close-order-modal');
  if (closeOrderBtn && orderModal) {
    closeOrderBtn.onclick = () => orderModal.classList.remove('active');
  }
  if (orderModal) {
    orderModal.onclick = (e) => {
      if (e.target === orderModal) orderModal.classList.remove('active');
    };
  }
}

function startLiveClock() {
  const clockEl = document.getElementById('admin-live-clock');
  const update = () => {
    if (!clockEl) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
    clockEl.textContent = `🕒 ${timeStr} • ${dateStr}`;
  };
  update();
  setInterval(update, 1000);
}

export function showToastNotification(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="font-size: 1.2rem;">✨</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}
