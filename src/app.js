/**
 * App Configuration
 */
export const APP_CONFIG = {
  name: 'Web Booking View',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  defaultTenant: import.meta.env.VITE_DEFAULT_TENANT || 'MAJU1234',
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
  initialized: false,
};

/**
 * Initialize the application
 * Must be called before rendering any page
 */
export async function initializeApp() {
  if (appState.initialized) {
    console.log('[App] Already initialized');
    return appState;
  }

  console.log('[App] Initializing application...');
  appState.loading = true;

  try {
    // Import services dynamically to avoid circular dependencies
    const { tenantService } = await import('./services/tenant.service.js');
    const { authService } = await import('./services/auth.service.js');
    const CartStorage = (await import('./services/cart-storage.service.js')).default;

    // 1. Initialize tenant from URL or storage
    const tenant = await tenantService.initializeTenant();
    appState.tenant = tenant;

    // 2. Check if user is already logged in
    if (authService.isLoggedIn()) {
      const customer = authService.getCurrentCustomer();
      appState.customer = customer;
      console.log('[App] User logged in:', customer.name);
    }

    // 3. Load cart from storage
    const cart = CartStorage.getCart();
    appState.cart = cart;
    console.log('[App] Cart loaded:', cart.items.length, 'items');

    appState.initialized = true;
    console.log('[App] Application initialized successfully');

    return appState;
  } catch (error) {
    console.error('[App] Initialization error:', error);
    appState.error = error.message;
    throw error;
  } finally {
    appState.loading = false;
  }
}

/**
 * Get current app state
 */
export function getAppState() {
  return { ...appState };
}

/**
 * Update app state
 */
export function setAppState(updates) {
  Object.assign(appState, updates);
}

export default { APP_CONFIG, appState, initializeApp, getAppState, setAppState };
