/**
 * Item Service - API Integration for Items
 * Uses public endpoints with kode tenant parameter
 *
 * IMPORTANT: Always use 'kode' header/query parameter, NOT 'x-tenant-id'
 */
import Storage from '../utils/storage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const DEFAULT_TENANT = 'MAJU1234';

class ItemService {
  /**
   * Get kode tenant from storage or env
   */
  getKodeTenant() {
    const fromStorage = Storage.get('tenant_code');
    const fromEnv = import.meta.env.VITE_DEFAULT_TENANT || DEFAULT_TENANT;
    return fromStorage || fromEnv;
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

    // Build query string
    const queryString = new URLSearchParams(
      Object.entries(apiParams).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    ).toString();

    const url = `${API_BASE_URL}/public/items?${queryString}`;
    console.log('[ItemService] Fetching items from:', url);

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log('[ItemService] Response:', data);

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch items');
      }

      return data;
    } catch (error) {
      console.error('[ItemService] Error fetching items:', error);
      throw error;
    }
  }

  /**
   * Get item types
   * GET /public/items/types
   */
  async getItemTypes() {
    const kodeTenant = this.getKodeTenant();
    const url = `${API_BASE_URL}/public/items/types?kode=${kodeTenant}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ItemService] Error fetching item types:', error);
      throw error;
    }
  }

  /**
   * Get item by ID
   * GET /public/items/:id
   */
  async getItem(id) {
    const kodeTenant = this.getKodeTenant();
    const url = `${API_BASE_URL}/public/items/${id}?kode=${kodeTenant}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ItemService] Error fetching item:', error);
      throw error;
    }
  }

  /**
   * Check item availability for a date range
   * GET /public/items/:id/availability
   */
  async checkAvailability(itemId, startDate, endDate, quantity = 1) {
    const kodeTenant = this.getKodeTenant();
    const url = `${API_BASE_URL}/public/items/${itemId}/availability?kode=${kodeTenant}&start_date=${startDate}&end_date=${endDate}&quantity=${quantity}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ItemService] Error checking availability:', error);
      throw error;
    }
  }

  /**
   * Get availability calendar - returns booked dates for a date range
   * GET /public/items/:id/availability-calendar
   * Returns array of { date, available, booked }
   */
  async getAvailabilityCalendar(itemId, startDate, endDate) {
    const kodeTenant = this.getKodeTenant();
    const url = `${API_BASE_URL}/public/items/${itemId}/availability-calendar?kode=${kodeTenant}&start_date=${startDate}&end_date=${endDate}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ItemService] Error fetching availability calendar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get booked/unavailable dates for an item (next 90 days by default)
   * Returns an array of date strings that are fully booked
   */
  async getBookedDates(itemId, days = 90) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const result = await this.getAvailabilityCalendar(itemId, startStr, endStr);

    if (result.success && result.data) {
      const bookedDates = result.data
        .filter(day => !day.available)
        .map(day => day.date);

      return bookedDates;
    }

    return [];
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
