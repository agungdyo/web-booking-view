/**
 * Item Service - API Integration for Items
 * Supports both public and authenticated endpoints
 */
import apiClient from '../api/client.js';
import Storage from '../utils/storage.js';

class ItemService {
  /**
   * Get tenant code from storage
   */
  getTenantCode() {
    return Storage.get('tenant_code') || import.meta.env.VITE_DEFAULT_TENANT;
  }

  /**
   * Get tenant ID from storage
   */
  getTenantId() {
    return Storage.get('tenant_id');
  }

  /**
   * Get all items using authenticated endpoint
   * GET /items - List items with tenant isolation
   * @param {Object} params - Query parameters
   */
  async getItems(params = {}) {
    const tenantCode = this.getTenantCode();
    console.log('[ItemService] Getting items, tenantCode:', tenantCode);

    return apiClient.get('/items', {
      kode: tenantCode,
      page: params.page || 1,
      limit: params.limit || 12,
      type: params.type || null,
      search: params.search || null,
      is_available: params.is_available !== undefined ? params.is_available : null,
    });
  }

  /**
   * Get item types using authenticated endpoint
   * GET /items/types - List item types with counts
   */
  async getItemTypes() {
    const tenantCode = this.getTenantCode();
    console.log('[ItemService] Getting item types, tenantCode:', tenantCode);

    return apiClient.get('/items/types', {
      kode: tenantCode,
    });
  }

  /**
   * Get item by ID using authenticated endpoint
   * GET /items/:id
   */
  async getItem(id) {
    const tenantCode = this.getTenantCode();

    return apiClient.get(`/items/${id}`, {
      kode: tenantCode,
    });
  }

  /**
   * Check item availability using authenticated endpoint
   * GET /items/:id/availability
   */
  async checkAvailability(itemId, startDate, endDate, quantity = 1) {
    const tenantCode = this.getTenantCode();

    return apiClient.get(`/items/${itemId}/availability`, {
      kode: tenantCode,
      start_date: startDate,
      end_date: endDate,
      quantity,
    });
  }

  /**
   * Get featured items (public endpoint)
   */
  async getFeaturedItems(limit = 4) {
    const tenantCode = this.getTenantCode();
    console.log('[ItemService] Getting featured items, tenantCode:', tenantCode);

    const result = await apiClient.get('/items', {
      kode: tenantCode,
      limit,
    });
    console.log('[ItemService] Featured items result:', result);
    return result;
  }

  /**
   * Public endpoint: Get all items
   * GET /public/items
   */
  async getPublicItems(params = {}) {
    const tenantCode = this.getTenantCode();

    return apiClient.get('/public/items', {
      kode: tenantCode,
      page: params.page || 1,
      limit: params.limit || 12,
      type: params.type || null,
      search: params.search || null,
    });
  }

  /**
   * Public endpoint: Get item types
   * GET /public/items/types
   */
  async getPublicItemTypes() {
    const tenantCode = this.getTenantCode();

    return apiClient.get('/public/items/types', {
      kode: tenantCode,
    });
  }

  /**
   * Public endpoint: Get item by ID
   * GET /public/items/:id
   */
  async getPublicItem(id) {
    const tenantCode = this.getTenantCode();

    return apiClient.get(`/public/items/${id}`, {
      kode: tenantCode,
    });
  }
}

export const itemService = new ItemService();
export default itemService;
