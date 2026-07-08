/**
 * Payment Service
 */
import apiClient from '../api/client.js';

class PaymentService {
  /**
   * Initiate payment
   */
  async initiatePayment(bookingId, method = 'bank_transfer', provider = 'midtrans') {
    return apiClient.post('/payments/initiate', {
      booking_id: bookingId,
      method,
      provider,
    });
  }

  /**
   * Get payment details
   */
  async getPayment(id) {
    return apiClient.get(`/payments/${id}`);
  }

  /**
   * Retry payment
   */
  async retryPayment(paymentId) {
    return apiClient.post(`/payments/${paymentId}/retry`);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
