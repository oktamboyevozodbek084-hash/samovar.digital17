import { store } from './store.js';
import { CATEGORIES } from './data.js';
import { formatCurrency, openThermalReceiptModal } from './receipt.js';

let activeAdminTab = 'menu'; // 'menu' | 'inventory' | 'orders' | 'reports'
let adminCategoryFilter = 'all';
let adminStatusFilter = 'all';
let adminSearchQuery = '';
let ordersStatusFilter = 'all';

export function initAdminApp() {
  renderSidebar();
  renderTopStats();
  renderAdminSection();
  bindAdminEvents();
}

export function setActiveAdminTab(tab) {
  activeAdminTab = tab;
  renderSidebar();
  renderAdminSection();
}

function renderSidebar() {
  const navContainer = document.getElementById('admin-sidebar-nav');
  if (!navContainer) return;

  const activeOrdersCount = store.orders.filter(o => o.status !== 'tolandi').length;
  const outOfStockCount = store.products.filter(p => p.status === 'tugadi').length;

  navContainer.innerHTML = `
    <li class="nav-item-link ${activeAdminTab === 'menu' ? 'active' : ''}" data-tab="menu">
      <div class="nav-item-left">
        <span class="nav-icon">📋</span>
        <span>Menyu Boshqaruvi</span>
      </div>
      <span class="nav-counter-badge gold">${store.products.length}</span>
    </li>
    <li class="nav-item-link ${activeAdminTab === 'inventory' ? 'active' : ''}" data-tab="inventory">
      <div class="nav-item-left">
        <span class="nav-icon">📦</span>
        <span>Omborxona & Zaxira</span>
      </div>
      ${outOfStockCount > 0 ? `<span class="nav-counter-badge" title="${outOfStockCount} ta mahsulot tugagan">${outOfStockCount}</span>` : ''}
    </li>
    <li class="nav-item-link ${activeAdminTab === 'orders' ? 'active' : ''}" data-tab="orders">
      <div class="nav-item-left">
        <span class="nav-icon">🔔</span>
        <span>Buyurtmalar & Kassa</span>
      </div>
      <span class="nav-counter-badge">${activeOrdersCount}</span>
    </li>
    <li class="nav-item-link ${activeAdminTab === 'reports' ? 'active' : ''}" data-tab="reports">
      <div class="nav-item-left">
        <span class="nav-icon">📊</span>
        <span>Hisobotlar & Tushum</span>
      </div>
    </li>
  `;

  navContainer.querySelectorAll('.nav-item-link').forEach(item => {
    item.onclick = () => {
      const tab = item.getAttribute('data-tab');
      setActiveAdminTab(tab);
    };
  });
}

export function renderTopStats() {
  const container = document.getElementById('admin-stats-grid');
  if (!container) return;

  const totalProds = store.products.length;
  const inStockProds = store.products.filter(p => p.status === 'mavjud').length;
  const outStockProds = store.products.filter(p => p.status === 'tugadi').length;
  const ordersCount = store.orders.length;
  const totalRevenue = store.orders.reduce((sum, o) => sum + (o.total || 0), 0);

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-info-block">
        <span class="stat-label">Jami Taomlar</span>
        <span class="stat-value">${totalProds}</span>
        <span class="stat-subtext" style="color: var(--teal-600);">${CATEGORIES.length - 1} ta kategoriya</span>
      </div>
      <div class="stat-icon-wrapper teal">📋</div>
    </div>

    <div class="stat-card">
      <div class="stat-info-block">
        <span class="stat-label">Sotuvda Mavjud</span>
        <span class="stat-value" style="color: #059669;">${inStockProds}</span>
        <span class="stat-subtext" style="color: #059669;">Faol buyurtma uchun tayyor</span>
      </div>
      <div class="stat-icon-wrapper green">✓</div>
    </div>

    <div class="stat-card">
      <div class="stat-info-block">
        <span class="stat-label">Tugagan Mahsulotlar</span>
        <span class="stat-value" style="color: #DC2626;">${outStockProds}</span>
        <span class="stat-subtext" style="color: #DC2626;">Zaxirasi 0 bo'lgan taomlar</span>
      </div>
      <div class="stat-icon-wrapper red">✕</div>
    </div>

    <div class="stat-card">
      <div class="stat-info-block">
        <span class="stat-label">Bugungi Tushum</span>
        <span class="stat-value" style="font-size: 1.25rem; color: var(--gold-800);">
          ${formatCurrency(totalRevenue)}
        </span>
        <span class="stat-subtext" style="color: var(--gold-700);">${ordersCount} ta muvaffaqiyatli buyurtma</span>
      </div>
      <div class="stat-icon-wrapper gold">💰</div>
    </div>
  `;
}

export function renderAdminSection() {
  const container = document.getElementById('admin-dynamic-content');
  if (!container) return;

  if (activeAdminTab === 'menu' || activeAdminTab === 'inventory') {
    renderMenuInventorySection(container);
  } else if (activeAdminTab === 'orders') {
    renderOrdersSection(container);
  } else if (activeAdminTab === 'reports') {
    renderReportsSection(container);
  }
}

// 1. Menu & Inventory Section (With Prominent Green Add Product Button & Live Toggle Switch)
function renderMenuInventorySection(container) {
  const isInventoryMode = activeAdminTab === 'inventory';

  const filtered = store.products.filter(p => {
    const matchesCat = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
    const matchesStatus = adminStatusFilter === 'all' || p.status === adminStatusFilter;
    const matchesSearch = !adminSearchQuery || 
      p.name.toLowerCase().includes(adminSearchQuery) || 
      p.category.toLowerCase().includes(adminSearchQuery);
    return matchesCat && matchesStatus && matchesSearch;
  });

  container.innerHTML = `
    <!-- Controls Header Bar -->
    <div class="admin-table-action-bar">
      <div class="table-filter-group">
        <input 
          type="text" 
          id="admin-filter-search" 
          class="admin-search-input" 
          placeholder="Taom nomini qidirish..." 
          value="${adminSearchQuery}"
        >

        <select id="admin-filter-category" class="admin-select-filter">
          <option value="all">Barcha Kategoriyalar</option>
          ${CATEGORIES.filter(c => c.id !== 'all').map(c => `
            <option value="${c.id}" ${adminCategoryFilter === c.id ? 'selected' : ''}>${c.name}</option>
          `).join('')}
        </select>

        <select id="admin-filter-status" class="admin-select-filter">
          <option value="all" ${adminStatusFilter === 'all' ? 'selected' : ''}>Barcha Holatlar</option>
          <option value="mavjud" ${adminStatusFilter === 'mavjud' ? 'selected' : ''}>🟢 Faqat Mavjud</option>
          <option value="tugadi" ${adminStatusFilter === 'tugadi' ? 'selected' : ''}>🔴 Faqat Tugagan (Tugadi)</option>
        </select>
      </div>

      <!-- Prominent Green Add New Product Button -->
      <button class="btn-add-product-prominent" id="btn-open-add-product-modal">
        <span style="font-size: 1.1rem; line-height: 1;">+</span>
        <span>Yangi Mahsulot Qo'shish</span>
      </button>
    </div>

    <!-- Elevated Product Table -->
    <div class="admin-table-card">
      <div class="responsive-table-wrapper">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th style="width: 70px;">Rasm</th>
              <th>Taom Nomi & Ta'rif</th>
              <th>Kategoriya</th>
              <th>Narxi</th>
              <th>Ombor Qoldig'i</th>
              <th style="text-align: center;">Holati (Jonli Tugma)</th>
              <th style="text-align: right;">Amallar</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                  Hech qanday mahsulot topilmadi
                </td>
              </tr>
            ` : filtered.map(prod => {
              const isChecked = prod.status === 'mavjud';
              return `
                <tr id="admin-product-row-${prod.id}">
                  <td>
                    <img 
                      src="${prod.image}" 
                      alt="${prod.name}" 
                      class="table-product-thumb" 
                      onerror="this.src='assets/images/palov.jpg'"
                    >
                  </td>
                  <td>
                    <div class="table-product-info">
                      <div class="table-product-name">${prod.name}</div>
                      <div class="table-product-desc">${prod.description}</div>
                    </div>
                  </td>
                  <td>
                    <span class="table-category-pill">${prod.category}</span>
                  </td>
                  <td>
                    <div class="table-price-tag">${formatCurrency(prod.price)}</div>
                  </td>
                  <td>
                    <span class="table-stock-badge" style="color: ${prod.stock <= 5 ? '#DC2626' : 'var(--text-secondary)'};">
                      ${prod.stock} porsiya
                    </span>
                  </td>

                  <!-- Live Interactive Toggle Switch ("Mavjud" vs "Tugadi") -->
                  <td style="text-align: center;">
                    <label class="switch-label" title="Holatni darhol o'zgartirish (Mijoz ekranida jonli aks etadi)">
                      <input 
                        type="checkbox" 
                        class="switch-input live-status-toggle" 
                        data-id="${prod.id}" 
                        ${isChecked ? 'checked' : ''}
                      >
                      <span class="switch-slider"></span>
                      <span class="switch-status-text">
                        ${isChecked ? 'Mavjud' : 'Tugadi'}
                      </span>
                    </label>
                  </td>

                  <!-- Edit / Delete Actions -->
                  <td style="text-align: right;">
                    <div class="table-action-btns" style="justify-content: flex-end;">
                      <button 
                        class="btn-table-action edit-product-btn" 
                        data-id="${prod.id}" 
                        title="Tahrirlash"
                      >
                        ✏️
                      </button>
                      <button 
                        class="btn-table-action delete delete-product-btn" 
                        data-id="${prod.id}" 
                        title="O'chirish"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Wire up filter events
  const searchInput = document.getElementById('admin-filter-search');
  if (searchInput) {
    searchInput.oninput = (e) => {
      adminSearchQuery = e.target.value.toLowerCase().trim();
      renderAdminSection();
    };
  }

  const catSelect = document.getElementById('admin-filter-category');
  if (catSelect) {
    catSelect.onchange = (e) => {
      adminCategoryFilter = e.target.value;
      renderAdminSection();
    };
  }

  const statusSelect = document.getElementById('admin-filter-status');
  if (statusSelect) {
    statusSelect.onchange = (e) => {
      adminStatusFilter = e.target.value;
      renderAdminSection();
    };
  }

  // Wire up Prominent Green Add Product button
  const addBtn = document.getElementById('btn-open-add-product-modal');
  if (addBtn) {
    addBtn.onclick = () => openProductModal();
  }

  // Wire up live toggle switch handlers (INSTANT UPDATE CLIENT VIEW)
  container.querySelectorAll('.live-status-toggle').forEach(toggle => {
    toggle.onchange = (e) => {
      const prodId = toggle.getAttribute('data-id');
      const updated = store.toggleProductStatus(prodId);
      
      // Update label text adjacent to slider
      const labelText = toggle.closest('.switch-label').querySelector('.switch-status-text');
      if (labelText && updated) {
        labelText.textContent = updated.status === 'mavjud' ? 'Mavjud' : 'Tugadi';
      }

      renderTopStats();
    };
  });

  // Wire edit buttons
  container.querySelectorAll('.edit-product-btn').forEach(btn => {
    btn.onclick = () => {
      const prodId = btn.getAttribute('data-id');
      const prod = store.products.find(p => p.id === prodId);
      if (prod) openProductModal(prod);
    };
  });

  // Wire delete buttons
  container.querySelectorAll('.delete-product-btn').forEach(btn => {
    btn.onclick = () => {
      const prodId = btn.getAttribute('data-id');
      const prod = store.products.find(p => p.id === prodId);
      if (prod && confirm(`"${prod.name}" taomini ro'yxatdan o'chirmoqchimisiz?`)) {
        store.deleteProduct(prodId);
        renderAdminSection();
        renderTopStats();
      }
    };
  });
}

// 2. Active Orders & Checkout Section (With Explicit "CHEK CHIQARISH" Button)
function renderOrdersSection(container) {
  const filteredOrders = store.orders.filter(o => {
    if (ordersStatusFilter === 'all') return true;
    return o.status === ordersStatusFilter;
  });

  const statuses = [
    { id: 'all', name: 'Barcha Buyurtmalar' },
    { id: 'yangi', name: '🟦 Yangi' },
    { id: 'tayyorlanmoqda', name: '🟨 Tayyorlanmoqda' },
    { id: 'yetkazildi', name: '🟩 Yetkazildi' },
    { id: 'tolandi', name: '⬜ To\'landi' }
  ];

  container.innerHTML = `
    <!-- Orders Filter Tabs -->
    <div class="orders-filter-tabs">
      ${statuses.map(st => `
        <button 
          class="order-filter-tab ${ordersStatusFilter === st.id ? 'active' : ''}" 
          data-status="${st.id}"
        >
          ${st.name} (${st.id === 'all' ? store.orders.length : store.orders.filter(o => o.status === st.id).length})
        </button>
      `).join('')}
    </div>

    <!-- Active Orders Grid -->
    <div class="active-orders-grid">
      ${filteredOrders.length === 0 ? `
        <div style="grid-column: 1 / -1; background: white; padding: 40px; border-radius: var(--radius-lg); text-align: center; color: var(--text-tertiary);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🍽️</div>
          <h4 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--teal-950);">Buyurtmalar yo'q</h4>
          <p style="font-size: 0.8rem; margin-top: 4px;">Mijoz ekrani orqali yangi buyurtma berishingiz mumkin</p>
        </div>
      ` : filteredOrders.map(order => {
        const timeAgo = formatTimeAgo(order.timestamp);
        return `
          <div class="order-card-tile status-${order.status}" id="admin-order-card-${order.id}">
            <div class="order-card-header">
              <span class="order-table-badge">${order.table} • ${order.guestCount ? order.guestCount + ' kishi' : '2 kishi'}</span>
              <div class="order-meta-info">
                <div class="order-id-code">#${order.id}</div>
                <div class="order-timestamp-text">${timeAgo}</div>
              </div>
            </div>

            <div class="order-card-items-body">
              <div class="order-items-compact-list">
                ${order.items.map(i => `
                  <div class="order-item-compact-row">
                    <span class="item-qty-name">
                      <span class="item-qty-pill">${i.quantity}x</span>
                      <span>${i.name}</span>
                    </span>
                    <span class="item-total-cost">${formatCurrency(i.price * i.quantity)}</span>
                  </div>
                `).join('')}
              </div>

              ${order.notes ? `
                <div class="order-note-box">
                  <strong>Izoh:</strong> ${order.notes}
                </div>
              ` : ''}
            </div>

            <div class="order-card-financials">
              <div class="order-total-sum-block">
                <span class="total-sum-label">Jami Summa (10% xizmat bilan)</span>
                <span class="total-sum-value">${formatCurrency(order.total)}</span>
              </div>
              <span class="order-status-badge ${order.status}">
                ${formatStatusTitle(order.status)}
              </span>
            </div>

            <!-- Action Bar with EXPLICIT "CHEK CHIQARISH" Button -->
            <div class="order-card-action-bar">
              <select class="order-status-select change-order-status" data-id="${order.id}">
                <option value="yangi" ${order.status === 'yangi' ? 'selected' : ''}>Yangi</option>
                <option value="tayyorlanmoqda" ${order.status === 'tayyorlanmoqda' ? 'selected' : ''}>Tayyorlanmoqda</option>
                <option value="yetkazildi" ${order.status === 'yetkazildi' ? 'selected' : ''}>Yetkazildi</option>
                <option value="tolandi" ${order.status === 'tolandi' ? 'selected' : ''}>To'landi</option>
              </select>

              <!-- Explicit CHEK CHIQARISH (Thermal Receipt Print) Button -->
              <button 
                class="btn-print-receipt btn-trigger-print-receipt" 
                data-id="${order.id}" 
                title="80mm termal printer uchun fiskal chek chiqarish"
                id="btn-print-receipt-${order.id}"
              >
                <span>🖨️</span>
                <span>CHEK CHIQARISH</span>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Wire status tabs
  container.querySelectorAll('.order-filter-tab').forEach(tab => {
    tab.onclick = () => {
      ordersStatusFilter = tab.getAttribute('data-status');
      renderOrdersSection(container);
    };
  });

  // Wire status change dropdown
  container.querySelectorAll('.change-order-status').forEach(select => {
    select.onchange = (e) => {
      const orderId = select.getAttribute('data-id');
      store.updateOrderStatus(orderId, e.target.value);
      renderSidebar();
      renderOrdersSection(container);
    };
  });

  // Wire explicit CHEK CHIQARISH button
  container.querySelectorAll('.btn-trigger-print-receipt').forEach(btn => {
    btn.onclick = () => {
      const orderId = btn.getAttribute('data-id');
      const order = store.orders.find(o => o.id === orderId);
      if (order) {
        openThermalReceiptModal(order);
      }
    };
  });
}

// 3. Reports & Hisobotlar Section
function renderReportsSection(container) {
  const totalRevenue = store.orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgCheck = store.orders.length ? Math.round(totalRevenue / store.orders.length) : 0;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      <div style="background: white; border-radius: var(--radius-lg); padding: 22px; border: 1px solid var(--surface-border); box-shadow: var(--shadow-sm);">
        <h4 style="font-family: var(--font-display); font-size: 1.1rem; color: var(--teal-950); margin-bottom: 14px;">
          📊 Kunlik Moliyaviy Tushum
        </h4>
        <div style="font-size: 2rem; font-family: var(--font-display); font-weight: 800; color: var(--gold-800);">
          ${formatCurrency(totalRevenue)}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
          O'rtacha chek miqdori: <strong>${formatCurrency(avgCheck)}</strong>
        </div>

        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
            <span>Karta / Payme orqali:</span>
            <strong>65%</strong>
          </div>
          <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
            <div style="width: 65%; height: 100%; background: var(--teal-700);"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-top: 6px;">
            <span>Naqd pul orqali:</span>
            <strong>35%</strong>
          </div>
          <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
            <div style="width: 35%; height: 100%; background: var(--gold-500);"></div>
          </div>
        </div>
      </div>

      <div style="background: white; border-radius: var(--radius-lg); padding: 22px; border: 1px solid var(--surface-border); box-shadow: var(--shadow-sm);">
        <h4 style="font-family: var(--font-display); font-size: 1.1rem; color: var(--teal-950); margin-bottom: 14px;">
          ⭐ Eng Xaridorgir Choyxona Taomlari
        </h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
            <span>1. Toshkent Choyxona Palovi</span>
            <strong style="color: var(--teal-900);">42 porsiya</strong>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
            <span>2. Gijduvoncha Qiyma Shashlik</span>
            <strong style="color: var(--teal-900);">38 dona</strong>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
            <span>3. Samovar Ko'k Choy (Limon & Navat)</span>
            <strong style="color: var(--teal-900);">56 choynak</strong>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
            <span>4. Qozon Kabob (Maxsus)</span>
            <strong style="color: var(--teal-900);">24 porsiya</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add / Edit Product Modal Controller
export function openProductModal(product = null) {
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  const form = document.getElementById('product-modal-form');
  if (!modal || !form) return;

  const isEditing = Boolean(product);
  if (title) {
    title.textContent = isEditing ? "Taomni Tahrirlash" : "Yangi Mahsulot Qo'shish";
  }

  // Preload values
  document.getElementById('modal-prod-id').value = isEditing ? product.id : '';
  document.getElementById('modal-prod-name').value = isEditing ? product.name : '';
  document.getElementById('modal-prod-category').value = isEditing ? product.category : 'Asosiy Taomlar';
  document.getElementById('modal-prod-price').value = isEditing ? product.price : '';
  document.getElementById('modal-prod-stock').value = isEditing ? product.stock : 20;
  document.getElementById('modal-prod-desc').value = isEditing ? product.description : '';
  document.getElementById('modal-prod-image').value = isEditing ? product.image : 'assets/images/palov.jpg';
  document.getElementById('modal-prod-status').value = isEditing ? product.status : 'mavjud';

  modal.classList.add('active');
}

export function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('active');
}

function bindAdminEvents() {
  // Modal save form submit
  const form = document.getElementById('product-modal-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const id = document.getElementById('modal-prod-id').value;
      const name = document.getElementById('modal-prod-name').value.trim();
      const category = document.getElementById('modal-prod-category').value;
      const price = Number(document.getElementById('modal-prod-price').value);
      const stock = Number(document.getElementById('modal-prod-stock').value);
      const description = document.getElementById('modal-prod-desc').value.trim();
      const image = document.getElementById('modal-prod-image').value.trim();
      const status = document.getElementById('modal-prod-status').value;

      if (!name || isNaN(price)) {
        alert("Iltimos, taom nomi va narxini to'g'ri kiriting!");
        return;
      }

      if (id) {
        // Update existing
        store.updateProduct(id, { name, category, price, stock, description, image, status });
      } else {
        // Add new
        store.addProduct({ name, category, price, stock, description, image, status });
      }

      closeProductModal();
      renderAdminSection();
      renderTopStats();
    };
  }

  // Quick preset image selector buttons inside modal
  const imagePresets = document.querySelectorAll('.image-preset-option');
  imagePresets.forEach(imgBtn => {
    imgBtn.onclick = () => {
      const src = imgBtn.getAttribute('data-img-src');
      const input = document.getElementById('modal-prod-image');
      if (input) input.value = src;
    };
  });
}

function formatStatusTitle(status) {
  switch (status) {
    case 'yangi': return 'Yangi';
    case 'tayyorlanmoqda': return 'Oshxonada';
    case 'yetkazildi': return 'Yetkazildi';
    case 'tolandi': return 'To\'landi';
    default: return status;
  }
}

function formatTimeAgo(isoString) {
  if (!isoString) return 'hozir';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return 'Hozirgina';
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min} daqiqa oldin`;
  const hrs = Math.floor(min / 60);
  return `${hrs} soat oldin`;
}
