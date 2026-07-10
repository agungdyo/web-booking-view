/**
 * Tenant Service
 * Uses kode tenant (not tenant ID)
 */
import Storage from '../utils/storage.js';

class TenantService {
  /**
   * Get API base URL
   */
  getApiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  }

  /**
   * Get tenant by kode (public endpoint)
   */
  async getTenantByKode(kode) {
    const response = await fetch(`${this.getApiBaseUrl()}/public/tenants/kode/${kode}`);

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
    Storage.set('tenant_code', tenant.kodeTenant); // Kode tenant
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
        const response = await this.getTenantByKode(tenantCode);
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
        const response = await this.getTenantByKode(defaultTenant);
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
