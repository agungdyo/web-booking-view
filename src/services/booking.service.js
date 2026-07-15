/**
 * Booking Service
 * Handles booking operations
 *
 * IMPORTANT: Always use 'kode' header/query parameter, NOT 'x-tenant-id'
 */
import Storage from '../utils/storage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const DEFAULT_TENANT = 'MAJU1234';

class BookingService {
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
   * Get customer from storage
   */
  getCustomer() {
    return Storage.get('customer');
  }

  /**
   * Get auth headers with customer token and kode tenant
   */
  getAuthHeaders() {
    const customer = this.getCustomer();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (customer?.token) {
      headers['Authorization'] = `Bearer ${customer.token}`;
    }

    const kodeTenant = customer?.kodeTenant || this.getKodeTenant();
    if (kodeTenant) {
      headers['kode'] = kodeTenant;
    }

    return headers;
  }

  /**
   * Create new booking
   * @param {Object} data - Booking data
   */
  async createBooking(data) {
    const customer = this.getCustomer();
    const kodeTenant = customer?.kodeTenant || this.getKodeTenant();

    const payload = {
      customerId: customer?.id || data.customer_id, // Backend expects customerId (camelCase)
      startDate: data.start_date || data.startDate, // Backend expects startDate (camelCase)
      endDate: data.end_date || data.endDate, // Backend expects endDate (camelCase)
      items: data.items.map(item => ({
        itemId: item.item_id || item.id, // Backend expects itemId (camelCase)
        quantity: parseInt(item.quantity) || 1,
        days: parseInt(item.days) || 1,
      })),
      notes: data.notes || '',
      discount_amount: parseFloat(data.discount_amount) || 0,
    };

    console.log('[BookingService] Creating booking with payload:', payload);
    console.log('[BookingService] Using kode tenant:', kodeTenant);

    const response = await fetch(`${this.getApiBaseUrl()}/bookings`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'kode': kodeTenant
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('[BookingService] Booking response:', result);

    return result;
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
    const customer = this.getCustomer();
    if (!customer?.id) {
      throw new Error('Not logged in');
    }

    const kodeTenant = customer.kodeTenant || this.getKodeTenant();

    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      kode: kodeTenant // Include kode tenant in query
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
        'Content-Type': 'application/json',
        'kode': kodeTenant
      }
    });

    return response.json();
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id) {
    const kodeTenant = this.getKodeTenant();

    const response = await fetch(`${this.getApiBaseUrl()}/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        'kode': kodeTenant
      }
    });

    return response.json();
  }

  /**
   * Update booking status (admin)
   */
  async updateBookingStatus(id, status) {
    const kodeTenant = this.getKodeTenant();

    const response = await fetch(`${this.getApiBaseUrl()}/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'kode': kodeTenant
      },
      body: JSON.stringify({ status })
    });

    return response.json();
  }
}

export const bookingService = new BookingService();
export default bookingService;
