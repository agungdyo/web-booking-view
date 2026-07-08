/**
 * Booking Service
 */
import apiClient from '../api/client.js';
import Storage from '../utils/storage.js';

class BookingService {
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

    return apiClient.post('/bookings', payload);
  }

  /**
   * Get booking by ID
   */
  async getBooking(id) {
    return apiClient.get(`/bookings/${id}`);
  }

  /**
   * Get customer's bookings
   */
  async getMyBookings(params = {}) {
    const customer = Storage.get('customer');
    if (!customer?.id) {
      throw new Error('Not logged in');
    }

    return apiClient.get(`/customers/${customer.id}/bookings`, {
      page: params.page || 1,
      limit: params.limit || 10,
    });
  }

  /**
   * Track booking by code (public)
   */
  async trackBooking(code) {
    return apiClient.get(`/bookings/track/${code}`);
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

    return apiClient.post('/utils/calculate-price', payload);
  }
}

export const bookingService = new BookingService();
export default bookingService;
