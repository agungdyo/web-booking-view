/**
 * Payment Service
 * Handles payment operations
 *
 * IMPORTANT: Always use 'kode' header/query parameter, NOT 'x-tenant-id'
 */
import Storage from '../utils/storage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const DEFAULT_TENANT = 'MAJU1234';

class PaymentService {
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
   * Initiate payment for a booking
   * @param {string} bookingId - Booking ID
   * @param {string} method - Payment method (bank_transfer, ewallet, credit_card)
   * @param {string} provider - Payment provider (midtrans)
   */
  async initiatePayment(bookingId, method = 'bank_transfer', provider = 'midtrans') {
    const customer = this.getCustomer();
    const kodeTenant = customer?.kodeTenant || this.getKodeTenant();

    // Map frontend method to MAJA payment method
    const paymentMethodMap = {
      'bank_transfer': 'bni', // Default to BNI for bank transfer
      'ewallet': 'gopay',
      'credit_card': 'credit_card'
    };

    const payload = {
      bookingId: bookingId, // Backend expects bookingId (camelCase)
      paymentMethod: paymentMethodMap[method] || 'bni' // Map to MAJA method
    };

    console.log('[PaymentService] Initiating payment:', payload);
    console.log('[PaymentService] Using kode tenant:', kodeTenant);

    const response = await fetch(`${this.getApiBaseUrl()}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': customer?.token ? `Bearer ${customer.token}` : '',
        'kode': kodeTenant
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('[PaymentService] Payment initiation response:', result);

    return result;
  }

  /**
   * Get payment details
   */
  async getPayment(id) {
    const response = await fetch(`${this.getApiBaseUrl()}/payments/${id}`, {
      headers: this.getAuthHeaders()
    });

    return response.json();
  }

  /**
   * Get payments for current customer
   */
  async getMyPayments(params = {}) {
    const customer = this.getCustomer();
    if (!customer?.token) {
      throw new Error('Not logged in');
    }

    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
    });

    const response = await fetch(`${this.getApiBaseUrl()}/payments?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    return response.json();
  }

  /**
   * Retry payment
   */
  async retryPayment(paymentId) {
    const kodeTenant = this.getKodeTenant();

    const response = await fetch(`${this.getApiBaseUrl()}/payments/${paymentId}/retry`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'kode': kodeTenant
      }
    });

    return response.json();
  }

  /**
   * Request refund
   */
  async requestRefund(paymentId, reason = '') {
    const kodeTenant = this.getKodeTenant();

    const response = await fetch(`${this.getApiBaseUrl()}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'kode': kodeTenant
      },
      body: JSON.stringify({ reason })
    });

    return response.json();
  }
}

export const paymentService = new PaymentService();
export default paymentService;
