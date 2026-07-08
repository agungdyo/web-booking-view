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
    return apiClient.get(`/public/tenants/kode/${code}`);
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
    Storage.set('tenant_id', tenant.id);
    Storage.set('tenant_code', tenant.kodeTenant);
  }

  /**
   * Initialize tenant from URL or storage
   */
  async initializeTenant() {
    // Check URL for tenant code
    const urlParams = new URLSearchParams(window.location.search);
    const tenantCode = urlParams.get('t') || Storage.get('tenant_code');

    if (tenantCode) {
      try {
        const response = await this.getTenantByCode(tenantCode);
        if (response.success) {
          this.setCurrentTenant(response.data);
          return response.data;
        }
      } catch (error) {
        console.warn('Failed to load tenant:', error);
      }
    }

    // Check default tenant from env
    const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT;
    if (defaultTenant && !tenantCode) {
      try {
        const response = await this.getTenantByCode(defaultTenant);
        if (response.success) {
          this.setCurrentTenant(response.data);
          return response.data;
        }
      } catch (error) {
        console.warn('Failed to load default tenant:', error);
      }
    }

    return null;
  }
}

export const tenantService = new TenantService();
export default tenantService;
