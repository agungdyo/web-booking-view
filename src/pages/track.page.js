/**
 * Track Booking Page
 */
import { bookingService } from '../services/booking.service.js';
import { formatCurrency, formatDate, formatBookingStatus, formatPaymentStatus, getBadgeClass } from '../utils/format.js';

export async function renderTrackPage() {
  const content = document.getElementById('page-content');
  const code = new URLSearchParams(window.location.search).get('code') || '';

  content.innerHTML = `
    <section class="track-page">
      <div class="page-container">
        <div class="track-form">
          <h1 class="section-title" style="text-align: center;">Lacak Booking</h1>
          <p class="text-secondary text-center" style="margin-bottom: var(--space-xl);">
            Masukkan kode booking untuk melihat status pesanan Anda
          </p>

          <div class="card">
            <div class="card-body">
              <form id="track-form">
                <div class="form-group">
                  <label class="form-label">Kode Booking</label>
                  <input type="text" class="form-input" id="booking-code" placeholder="Contoh: BK-20240115-0001" value="${code}" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block btn-lg" id="track-btn">
                  Lacak
                </button>
              </form>
            </div>
          </div>
        </div>

        <div id="track-result"></div>
      </div>
    </section>
  `;

  // Setup form handler
  const form = document.getElementById('track-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('booking-code').value.trim();
    await trackBooking(code);
  });

  // Auto-track if code provided
  if (code) {
    await trackBooking(code);
  }
}

async function trackBooking(code) {
  const resultDiv = document.getElementById('track-result');
  const trackBtn = document.getElementById('track-btn');

  if (!code) {
    resultDiv.innerHTML = '';
    return;
  }

  trackBtn.disabled = true;
  trackBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';

  try {
    const response = await bookingService.trackBooking(code);

    if (response.success) {
      renderTrackResult(response.data);
    } else {
      throw new Error('Booking tidak ditemukan');
    }
  } catch (error) {
    console.error('Track error:', error);
    resultDiv.innerHTML = `
      <div class="alert alert-error" style="max-width: 600px; margin: 0 auto;">
        <strong>Gagal Melacak Booking</strong>
        <p style="margin-top: var(--space-xs);">${error.message}</p>
      </div>
    `;
  } finally {
    trackBtn.disabled = false;
    trackBtn.textContent = 'Lacak';
  }
}

function renderTrackResult(booking) {
  const resultDiv = document.getElementById('track-result');

  resultDiv.innerHTML = `
    <div class="track-result">
      <div style="text-align: center; margin-bottom: var(--space-xl);">
        <span class="badge ${getBadgeClass(formatBookingStatus(booking.status).color)}" style="font-size: var(--text-base); padding: var(--space-sm) var(--space-lg);">
          ${formatBookingStatus(booking.status).label}
        </span>
      </div>

      <div class="card" style="background: var(--bg-tertiary);">
        <div class="card-body">
          <div style="text-align: center;">
            <p style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: var(--space-xs);">Kode Booking</p>
            <p style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary); letter-spacing: 0.05em;">${booking.code}</p>
          </div>
        </div>
      </div>

      <div style="margin-top: var(--space-xl);">
        <h4 style="font-weight: var(--font-semibold); margin-bottom: var(--space-md);">Detail Booking</h4>

        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          <div style="display: flex; justify-content: space-between; padding: var(--space-md) 0; border-bottom: 1px solid var(--border-light);">
            <span class="text-secondary">Item</span>
            <span class="font-medium">${booking.items_summary || '-'}</span>
          </div>

          ${booking.start_date ? `
            <div style="display: flex; justify-content: space-between; padding: var(--space-md) 0; border-bottom: 1px solid var(--border-light);">
              <span class="text-secondary">Tanggal</span>
              <span class="font-medium">${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}</span>
            </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between; padding: var(--space-md) 0; border-bottom: 1px solid var(--border-light);">
            <span class="text-secondary">Total Pembayaran</span>
            <span class="font-bold text-primary">${formatCurrency(booking.total)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; padding: var(--space-md) 0;">
            <span class="text-secondary">Status Pembayaran</span>
            <span class="badge ${getBadgeClass(formatPaymentStatus(booking.payment_status).color)}">
              ${formatPaymentStatus(booking.payment_status).label}
            </span>
          </div>
        </div>
      </div>

      ${booking.status === 'pending' ? `
        <div style="margin-top: var(--space-xl);">
          <a href="/payment/${booking.id}" class="btn btn-primary btn-block btn-lg">
            Lanjutkan Pembayaran
          </a>
        </div>
      ` : ''}
    </div>
  `;
}

export default renderTrackPage;
