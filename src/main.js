/**
 * Main Application Entry Point
 */
import { router } from './utils/router.js';
import { renderHeader } from './components/header.component.js';
import { renderFooter } from './components/footer.component.js';
import { tenantService } from './services/tenant.service.js';
import { authService } from './services/auth.service.js';
import Storage from './utils/storage.js';
import Cart from './components/cart.component.js';
import Toast from './components/toast.component.js';

// Import pages
import { renderHomePage } from './pages/home.page.js';
import { renderCatalogPage } from './pages/catalog.page.js';
import { renderItemDetailPage } from './pages/item-detail.page.js';
import { renderLoginPage } from './pages/login.page.js';
import { renderRegisterPage } from './pages/register.page.js';
import { renderBookingPage } from './pages/booking.page.js';
import { renderPaymentPage } from './pages/payment.page.js';
import { renderTrackPage } from './pages/track.page.js';
import { renderMyBookingsPage } from './pages/my-bookings.page.js';
import { renderDashboardPage } from './pages/dashboard.page.js';

/**
 * Initialize application
 */
async function initApp() {
  console.log('[App] Starting initialization...');
  console.log('[App] VITE_DEFAULT_TENANT:', import.meta.env.VITE_DEFAULT_TENANT);

  try {
    // Initialize tenant first
    console.log('[App] Initializing tenant...');
    const tenant = await tenantService.initializeTenant();
    console.log('[App] Tenant initialized:', tenant?.name || 'No tenant');

  } catch (error) {
    console.error('[App] Tenant init error:', error);
  }

  // Render header and footer
  console.log('[App] Rendering header/footer...');
  renderHeader();
  renderFooter();

  // Render cart drawer
  document.body.insertAdjacentHTML('beforeend', Cart.renderDrawerHTML());
  Cart.updateUI();

  // Setup router
  setupRoutes();

  // Initialize router
  console.log('[App] Initializing router...');
  router.init();

  // Make navigateTo globally available
  window.navigateTo = (path) => router.navigate(path);

  // Make addToCart globally available
  window.addToCart = async (itemId) => {
    try {
      const { itemService } = await import('./services/item.service.js');
      const response = await itemService.getItem(itemId);
      if (response.success) {
        const item = response.data;
        Cart.addItem(item);

        // Show success toast
        Toast.success(`${item.name} ditambahkan ke keranjang!`);

        // Open cart drawer after adding
        Cart.openDrawer();

        // Update header badge
        Cart.updateUI();
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      Toast.error('Gagal menambahkan item ke keranjang');
    }
  };

  // Expose services for debugging
  window.authService = authService;
  window.tenantService = tenantService;

  console.log('[App] Initialization complete');
}

/**
 * Setup routes
 */
function setupRoutes() {
  router
    // Public routes
    .addRoute('/', renderHomePage)
    .addRoute('/katalog', renderCatalogPage)
    .addRoute('/item/:id', renderItemDetailPage)
    .addRoute('/login', renderLoginPage)
    .addRoute('/register', renderRegisterPage)
    .addRoute('/lacak', renderTrackPage)

    // Protected routes
    .addRoute('/booking', (context) => {
      if (!authService.isLoggedIn()) {
        router.navigate('/login?redirect=/booking');
        return;
      }
      renderBookingPage(context);
    })
    .addRoute('/payment/:id', (context) => {
      if (!authService.isLoggedIn()) {
        router.navigate('/login?redirect=/payment/' + context.params.id);
        return;
      }
      renderPaymentPage(context);
    })
    .addRoute('/dashboard', (context) => {
      if (!authService.isLoggedIn()) {
        router.navigate('/login?redirect=/dashboard');
        return;
      }
      renderDashboardPage(context);
    })
    .addRoute('/dashboard/bookings', (context) => {
      if (!authService.isLoggedIn()) {
        router.navigate('/login?redirect=/dashboard/bookings');
        return;
      }
      renderMyBookingsPage(context);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
