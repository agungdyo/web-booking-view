/**
 * Simple SPA Router
 * Features:
 * - Route definitions with named parameters
 * - Regex-based route matching
 * - Navigation handling (history API)
 * - Route guards (beforeEach, afterEach)
 * - 404 page
 * - Redirect support
 * - Query parameters parsing
 */

class Router {
  constructor() {
    this.routes = [];
    this.namedRoutes = new Map();
    this.currentRoute = null;
    this.beforeEach = null;
    this.afterEach = null;

    // Listen to browser back/forward
    window.addEventListener('popstate', () => this.handleRoute());

    // Intercept all link clicks
    this._setupLinkInterceptor();
  }

  /**
   * Setup link click interception
   */
  _setupLinkInterceptor() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"]');
      if (link && !link.hasAttribute('data-router-ignore')) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
  }

  // ============================================
  // 1. ROUTE DEFINITIONS
  // ============================================

  /**
   * Add a route
   * @param {string} path - Route path (e.g., '/user/:id', '/product/:category/:id')
   * @param {function} handler - Route handler/page renderer
   * @param {object} options - Additional options (name, meta, guards)
   */
  addRoute(path, handler, options = {}) {
    const { name, meta = {}, guards = [] } = options;

    // Parse path to extract parameter names
    const paramNames = [];
    const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    const route = {
      path,
      name,
      regex: new RegExp(`^${regexPath}$`),
      paramNames,
      handler,
      meta,
      guards,
    };

    this.routes.push(route);

    // Register named route
    if (name) {
      this.namedRoutes.set(name, route);
    }

    return this;
  }

  /**
   * Add multiple routes at once
   * @param {array} routes - Array of route definitions
   */
  addRoutes(routes) {
    routes.forEach(route => {
      this.addRoute(route.path, route.handler, route.options);
    });
    return this;
  }

  /**
   * Create a route group with shared configuration
   * @param {object} config - Group configuration (prefix, guards, meta)
   * @param {array} routes - Routes to add
   */
  group(config, routes) {
    const { prefix = '', guards = [], meta = {} } = config;

    routes.forEach(route => {
      const fullPath = prefix + route.path;
      const mergedGuards = [...guards, ...(route.guards || [])];
      const mergedMeta = { ...meta, ...(route.meta || {}) };

      this.addRoute(fullPath, route.handler, {
        name: route.name,
        meta: mergedMeta,
        guards: mergedGuards,
      });
    });

    return this;
  }

  /**
   * Define redirect route
   * @param {string} from - Source path
   * @param {string} to - Target path or route name
   */
  redirect(from, to) {
    // Check if 'to' is a named route
    const targetRoute = this.namedRoutes.get(to);
    const targetPath = targetRoute ? targetRoute.path : to;

    this.addRoute(from, () => {
      this.navigate(targetPath, true);
    });

    return this;
  }

  // ============================================
  // 2. ROUTE MATCHING
  // ============================================

  /**
   * Match path against all routes
   * @param {string} path - URL path to match
   * @returns {object|null} Matched route with params or null
   */
  matchRoute(path) {
    for (const route of this.routes) {
      const match = path.match(route.regex);

      if (match) {
        // Extract route parameters
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        return {
          route,
          params,
          path,
        };
      }
    }

    return null;
  }

  /**
   * Find route by name
   * @param {string} name - Route name
   * @returns {object|null} Route object or null
   */
  getRoute(name) {
    return this.namedRoutes.get(name) || null;
  }

  /**
   * Generate URL from route name and params
   * @param {string} name - Route name
   * @param {object} params - Route parameters
   * @returns {string|null} Generated URL or null
   */
  generateUrl(name, params = {}) {
    const route = this.namedRoutes.get(name);

    if (!route) {
      console.warn(`Route "${name}" not found`);
      return null;
    }

    let path = route.path;

    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }

    // Replace any remaining :params with empty string
    path = path.replace(/:[^/]+/g, '');

    return path;
  }

  // ============================================
  // 3. NAVIGATION HANDLING
  // ============================================

  /**
   * Navigate to a path
   * @param {string} path - Target path
   * @param {boolean} replace - Replace history entry
   */
  navigate(path, replace = false) {
    if (path === this.getPath() && !replace) {
      return;
    }

    if (replace) {
      history.replaceState(null, '', path);
    } else {
      history.pushState(null, '', path);
    }

    this.handleRoute();
  }

  /**
   * Navigate back
   */
  back() {
    history.back();
  }

  /**
   * Navigate forward
   */
  forward() {
    history.forward();
  }

  /**
   * Refresh current route (re-run handler)
   */
  refresh() {
    this.handleRoute();
  }

  /**
   * Get current URL path (without query string)
   */
  getPath() {
    return window.location.pathname;
  }

  /**
   * Get full URL with query string
   */
  getFullPath() {
    return window.location.href;
  }

  /**
   * Get query parameters as object
   */
  getQuery() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  }

  /**
   * Get query parameters as URLSearchParams
   */
  getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Get current route params
   */
  getParams() {
    return this.currentRoute?.params || {};
  }

  /**
   * Set beforeEach navigation guard
   * @param {function} callback - Guard function
   */
  setBeforeEach(callback) {
    this.beforeEach = callback;
    return this;
  }

  /**
   * Set afterEach hook
   * @param {function} callback - Hook function
   */
  setAfterEach(callback) {
    this.afterEach = callback;
    return this;
  }

  // ============================================
  // 4. 404 PAGE & ERROR HANDLING
  // ============================================

  /**
   * Set custom 404 page
   * @param {function} handler - Custom 404 handler
   */
  setNotFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Set error handler
   * @param {function} handler - Error handler (receives error)
   */
  setErrorHandler(handler) {
    this.errorHandler = handler;
    return this;
  }

  /**
   * Render default 404 page
   */
  render404() {
    const content = document.getElementById('page-content');

    if (!content) {
      console.error('Element with id "page-content" not found');
      return;
    }

    content.innerHTML = `
      <div class="error-page" style="
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: var(--space-xl);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round"
             style="color: var(--text-tertiary); margin-bottom: var(--space-xl);">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>

        <h1 style="
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-md);
        ">404</h1>

        <h2 style="
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        ">Halaman Tidak Ditemukan</h2>

        <p style="
          color: var(--text-secondary);
          margin-bottom: var(--space-xl);
          max-width: 400px;
        ">Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>

        <div style="display: flex; gap: var(--space-md); flex-wrap: wrap; justify-content: center;">
          <a href="/" class="btn btn-primary btn-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Kembali ke Beranda
          </a>

          <a href="/lacak" class="btn btn-outline btn-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            Lacak Booking
          </a>
        </div>

        <div style="margin-top: var(--space-2xl); padding-top: var(--space-xl); border-top: 1px solid var(--border-light);">
          <p style="font-size: var(--text-sm); color: var(--text-tertiary);">
            Kode Error: <code style="background: var(--bg-tertiary); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm);">404_NOT_FOUND</code>
          </p>
          <p style="font-size: var(--text-sm); color: var(--text-tertiary); margin-top: var(--space-sm);">
            Path: <code style="background: var(--bg-tertiary); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm);">${this.getPath()}</code>
          </p>
        </div>
      </div>
    `;
  }

  // ============================================
  // MAIN ROUTE HANDLER
  // ============================================

  /**
   * Handle current route
   * @returns {Promise<void>}
   */
  async handleRoute() {
    const path = this.getPath();

    // 1. Match route
    const match = this.matchRoute(path);

    // 2. Run beforeEach guard
    if (this.beforeEach) {
      try {
        const result = await this.beforeEach(path, match);

        if (result === false) {
          return; // Guard blocked navigation
        }

        if (typeof result === 'string') {
          this.navigate(result); // Redirect
          return;
        }
      } catch (error) {
        if (this.errorHandler) {
          this.errorHandler(error);
        } else {
          console.error('Router error:', error);
        }
        return;
      }
    }

    // 3. Run route guards
    if (match && match.route.guards) {
      for (const guard of match.route.guards) {
        try {
          const result = await guard(path, match);
          if (result === false) return;
          if (typeof result === 'string') {
            this.navigate(result);
            return;
          }
        } catch (error) {
          if (this.errorHandler) {
            this.errorHandler(error);
          }
          return;
        }
      }
    }

    // 4. Update current route
    this.currentRoute = match;

    // 5. Get content element
    const content = document.getElementById('page-content');

    if (!content) {
      console.error('Element with id "page-content" not found');
      return;
    }

    // 6. Render route or 404
    try {
      if (match) {
        await match.route.handler({
          path,
          name: match.route.name,
          params: match.params,
          query: this.getQuery(),
          queryParams: this.getQueryParams(),
          meta: match.route.meta,
          navigate: (p, replace) => this.navigate(p, replace),
          router: this,
        });
      } else {
        // Custom 404 handler
        if (this.notFoundHandler) {
          await this.notFoundHandler({ path, navigate: this.navigate.bind(this) });
        } else {
          this.render404();
        }
      }
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error);
      } else {
        console.error('Route handler error:', error);
        content.innerHTML = `
          <div class="error-page" style="
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: var(--space-xl);
          ">
            <h1 style="font-size: var(--text-3xl); color: var(--color-error); margin-bottom: var(--space-md);">
              Terjadi Kesalahan
            </h1>
            <p style="color: var(--text-secondary); margin-bottom: var(--space-xl);">
              ${error.message || 'Gagal memuat halaman'}
            </p>
            <button onclick="location.reload()" class="btn btn-primary">
              Refresh Halaman
            </button>
          </div>
        `;
      }
    }

    // 7. Run afterEach hook
    if (this.afterEach) {
      this.afterEach(path, match);
    }

    // 8. Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 9. Update active nav links
    this._updateActiveLinks(path);
  }

  /**
   * Update active state on navigation links
   */
  _updateActiveLinks(currentPath) {
    document.querySelectorAll('[data-route]').forEach(link => {
      const route = link.getAttribute('data-route');
      if (route === currentPath || (route !== '/' && currentPath.startsWith(route))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize router
   */
  init() {
    // Handle initial route
    this.handleRoute();

    return this;
  }

  /**
   * Get all registered routes (for debugging)
   */
  getRoutes() {
    return this.routes;
  }
}

// ============================================
// EXAMPLE ROUTE GUARDS
// ============================================

/**
 * Auth guard - redirect to login if not authenticated
 */
export function requireAuth(redirectTo = '/login') {
  return (path, match) => {
    const customer = JSON.parse(localStorage.getItem('wb_customer') || 'null');

    if (!customer?.token) {
      // Store intended destination
      sessionStorage.setItem('redirectAfterLogin', path);
      return redirectTo;
    }

    return true;
  };
}

/**
 * Guest guard - redirect to dashboard if already logged in
 */
export function requireGuest(redirectTo = '/dashboard') {
  return (path, match) => {
    const customer = JSON.parse(localStorage.getItem('wb_customer') || 'null');

    if (customer?.token) {
      return redirectTo;
    }

    return true;
  };
}

/**
 * Role guard - check user role
 */
export function requireRole(roles, redirectTo = '/') {
  return (path, match) => {
    const customer = JSON.parse(localStorage.getItem('wb_customer') || 'null');

    if (!customer?.token) {
      return '/login';
    }

    if (!roles.includes(customer.role)) {
      return redirectTo;
    }

    return true;
  };
}

// ============================================
// EXPORT
// ============================================

// Singleton instance
export const router = new Router();
export default router;
