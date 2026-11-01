import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data.js';

class SamovarStore {
  constructor() {
    this.storageKeyProducts = 'samovar_products_v3';
    this.storageKeyOrders = 'samovar_orders_v3';
    this.storageKeyCart = 'samovar_cart_v3';
    this.storageKeyTable = 'samovar_selected_table_v3';
    this.storageKeyGuests = 'samovar_guest_count_v3';
    this.storageKeyTableConfirmed = 'samovar_table_confirmed_v3';

    this.products = this.loadProducts();
    this.orders = this.loadOrders();
    this.cart = this.loadCart();
    
    // Table & Guests state
    this.selectedTable = localStorage.getItem(this.storageKeyTable) || 'Stol 1';
    this.guestCount = parseInt(localStorage.getItem(this.storageKeyGuests)) || 2;
    this.isTableConfirmed = localStorage.getItem(this.storageKeyTableConfirmed) === 'true';

    // Views & Auth
    this.currentView = 'client'; // 'client' | 'admin'
    this.isAdminLoggedIn = false; // Strictly requires PIN "1234"

    this.activeCategory = 'all';
    this.searchQuery = '';
    this.listeners = [];

    // Web Audio API for teahouse notification chime
    this.audioCtx = null;
  }

  loadProducts() {
    try {
      const saved = localStorage.getItem(this.storageKeyProducts);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved products:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  }

  loadOrders() {
    try {
      const saved = localStorage.getItem(this.storageKeyOrders);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved orders:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_ORDERS));
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKeyCart);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved cart:', e);
    }
    return {};
  }

  saveProducts() {
    localStorage.setItem(this.storageKeyProducts, JSON.stringify(this.products));
    this.notify('products-updated');
  }

  saveOrders() {
    localStorage.setItem(this.storageKeyOrders, JSON.stringify(this.orders));
    this.notify('orders-updated');
  }

  saveCart() {
    localStorage.setItem(this.storageKeyCart, JSON.stringify(this.cart));
    this.notify('cart-updated');
  }

  // --- TABLE & GUEST SELECTION ---

  setTableAndGuests(table, guests) {
    this.selectedTable = table;
    this.guestCount = Math.max(1, parseInt(guests) || 1);
    this.isTableConfirmed = true;

    localStorage.setItem(this.storageKeyTable, this.selectedTable);
    localStorage.setItem(this.storageKeyGuests, this.guestCount.toString());
    localStorage.setItem(this.storageKeyTableConfirmed, 'true');

    this.playTone(600, 0.12);
    this.notify('table-guests-updated', { table: this.selectedTable, guestCount: this.guestCount });
  }

  // --- ADMIN AUTHENTICATION (STRICT PIN: 1234) ---

  loginAdmin(pin) {
    if (pin && pin.trim() === '1234') {
      this.isAdminLoggedIn = true;
      this.currentView = 'admin';
      this.playTone(880, 0.15);
      this.notify('admin-login-success');
      this.notify('view-changed', 'admin');
      return true;
    }
    this.playTone(220, 0.25); // Error tone
    return false;
  }

  logoutAdmin() {
    this.isAdminLoggedIn = false;
    this.currentView = 'client';
    this.notify('admin-logout');
    this.notify('view-changed', 'client');
  }

  setView(view) {
    if (view === 'admin' && !this.isAdminLoggedIn) {
      this.notify('admin-login-required');
      return;
    }
    this.currentView = view;
    this.notify('view-changed', view);
  }

  setCategory(catId) {
    this.activeCategory = catId;
    this.notify('category-changed');
  }

  setSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.notify('search-changed');
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, payload = null) {
    this.listeners.forEach(fn => {
      try {
        fn(event, payload);
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }

  // --- PRODUCT MANAGEMENT ---

  toggleProductStatus(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Toggle between 'mavjud' and 'tugadi'
    const newStatus = product.status === 'mavjud' ? 'tugadi' : 'mavjud';
    product.status = newStatus;

    // If marked out of stock, zero out from cart
    if (newStatus === 'tugadi' && this.cart[productId]) {
      delete this.cart[productId];
      this.saveCart();
    }

    this.saveProducts();
    this.playTone(newStatus === 'mavjud' ? 523.25 : 329.63, 0.15);
    return product;
  }

  addProduct(newProduct) {
    const id = 'prod-' + Date.now();
    const product = {
      id,
      name: newProduct.name,
      category: newProduct.category || 'Asosiy Taomlar',
      price: Number(newProduct.price) || 0,
      stock: Number(newProduct.stock) || 0,
      status: newProduct.status || 'mavjud',
      image: newProduct.image || 'assets/images/palov.jpg',
      description: newProduct.description || '',
      badge: newProduct.badge || null,
      isChefSpecial: Boolean(newProduct.isChefSpecial)
    };
    this.products.unshift(product);
    this.saveProducts();
    this.playOrderChime();
    return product;
  }

  updateProduct(id, updateData) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.products[index] = {
      ...this.products[index],
      ...updateData,
      price: Number(updateData.price) || this.products[index].price,
      stock: Number(updateData.stock) ?? this.products[index].stock
    };

    if (this.products[index].status === 'tugadi' && this.cart[id]) {
      delete this.cart[id];
      this.saveCart();
    }

    this.saveProducts();
    return this.products[index];
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    if (this.cart[id]) {
      delete this.cart[id];
      this.saveCart();
    }
    this.saveProducts();
  }

  resetToDefault() {
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.cart = {};
    this.selectedTable = 'Stol 1';
    this.guestCount = 2;
    this.isTableConfirmed = false;
    this.saveProducts();
    this.saveOrders();
    this.saveCart();
    localStorage.removeItem(this.storageKeyTableConfirmed);
    this.notify('all-reset');
  }

  // --- CART MANAGEMENT ---

  addToCart(productId, qty = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product || product.status === 'tugadi') {
      return false; // Can't add out of stock items
    }

    const currentQty = this.cart[productId] || 0;
    this.cart[productId] = currentQty + qty;
    this.saveCart();
    this.playTone(659.25, 0.1);
    return true;
  }

  decrementCart(productId) {
    if (!this.cart[productId]) return;
    if (this.cart[productId] <= 1) {
      delete this.cart[productId];
    } else {
      this.cart[productId] -= 1;
    }
    this.saveCart();
    this.playTone(440, 0.08);
  }

  setCartQuantity(productId, qty) {
    const product = this.products.find(p => p.id === productId);
    if (!product || product.status === 'tugadi') return;

    if (qty <= 0) {
      delete this.cart[productId];
    } else {
      this.cart[productId] = qty;
    }
    this.saveCart();
  }

  removeFromCart(productId) {
    if (this.cart[productId]) {
      delete this.cart[productId];
      this.saveCart();
    }
  }

  clearCart() {
    this.cart = {};
    this.saveCart();
  }

  getCartItems() {
    const items = [];
    for (const [id, qty] of Object.entries(this.cart)) {
      const prod = this.products.find(p => p.id === id);
      if (prod && prod.status === 'mavjud') {
        items.push({
          product: prod,
          quantity: qty,
          totalPrice: prod.price * qty
        });
      }
    }
    return items;
  }

  getCartSummary() {
    const items = this.getCartItems();
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const serviceFee = Math.round(subtotal * 0.1); // 10% Choyxona xizmat haqi
    const total = subtotal + serviceFee;

    return {
      items,
      count,
      subtotal,
      serviceFee,
      total
    };
  }

  // --- ORDER PLACEMENT (TABLE & GUEST COUNT INCLUDED) ---

  placeOrder(customerNotes = '', paymentMethod = 'Karta / Naqd') {
    const summary = this.getCartSummary();
    if (summary.items.length === 0) return null;

    const orderNumber = 'SMV-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: orderNumber,
      table: this.selectedTable || 'Stol 1',
      guestCount: this.guestCount || 2,
      timestamp: new Date().toISOString(),
      status: 'yangi',
      items: summary.items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity
      })),
      notes: customerNotes.trim(),
      serviceFeePercent: 10,
      subtotal: summary.subtotal,
      serviceFee: summary.serviceFee,
      total: summary.total,
      waiter: 'Oktamboyev Ozodbek (Kassa #1)',
      paymentMethod: paymentMethod
    };

    // Deduct stock for products
    summary.items.forEach(item => {
      const p = this.products.find(prod => prod.id === item.product.id);
      if (p && p.stock > 0) {
        p.stock = Math.max(0, p.stock - item.quantity);
        if (p.stock === 0) {
          p.status = 'tugadi';
        }
      }
    });

    this.orders.unshift(newOrder);
    this.clearCart();
    this.saveProducts();
    this.saveOrders();
    this.playOrderChime();
    this.notify('order-placed', newOrder);

    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = newStatus;
    this.saveOrders();
    this.playTone(587.33, 0.12);
    return order;
  }

  // --- AUDIO SYNTHESIZER ---

  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
  }

  playTone(freq, duration = 0.1) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  playOrderChime() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        setTimeout(() => {
          this.playTone(freq, 0.25);
        }, index * 100);
      });
    } catch (e) {
      // Ignore
    }
  }
}

export const store = new SamovarStore();
