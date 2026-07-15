/**
 * Cart Component - Enhanced Shopping Cart for Booking
 * Integrates with kode tenant system
 */
import CartStorage from '../services/cart-storage.service.js';
import { formatCurrency, formatDate, formatItemType, formatPriceType } from '../utils/format.js';
import Toast from './toast.component.js';

class Cart {
  /**
   * Get cart from storage
   */
  static getCart() {
    return CartStorage.getCart();
  }

  /**
   * Save cart to storage
   */
  static saveCart(cart) {
    return CartStorage.saveCart(cart);
  }

  /**
   * Add item to cart with validation
   */
  static addItem(item, quantity = 1, days = 1) {
    return CartStorage.addItem(item, quantity, days);
  }

  /**
   * Update item in cart
   */
  static updateItem(itemId, updates) {
    const cart = this.getCart();
    const item = cart.items.find(i => i.item_id === itemId);

    if (item) {
      if (updates.quantity !== undefined) {
        CartStorage.updateQuantity(itemId, updates.quantity, updates.days);
      } else if (updates.days !== undefined) {
        CartStorage.updateItemDays(itemId, updates.days);
      }
      this.updateUI();
    }
  }

  /**
   * Remove item from cart
   */
  static removeItem(itemId) {
    CartStorage.removeItem(itemId);
    this.updateUI();
  }

  /**
   * Update item quantity
   */
  static updateQuantity(itemId, quantity, days = null) {
    CartStorage.updateQuantity(itemId, quantity, days);
    this.updateUI();
  }

  /**
   * Set booking dates for all items
   */
  static setDates(startDate, endDate) {
    CartStorage.setDates(startDate, endDate);
    this.updateUI();
  }

  /**
   * Set notes for booking
   */
  static setNotes(notes) {
    CartStorage.setNotes(notes);
  }

  /**
   * Set booking price details
   */
  static setBookingPrice(priceDetails) {
    CartStorage.setPriceDetails(priceDetails);
  }

  /**
   * Get booking price breakdown
   */
  static getPriceBreakdown() {
    return CartStorage.getPriceBreakdown();
  }

  /**
   * Clear entire cart
   */
  static clear() {
    CartStorage.clear();
    this.updateUI();
    Toast.info('Keranjang dikosongkan');
  }

  /**
   * Confirm clear cart - shows confirmation first
   */
  static confirmClear() {
    if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      this.clear();
    }
  }

  /**
   * Get item count
   */
  static getItemCount() {
    return CartStorage.getItemCount();
  }

  /**
   * Get unique item count
   */
  static getUniqueItemCount() {
    return CartStorage.getUniqueItemCount();
  }

  /**
   * Calculate subtotal
   */
  static getSubtotal() {
    return CartStorage.getSubtotal();
  }

  /**
   * Check if cart is empty
   */
  static isEmpty() {
    return CartStorage.isEmpty();
  }

  /**
   * Check if dates are set
   */
  static hasDates() {
    return CartStorage.hasDates();
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
    // Debounce UI updates for rapid changes
    clearTimeout(this._uiUpdateTimeout);
    this._uiUpdateTimeout = setTimeout(() => {
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

      // Update drawer count in header
      const drawerCount = document.getElementById('cart-drawer-count');
      if (drawerCount) {
        drawerCount.textContent = `${itemCount} item`;
      }
    }, 50);
  }

  /**
   * Force immediate UI update (bypass debounce)
   */
  static updateUINow() {
    clearTimeout(this._uiUpdateTimeout);
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
        <!-- Cart Header with Clear Button -->
        <div class="cart-header">
          <span class="cart-item-count">${cart.items.length} item${cart.items.length > 1 ? 's' : ''}</span>
          <button class="cart-clear-btn" onclick="Cart.confirmClear()" title="Kosongkan keranjang">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Kosongkan
          </button>
        </div>

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
            <span class="cart-item-unit">${formatPriceType(item.price_type)}</span>
          </div>
          <div class="cart-item-footer">
            <div class="cart-item-footer-left">
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
            </div>
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
    return CartStorage.prepareForCheckout();
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
    // Render cart drawer if not exists
    if (!document.getElementById('cart-drawer')) {
      document.body.insertAdjacentHTML('beforeend', this.renderDrawerHTML());
    }

    // Setup cross-tab sync
    this.setupCrossTabSync();

    // Update UI
    this.updateUI();

    console.log('[Cart] Initialized with kode tenant:', CartStorage.getKodeTenant());
  }

  /**
   * Setup cross-tab synchronization using storage event
   */
  static setupCrossTabSync() {
    // Remove any existing listener to prevent duplicates
    if (this._storageListener) {
      window.removeEventListener('storage', this._storageListener);
    }

    // Create listener for storage changes from other tabs
    this._storageListener = (event) => {
      // Check if cart storage was changed in another tab
      if (event.key === 'wb_cart') {
        console.log('[Cart] Detected cart change from another tab');

        // Parse old and new values
        let oldCount = 0;
        let newCount = 0;
        try {
          const oldCart = event.oldValue ? JSON.parse(event.oldValue) : null;
          oldCount = oldCart?.items?.length || 0;
          const newCart = event.newValue ? JSON.parse(event.newValue) : null;
          newCount = newCart?.items?.length || 0;
        } catch (e) {
          // Ignore parse errors
        }

        // Immediate UI update for cross-tab changes
        this.updateUINow();

        // Show notification if cart was cleared in another tab
        if (newCount === 0 && oldCount > 0) {
          Toast.info('Keranjang dikosongkan dari tab lain');
          this.closeDrawer();
        } else if (newCount < oldCount) {
          Toast.info('Item dihapus dari keranjang di tab lain');
        } else if (newCount > oldCount) {
          Toast.info(`${newCount - oldCount} item ditambahkan ke keranjang di tab lain`);
        }
      }
    };

    // Add event listener
    window.addEventListener('storage', this._storageListener);

    // Also listen for internal sync events
    window.addEventListener('cart:sync', () => {
      this.updateUINow();
    });

    console.log('[Cart] Cross-tab sync enabled');
  }

  /**
   * Cleanup cross-tab sync listener
   */
  static destroy() {
    if (this._storageListener) {
      window.removeEventListener('storage', this._storageListener);
      this._storageListener = null;
    }
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
