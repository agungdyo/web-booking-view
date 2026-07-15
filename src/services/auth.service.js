/**
 * Authentication Service
 * Handles customer authentication and token management
 *
 * IMPORTANT: Always use 'kode' header/query parameter, NOT 'x-tenant-id'
 */
import Storage from '../utils/storage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const DEFAULT_TENANT = 'MAJU1234';

class AuthService {
  /**
   * Get API base URL
   */
  getApiBaseUrl() {
    return API_BASE_URL;
  }

  /**
   * Get kode tenant from storage
   */
  getKodeTenant() {
    return Storage.get('tenant_code') || import.meta.env.VITE_DEFAULT_TENANT || DEFAULT_TENANT;
  }

  /**
   * Set kode tenant
   */
  setKodeTenant(kodeTenant) {
    Storage.set('tenant_code', kodeTenant);
  }

  /**
   * Login customer with email and password
   * Uses /customers/login endpoint with kode query parameter
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async login(email, password) {
    console.log('[AuthService] Customer login attempt:', email);

    const kodeTenant = this.getKodeTenant();
    console.log('[AuthService] Using kode tenant:', kodeTenant);

    if (!kodeTenant) {
      throw new Error('Tenant not initialized. Please refresh the page.');
    }

    // Use fetch with kode query parameter
    const response = await fetch(`${this.getApiBaseUrl()}/customers/login?kode=${kodeTenant}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }

    const { customer, token } = data.data;

    // Store customer data with kode tenant
    const customerData = {
      id: customer.id,
      customer_uuid: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      token: token,
      kodeTenant: kodeTenant,
      loginAt: new Date().toISOString()
    };

    Storage.set('customer', customerData);

    console.log('[AuthService] Login successful:', customer.name);

    return data;
  }

  /**
   * Login with credentials (convenience method)
   * Uses predefined credentials for demo purposes
   */
  async loginWithCredentials(email, password) {
    return this.login(email, password);
  }

  /**
   * Register new customer (public)
   * @param {Object} data - Registration data { name, email, phone, password }
   */
  async register(data) {
    console.log('[AuthService] Customer registration:', data.email);

    const kodeTenant = this.getKodeTenant();

    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      password: data.password,
      kodeTenant: kodeTenant
    };

    const response = await fetch(`${this.getApiBaseUrl()}/customers/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'kode': kodeTenant
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Registration failed');
    }

    // Auto login after successful registration
    await this.login(data.email, data.password);

    return result;
  }

  /**
   * Get current customer
   */
  getCurrentCustomer() {
    // Try Storage first
    const customer = Storage.get('customer');
    if (customer) return customer;

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
    console.log('[AuthService] Logged out');
  }

  /**
   * Refresh token (for future use)
   */
  async refreshToken() {
    const customer = this.getCurrentCustomer();
    if (!customer?.refresh_token) {
      throw new Error('No refresh token');
    }

    const response = await fetch(`${this.getApiBaseUrl()}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'kode': customer.kodeTenant
      },
      body: JSON.stringify({ refreshToken: customer.refresh_token })
    });

    const data = await response.json();

    if (data.success) {
      const updated = {
        ...customer,
        token: data.data.token,
        refresh_token: data.data.refreshToken || customer.refresh_token,
      };
      Storage.set('customer', updated);
    }

    return data;
  }

  /**
   * Get current customer profile from API
   */
  async getMe() {
    const customer = this.getCurrentCustomer();
    if (!customer?.token) {
      throw new Error('Not logged in');
    }

    const kodeTenant = customer.kodeTenant || this.getKodeTenant();

    const response = await fetch(`${this.getApiBaseUrl()}/customers/me`, {
      headers: {
        'Authorization': `Bearer ${customer.token}`,
        'kode': kodeTenant
      }
    });

    const data = await response.json();
    return data;
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    const customer = this.getCurrentCustomer();
    if (!customer?.token) {
      throw new Error('Not logged in');
    }

    const response = await fetch(`${this.getApiBaseUrl()}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customer.token}`,
        'kode': customer.kodeTenant || this.getKodeTenant()
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    return response.json();
  }
}

export const authService = new AuthService();
export default authService;
