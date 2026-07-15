/**
 * Cart Storage Service
 * Handles cart persistence with LocalStorage
 * Uses kode tenant for multi-tenant support
 */
import Storage from '../utils/storage.js';

const CART_KEY = 'cart';
const DEFAULT_TENANT = 'MAJU1234';

/**
 * Cart Storage - Manages cart data persistence
 */
class CartStorage {
  /**
   * Get kode tenant from storage
   */
  static getKodeTenant() {
    return Storage.get('tenant_code') || DEFAULT_TENANT;
  }

  /**
   * Get cart from storage with validation
   */
  static getCart() {
    const cart = Storage.get(CART_KEY, null);

    if (!cart) {
      return this.createEmptyCart();
    }

    // Validate and migrate old cart format
    const validatedCart = this.validateCart(cart);
    return validatedCart;
  }

  /**
   * Create empty cart structure
   */
  static createEmptyCart() {
    return {
      items: [],
      dates: null,
      notes: '',
      priceDetails: null,
      kodeTenant: this.getKodeTenant(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate and migrate cart data
   */
  static validateCart(cart) {
    // Ensure required fields exist
    if (!Array.isArray(cart.items)) {
      cart.items = [];
    }

    // Ensure kode tenant is set
    if (!cart.kodeTenant) {
      cart.kodeTenant = this.getKodeTenant();
    }

    // Initialize missing fields
    if (cart.notes === undefined) {
      cart.notes = '';
    }

    if (!cart.dates) {
      cart.dates = null;
    }

    if (!cart.priceDetails) {
      cart.priceDetails = null;
    }

    // Track timestamps
    if (!cart.createdAt) {
      cart.createdAt = new Date().toISOString();
    }
    cart.updatedAt = new Date().toISOString();

    // Validate each item
    cart.items = cart.items.filter(item => this.validateItem(item));

    return cart;
  }

  /**
   * Validate individual cart item
   */
  static validateItem(item) {
    if (!item || typeof item !== 'object') return false;
    if (!item.item_id && !item.id) return false;

    // Ensure required fields
    return !!(item.name || item.itemName);
  }

  /**
   * Save cart to storage
   */
  static saveCart(cart) {
    // Always ensure kode tenant
    cart.kodeTenant = this.getKodeTenant();
    cart.updatedAt = new Date().toISOString();

    // Validate before saving
    const validatedCart = this.validateCart(cart);

    Storage.set(CART_KEY, validatedCart);
    return validatedCart;
  }

  /**
   * Add item to cart
   */
  static addItem(item, quantity = 1, days = 1, dates = null) {
    const cart = this.getCart();

    // Get item ID
    const itemId = item.id || item.item_id;

    // Check if item already exists
    const existingIndex = cart.items.findIndex(i =>
      (i.item_id === itemId) || (i.id === itemId)
    );

    // Calculate total days if dates provided
    let totalDays = days;
    if (dates && dates.startDate && dates.endDate) {
      totalDays = this.calculateDays(dates.startDate, dates.endDate);
    }

    if (existingIndex >= 0) {
      // Update existing item
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].days = totalDays;
      cart.items[existingIndex].totalPrice =
        cart.items[existingIndex].price *
        cart.items[existingIndex].quantity *
        cart.items[existingIndex].days;
    } else {
      // Add new item
      const cartItem = {
        item_id: itemId,
        item_uuid: itemId,
        name: item.name || item.itemName || 'Unknown Item',
        type: item.type || 'other',
        price: parseFloat(item.price) || 0,
        price_type: item.priceType || item.price_type || 'per_day',
        quantity: parseInt(quantity) || 1,
        days: totalDays,
        totalPrice: (parseFloat(item.price) || 0) * (parseInt(quantity) || 1) * totalDays,
        image: this.extractImage(item.images),
        specifications: item.specifications || {},
        kodeTenant: this.getKodeTenant(),
        addedAt: new Date().toISOString()
      };

      // Add dates if provided
      if (dates && dates.startDate && dates.endDate) {
        cartItem.startDate = dates.startDate;
        cartItem.endDate = dates.endDate;
      }

      cart.items.push(cartItem);
    }

    return this.saveCart(cart);
  }

  /**
   * Extract primary image from item
   */
  static extractImage(images) {
    if (!images) return null;
    if (typeof images === 'string') return images;
    if (Array.isArray(images)) {
      if (typeof images[0] === 'string') return images[0];
      if (images[0]?.url) return images[0].url;
    }
    if (images.url) return images.url;
    return null;
  }

  /**
   * Calculate days between dates
   */
  static calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }

  /**
   * Update item quantity
   */
  static updateQuantity(itemId, quantity, days = null) {
    const cart = this.getCart();
    const item = cart.items.find(i =>
      i.item_id === itemId || i.id === itemId
    );

    if (!item) return null;

    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    item.quantity = parseInt(quantity) || 1;
    if (days !== null && days !== undefined) {
      item.days = Math.max(1, parseInt(days) || 1);
    }

    item.totalPrice = item.price * item.quantity * item.days;

    return this.saveCart(cart);
  }

  /**
   * Update item days
   */
  static updateItemDays(itemId, days) {
    const cart = this.getCart();
    const item = cart.items.find(i =>
      i.item_id === itemId || i.id === itemId
    );

    if (!item) return null;

    item.days = Math.max(1, parseInt(days) || 1);
    item.totalPrice = item.price * item.quantity * item.days;

    return this.saveCart(cart);
  }

  /**
   * Remove item from cart
   */
  static removeItem(itemId) {
    const cart = this.getCart();
    const initialLength = cart.items.length;

    cart.items = cart.items.filter(i =>
      i.item_id !== itemId && i.id !== itemId
    );

    if (cart.items.length < initialLength) {
      return this.saveCart(cart);
    }

    return cart;
  }

  /**
   * Set booking dates for all items
   */
  static setDates(startDate, endDate) {
    const cart = this.getCart();
    const days = this.calculateDays(startDate, endDate);

    cart.dates = { startDate, endDate };

    // Update each item with dates
    cart.items.forEach(item => {
      item.startDate = startDate;
      item.endDate = endDate;
      item.days = days;
      item.totalPrice = item.price * item.quantity * days;
    });

    return this.saveCart(cart);
  }

  /**
   * Set notes for booking
   */
  static setNotes(notes) {
    const cart = this.getCart();
    cart.notes = notes || '';
    return this.saveCart(cart);
  }

  /**
   * Set price details
   */
  static setPriceDetails(priceDetails) {
    const cart = this.getCart();
    cart.priceDetails = priceDetails;
    return this.saveCart(cart);
  }

  /**
   * Clear entire cart
   */
  static clear() {
    const emptyCart = this.createEmptyCart();
    Storage.set(CART_KEY, emptyCart);
    return emptyCart;
  }

  /**
   * Get item count (total quantity)
   */
  static getItemCount() {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  }

  /**
   * Get unique item count
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
    return cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.totalPrice) || 0);
    }, 0);
  }

  /**
   * Calculate total days
   */
  static getTotalDays() {
    const cart = this.getCart();
    if (cart.items.length === 0) return 0;
    return Math.max(...cart.items.map(i => parseInt(i.days) || 1), 1);
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
   * Get price breakdown
   */
  static getPriceBreakdown() {
    const cart = this.getCart();
    const items = cart.items || [];

    const subtotal = items.reduce((sum, item) =>
      sum + (parseFloat(item.totalPrice) || 0), 0
    );

    return {
      items: items,
      subtotal: subtotal,
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
      totalDays: this.getTotalDays(),
      dates: cart.dates,
      notes: cart.notes
    };
  }

  /**
   * Prepare cart data for checkout/booking API
   */
  static prepareForCheckout() {
    const cart = this.getCart();
    const kodeTenant = this.getKodeTenant();

    return {
      kodeTenant: kodeTenant,
      items: cart.items.map(item => ({
        item_id: item.item_id || item.id,
        quantity: parseInt(item.quantity) || 1,
        start_date: cart.dates?.startDate || item.startDate,
        end_date: cart.dates?.endDate || item.endDate,
        days: parseInt(item.days) || 1,
        price_per_unit: parseFloat(item.price) || 0,
        subtotal: parseFloat(item.totalPrice) || 0
      })),
      dates: cart.dates,
      notes: cart.notes || '',
      subtotal: this.getSubtotal()
    };
  }

  /**
   * Get cart version for cache busting
   */
  static getCartVersion() {
    const cart = this.getCart();
    return {
      itemCount: this.getItemCount(),
      subtotal: this.getSubtotal(),
      updatedAt: cart.updatedAt
    };
  }

  /**
   * Import cart from external data
   */
  static importCart(data) {
    const cart = {
      items: [],
      dates: data.dates || null,
      notes: data.notes || '',
      priceDetails: data.priceDetails || null,
      kodeTenant: data.kodeTenant || this.getKodeTenant(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (Array.isArray(data.items)) {
      data.items.forEach(item => {
        if (this.validateItem(item)) {
          cart.items.push({
            item_id: item.item_id || item.id,
            item_uuid: item.item_id || item.id,
            name: item.name || item.itemName || 'Unknown',
            type: item.type || 'other',
            price: parseFloat(item.price) || 0,
            price_type: item.priceType || item.price_type || 'per_day',
            quantity: parseInt(item.quantity) || 1,
            days: parseInt(item.days) || 1,
            totalPrice: parseFloat(item.totalPrice) || (parseFloat(item.price) * parseInt(item.quantity || 1)),
            image: this.extractImage(item.images),
            specifications: item.specifications || {},
            kodeTenant: this.getKodeTenant(),
            addedAt: new Date().toISOString()
          });
        }
      });
    }

    return this.saveCart(cart);
  }
}

// Make globally accessible
window.CartStorage = CartStorage;

export default CartStorage;
