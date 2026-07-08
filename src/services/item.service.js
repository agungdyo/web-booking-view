/**
 * Item Service
 */
import apiClient from '../api/client.js';
import Storage from '../utils/storage.js';

class ItemService {
  /**
   * Get all items
   */
  async getItems(params = {}) {
    return apiClient.get('/items', {
      page: params.page || 1,
      limit: params.limit || 12,
      type: params.type || null,
      is_available: params.is_available !== false ? true : null,
      search: params.search || null,
      min_price: params.min_price || null,
      max_price: params.max_price || null,
    });
  }

  /**
   * Get item by ID
   */
  async getItem(id) {
    return apiClient.get(`/items/${id}`);
  }

  /**
   * Check item availability
   */
  async checkAvailability(itemId, startDate, endDate) {
    return apiClient.get(`/items/${itemId}/availability`, {
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Get item types
   */
  async getItemTypes() {
    return apiClient.get('/items/types');
  }

  /**
   * Get featured items
   */
  async getFeaturedItems(limit = 4) {
    return apiClient.get('/items', {
      limit,
      is_available: true,
    });
  }
}

export const itemService = new ItemService();
export default itemService;
