/**
 * Tenant Service
 * Handles tenant management
 *
 * IMPORTANT: Always use 'kode' header/query parameter, NOT 'x-tenant-id'
 */
import Storage from '../utils/storage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const DEFAULT_TENANT = 'MAJU1234';

class TenantService {
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
    // Store full tenant data
    Storage.set('tenant', tenant);
    // Store kode tenant separately for easy access
    Storage.set('tenant_code', tenant.kodeTenant);
    console.log('[TenantService] Tenant set:', tenant.name, '(kode:', tenant.kodeTenant + ')');
  }

  /**
   * Initialize tenant from URL or storage
   */
  async initializeTenant() {
    console.log('[TenantService] Initializing tenant...');

    // Check URL for tenant code
    const urlParams = new URLSearchParams(window.location.search);
    const urlTenantCode = urlParams.get('t');
    const storageTenantCode = Storage.get('tenant_code');

    // Priority: URL param > storage > env default
    const tenantCode = urlTenantCode || storageTenantCode;
    console.log('[TenantService] Tenant code source:', {
      url: urlTenantCode,
      storage: storageTenantCode,
      final: tenantCode
    });

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
    const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT || DEFAULT_TENANT;
    console.log('[TenantService] Default tenant from env:', defaultTenant);

    if (defaultTenant && defaultTenant !== tenantCode) {
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

    // Fallback: use stored tenant if available
    const storedTenant = this.getCurrentTenant();
    if (storedTenant && storedTenant.kodeTenant) {
      console.log('[TenantService] Using stored tenant:', storedTenant.name);
      return storedTenant;
    }

    console.warn('[TenantService] No tenant found, using guest mode');
    return null;
  }

  /**
   * Set tenant code directly (without fetching tenant info)
   */
  setTenantCode(kodeTenant) {
    Storage.set('tenant_code', kodeTenant);
    console.log('[TenantService] Tenant code set to:', kodeTenant);
  }

  /**
   * Clear tenant data
   */
  clearTenant() {
    Storage.remove('tenant');
    Storage.remove('tenant_code');
    console.log('[TenantService] Tenant data cleared');
  }
}

export const tenantService = new TenantService();
export default tenantService;
