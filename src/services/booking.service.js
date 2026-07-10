/**
 * Booking Service
 * Uses kode tenant (not tenant ID)
 */
import Storage from '../utils/storage.js';

class BookingService {
  /**
   * Get API base URL
   */
  getApiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Get kode tenant
   */
  getKodeTenant() {
    return Storage.get('tenant_code') || import.meta.env.VITE_DEFAULT_TENANT;
  }

  /**
   * Get auth headers with customer token and kode tenant
   */
  getAuthHeaders() {
    const customer = Storage.get('customer');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (customer?.token) {
      headers['Authorization'] = `Bearer ${customer.token}`;
    }

    if (customer?.kodeTenant) {
      headers['kode'] = customer.kodeTenant;
    }

    return headers;
  }

  /**
   * Create new booking
   */
  async createBooking(data) {
    const payload = {
      customer_id: data.customer_id,
      start_date: data.start_date,
      end_date: data.end_date,
      items: data.items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity || 1,
        days: item.days || 1,
      })),
      notes: data.notes || '',
      discount_amount: data.discount_amount || 0,
    };

    const response = await fetch(`${this.getApiBaseUrl()}/bookings`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return response.json();
  }

  /**
   * Get booking by ID
   */
  async getBooking(id) {
    const response = await fetch(`${this.getApiBaseUrl()}/bookings/${id}`, {
      headers: this.getAuthHeaders()
    });

    return response.json();
  }

  /**
   * Get customer's bookings
   */
  async getMyBookings(params = {}) {
    const customer = Storage.get('customer');
    if (!customer?.id) {
      throw new Error('Not logged in');
    }

    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
    });

    const response = await fetch(`${this.getApiBaseUrl()}/customers/${customer.id}/bookings?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    return response.json();
  }

  /**
   * Track booking by code (public)
   */
  async trackBooking(code) {
    const kodeTenant = this.getKodeTenant();

    const response = await fetch(`${this.getApiBaseUrl()}/bookings/track/${code}?kode=${kodeTenant}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }

  /**
   * Calculate price
   */
  async calculatePrice(items, discountAmount = 0, taxRate = 10) {
    const payload = {
      items: items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity || 1,
        days: item.days || 1,
      })),
      discount_amount: discountAmount,
      tax_rate: taxRate,
    };

    const response = await fetch(`${this.getApiBaseUrl()}/utils/calculate-price`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return response.json();
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id) {
    const response = await fetch(`${this.getApiBaseUrl()}/bookings/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return response.json();
  }
}

export const bookingService = new BookingService();
export default bookingService;
