/**
 * Cart Component - Enhanced Shopping Cart for Booking
 * Integrates with kode tenant system
 */
import Storage from '../utils/storage.js';
import { formatCurrency, formatDate, formatItemType, formatPriceType } from '../utils/format.js';
import Toast from './toast.component.js';

class Cart {
  /**
   * Get cart from storage
   */
  static getCart() {
    return Storage.get('cart', {
      items: [],
      dates: null,
      notes: '',
      priceDetails: null,
      kodeTenant: Storage.get('tenant_code') || 'MAJU1234' // Default kode tenant
    });
  }

  /**
   * Save cart to storage
   */
  static saveCart(cart) {
    // Always ensure kode tenant is set
    cart.kodeTenant = Storage.get('tenant_code') || 'MAJU1234';
    Storage.set('cart', cart);
  }

  /**
   * Add item to cart with validation
   */
  static addItem(item, quantity = 1, days = 1) {
    const cart = this.getCart();

    // Validate item
    if (!item || !item.id) {
      console.error('[Cart] Invalid item:', item);
      return null;
    }

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex(i => i.item_id === item.id);

    if (existingIndex >= 0) {
      // Update existing item
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].days = days;
      cart.items[existingIndex].totalPrice =
        cart.items[existingIndex].price *
        cart.items[existingIndex].quantity *
        cart.items[existingIndex].days;
    } else {
      // Add new item
      const itemData = {
        item_id: item.id,
        item_uuid: item.id,
        name: item.name,
        type: item.type,
        price: item.price,
        price_type: item.priceType || item.price_type || 'per_day',
        quantity: quantity,
        days: days,
        totalPrice: item.price * quantity * days,
        image: this._extractImage(item.images),
        specifications: item.specifications || {},
        // Store kode tenant for API calls
        kodeTenant: Storage.get('tenant_code') || 'MAJU1234'
      };
      cart.items.push(itemData);
    }

    this.saveCart(cart);
    this.updateUI();

    console.log('[Cart] Item added:', item.name, { quantity, days });
    return cart;
  }

  /**
   * Extract primary image from item
   */
  static _extractImage(images) {
    if (!images || !Array.isArray(images)) return null;
    if (typeof images[0] === 'string') return images[0];
    if (images[0]?.url) return images[0].url;
    return null;
  }

  /**
   * Update item in cart
   */
  static updateItem(itemId, updates) {
    const cart = this.getCart();
    const item = cart.items.find(i => i.item_id === itemId);

    if (item) {
      // Apply updates
      if (updates.quantity !== undefined) {
        item.quantity = Math.max(1, updates.quantity);
      }
      if (updates.days !== undefined) {
        item.days = Math.max(1, updates.days);
      }
      if (updates.startDate !== undefined) {
        item.startDate = updates.startDate;
      }
      if (updates.endDate !== undefined) {
        item.endDate = updates.endDate;
      }

      // Recalculate total price
      item.totalPrice = item.price * item.quantity * item.days;

      this.saveCart(cart);
      this.updateUI();
    }
  }

  /**
   * Remove item from cart
   */
  static removeItem(itemId) {
    const cart = this.getCart();
    const itemIndex = cart.items.findIndex(i => i.item_id === itemId);

    if (itemIndex >= 0) {
      const removedItem = cart.items[itemIndex];
      cart.items.splice(itemIndex, 1);
      this.saveCart(cart);
      this.updateUI();

      Toast.info(`${removedItem.name} dihapus dari keranjang`);
    }
  }

  /**
   * Update item quantity
   */
  static updateQuantity(itemId, quantity, days = null) {
    const cart = this.getCart();
    const item = cart.items.find(i => i.item_id === itemId);

    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
        if (days !== null) {
          item.days = days;
        }
        item.totalPrice = item.price * item.quantity * item.days;
        this.saveCart(cart);
        this.updateUI();
      }
    }
  }

  /**
   * Set booking dates for all items
   */
  static setDates(startDate, endDate) {
    const cart = this.getCart();
    cart.dates = { startDate, endDate };

    // Update each item with dates
    cart.items.forEach(item => {
      item.startDate = startDate;
      item.endDate = endDate;

      // Recalculate duration based on dates
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        item.days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        item.totalPrice = item.price * item.quantity * item.days;
      }
    });

    this.saveCart(cart);
    this.updateUI();

    console.log('[Cart] Dates set:', { startDate, endDate });
  }

  /**
   * Set notes for booking
   */
  static setNotes(notes) {
    const cart = this.getCart();
    cart.notes = notes || '';
    this.saveCart(cart);
  }

  /**
   * Set booking price details
   */
  static setBookingPrice(priceDetails) {
    const cart = this.getCart();
    cart.priceDetails = priceDetails;
    this.saveCart(cart);
  }

  /**
   * Get booking price breakdown
   */
  static getPriceBreakdown() {
    const cart = this.getCart();
    const items = cart.items || [];

    const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const itemCount = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalDays = Math.max(...items.map(i => i.days || 1), 1);

    return {
      items: items,
      subtotal: subtotal,
      itemCount: itemCount,
      totalQuantity: totalQuantity,
      totalDays: totalDays,
      dates: cart.dates,
      notes: cart.notes
    };
  }

  /**
   * Clear entire cart
   */
  static clear() {
    Storage.remove('cart');
    this.updateUI();
    Toast.info('Keranjang dikosongkan');
  }

  /**
   * Get item count
   */
  static getItemCount() {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get unique item count (not total quantity)
   */
  static getUniqueItemCount() {
    const cart = this.getCart();
    return cart.items.length;
  }

  /**
   * Calculate subtotal
   */
  static getSubtotal() {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity * item.days), 0);
  }

  /**
   * Check if cart is empty
   */
  static isEmpty() {
    const cart = this.getCart();
    return !cart.items || cart.items.length === 0;
  }

  /**
   * Check if dates are set
   */
  static hasDates() {
    const cart = this.getCart();
    return cart.dates && cart.dates.startDate && cart.dates.endDate;
  }

  /**
   * Open cart drawer
   */
  static openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');

    if (drawer) {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    if (backdrop) {
      backdrop.classList.add('open');
    }
  }

  /**
   * Close cart drawer
   */
  static closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');

    if (drawer) {
      drawer.classList.remove('open');
    }
    if (backdrop) {
      backdrop.classList.remove('open');
    }
    document.body.style.overflow = '';
  }

  /**
   * Toggle cart drawer
   */
  static toggleDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer?.classList.contains('open')) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  /**
   * Update UI - badge and drawer content
   */
  static updateUI() {
    const cart = this.getCart();
    const itemCount = this.getItemCount();

    // Update cart badge if exists
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = itemCount;
      badge.style.display = itemCount > 0 ? 'flex' : 'none';
    }

    // Update mobile cart indicator
    const mobileBadge = document.getElementById('mobile-cart-badge');
    if (mobileBadge) {
      mobileBadge.textContent = itemCount;
      mobileBadge.style.display = itemCount > 0 ? 'flex' : 'none';
    }

    // Update drawer content
    const drawerBody = document.getElementById('cart-drawer-body');
    if (drawerBody) {
      drawerBody.innerHTML = this.renderDrawerContent();
      this.attachDrawerEvents();
    }
  }

  /**
   * Render drawer content
   */
  static renderDrawerContent() {
    const cart = this.getCart();
    const isEmpty = !cart.items || cart.items.length === 0;

    if (isEmpty) {
      return `
        <div class="cart-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <h3>Keranjang Kosong</h3>
          <p>Belum ada item yang ditambahkan</p>
          <a href="/katalog" class="btn btn-primary" onclick="Cart.closeDrawer()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Lihat Katalog
          </a>
        </div>
      `;
    }

    return `
      <div class="cart-content">
        <!-- Items List -->
        <div class="cart-items">
          ${cart.items.map(item => this._renderCartItem(item)).join('')}
        </div>

        <!-- Date Selection -->
        <div class="cart-dates-section">
          <h4 class="cart-section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            Tanggal Booking
          </h4>
          ${cart.dates ? `
            <div class="cart-dates-display">
              <div class="date-chip">
                <span class="date-label">Mulai</span>
                <span class="date-value">${formatDate(cart.dates.startDate, { day: 'numeric', month: 'short' })}</span>
              </div>
              <div class="date-separator">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
              <div class="date-chip">
                <span class="date-label">Selesai</span>
                <span class="date-value">${formatDate(cart.dates.endDate, { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="Cart.openDateEditor()">Ubah Tanggal</button>
          ` : `
            <div class="cart-dates-empty">
              <p>Belum ada tanggal yang dipilih</p>
              <button class="btn btn-sm btn-outline" onclick="Cart.selectDates()">Pilih Tanggal</button>
            </div>
          `}
        </div>

        <!-- Price Summary -->
        <div class="cart-summary">
          <div class="summary-header">
            <h4>Ringkasan</h4>
            <span class="item-count">${this.getUniqueItemCount()} item</span>
          </div>

          <div class="summary-items">
            ${cart.items.map(item => `
              <div class="summary-item">
                <span class="summary-item-name">
                  ${item.name}
                  ${item.quantity > 1 ? `<span class="summary-item-qty">x${item.quantity}</span>` : ''}
                </span>
                <span class="summary-item-price">${formatCurrency(item.totalPrice)}</span>
              </div>
            `).join('')}
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row">
            <span>Subtotal</span>
            <span class="summary-subtotal">${formatCurrency(this.getSubtotal())}</span>
          </div>

          <div class="summary-row summary-note">
            <span>Tax &amp; fees</span>
            <span class="summary-note-text">Akan dihitung saat checkout</span>
          </div>

          <div class="summary-total">
            <span>Total</span>
            <span class="summary-total-value">${formatCurrency(this.getSubtotal())}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="cart-actions">
          <button class="btn btn-primary btn-lg btn-block" onclick="Cart.proceedToBooking()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Lanjutkan ke Booking
          </button>
          <button class="btn btn-outline btn-block" onclick="Cart.continueShopping()">
            Lihat Katalog
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render individual cart item
   */
  static _renderCartItem(item) {
    return `
      <div class="cart-item" data-item-id="${item.item_id}">
        <div class="cart-item-image">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
            : `<div class="cart-item-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
               </div>`
          }
        </div>
        <div class="cart-item-details">
          <div class="cart-item-header">
            <span class="cart-item-type">${formatItemType(item.type)}</span>
            <button class="cart-item-remove" onclick="Cart.removeItem('${item.item_id}')" aria-label="Hapus item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-meta">
            <span class="cart-item-price">${formatCurrency(item.price)}</span>
            <span class="cart-item-unit">${formatPriceType(item.priceType || item.price_type)}</span>
          </div>
          <div class="cart-item-footer">
            <div class="cart-item-qty">
              <button class="qty-btn-sm" onclick="Cart.updateQuantity('${item.item_id}', ${item.quantity - 1}, ${item.days})">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
              </button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn-sm" onclick="Cart.updateQuantity('${item.item_id}', ${item.quantity + 1}, ${item.days})">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </button>
            </div>
            <span class="cart-item-days">${item.days} hari</span>
            <span class="cart-item-total">${formatCurrency(item.totalPrice)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach drawer events
   */
  static attachDrawerEvents() {
    const closeBtn = document.getElementById('cart-drawer-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeDrawer();
    }

    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (backdrop) {
      backdrop.onclick = () => this.closeDrawer();
    }

    // ESC key to close
    document.addEventListener('keydown', this._handleEscKey);
  }

  /**
   * Handle ESC key
   */
  static _handleEscKey = (e) => {
    if (e.key === 'Escape') {
      this.closeDrawer();
      document.removeEventListener('keydown', this._handleEscKey);
    }
  }

  /**
   * Open date editor modal
   */
  static openDateEditor() {
    Toast.info('Pilih tanggal dari halaman item');
    this.closeDrawer();
  }

  /**
   * Select dates
   */
  static selectDates() {
    this.closeDrawer();
    if (window.navigateTo) {
      window.navigateTo('/katalog');
    }
  }

  /**
   * Continue shopping
   */
  static continueShopping() {
    this.closeDrawer();
    if (window.navigateTo) {
      window.navigateTo('/katalog');
    }
  }

  /**
   * Proceed to booking
   */
  static proceedToBooking() {
    const cart = this.getCart();

    // Validate cart
    if (this.isEmpty()) {
      Toast.warning('Keranjang masih kosong');
      return;
    }

    // Close drawer
    this.closeDrawer();

    // Navigate to booking page
    if (window.navigateTo) {
      window.navigateTo('/booking');
    }
  }

  /**
   * Prepare cart data for API submission
   */
  static prepareForCheckout() {
    const cart = this.getCart();
    const kodeTenant = Storage.get('tenant_code') || 'MAJU1234';

    return {
      kodeTenant: kodeTenant,
      items: cart.items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        start_date: cart.dates?.startDate || item.startDate,
        end_date: cart.dates?.endDate || item.endDate,
        days: item.days,
        price_per_unit: item.price,
        subtotal: item.totalPrice
      })),
      dates: cart.dates,
      notes: cart.notes,
      subtotal: this.getSubtotal()
    };
  }

  /**
   * Render cart drawer HTML
   */
  static renderDrawerHTML() {
    return `
      <div class="modal-backdrop cart-backdrop" id="cart-drawer-backdrop"></div>
      <div class="cart-drawer" id="cart-drawer">
        <div class="cart-drawer-header">
          <div class="cart-drawer-title-area">
            <h3 class="cart-drawer-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Keranjang Booking
            </h3>
            <span class="cart-drawer-count" id="cart-drawer-count">${this.getItemCount()} item</span>
          </div>
          <button class="cart-drawer-close" id="cart-drawer-close" aria-label="Tutup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="cart-drawer-body" id="cart-drawer-body">
          ${this.renderDrawerContent()}
        </div>
      </div>
    `;
  }

  /**
   * Initialize cart
   */
  static init() {
    // Ensure kode tenant is set
    const kodeTenant = Storage.get('tenant_code');
    if (!kodeTenant) {
      Storage.set('tenant_code', 'MAJU1234');
    }

    // Render cart drawer if not exists
    if (!document.getElementById('cart-drawer')) {
      document.body.insertAdjacentHTML('beforeend', this.renderDrawerHTML());
    }

    // Update UI
    this.updateUI();

    console.log('[Cart] Initialized with kode tenant:', kodeTenant || 'MAJU1234');
  }
}

// Make Cart globally accessible
window.Cart = Cart;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Cart.init());
} else {
  Cart.init();
}

export default Cart;
