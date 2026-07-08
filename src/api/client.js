/**
 * API Client - Fetch wrapper for API calls
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
   */
  buildHeaders(extraHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...extraHeaders };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.buildHeaders(),
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
   * GET request
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
   * POST request
   */
  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
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
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
export default apiClient;
