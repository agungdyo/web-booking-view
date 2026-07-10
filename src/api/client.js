/**
 * API Client - Fetch wrapper for API calls
 * Supports authenticated endpoints with Bearer token
 */

import Storage from '../utils/storage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get auth token from storage
   */
  getToken() {
    const customer = Storage.get('customer');
    return customer?.token || null;
  }

  /**
   * Set tenant ID header
   */
  getTenantId() {
    return Storage.get('tenant_id') || null;
  }

  /**
   * Set tenant code (for public API calls)
   */
  getTenantCode() {
    return Storage.get('tenant_code') || null;
  }

  /**
   * Build headers with auth and tenant
   * @param {Object} extraHeaders - Additional headers to merge
   * @param {boolean} requireAuth - Whether to include auth token
   */
  buildHeaders(extraHeaders = {}, requireAuth = false) {
    const headers = { ...this.defaultHeaders, ...extraHeaders };

    // Add auth token if available or required
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (requireAuth) {
      // Try to get from localStorage directly if not in Storage wrapper
      const localCustomer = localStorage.getItem('customer');
      if (localCustomer) {
        try {
          const parsed = JSON.parse(localCustomer);
          if (parsed.token) {
            headers['Authorization'] = `Bearer ${parsed.token}`;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    // Add tenant ID if available
    const tenantId = this.getTenantId();
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    return headers;
  }

  /**
   * Make API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @param {boolean} requireAuth - Whether auth is required
   */
  async request(endpoint, options = {}, requireAuth = false) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.buildHeaders(options.headers || {}, requireAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        const error = new Error(data.error?.message || 'Request failed');
        error.status = response.status;
        error.code = data.error?.code;
        error.details = data.error?.details;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError') {
        // Network error
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      throw error;
    }
  }

  /**
   * GET request (public endpoint)
   */
  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    ).toString();

    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * GET request with kode parameter (for public endpoints)
   * Uses X-Tenant-ID header instead of query param
   */
  async getPublic(endpoint, params = {}, options = {}) {
    // Extract kode from params (for public endpoints)
    const { kode, ...restParams } = params;

    // Build headers with X-Tenant-ID
    const headers = { ...this.buildHeaders() };

    // If we have a tenant ID directly, use it
    // Otherwise we might need to look it up
    const tenantId = this.getTenantId();
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    const queryString = new URLSearchParams(
      Object.entries(restParams).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    ).toString();

    const url = `${this.baseURL}${endpoint}${queryString ? '?' + queryString : ''}`;

    return this.request(url, {
      ...options,
      method: 'GET',
      headers
    });
  }

  /**
   * GET request for authenticated endpoints
   */
  async getAuth(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    ).toString();

    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { ...options, method: 'GET' }, true);
  }

  /**
   * POST request (public endpoint)
   */
  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * POST request for authenticated endpoints
   */
  async postAuth(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }, true);
  }

  /**
   * PUT request
   */
  async put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request for authenticated endpoints
   */
  async putAuth(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }, true);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * DELETE request for authenticated endpoints
   */
  async deleteAuth(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    }, true);
  }
}

// Singleton instance
export const apiClient = new ApiClient();
export default apiClient;
