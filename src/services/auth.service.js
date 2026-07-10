/**
 * Authentication Service
 * Handles user authentication and token management
 */
import apiClient from '../api/client.js';
import Storage from '../utils/storage.js';

class AuthService {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} kodeTenant - Optional tenant code for login
   */
  async login(email, password, kodeTenant = null) {
    console.log('[AuthService] Login attempt:', email);

    const payload = {
      email,
      password,
    };

    // Add tenant code if provided
    // Note: The backend login doesn't require kodeTenant (SSO style)
    // But we store it for reference
    const tenantCode = kodeTenant || import.meta.env.VITE_DEFAULT_TENANT;

    const response = await apiClient.post('/auth/login', payload);

    if (response.success) {
      const { accessToken, refreshToken, user } = response.data;

      // Store customer data
      const customerData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
        refresh_token: refreshToken,
        tenant_id: user.tenant_id || Storage.get('tenant_id'),
        kodeTenant: user.kodeTenant || tenantCode,
      };

      Storage.set('customer', customerData);

      // Also store in localStorage for direct access
      localStorage.setItem('customer', JSON.stringify(customerData));

      // Store tenant info
      if (user.tenant_id) {
        Storage.set('tenant_id', user.tenant_id);
      }
      if (user.kodeTenant) {
        Storage.set('tenant_code', user.kodeTenant);
      } else if (tenantCode) {
        Storage.set('tenant_code', tenantCode);
      }

      console.log('[AuthService] Login successful:', user.name);
    }

    return response;
  }

  /**
   * Login with credentials (convenience method)
   * Uses predefined credentials for demo purposes
   */
  async loginWithCredentials(email, password) {
    const kodeTenant = import.meta.env.VITE_DEFAULT_TENANT;
    return this.login(email, password, kodeTenant);
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
    const tenantCode = Storage.get('tenant_code') || import.meta.env.VITE_DEFAULT_TENANT;
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
    // Try Storage first
    const customer = Storage.get('customer');
    if (customer) return customer;

    // Fallback to localStorage
    try {
      const local = localStorage.getItem('customer');
      if (local) return JSON.parse(local);
    } catch (e) {
      // Ignore
    }

    return null;
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
    localStorage.remove('customer');
    console.log('[AuthService] Logged out');
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
      const updated = {
        ...customer,
        token: response.data.token,
        refresh_token: response.data.refresh_token || customer.refresh_token,
      };
      Storage.set('customer', updated);
      localStorage.setItem('customer', JSON.stringify(updated));
    }

    return response;
  }

  /**
   * Get current user info
   */
  async getMe() {
    return apiClient.getAuth('/auth/me');
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    return apiClient.postAuth('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }
}

export const authService = new AuthService();
export default authService;
