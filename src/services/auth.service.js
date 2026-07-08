/**
 * Authentication Service
 */
import apiClient from '../api/client.js';
import Storage from '../utils/storage.js';

class AuthService {
  /**
   * Login customer
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });

    if (response.success) {
      const { token, refresh_token, user } = response.data;
      Storage.set('customer', {
        id: user.id,
        name: user.name,
        email: user.email,
        token,
        refresh_token,
      });
      Storage.set('tenant_id', user.tenant_id);
    }

    return response;
  }

  /**
   * Register new customer (public)
   */
  async register(data) {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    };

    // Add tenant code if available
    const tenantCode = Storage.get('tenant_code');
    if (tenantCode) {
      payload.kodeTenant = tenantCode;
    }

    const response = await apiClient.post('/customers/public', payload);

    if (response.success) {
      // Auto login after registration
      await this.login(data.email, data.password);
    }

    return response;
  }

  /**
   * Get current customer
   */
  getCurrentCustomer() {
    return Storage.get('customer');
  }

  /**
   * Check if logged in
   */
  isLoggedIn() {
    const customer = this.getCurrentCustomer();
    return !!(customer?.token);
  }

  /**
   * Logout
   */
  logout() {
    Storage.remove('customer');
    Storage.remove('cart');
  }

  /**
   * Refresh token
   */
  async refreshToken() {
    const customer = this.getCurrentCustomer();
    if (!customer?.refresh_token) {
      throw new Error('No refresh token');
    }

    const response = await apiClient.post('/auth/refresh-token', {
      refresh_token: customer.refresh_token,
    });

    if (response.success) {
      Storage.set('customer', {
        ...customer,
        token: response.data.token,
      });
    }

    return response;
  }
}

export const authService = new AuthService();
export default authService;
