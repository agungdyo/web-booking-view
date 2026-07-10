/**
 * Authentication Service
 * Handles customer authentication and token management
 * Uses kode tenant (not tenant ID)
 */
import Storage from '../utils/storage.js';

class AuthService {
  /**
   * Get API base URL
   */
  getApiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Get kode tenant from storage
   */
  getKodeTenant() {
    return Storage.get('tenant_code') || import.meta.env.VITE_DEFAULT_TENANT;
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

    // Store customer data
    const customerData = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      token: token,
      kodeTenant: customer.kodeTenant,
    };

    Storage.set('customer', customerData);

    // Also store in localStorage for direct access
    localStorage.setItem('wb_customer', JSON.stringify(customerData));

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
    };

    if (kodeTenant) {
      payload.kodeTenant = kodeTenant;
    }

    const response = await fetch(`${this.getApiBaseUrl()}/customers/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

    // Fallback to localStorage
    try {
      const local = localStorage.getItem('wb_customer');
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
    localStorage.remove('wb_customer');
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
      localStorage.setItem('wb_customer', JSON.stringify(updated));
    }

    return data;
  }

  /**
   * Get current customer profile
   */
  async getMe() {
    const customer = this.getCurrentCustomer();
    if (!customer?.token) {
      throw new Error('Not logged in');
    }

    const response = await fetch(`${this.getApiBaseUrl()}/customers/me`, {
      headers: {
        'Authorization': `Bearer ${customer.token}`,
        'kode': customer.kodeTenant
      }
    });

    return response.json();
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
        'Authorization': `Bearer ${customer.token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    return response.json();
  }
}

export const authService = new AuthService();
export default authService;
