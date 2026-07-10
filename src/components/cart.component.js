/**
 * Cart Component
 */
import Storage from '../utils/storage.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import Toast from './toast.component.js';

class Cart {
  /**
   * Get cart from storage
   */
  static getCart() {
    return Storage.get('cart', { items: [], dates: null });
  }

  /**
   * Save cart to storage
   */
  static saveCart(cart) {
    Storage.set('cart', cart);
  }

  /**
   * Add item to cart
   */
  static addItem(item, quantity = 1, days = 1) {
    const cart = this.getCart();

    const existingIndex = cart.items.findIndex(i => i.item_id === item.id);
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        item_id: item.id,
        name: item.name,
        price: item.price,
        price_type: item.price_type,
        quantity,
        days,
        image: item.images?.[0]?.url || null,
      });
    }

    this.saveCart(cart);
    Toast.success(`${item.name} ditambahkan ke keranjang`);
    this.updateUI();
    return cart;
  }

  /**
   * Remove item from cart
   */
  static removeItem(itemId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(i => i.item_id !== itemId);
    this.saveCart(cart);
    this.updateUI();
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
        this.saveCart(cart);
        this.updateUI();
      }
    }
  }

  /**
   * Set dates
   */
  static setDates(startDate, endDate) {
    const cart = this.getCart();
    cart.dates = { startDate, endDate };
    this.saveCart(cart);
    this.updateUI();
  }

  /**
   * Set notes
   */
  static setNotes(notes) {
    const cart = this.getCart();
    cart.notes = notes;
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
   * Clear cart
   */
  static clear() {
    Storage.remove('cart');
    this.updateUI();
  }

  /**
   * Get item count
   */
  static getItemCount() {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calculate subtotal
   */
  static getSubtotal() {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity * item.days), 0);
  }

  /**
   * Open cart drawer
   */
  static openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close cart drawer
   */
  static closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Update UI
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

    if (cart.items.length === 0) {
      return `
        <div class="cart-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <p>Keranjang kosong</p>
          <a href="/katalog" class="btn btn-primary btn-sm" onclick="Cart.closeDrawer()">Lihat Katalog</a>
        </div>
      `;
    }

    return `
      <div class="booking-items-list">
        ${cart.items.map(item => `
          <div class="booking-item-row">
            <div style="display: flex; gap: var(--space-sm); align-items: center;">
              ${item.image
                ? `<img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-md);">`
                : `<div style="width: 48px; height: 48px; background: var(--bg-tertiary); border-radius: var(--radius-md);"></div>`
              }
              <div>
                <p class="booking-item-name">${item.name}</p>
                <p class="booking-item-qty">${item.quantity}x ${item.days} hari</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-md);">
              <span class="font-semibold">${formatCurrency(item.price * item.quantity * item.days)}</span>
              <button class="btn btn-icon btn-sm" onclick="Cart.removeItem('${item.item_id}')" aria-label="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      ${cart.dates ? `
        <div class="alert alert-info" style="margin-top: var(--space-md);">
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <span>${formatDate(cart.dates.startDate)} - ${formatDate(cart.dates.endDate)}</span>
          </div>
        </div>
      ` : ''}

      <div class="booking-totals" style="margin-top: var(--space-lg);">
        <div class="booking-total-row total">
          <span>Total</span>
          <span class="price price-large">${formatCurrency(this.getSubtotal())}</span>
        </div>
      </div>

      <a href="/booking" class="btn btn-primary btn-block btn-lg" style="margin-top: var(--space-lg);" onclick="Cart.closeDrawer()">
        Lanjutkan ke Booking
      </a>
    `;
  }

  /**
   * Attach drawer events
   */
  static attachDrawerEvents() {
    const closeBtn = document.getElementById('cart-drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeDrawer());
    }
  }

  /**
   * Render cart drawer HTML
   */
  static renderDrawerHTML() {
    return `
      <div class="modal-backdrop" id="cart-drawer-backdrop"></div>
      <div class="cart-drawer" id="cart-drawer">
        <div class="cart-drawer-header">
          <h3 class="cart-drawer-title">Keranjang</h3>
          <button class="cart-drawer-close" id="cart-drawer-close" aria-label="Close">
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
}

// Make Cart globally accessible
window.Cart = Cart;

export default Cart;
