/**
 * Booking Page
 */
import { bookingService } from '../services/booking.service.js';
import { authService } from '../services/auth.service.js';
import Cart from '../components/cart.component.js';
import { formatCurrency, formatDate, formatDateRange } from '../utils/format.js';
import Toast from '../components/toast.component.js';

export async function renderBookingPage() {
  const content = document.getElementById('page-content');
  const cart = Cart.getCart();
  const customer = authService.getCurrentCustomer();

  // Check if cart is empty
  if (cart.items.length === 0) {
    content.innerHTML = `
      <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary); margin-bottom: var(--space-lg);">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        <h1 class="empty-state-title">Keranjang Kosong</h1>
        <p class="empty-state-description">Pilih item yang ingin Anda booking terlebih dahulu</p>
        <a href="/katalog" class="btn btn-primary" style="margin-top: var(--space-lg);">Lihat Katalog</a>
      </div>
    `;
    return;
  }

  // Check if logged in
  if (!customer) {
    content.innerHTML = `
      <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary); margin-bottom: var(--space-lg);">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" x2="3" y1="12" y2="12"/>
        </svg>
        <h1 class="empty-state-title">Login Diperlukan</h1>
        <p class="empty-state-description">Silakan login terlebih dahulu untuk melanjutkan booking</p>
        <a href="/login?redirect=/booking" class="btn btn-primary" style="margin-top: var(--space-lg);">Masuk</a>
      </div>
    `;
    return;
  }

  // Calculate totals
  const subtotal = Cart.getSubtotal();
  const taxRate = 10;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Calculate days
  let days = 1;
  if (cart.dates) {
    const start = new Date(cart.dates.startDate);
    const end = new Date(cart.dates.endDate);
    days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  content.innerHTML = `
    <section class="section">
      <div class="page-container">
        <h1 class="section-title">Form Booking</h1>

        <div class="payment-grid">
          <!-- Form -->
          <div>
            <div class="card">
              <div class="card-body">
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Detail Pemesan</h3>

                <div class="grid grid-cols-2" style="gap: var(--space-md);">
                  <div class="form-group">
                    <label class="form-label">Nama</label>
                    <input type="text" class="form-input" id="customer-name" value="${customer.name}" readonly>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="customer-email" value="${customer.email}" readonly>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Nomor Telepon</label>
                  <input type="tel" class="form-input" id="customer-phone" value="${customer.phone || ''}" placeholder="Masukkan nomor telepon">
                </div>

                <div class="divider"></div>

                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Detail Booking</h3>

                <div class="form-group">
                  <label class="form-label">Tanggal Sewa</label>
                  <div class="date-picker-group">
                    <div>
                      <input type="text" class="form-input" id="start-date" value="${cart.dates?.startDate || ''}" placeholder="Tanggal mulai">
                    </div>
                    <div>
                      <input type="text" class="form-input" id="end-date" value="${cart.dates?.endDate || ''}" placeholder="Tanggal selesai">
                    </div>
                  </div>
                  <p class="form-hint">Durasi: ${days} hari</p>
                </div>

                <div class="form-group">
                  <label class="form-label">Catatan (opsional)</label>
                  <textarea class="form-input form-textarea" id="notes" placeholder="Tambahkan catatan untuk booking Anda"></textarea>
                </div>
              </div>
            </div>

            <div id="booking-error" class="alert alert-error" style="display: none; margin-top: var(--space-lg);"></div>

            <button class="btn btn-primary btn-lg btn-block" id="submit-btn" style="margin-top: var(--space-lg);" onclick="submitBooking()">
              Lanjutkan ke Pembayaran
            </button>
          </div>

          <!-- Summary -->
          <div>
            <div class="card" style="position: sticky; top: calc(var(--header-height) + var(--space-lg));">
              <div class="card-body">
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-lg);">Ringkasan Booking</h3>

                <div class="booking-items-list">
                  ${cart.items.map(item => `
                    <div class="booking-item-row">
                      <div>
                        <p class="booking-item-name">${item.name}</p>
                        <p class="booking-item-qty">${item.quantity} unit x ${item.days} hari</p>
                      </div>
                      <span class="font-semibold">${formatCurrency(item.price * item.quantity * item.days)}</span>
                    </div>
                  `).join('')}
                </div>

                <div class="divider"></div>

                <div class="booking-totals">
                  <div class="booking-total-row">
                    <span>Subtotal</span>
                    <span>${formatCurrency(subtotal)}</span>
                  </div>
                  <div class="booking-total-row">
                    <span>Pajak (${taxRate}%)</span>
                    <span>${formatCurrency(taxAmount)}</span>
                  </div>
                  <div class="booking-total-row total">
                    <span>Total</span>
                    <span class="price price-large">${formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Initialize date pickers
  initializeDatePickers();

  // Store customer data
  window.bookingCustomer = customer;
}

function initializeDatePickers() {
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');

  flatpickr(startInput, {
    minDate: 'today',
    dateFormat: 'Y-m-d',
    locale: 'id',
  });

  flatpickr(endInput, {
    minDate: 'today',
    dateFormat: 'Y-m-d',
    locale: 'id',
  });
}

async function submitBooking() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const notes = document.getElementById('notes').value;
  const errorDiv = document.getElementById('booking-error');
  const submitBtn = document.getElementById('submit-btn');

  // Clear errors
  errorDiv.style.display = 'none';

  // Validate dates
  if (!startDate || !endDate) {
    errorDiv.textContent = 'Silakan pilih tanggal mulai dan selesai';
    errorDiv.style.display = 'block';
    return;
  }

  const cart = Cart.getCart();
  const customer = window.bookingCustomer;

  // Submit
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div> Memproses...';

  try {
    const response = await bookingService.createBooking({
      customer_id: customer.id,
      start_date: startDate,
      end_date: endDate,
      items: cart.items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        days: item.days,
      })),
      notes,
    });

    if (response.success) {
      // Clear cart
      Cart.clear();

      // Redirect to payment
      Toast.success('Booking berhasil! Melanjutkan ke pembayaran...');
      window.location.href = `/payment/${response.data.id}`;
    } else {
      throw new Error(response.error?.message || 'Booking gagal');
    }
  } catch (error) {
    console.error('Booking error:', error);
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Lanjutkan ke Pembayaran';
  }
}

window.submitBooking = submitBooking;

export default renderBookingPage;
