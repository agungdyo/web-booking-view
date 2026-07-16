/**
 * Utils Service
 * Handles utility operations like price calculation
 */
import Storage from '../utils/storage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const DEFAULT_TENANT = 'MAJU1234';

class UtilsService {
  /**
   * Get API base URL
   */
  getApiBaseUrl() {
    return API_BASE_URL;
  }

  /**
   * Get kode tenant
   */
  getKodeTenant() {
    return Storage.get('tenant_code') || import.meta.env.VITE_DEFAULT_TENANT || DEFAULT_TENANT;
  }

  /**
   * Calculate price with tax and fees
   * @param {Array} items - Array of items [{ itemId, name, price, quantity, days }]
   * @returns {Object} Price breakdown
   */
  async calculatePrice(items) {
    const kodeTenant = this.getKodeTenant();

    const payload = {
      items: items.map(item => ({
        itemId: item.item_id || item.itemId,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity) || 1,
        days: parseInt(item.days) || 1
      })),
      kodeTenant
    };

    console.log('[UtilsService] Calculating price:', payload);

    const response = await fetch(`${this.getApiBaseUrl()}/utils/calculate-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'kode': kodeTenant
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('[UtilsService] Price calculation result:', result);

    return result;
  }

  /**
   * Format price for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatPrice(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export const utilsService = new UtilsService();
export default utilsService;
