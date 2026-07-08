/**
 * Simple SPA Router
 */

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.beforeEach = null;
    this.afterEach = null;

    // Listen to popstate
    window.addEventListener('popstate', () => this.handleRoute());

    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
  }

  /**
   * Add route
   */
  addRoute(path, handler) {
    // Convert path to regex
    const paramNames = [];
    const regexPath = path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    this.routes.push({
      path,
      regex: new RegExp(`^${regexPath}$`),
      paramNames,
      handler,
    });

    return this;
  }

  /**
   * Set beforeEach guard
   */
  setBeforeEach(callback) {
    this.beforeEach = callback;
    return this;
  }

  /**
   * Set afterEach hook
   */
  setAfterEach(callback) {
    this.afterEach = callback;
    return this;
  }

  /**
   * Navigate to path
   */
  navigate(path, replace = false) {
    if (replace) {
      history.replaceState(null, '', path);
    } else {
      history.pushState(null, '', path);
    }
    this.handleRoute();
  }

  /**
   * Get current path
   */
  getPath() {
    return window.location.pathname;
  }

  /**
   * Get query params
   */
  getQuery() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Get route params
   */
  getParams() {
    return this.currentRoute?.params || {};
  }

  /**
   * Handle current route
   */
  async handleRoute() {
    const path = this.getPath();

    // Find matching route
    let matchedRoute = null;

    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        matchedRoute = route;
        matchedRoute.params = {};
        route.paramNames.forEach((name, i) => {
          matchedRoute.params[name] = match[i + 1];
        });
        break;
      }
    }

    // Run beforeEach guard
    if (this.beforeEach) {
      const result = await this.beforeEach(path, matchedRoute);
      if (result === false) return;
      if (typeof result === 'string') {
        this.navigate(result);
        return;
      }
    }

    this.currentRoute = matchedRoute;

    // Render 404 or route handler
    const content = document.getElementById('page-content');
    if (matchedRoute) {
      await matchedRoute.handler({
        path,
        params: matchedRoute.params,
        query: this.getQuery(),
        navigate: (p) => this.navigate(p),
      });
    } else {
      this.render404();
    }

    // Run afterEach hook
    if (this.afterEach) {
      this.afterEach(path, matchedRoute);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Render 404 page
   */
  render404() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary); margin-bottom: var(--space-lg);">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h1 class="empty-state-title" style="font-size: var(--text-3xl);">404 - Halaman Tidak Ditemukan</h1>
        <p class="empty-state-description">Maaf, halaman yang Anda cari tidak tersedia.</p>
        <a href="/" class="btn btn-primary" style="margin-top: var(--space-lg);">
          Kembali ke Beranda
        </a>
      </div>
    `;
  }

  /**
   * Initialize router
   */
  init() {
    this.handleRoute();
    return this;
  }
}

// Singleton instance
export const router = new Router();
export default router;
