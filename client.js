import { store } from './store.js';
import { CATEGORIES, AVAILABLE_TABLES } from './data.js';
import { formatCurrency } from './receipt.js';

let tempSelectedTable = store.selectedTable || 'Stol 1';
let tempGuestCount = store.guestCount || 2;

export function initClientApp() {
  updateTableInfoPill();
  renderCategories();
  renderClientProducts();
  renderStickyCartBar();
  renderCartDrawer();
  bindClientEvents();

  // If table and guests haven't been confirmed yet (first open via QR code), prompt immediately!
  if (!store.isTableConfirmed) {
    setTimeout(() => {
      openTableAndGuestsModal(false);
    }, 200);
  }
}

export function updateTableInfoPill() {
  const pillText = document.getElementById('client-table-info-text');
  if (pillText) {
    pillText.textContent = `${store.selectedTable} • ${store.guestCount} kishi ▾`;
  }
}

// Render horizontal category navigation
export function renderCategories() {
  const container = document.getElementById('client-categories-nav');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    const isActive = store.activeCategory === cat.id;
    return `
      <button 
        class="category-chip ${isActive ? 'active' : ''}" 
        data-cat-id="${cat.id}"
        id="client-cat-btn-${cat.id.replace(/\s+/g, '-').toLowerCase()}"
      >
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');

  // Wire click handlers
  container.querySelectorAll('.category-chip').forEach(btn => {
    btn.onclick = () => {
      const catId = btn.getAttribute('data-cat-id');
      store.setCategory(catId);
    };
  });
}

// Render product cards with MAVJUD / TUGADI status
export function renderClientProducts() {
  const feed = document.getElementById('client-food-feed');
  if (!feed) return;

  const currentCat = store.activeCategory;
  const search = store.searchQuery;

  const filtered = store.products.filter(p => {
    const matchesCat = currentCat === 'all' || p.category === currentCat;
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search) || 
      p.description.toLowerCase().includes(search);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    feed.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
        <div style="font-size: 2.5rem; margin-bottom: 8px;">🍽️</div>
        <h4 style="font-family: var(--font-display); color: var(--teal-900); font-size: 1.1rem;">Taomlar topilmadi</h4>
        <p style="font-size: 0.8rem; margin-top: 4px;">Boshqa kategoriya yoki qidiruv so'zini sinab ko'ring</p>
      </div>
    `;
    return;
  }

  feed.innerHTML = filtered.map(prod => {
    const isOutOfStock = prod.status === 'tugadi';
    const cartQty = store.cart[prod.id] || 0;

    return `
      <div 
        class="food-card ${isOutOfStock ? 'card-out-of-stock' : ''}" 
        id="client-product-card-${prod.id}"
      >
        <!-- Food Thumbnail with Badges -->
        <div class="food-card-thumb">
          <img src="${prod.image}" alt="${prod.name}" loading="lazy" onerror="this.src='assets/images/palov.jpg'">
          
          <div class="thumb-top-badges">
            <span class="category-tag-mini">${prod.category}</span>

            <!-- Status Badge: Green MAVJUD vs Red TUGADI -->
            ${isOutOfStock ? `
              <span class="status-badge-chip status-tugadi" title="Ushbu taom omborda tugagan">
                ● TUGADI
              </span>
            ` : `
              <span class="status-badge-chip status-mavjud" title="Buyurtma berish mumkin">
                ● MAVJUD
              </span>
            `}
          </div>
        </div>

        <!-- Food Details -->
        <div class="food-card-body">
          <div class="food-card-title-row">
            <h3 class="food-card-name">${prod.name}</h3>
            ${prod.badge ? `<span style="font-size: 0.68rem; background: var(--gold-100); color: var(--gold-800); padding: 2px 6px; border-radius: 4px; font-weight: 700; white-space: nowrap;">${prod.badge}</span>` : ''}
          </div>
          
          <p class="food-card-desc">${prod.description}</p>

          <div class="food-card-footer">
            <div class="food-card-price-block">
              <span class="food-card-price-label">Narxi</span>
              <div class="food-card-price">
                ${new Intl.NumberFormat('uz-UZ').format(prod.price)} <span>so'm</span>
              </div>
            </div>

            <!-- Action: Stepper, Add button, or Disabled Button for TUGADI -->
            <div class="cart-action-container">
              ${isOutOfStock ? `
                <button 
                  class="btn-add-food disabled-btn" 
                  disabled 
                  title="Taom tugagan, buyurtma qilib bo'lmaydi"
                  id="btn-add-${prod.id}"
                >
                  ✕ Tugadi
                </button>
              ` : cartQty > 0 ? `
                <div class="quantity-stepper" id="stepper-${prod.id}">
                  <button class="stepper-btn btn-cart-minus" data-id="${prod.id}" title="Kamaytirish">−</button>
                  <span class="stepper-qty">${cartQty}</span>
                  <button class="stepper-btn btn-cart-plus" data-id="${prod.id}" title="Ko'paytirish">+</button>
                </div>
              ` : `
                <button 
                  class="btn-add-food btn-cart-add-direct" 
                  data-id="${prod.id}"
                  id="btn-add-${prod.id}"
                >
                  <span>+</span> Savatga
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Wire product card actions
  feed.querySelectorAll('.btn-cart-add-direct').forEach(btn => {
    btn.onclick = () => {
      const prodId = btn.getAttribute('data-id');
      store.addToCart(prodId, 1);
    };
  });

  feed.querySelectorAll('.btn-cart-plus').forEach(btn => {
    btn.onclick = () => {
      const prodId = btn.getAttribute('data-id');
      store.addToCart(prodId, 1);
    };
  });

  feed.querySelectorAll('.btn-cart-minus').forEach(btn => {
    btn.onclick = () => {
      const prodId = btn.getAttribute('data-id');
      store.decrementCart(prodId);
    };
  });
}

// Render bottom floating sticky cart bar
export function renderStickyCartBar() {
  const bar = document.getElementById('client-sticky-cart');
  if (!bar) return;

  const summary = store.getCartSummary();

  if (summary.count > 0) {
    bar.classList.add('visible');
    const countBadge = document.getElementById('sticky-cart-count-badge');
    const countText = document.getElementById('sticky-cart-count-text');
    const totalPrice = document.getElementById('sticky-cart-total');

    if (countBadge) countBadge.textContent = summary.count;
    if (countText) countText.textContent = `${summary.count} ta taom tanlandi`;
    if (totalPrice) totalPrice.textContent = formatCurrency(summary.total);
  } else {
    bar.classList.remove('visible');
  }
}

// Render cart drawer modal
export function renderCartDrawer() {
  const listContainer = document.getElementById('cart-drawer-items-list');
  const summaryBlock = document.getElementById('cart-drawer-summary-block');
  const tableGuestBanner = document.getElementById('cart-table-guest-info');
  if (!listContainer || !summaryBlock) return;

  const summary = store.getCartSummary();

  if (tableGuestBanner) {
    tableGuestBanner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--teal-50); border: 1px solid var(--teal-100); padding: 8px 12px; border-radius: var(--radius-md); margin-bottom: 10px;">
        <span style="font-weight: 700; color: var(--teal-900); font-size: 0.82rem;">
          📍 ${store.selectedTable} • 👥 ${store.guestCount} kishi
        </span>
        <button type="button" id="btn-change-table-cart" style="background: transparent; border: none; color: var(--gold-700); font-weight: 700; font-size: 0.75rem; cursor: pointer; text-decoration: underline;">
          O'zgartirish
        </button>
      </div>
    `;
    const changeBtn = document.getElementById('btn-change-table-cart');
    if (changeBtn) {
      changeBtn.onclick = () => {
        closeCartDrawer();
        openTableAndGuestsModal(true);
      };
    }
  }

  if (summary.items.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 30px 10px; color: var(--text-tertiary);">
        <div style="font-size: 2rem; margin-bottom: 6px;">🛒</div>
        <p style="font-size: 0.85rem; font-weight: 600;">Savatingiz hozircha bo'sh</p>
        <p style="font-size: 0.75rem; margin-top: 2px;">Menyudan lazzatli taomlarni tanlang</p>
      </div>
    `;
    summaryBlock.innerHTML = '';
    const submitBtn = document.getElementById('btn-confirm-order');
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  const submitBtn = document.getElementById('btn-confirm-order');
  if (submitBtn) submitBtn.disabled = false;

  listContainer.innerHTML = summary.items.map(item => `
    <div class="cart-drawer-item-row">
      <div class="cart-item-details">
        <span class="cart-item-title">${item.product.name}</span>
        <span class="cart-item-unit-price">${formatCurrency(item.product.price)} x ${item.quantity}</span>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 800; font-family: var(--font-display); font-size: 0.9rem; color: var(--teal-900);">
          ${formatCurrency(item.totalPrice)}
        </span>
        <div class="quantity-stepper">
          <button class="stepper-btn drawer-minus" data-id="${item.product.id}">−</button>
          <span class="stepper-qty">${item.quantity}</span>
          <button class="stepper-btn drawer-plus" data-id="${item.product.id}">+</button>
        </div>
      </div>
    </div>
  `).join('');

  summaryBlock.innerHTML = `
    <div class="summary-calc-row">
      <span>Taomlar jami:</span>
      <span>${formatCurrency(summary.subtotal)}</span>
    </div>
    <div class="summary-calc-row">
      <span>Choyxona xizmat haqi (10%):</span>
      <span>${formatCurrency(summary.serviceFee)}</span>
    </div>
    <div class="summary-calc-row total-row">
      <span>Umumiy to'lov:</span>
      <span style="color: var(--teal-950);">${formatCurrency(summary.total)}</span>
    </div>
  `;

  // Stepper handlers inside drawer
  listContainer.querySelectorAll('.drawer-plus').forEach(b => {
    b.onclick = () => store.addToCart(b.getAttribute('data-id'), 1);
  });
  listContainer.querySelectorAll('.drawer-minus').forEach(b => {
    b.onclick = () => store.decrementCart(b.getAttribute('data-id'));
  });
}

export function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    renderCartDrawer();
    overlay.classList.add('active');
  }
}

export function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// ============================================================================
// INITIAL TABLE & GUEST SELECTION MODAL (9 TABLES & GUEST COUNT)
// ============================================================================

export function openTableAndGuestsModal(canClose = true) {
  const modal = document.getElementById('table-guest-modal');
  const grid = document.getElementById('tables-selection-grid');
  const closeBtn = document.getElementById('btn-close-table-guest-modal');
  const guestDisplay = document.getElementById('selected-guest-count-display');
  if (!modal || !grid) return;

  tempSelectedTable = store.selectedTable || 'Stol 1';
  tempGuestCount = store.guestCount || 2;

  // If initial QR open, user cannot close until table is selected
  if (closeBtn) {
    closeBtn.style.display = canClose ? 'flex' : 'none';
  }

  // Render exactly 9 tables (Table 1 to Table 9)
  grid.innerHTML = AVAILABLE_TABLES.map(tbl => {
    const isSelected = tbl === tempSelectedTable;
    return `
      <button 
        type="button"
        class="table-choice-btn ${isSelected ? 'selected' : ''}" 
        data-table="${tbl}"
      >
        <span class="table-icon">🫖</span>
        <span>${tbl}</span>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.table-choice-btn').forEach(btn => {
    btn.onclick = () => {
      grid.querySelectorAll('.table-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      tempSelectedTable = btn.getAttribute('data-table');
    };
  });

  // Guest count display
  if (guestDisplay) {
    guestDisplay.textContent = `${tempGuestCount} kishi`;
  }

  // Update preset chips active state
  updateGuestPresetChips(tempGuestCount);

  modal.classList.add('active');
}

export function closeTableAndGuestsModal() {
  const modal = document.getElementById('table-guest-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function updateGuestPresetChips(count) {
  document.querySelectorAll('.guest-preset-chip').forEach(chip => {
    const val = parseInt(chip.getAttribute('data-guests'));
    if (val === count) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

export function showOrderSuccessModal(order) {
  const modal = document.getElementById('order-status-modal');
  const details = document.getElementById('order-status-details');
  if (!modal || !details) return;

  details.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="font-size: 3rem; margin-bottom: 8px;">🎉</div>
      <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: var(--teal-950); font-weight: 800;">
        Buyurtma Qabul Qilindi!
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
        Chek raqami: <strong style="font-family: var(--font-mono); color: var(--teal-900);">${order.id}</strong> • 
        <strong>${order.table} (${order.guestCount} kishi)</strong>
      </p>
    </div>

    <!-- Live Step Progress Tracker -->
    <div style="display: flex; justify-content: space-between; position: relative; margin: 24px 0 16px;">
      <div style="position: absolute; top: 14px; left: 10%; right: 10%; height: 3px; background: #E2E8F0; z-index: 1;"></div>
      <div style="position: absolute; top: 14px; left: 10%; width: 33%; height: 3px; background: #059669; z-index: 2;"></div>

      <div style="display: flex; flex-direction: column; align-items: center; z-index: 3;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background: #059669; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800;">✓</div>
        <span style="font-size: 0.72rem; font-weight: 700; color: var(--teal-900); margin-top: 6px;">Qabul qilindi</span>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; z-index: 3;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--gold-500); color: var(--teal-950); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; animation: pulseAnimation 1.5s infinite;">⏳</div>
        <span style="font-size: 0.72rem; font-weight: 700; color: var(--gold-800); margin-top: 6px;">Oshxonada</span>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; z-index: 3;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background: #E2E8F0; color: #94A3B8; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800;">3</div>
        <span style="font-size: 0.72rem; font-weight: 600; color: #94A3B8; margin-top: 6px;">Yetkazilmoqda</span>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; z-index: 3;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background: #E2E8F0; color: #94A3B8; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800;">4</div>
        <span style="font-size: 0.72rem; font-weight: 600; color: #94A3B8; margin-top: 6px;">Stolda</span>
      </div>
    </div>

    <!-- Summary of Ordered Items -->
    <div style="background: var(--surface-subtle); border-radius: var(--radius-md); padding: 12px; margin-top: 14px; font-size: 0.82rem;">
      <div style="font-weight: 700; color: var(--teal-950); margin-bottom: 6px;">Taomlar ro'yxati:</div>
      ${order.items.map(i => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>${i.quantity}x ${i.name}</span>
          <span style="font-weight: 600;">${formatCurrency(i.price * i.quantity)}</span>
        </div>
      `).join('')}
      <div style="display: flex; justify-content: space-between; border-top: 1px dashed var(--surface-border); padding-top: 6px; margin-top: 6px; font-weight: 800; color: var(--teal-900);">
        <span>Jami to'lov (xizmat haqi bilan):</span>
        <span>${formatCurrency(order.total)}</span>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function bindClientEvents() {
  // Table info pill click
  const tableBtn = document.getElementById('client-table-info-btn');
  if (tableBtn) {
    tableBtn.onclick = () => openTableAndGuestsModal(true);
  }

  // Modal Table selection confirm button
  const confirmTableBtn = document.getElementById('btn-confirm-table-guests');
  if (confirmTableBtn) {
    confirmTableBtn.onclick = () => {
      store.setTableAndGuests(tempSelectedTable, tempGuestCount);
      updateTableInfoPill();
      closeTableAndGuestsModal();
    };
  }

  // Close Table & Guests modal button
  const closeTableModalBtn = document.getElementById('btn-close-table-guest-modal');
  if (closeTableModalBtn) {
    closeTableModalBtn.onclick = () => closeTableAndGuestsModal();
  }

  // Guest count increment & decrement
  const guestPlusBtn = document.getElementById('btn-guest-plus');
  const guestMinusBtn = document.getElementById('btn-guest-minus');
  const guestDisplay = document.getElementById('selected-guest-count-display');

  if (guestPlusBtn) {
    guestPlusBtn.onclick = () => {
      tempGuestCount = Math.min(20, tempGuestCount + 1);
      if (guestDisplay) guestDisplay.textContent = `${tempGuestCount} kishi`;
      updateGuestPresetChips(tempGuestCount);
    };
  }

  if (guestMinusBtn) {
    guestMinusBtn.onclick = () => {
      tempGuestCount = Math.max(1, tempGuestCount - 1);
      if (guestDisplay) guestDisplay.textContent = `${tempGuestCount} kishi`;
      updateGuestPresetChips(tempGuestCount);
    };
  }

  // Preset chips click
  document.querySelectorAll('.guest-preset-chip').forEach(chip => {
    chip.onclick = () => {
      tempGuestCount = parseInt(chip.getAttribute('data-guests')) || 2;
      if (guestDisplay) guestDisplay.textContent = `${tempGuestCount} kishi`;
      updateGuestPresetChips(tempGuestCount);
    };
  });

  // Search input
  const searchInput = document.getElementById('client-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      store.setSearch(e.target.value);
    };
  }

  // Open drawer from sticky cart
  const openDrawerBtn = document.getElementById('btn-open-cart-drawer');
  const stickyCartLeft = document.getElementById('sticky-cart-left-click');
  if (openDrawerBtn) openDrawerBtn.onclick = openCartDrawer;
  if (stickyCartLeft) stickyCartLeft.onclick = openCartDrawer;

  // Close drawer
  const closeDrawerBtn = document.getElementById('btn-close-cart-drawer');
  const drawerOverlay = document.getElementById('cart-drawer-overlay');
  if (closeDrawerBtn) closeDrawerBtn.onclick = closeCartDrawer;
  if (drawerOverlay) {
    drawerOverlay.onclick = (e) => {
      if (e.target === drawerOverlay) closeCartDrawer();
    };
  }

  // Fast order submit from sticky bar
  const fastOrderBtn = document.getElementById('btn-sticky-fast-order');
  if (fastOrderBtn) {
    fastOrderBtn.onclick = () => {
      const order = store.placeOrder("Mijoz tezkor buyurtmasi", "Karta / Naqd");
      if (order) {
        showOrderSuccessModal(order);
      }
    };
  }

  // Confirm order inside drawer
  const confirmOrderBtn = document.getElementById('btn-confirm-order');
  if (confirmOrderBtn) {
    confirmOrderBtn.onclick = () => {
      const notesInput = document.getElementById('cart-customer-notes');
      const paymentSelect = document.getElementById('cart-payment-method');
      const notes = notesInput ? notesInput.value : '';
      const paymentMethod = paymentSelect ? paymentSelect.value : 'Karta / Naqd';

      const order = store.placeOrder(notes, paymentMethod);
      if (order) {
        closeCartDrawer();
        showOrderSuccessModal(order);
        if (notesInput) notesInput.value = '';
      }
    };
  }

  // Call waiter button
  const callWaiterBtn = document.getElementById('btn-call-waiter');
  if (callWaiterBtn) {
    callWaiterBtn.onclick = () => {
      store.playTone(880, 0.2);
      alert(`🔔 ${store.selectedTable} (${store.guestCount} kishi) uchun ofitsiant chaqirildi! 2 daqiqada siz bilan bo'ladi.`);
    };
  }
}
