/**
 * Payment Page
 * Handles booking payment with MAJA Virtual Account
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
  const hasVaNumber = payment.vaNumber || payment.va_number || payment.instructions?.va_number;

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
          <!-- Payment Section -->
          <div>
            ${canPay && !hasVaNumber ? `
              <div class="card">
                <div class="card-body">
                  <h3 class="payment-methods-title" style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Pilih Metode Pembayaran</h3>

                  <div class="payment-method-list" id="payment-methods">
                    <div class="payment-method selected" data-method="bank_transfer" data-maja-method="bni">
                      <div class="payment-method-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      </div>
                      <div class="payment-method-info">
                        <h4>BNI</h4>
                        <p>Transfer via Virtual Account</p>
                      </div>
                    </div>

                    <div class="payment-method" data-method="bank_transfer" data-maja-method="mandiri">
                      <div class="payment-method-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      </div>
                      <div class="payment-method-info">
                        <h4>Mandiri</h4>
                        <p>Transfer via Virtual Account</p>
                      </div>
                    </div>

                    <div class="payment-method" data-method="bank_transfer" data-maja-method="bri">
                      <div class="payment-method-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      </div>
                      <div class="payment-method-info">
                        <h4>BRI</h4>
                        <p>Transfer via Virtual Account</p>
                      </div>
                    </div>

                    <div class="payment-method" data-method="bank_transfer" data-maja-method="bca">
                      <div class="payment-method-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      </div>
                      <div class="payment-method-info">
                        <h4>BCA</h4>
                        <p>Transfer via Virtual Account</p>
                      </div>
                    </div>
                  </div>

                  <button class="btn btn-primary btn-lg btn-block" id="pay-btn" style="margin-top: var(--space-xl);" onclick="initiatePayment('${booking.id}')">
                    Buat Virtual Account
                  </button>
                </div>
              </div>
            ` : canPay && hasVaNumber ? `
              <div class="card">
                <div class="card-body">
                  <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Pembayaran</h3>

                  <div class="alert alert-info" style="margin-bottom: var(--space-xl);">
                    <p style="font-weight: var(--font-medium); margin-bottom: var(--space-sm);">Nomor Virtual Account:</p>
                    <p style="font-size: var(--text-2xl); font-weight: var(--font-bold); letter-spacing: 0.1em;" id="va-number">
                      ${payment.vaNumber || payment.va_number || payment.instructions?.va_number}
                    </p>
                    <button class="btn btn-sm btn-outline" style="margin-top: var(--space-sm);" onclick="copyVaNumber()">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Salin
                    </button>
                  </div>

                  <h4 style="font-weight: var(--font-medium); margin-bottom: var(--space-md);">Cara Pembayaran:</h4>
                  <div style="margin-bottom: var(--space-xl);">
                    ${(payment.instructions?.instructions || getDefaultInstructions(payment.bankCode || payment.instructions?.bank?.toLowerCase() || 'bni')).map((step, i) => `
                      <p style="margin-bottom: var(--space-sm); color: var(--text-secondary);">${step}</p>
                    `).join('')}
                  </div>

                  <div class="alert alert-warning" style="margin-bottom: var(--space-lg);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p>Silakan transfer tepat sesuai nominal. Booking akan dikonfirmasi setelah pembayaran diterima.</p>
                  </div>

                  <div style="display: flex; gap: var(--space-md);">
                    <button class="btn btn-outline" onclick="refreshPaymentStatus('${booking.id}')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                      Cek Status
                    </button>
                    <a href="/dashboard/bookings" class="btn btn-primary">
                      Lihat Semua Booking
                    </a>
                  </div>
                </div>
              </div>
            ` : `
              <div class="card">
                <div class="card-body">
                  <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Status Pembayaran</h3>

                  <div style="text-align: center; padding: var(--space-xl);">
                    <span class="badge ${getBadgeClass(formatPaymentStatus(payment.status || booking.status).color)}" style="font-size: var(--text-base); padding: var(--space-sm) var(--space-lg);">
                      ${formatPaymentStatus(payment.status || booking.status).label}
                    </span>

                    ${hasVaNumber ? `
                      <div style="margin-top: var(--space-xl); text-align: left;">
                        <h4 style="font-weight: var(--font-medium); margin-bottom: var(--space-md);">Virtual Account</h4>
                        <div class="alert alert-info">
                          <p style="font-weight: var(--font-medium);">Nomor Virtual Account:</p>
                          <p style="font-size: var(--text-xl); font-weight: var(--font-bold); letter-spacing: 0.1em;">
                            ${payment.vaNumber || payment.va_number || payment.instructions?.va_number}
                          </p>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `}
          </div>

          <!-- Booking Summary -->
          <div>
            <div class="card" style="position: sticky; top: calc(var(--header-height) + var(--space-lg));">
              <div class="card-body">
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Ringkasan Booking</h3>

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
                  <div style="display: flex; justify-content: space-between; margin-top: var(--space-sm);">
                    <span class="text-secondary">Tanggal</span>
                    <span>${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}</span>
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
                  ${booking.payment?.metadata?.taxAmount ? `
                    <div class="booking-total-row">
                      <span>Pajak (${booking.payment.metadata.taxRate || 11}%)</span>
                      <span>${formatCurrency(booking.payment.metadata.taxAmount)}</span>
                    </div>
                    <div class="booking-total-row">
                      <span>Biaya Admin VA</span>
                      <span>${formatCurrency(booking.payment.metadata.adminFee || 3500)}</span>
                    </div>
                  ` : ''}
                  ${parseFloat(booking.discount_amount) > 0 ? `
                    <div class="booking-total-row" style="color: var(--color-success);">
                      <span>Diskon</span>
                      <span>-${formatCurrency(booking.discount_amount)}</span>
                    </div>
                  ` : ''}
                  <div class="booking-total-row total">
                    <span>Total</span>
                    <span class="price price-large">${formatCurrency(booking.payment?.amount || booking.total)}</span>
                  </div>
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

function getDefaultInstructions(bankCode) {
  const instructions = {
    bni: [
      '1. Pilih menu Transfer/Transfer Dana',
      '2. Pilih menu Virtual Account',
      '3. Masukkan nomor Virtual Account di atas',
      '4. Masukkan jumlah transfer sesuai tagihan',
      '5. Ikuti instruksi untuk menyelesaikan transaksi'
    ],
    mandiri: [
      '1. Pilih menu Bayar/Beli',
      '2. Pilih menu Multi Payment',
      '3. Masukkan kode perusahaan (88008) kemudian nomor Virtual Account',
      '4. Masukkan jumlah transfer sesuai tagihan',
      '5. Ikuti instruksi untuk menyelesaikan transaksi'
    ],
    bca: [
      '1. Pilih menu Transaksi',
      '2. Pilih menu Transfer',
      '3. Pilih menu ke Virtual Account',
      '4. Masukkan nomor Virtual Account di atas',
      '5. Masukkan jumlah transfer sesuai tagihan',
      '6. Konfirmasi transaksi'
    ],
    bri: [
      '1. Pilih menu Transaksi',
      '2. Pilih menu Pembayaran',
      '3. Pilih menu Multipayment',
      '4. Masukkan kode perusahaan (002) dan nomor Virtual Account',
      '5. Masukkan jumlah transfer sesuai tagihan',
      '6. Konfirmasi transaksi'
    ]
  };
  return instructions[bankCode] || instructions.bni;
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
  const majaMethod = selected?.dataset.majaMethod || 'bni';
  const payBtn = document.getElementById('pay-btn');

  payBtn.disabled = true;
  payBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div> Membuat Virtual Account...';

  try {
    console.log('[PaymentPage] Initiating payment for booking:', bookingId, 'with method:', majaMethod);

    const response = await paymentService.initiatePayment(bookingId, 'bank_transfer', 'maja');

    console.log('[PaymentPage] Payment response:', response);

    if (response.success) {
      Toast.success('Virtual Account berhasil dibuat!');

      // Reload the page to show the VA number
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      throw new Error(response.error?.message || 'Gagal membuat Virtual Account');
    }
  } catch (error) {
    console.error('Payment error:', error);
    Toast.error(error.message || 'Terjadi kesalahan saat membuat Virtual Account');
  } finally {
    payBtn.disabled = false;
    payBtn.textContent = 'Buat Virtual Account';
  }
}

async function refreshPaymentStatus(bookingId) {
  try {
    const response = await bookingService.getBooking(bookingId);

    if (response.success) {
      const booking = response.data;

      if (booking.status === 'confirmed') {
        Toast.success('Pembayaran berhasil! Booking Anda telah dikonfirmasi.');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (booking.payment?.status === 'pending') {
        Toast.info('Pembayaran masih dalam proses. Mohon tunggu beberapa saat.');
      } else {
        Toast.info('Status belum berubah. Silakan coba beberapa saat lagi.');
      }
    }
  } catch (error) {
    console.error('Error refreshing payment status:', error);
    Toast.error('Gagal memperbarui status');
  }
}

function copyVaNumber() {
  const vaNumber = document.getElementById('va-number')?.textContent?.trim();
  if (vaNumber) {
    navigator.clipboard.writeText(vaNumber).then(() => {
      Toast.success('Nomor Virtual Account berhasil disalin!');
    }).catch(() => {
      Toast.error('Gagal menyalin nomor');
    });
  }
}

// Export functions to global scope
window.initiatePayment = initiatePayment;
window.refreshPaymentStatus = refreshPaymentStatus;
window.copyVaNumber = copyVaNumber;

export default renderPaymentPage;
