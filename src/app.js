/**
 * App Configuration
 */
export const APP_CONFIG = {
  name: 'Web Booking View',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  defaultTenant: import.meta.env.VITE_DEFAULT_TENANT || null,
};

/**
 * App state
 */
export const appState = {
  tenant: null,
  customer: null,
  cart: { items: [], dates: null },
  loading: false,
  error: null,
};

export default { APP_CONFIG, appState };
