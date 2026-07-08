/**
 * Dashboard Page
 */
import { authService } from '../services/auth.service.js';

export async function renderDashboardPage() {
  const content = document.getElementById('page-content');
  const customer = authService.getCurrentCustomer();

  // Check if logged in
  if (!customer) {
    window.location.href = '/login?redirect=/dashboard';
    return;
  }

  content.innerHTML = `
    <div class="dashboard-layout">
      <div class="page-container" style="max-width: 100%; padding: 0;">
        <div class="dashboard-header">
          <h1 class="dashboard-title">Dashboard</h1>
        </div>

        <div class="grid grid-cols-1" style="gap: var(--space-lg);">
          <!-- Welcome Card -->
          <div class="card">
            <div class="card-body" style="display: flex; align-items: center; gap: var(--space-lg);">
              <div class="avatar avatar-lg">
                ${getInitials(customer.name)}
              </div>
              <div>
                <h2 style="font-weight: var(--font-semibold);">Selamat Datang, ${customer.name}!</h2>
                <p class="text-secondary">Kelola booking dan aktivitas Anda di sini</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-2" style="gap: var(--space-lg);">
            <a href="/katalog" class="card" style="text-decoration: none;">
              <div class="card-body" style="text-align: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: var(--space-md);">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-xs);">Cari Item</h3>
                <p class="text-sm text-secondary">Jelajahi katalog item</p>
              </div>
            </a>

            <a href="/dashboard/bookings" class="card" style="text-decoration: none;">
              <div class="card-body" style="text-align: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: var(--space-md);">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-xs);">Booking Saya</h3>
                <p class="text-sm text-secondary">Lihat riwayat booking</p>
              </div>
            </a>

            <a href="/lacak" class="card" style="text-decoration: none;">
              <div class="card-body" style="text-align: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: var(--space-md);">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-xs);">Lacak Booking</h3>
                <p class="text-sm text-secondary">Cek status booking</p>
              </div>
            </a>

            <a href="/" class="card" style="text-decoration: none;">
              <div class="card-body" style="text-align: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: var(--space-md);">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-xs);">Beranda</h3>
                <p class="text-sm text-secondary">Kembali ke beranda</p>
              </div>
            </a>
          </div>

          <!-- Profile Summary -->
          <div class="card">
            <div class="card-body">
              <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Informasi Akun</h3>

              <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                <div style="display: flex; justify-content: space-between; padding: var(--space-sm) 0; border-bottom: 1px solid var(--border-light);">
                  <span class="text-secondary">Nama</span>
                  <span class="font-medium">${customer.name}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: var(--space-sm) 0; border-bottom: 1px solid var(--border-light);">
                  <span class="text-secondary">Email</span>
                  <span class="font-medium">${customer.email}</span>
                </div>
                ${customer.phone ? `
                  <div style="display: flex; justify-content: space-between; padding: var(--space-sm) 0;">
                    <span class="text-secondary">Telepon</span>
                    <span class="font-medium">${customer.phone}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export default renderDashboardPage;
