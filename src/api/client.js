/**
 * API Client - Simple Fetch wrapper
 * Uses kode tenant (not tenant ID)
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
   * Get kode tenant
   */
  getKodeTenant() {
    return Storage.get('tenant_code') || null;
  }

  /**
   * Build headers with auth and kode tenant
   */
  buildHeaders(extraHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...extraHeaders };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add kode tenant
    const kodeTenant = this.getKodeTenant();
    if (kodeTenant) {
      headers['kode'] = kodeTenant;
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
        ...this.buildHeaders(options.headers || {}),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error?.message || 'Request failed');
        error.status = response.status;
        error.code = data.error?.code;
        error.details = data.error?.details;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError') {
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
