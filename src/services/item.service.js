/**
 * Item Service - API Integration for Items
 * Uses public endpoints with kode tenant parameter
 */
import Storage from '../utils/storage.js';

class ItemService {
  /**
   * Get kode tenant from storage or env
   */
  getKodeTenant() {
    const fromStorage = Storage.get('tenant_code');
    const fromEnv = import.meta.env.VITE_DEFAULT_TENANT;
    const result = fromStorage || fromEnv;
    console.log('[ItemService] getKodeTenant:', { fromStorage, fromEnv, result });
    return result;
  }

  /**
   * Get all items using public endpoint
   * GET /public/items - List items with tenant isolation via kode param
   */
  async getItems(params = {}) {
    const kodeTenant = this.getKodeTenant();
    console.log('[ItemService] Getting items, kodeTenant:', kodeTenant);

    const apiParams = {
      kode: kodeTenant,
      page: params.page || 1,
      limit: params.limit || 12,
    };

    if (params.type) apiParams.type = params.type;
    if (params.search) apiParams.search = params.search;
    if (params.is_available !== undefined && params.is_available !== null) {
      apiParams.is_available = params.is_available;
    }

    console.log('[ItemService] API params:', apiParams);

    // Direct fetch for public endpoint
    const queryString = new URLSearchParams(
      Object.entries(apiParams).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    ).toString();

    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/public/items?${queryString}`;
    console.log('[ItemService] URL:', url);

    const response = await fetch(url);
    const data = await response.json();
    console.log('[ItemService] Raw response:', data);

    return data;
  }

  /**
   * Get item types
   * GET /public/items/types
   */
  async getItemTypes() {
    const kodeTenant = this.getKodeTenant();
    console.log('[ItemService] Getting item types, kodeTenant:', kodeTenant);

    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/public/items/types?kode=${kodeTenant}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Get item by ID
   * GET /public/items/:id
   */
  async getItem(id) {
    const kodeTenant = this.getKodeTenant();

    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/public/items/${id}?kode=${kodeTenant}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Check item availability
   * GET /public/items/:id/availability
   */
  async checkAvailability(itemId, startDate, endDate, quantity = 1) {
    const kodeTenant = this.getKodeTenant();

    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/public/items/${itemId}/availability?kode=${kodeTenant}&start_date=${startDate}&end_date=${endDate}&quantity=${quantity}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Get featured items
   */
  async getFeaturedItems(limit = 4) {
    return this.getItems({ limit });
  }
}

export const itemService = new ItemService();
export default itemService;
