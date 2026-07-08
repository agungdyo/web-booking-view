/**
 * My Bookings Page
 */
import { bookingService } from '../services/booking.service.js';
import { authService } from '../services/auth.service.js';
import { formatCurrency, formatDate, formatBookingStatus, getBadgeClass } from '../utils/format.js';

export async function renderMyBookingsPage() {
  const content = document.getElementById('page-content');
  const customer = authService.getCurrentCustomer();

  // Check if logged in
  if (!customer) {
    content.innerHTML = `
      <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1 class="empty-state-title">Login Diperlukan</h1>
        <p class="empty-state-description">Silakan login untuk melihat booking Anda</p>
        <a href="/login?redirect=/dashboard/bookings" class="btn btn-primary" style="margin-top: var(--space-lg);">Masuk</a>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="dashboard-layout">
      <div class="page-container" style="max-width: 100%; padding: 0;">
        <div class="dashboard-header">
          <h1 class="dashboard-title">Booking Saya</h1>
        </div>

        <div id="bookings-list">
          <div class="page-loading">
            <div class="spinner"></div>
            <p class="page-loading-text">Memuat daftar booking...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadBookings();
}

async function loadBookings() {
  const container = document.getElementById('bookings-list');

  try {
    const response = await bookingService.getMyBookings();

    if (response.success && response.data.length > 0) {
      container.innerHTML = `
        <div class="bookings-list">
          ${response.data.map(booking => renderBookingCard(booking)).join('')}
        </div>

        ${response.meta?.total_pages > 1 ? `
          <div class="pagination">
            ${Array.from({ length: response.meta.total_pages }, (_, i) => `
              <button class="pagination-btn ${i + 1 === response.meta.page ? 'active' : ''}" onclick="loadBookingsPage(${i + 1})">
                ${i + 1}
              </button>
            `).join('')}
          </div>
        ` : ''}
      `;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-state-icon">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <h3 class="empty-state-title">Belum Ada Booking</h3>
          <p class="empty-state-description">Mulai booking item yang Anda butuhkan</p>
          <a href="/katalog" class="btn btn-primary" style="margin-top: var(--space-lg);">Lihat Katalog</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load bookings:', error);
    container.innerHTML = `
      <div class="alert alert-error">
        <strong>Gagal memuat booking</strong>
        <p style="margin-top: var(--space-xs);">${error.message}</p>
        <button class="btn btn-primary btn-sm" style="margin-top: var(--space-md);" onclick="loadBookings()">Coba Lagi</button>
      </div>
    `;
  }
}

function renderBookingCard(booking) {
  return `
    <div class="booking-card">
      <div class="booking-card-info">
        <div class="booking-card-header">
          <span class="booking-card-code">${booking.code}</span>
          <span class="badge ${getBadgeClass(formatBookingStatus(booking.status).color)}">
            ${formatBookingStatus(booking.status).label}
          </span>
        </div>
        <p class="booking-card-date">
          ${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}
        </p>
        <p class="booking-card-items">
          ${booking.items_count || booking.items?.length || 0} item
        </p>
      </div>

      <div class="booking-card-total">
        <span class="font-bold text-primary">${formatCurrency(booking.total)}</span>
      </div>

      <div class="booking-card-actions">
        <a href="/payment/${booking.id}" class="btn btn-primary btn-sm">
          Detail
        </a>
      </div>
    </div>
  `;
}

window.loadBookingsPage = async function(page) {
  const container = document.getElementById('bookings-list');
  container.innerHTML = `
    <div class="page-loading">
      <div class="spinner"></div>
      <p class="page-loading-text">Memuat...</p>
    </div>
  `;

  try {
    const response = await bookingService.getMyBookings({ page });
    if (response.success) {
      container.innerHTML = `
        <div class="bookings-list">
          ${response.data.map(booking => renderBookingCard(booking)).join('')}
        </div>

        ${response.meta?.total_pages > 1 ? `
          <div class="pagination">
            ${Array.from({ length: response.meta.total_pages }, (_, i) => `
              <button class="pagination-btn ${i + 1 === response.meta.page ? 'active' : ''}" onclick="loadBookingsPage(${i + 1})">
                ${i + 1}
              </button>
            `).join('')}
          </div>
        ` : ''}
      `;
    }
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-error">
        Gagal memuat data
      </div>
    `;
  }
};

export default renderMyBookingsPage;
