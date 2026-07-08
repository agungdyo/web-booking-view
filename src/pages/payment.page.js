/**
 * Payment Page
 */
import { bookingService } from '../services/booking.service.js';
import { paymentService } from '../services/payment.service.js';
import { formatCurrency, formatDate, formatBookingStatus, formatPaymentStatus, getBadgeClass } from '../utils/format.js';
import Toast from '../components/toast.component.js';

export async function renderPaymentPage({ params }) {
  const content = document.getElementById('page-content');
  const { id } = params;

  content.innerHTML = `
    <div class="page-loading">
      <div class="spinner"></div>
      <p class="page-loading-text">Memuat detail pembayaran...</p>
    </div>
  `;

  try {
    const response = await bookingService.getBooking(id);

    if (!response.success) {
      throw new Error('Booking not found');
    }

    renderPaymentDetail(response.data);
  } catch (error) {
    console.error('Failed to load booking:', error);
    content.innerHTML = `
      <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1 class="empty-state-title">Booking Tidak Ditemukan</h1>
        <p class="empty-state-description">Maaf, booking yang Anda cari tidak tersedia.</p>
        <a href="/dashboard" class="btn btn-primary" style="margin-top: var(--space-lg);">Kembali ke Dashboard</a>
      </div>
    `;
  }
}

function renderPaymentDetail(booking) {
  const content = document.getElementById('page-content');
  const payment = booking.payment || {};
  const isPaid = payment.status === 'paid';
  const isPending = payment.status === 'pending';
  const canPay = booking.status === 'pending';

  content.innerHTML = `
    <section class="payment-page">
      <div class="page-container">
        <!-- Status Banner -->
        ${booking.status === 'confirmed' || isPaid ? `
          <div class="alert alert-success" style="margin-bottom: var(--space-xl);">
            <div style="display: flex; align-items: center; gap: var(--space-md);">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <div>
                <strong>Pembayaran Berhasil!</strong>
                <p style="font-size: var(--text-sm); margin-top: var(--space-xs);">Booking Anda telah dikonfirmasi</p>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="payment-grid">
          <!-- Payment Methods -->
          <div>
            ${canPay ? `
              <div class="payment-methods">
                <h3 class="payment-methods-title">Pilih Metode Pembayaran</h3>

                <div class="payment-method-list" id="payment-methods">
                  <div class="payment-method selected" data-method="bank_transfer" data-provider="midtrans">
                    <div class="payment-method-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    </div>
                    <div class="payment-method-info">
                      <h4>Transfer Bank</h4>
                      <p>BCA, Mandiri, BNI, BRI</p>
                    </div>
                  </div>

                  <div class="payment-method" data-method="ewallet" data-provider="midtrans">
                    <div class="payment-method-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><path d="M7 15h0M2 9.5h20"/></svg>
                    </div>
                    <div class="payment-method-info">
                      <h4>E-Wallet</h4>
                      <p>GoPay, OVO, Dana, LinkAja</p>
                    </div>
                  </div>

                  <div class="payment-method" data-method="credit_card" data-provider="midtrans">
                    <div class="payment-method-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    </div>
                    <div class="payment-method-info">
                      <h4>Kartu Kredit</h4>
                      <p>Visa, Mastercard, JCB</p>
                    </div>
                  </div>
                </div>

                <button class="btn btn-primary btn-lg btn-block" id="pay-btn" style="margin-top: var(--space-xl);" onclick="initiatePayment('${booking.id}')">
                  Bayar Sekarang
                </button>
              </div>
            ` : `
              <div class="card">
                <div class="card-body">
                  <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Status Pembayaran</h3>

                  <div style="text-align: center; padding: var(--space-xl);">
                    <span class="badge ${getBadgeClass(formatPaymentStatus(payment.status).color)}" style="font-size: var(--text-base); padding: var(--space-sm) var(--space-lg);">
                      ${formatPaymentStatus(payment.status).label}
                    </span>

                    ${payment.instructions ? `
                      <div style="margin-top: var(--space-xl); text-align: left;">
                        <h4 style="font-weight: var(--font-medium); margin-bottom: var(--space-md);">Instruksi Pembayaran</h4>
                        ${payment.instructions.va_number ? `
                          <div class="alert alert-info">
                            <p style="font-weight: var(--font-medium);">Nomor Virtual Account:</p>
                            <p style="font-size: var(--text-xl); font-weight: var(--font-bold); letter-spacing: 0.1em;">${payment.instructions.va_number}</p>
                          </div>
                        ` : ''}
                        <p style="font-size: var(--text-sm); color: var(--text-secondary);">
                          Total Pembayaran: <strong>${formatCurrency(payment.amount || booking.total)}</strong>
                        </p>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `}
          </div>

          <!-- Booking Summary -->
          <div>
            <div class="payment-summary">
              <h3 class="payment-summary-title">Ringkasan Booking</h3>

              <div style="margin-bottom: var(--space-lg);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                  <span class="text-secondary">Kode Booking</span>
                  <span class="font-bold text-primary">${booking.code}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-secondary">Status</span>
                  <span class="badge ${getBadgeClass(formatBookingStatus(booking.status).color)}">
                    ${formatBookingStatus(booking.status).label}
                  </span>
                </div>
              </div>

              <div class="divider"></div>

              <h4 style="font-size: var(--text-sm); font-weight: var(--font-medium); margin-bottom: var(--space-md); color: var(--text-tertiary);">ITEM YANG DIBOOKING</h4>

              <div class="booking-items-list">
                ${(booking.items || []).map(item => `
                  <div class="booking-item-row">
                    <div>
                      <p class="booking-item-name">${item.item?.name || 'Item'}</p>
                      <p class="booking-item-qty">${item.quantity} x ${item.days || 1} hari</p>
                    </div>
                    <span class="font-semibold">${formatCurrency(item.subtotal)}</span>
                  </div>
                `).join('')}
              </div>

              <div class="divider"></div>

              <div class="booking-totals">
                <div class="booking-total-row">
                  <span>Subtotal</span>
                  <span>${formatCurrency(booking.subtotal)}</span>
                </div>
                ${booking.discount_amount > 0 ? `
                  <div class="booking-total-row" style="color: var(--color-success);">
                    <span>Diskon</span>
                    <span>-${formatCurrency(booking.discount_amount)}</span>
                  </div>
                ` : ''}
                <div class="booking-total-row">
                  <span>Pajak</span>
                  <span>${formatCurrency(booking.tax_amount)}</span>
                </div>
                <div class="booking-total-row total">
                  <span>Total</span>
                  <span class="price price-large">${formatCurrency(booking.total)}</span>
                </div>
              </div>
            </div>

            <div style="margin-top: var(--space-lg);">
              <a href="/dashboard/bookings" class="btn btn-outline btn-block">
                Kembali ke Daftar Booking
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Setup payment method selection
  setupPaymentMethods();

  // Store booking data
  window.currentBooking = booking;
}

function setupPaymentMethods() {
  const methods = document.querySelectorAll('.payment-method');

  methods.forEach(method => {
    method.addEventListener('click', () => {
      methods.forEach(m => m.classList.remove('selected'));
      method.classList.add('selected');
    });
  });
}

async function initiatePayment(bookingId) {
  const selected = document.querySelector('.payment-method.selected');
  const method = selected?.dataset.method || 'bank_transfer';
  const provider = selected?.dataset.provider || 'midtrans';
  const payBtn = document.getElementById('pay-btn');

  payBtn.disabled = true;
  payBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div> Memproses...';

  try {
    const response = await paymentService.initiatePayment(bookingId, method, provider);

    if (response.success && response.data.payment_url) {
      // Redirect to payment gateway
      Toast.info('Mengalihkan ke halaman pembayaran...');
      window.location.href = response.data.payment_url;
    } else {
      throw new Error(response.error?.message || 'Gagal initiate pembayaran');
    }
  } catch (error) {
    console.error('Payment error:', error);
    Toast.error(error.message);
  } finally {
    payBtn.disabled = false;
    payBtn.textContent = 'Bayar Sekarang';
  }
}

window.initiatePayment = initiatePayment;

export default renderPaymentPage;
