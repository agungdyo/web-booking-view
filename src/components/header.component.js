/**
 * Header Component
 */
import { authService } from '../services/auth.service.js';
import Storage from '../utils/storage.js';
import Cart from './cart.component.js';

export function renderHeader() {
  const header = document.getElementById('header');
  const customer = authService.getCurrentCustomer();
  const tenant = Storage.get('tenant');
  const itemCount = Cart.getItemCount();

  header.innerHTML = `
    <div class="header-container">

      <nav class="header-nav" id="nav-menu">
        <a href="/" class="nav-link" data-route="/">Beranda</a>
        <a href="/katalog" class="nav-link" data-route="/katalog">Katalog</a>
        <a href="/lacak" class="nav-link" data-route="/lacak">Lacak Booking</a>
      </nav>

      <a href="/" class="header-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" x2="16" y1="2" y2="6"/>
          <line x1="8" x2="8" y1="2" y2="6"/>
          <line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
        <span>${tenant?.name || 'Booking'}</span>
      </a>

      <div class="header-actions">
        <!-- Cart Icon with Badge -->
        <button class="cart-icon-btn" id="cart-icon-btn" onclick="Cart.toggleDrawer()" aria-label="Keranjang">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <span class="cart-badge" id="cart-badge" style="display: ${itemCount > 0 ? 'flex' : 'none'};">${itemCount > 99 ? '99+' : itemCount}</span>
        </button>

        ${customer ? `
          <div class="dropdown" style="position: relative;">
            <button class="btn btn-outline btn-sm" id="user-menu-btn" style="display: flex; align-items: center; gap: var(--space-sm);">
              <div class="avatar avatar-sm">${getInitials(customer.name)}</div>
              <span class="hide-mobile">${truncate(customer.name, 12)}</span>
            </button>
            <div class="dropdown-menu" id="user-dropdown" style="position: absolute; top: 100%; right: 0; margin-top: var(--space-sm); background: var(--bg-primary); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); min-width: 200px; opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all var(--transition-fast); z-index: var(--z-dropdown);">
              <div style="padding: var(--space-md); border-bottom: 1px solid var(--border-light);">
                <div style="font-weight: var(--font-medium);">${customer.name}</div>
                <div style="font-size: var(--text-sm); color: var(--text-tertiary);">${customer.email}</div>
              </div>
              <div style="padding: var(--space-sm);">
                <a href="/dashboard" class="dropdown-item" style="display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); color: var(--text-secondary); transition: background var(--transition-fast);">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                  Dashboard
                </a>
                <a href="/dashboard/bookings" class="dropdown-item" style="display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); color: var(--text-secondary); transition: background var(--transition-fast);">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Bookingan Saya
                </a>
                <button class="dropdown-item" id="logout-btn" style="display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); color: var(--color-error); width: 100%; text-align: left;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        ` : `
          <a href="/login" class="btn btn-outline btn-sm hide-mobile">Masuk</a>
          <a href="/register" class="btn btn-primary btn-sm">Daftar</a>
        `}

        <button class="menu-toggle hide-desktop" id="menu-toggle" aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="bottom-nav">
      <a href="/" class="bottom-nav-item" data-route="/">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Beranda</span>
      </a>
      <a href="/katalog" class="bottom-nav-item" data-route="/katalog">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Katalog</span>
      </a>
      ${customer ? `
        <a href="/dashboard/bookings" class="bottom-nav-item" data-route="/dashboard/bookings">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Booking</span>
        </a>
        <a href="/lacak" class="bottom-nav-item" data-route="/lacak">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span>Lacak</span>
        </a>
      ` : `
        <a href="/login" class="bottom-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
          <span>Masuk</span>
        </a>
      `}
    </nav>
  `;

  // Setup event listeners
  setupHeaderEvents();
}

function setupHeaderEvents() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // User dropdown
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');

  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', () => {
      const isOpen = userDropdown.style.opacity === '1';
      userDropdown.style.opacity = isOpen ? '0' : '1';
      userDropdown.style.visibility = isOpen ? 'hidden' : 'visible';
      userDropdown.style.transform = isOpen ? 'translateY(-10px)' : 'translateY(0)';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.style.opacity = '0';
        userDropdown.style.visibility = 'hidden';
        userDropdown.style.transform = 'translateY(-10px)';
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authService.logout();
      window.location.href = '/';
    });
  }

  // Active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
    const route = link.getAttribute('data-route');
    if (route === currentPath) {
      link.classList.add('active');
    }
  });
}

// Helper functions
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function truncate(text, length = 50) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export default renderHeader;
