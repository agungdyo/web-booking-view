/**
 * Item Service - Public API
 */
import apiClient from '../api/client.js';
import Storage from '../utils/storage.js';

class ItemService {
  /**
   * Get all items (public endpoint)
   */
  async getItems(params = {}) {
    // Use kode from tenant storage
    const tenantCode = Storage.get('tenant_code');

    return apiClient.get('/public/items', {
      kode: tenantCode,
      page: params.page || 1,
      limit: params.limit || 12,
      type: params.type || null,
      search: params.search || null,
    });
  }

  /**
   * Get item by ID (public endpoint)
   */
  async getItem(id) {
    const tenantCode = Storage.get('tenant_code');

    return apiClient.get(`/public/items/${id}`, {
      kode: tenantCode,
    });
  }

  /**
   * Check item availability (public endpoint)
   */
  async checkAvailability(itemId, startDate, endDate) {
    const tenantCode = Storage.get('tenant_code');

    return apiClient.get(`/public/items/${itemId}/availability`, {
      kode: tenantCode,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Get item types (public endpoint)
   */
  async getItemTypes() {
    const tenantCode = Storage.get('tenant_code');

    return apiClient.get('/public/items/types', {
      kode: tenantCode,
    });
  }

  /**
   * Get featured items (public endpoint)
   */
  async getFeaturedItems(limit = 4) {
    const tenantCode = Storage.get('tenant_code');
    console.log('[ItemService] Getting featured items, tenantCode:', tenantCode);

    const result = apiClient.get('/public/items', {
      kode: tenantCode,
      limit,
    });
    console.log('[ItemService] Result:', result);
    return result;
  }
}

export const itemService = new ItemService();
export default itemService;
