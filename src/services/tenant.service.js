/**
 * Tenant Service
 */
import apiClient from '../api/client.js';
import Storage from '../utils/storage.js';

class TenantService {
  /**
   * Get tenant by code (public endpoint)
   */
  async getTenantByCode(code) {
    // First, look up tenant ID by kode using the public API
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/public/tenants/kode/${code}`);

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data;
      }
    }

    throw new Error('Tenant not found');
  }

  /**
   * Get current tenant
   */
  getCurrentTenant() {
    return Storage.get('tenant');
  }

  /**
   * Set current tenant
   */
  setCurrentTenant(tenant) {
    Storage.set('tenant', tenant);
    Storage.set('tenant_id', tenant.id);           // UUID for API header
    Storage.set('tenant_code', tenant.kodeTenant); // Kode tenant for reference
  }

  /**
   * Initialize tenant from URL or storage
   */
  async initializeTenant() {
    console.log('[TenantService] Initializing tenant...');

    // Check URL for tenant code
    const urlParams = new URLSearchParams(window.location.search);
    const tenantCode = urlParams.get('t') || Storage.get('tenant_code');
    console.log('[TenantService] Found tenant code:', tenantCode);

    if (tenantCode) {
      try {
        console.log('[TenantService] Fetching tenant from API...');
        const response = await this.getTenantByCode(tenantCode);
        if (response.success) {
          console.log('[TenantService] Tenant loaded:', response.data.name);
          this.setCurrentTenant(response.data);
          return response.data;
        }
      } catch (error) {
        console.warn('[TenantService] Failed to load tenant from URL/storage:', error);
      }
    }

    // Check default tenant from env
    const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT;
    console.log('[TenantService] Default tenant from env:', defaultTenant);
    if (defaultTenant && !tenantCode) {
      try {
        console.log('[TenantService] Fetching default tenant...');
        const response = await this.getTenantByCode(defaultTenant);
        if (response.success) {
          console.log('[TenantService] Default tenant loaded:', response.data.name);
          this.setCurrentTenant(response.data);
          return response.data;
        }
      } catch (error) {
        console.warn('[TenantService] Failed to load default tenant:', error);
      }
    }

    console.warn('[TenantService] No tenant found, using guest mode');
    return null;
  }
}

export const tenantService = new TenantService();
export default tenantService;
