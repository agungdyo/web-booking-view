/**
 * Item Detail Page
 */
import { itemService } from '../services/item.service.js';
import { formatCurrency, formatItemType, formatPriceType, formatDate } from '../utils/format.js';
import Cart from '../components/cart.component.js';
import Toast from '../components/toast.component.js';

export async function renderItemDetailPage({ params }) {
  const content = document.getElementById('page-content');
  const { id } = params;

  content.innerHTML = `
    <div class="page-loading">
      <div class="spinner"></div>
      <p class="page-loading-text">Memuat detail item...</p>
    </div>
  `;

  try {
    const response = await itemService.getItem(id);

    if (!response.success) {
      throw new Error('Item not found');
    }

    renderItemDetail(response.data);
  } catch (error) {
    console.error('Failed to load item:', error);
    content.innerHTML = `
      <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary); margin-bottom: var(--space-lg);">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>
        <h1 class="empty-state-title">Item Tidak Ditemukan</h1>
        <p class="empty-state-description">Maaf, item yang Anda cari tidak tersedia.</p>
        <a href="/katalog" class="btn btn-primary" style="margin-top: var(--space-lg);">Kembali ke Katalog</a>
      </div>
    `;
  }
}

function renderItemDetail(item) {
  const content = document.getElementById('page-content');
  const primaryImage = item.images?.find(img => img.is_primary)?.url || item.images?.[0]?.url || null;
  const images = item.images || [];
  const isAvailable = item.is_available && item.stock > 0;

  content.innerHTML = `
    <section class="item-detail">
      <div class="page-container">
        <a href="/katalog" class="btn btn-outline btn-sm" style="margin-bottom: var(--space-lg); display: inline-flex; align-items: center; gap: var(--space-xs);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Kembali ke Katalog
        </a>

        <div class="item-detail-grid">
          <!-- Gallery -->
          <div class="item-gallery">
            <div class="item-main-image">
              ${primaryImage
                ? `<img src="${primaryImage}" alt="${item.name}" id="main-image">`
                : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary);">
                     <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary);">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                     </svg>
                   </div>`
              }
            </div>

            ${images.length > 1 ? `
              <div class="item-thumbnails">
                ${images.map((img, i) => `
                  <div class="item-thumbnail ${i === 0 ? 'active' : ''}" onclick="changeMainImage('${img.url}', this)">
                    <img src="${img.url}" alt="${item.name}">
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Info -->
          <div class="item-info">
            <span class="item-info-type">${formatItemType(item.type)}</span>
            <h1 class="item-info-title">${item.name}</h1>

            <div class="item-info-price">
              ${formatCurrency(item.price)}
              <span>${formatPriceType(item.price_type)}</span>
            </div>

            <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-lg);">
              <span class="availability-dot ${isAvailable ? 'available' : 'unavailable'}"></span>
              <span class="${isAvailable ? 'text-success' : 'text-error'}" style="font-weight: var(--font-medium);">
                ${isAvailable ? `Tersedia (${item.stock} unit)` : 'Tidak Tersedia'}
              </span>
            </div>

            ${item.description ? `
              <div class="item-info-description">
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-sm);">Deskripsi</h3>
                <p>${item.description}</p>
              </div>
            ` : ''}

            ${item.specifications && Object.keys(item.specifications).length > 0 ? `
              <div class="item-specifications">
                <h3 class="item-specifications-title">Spesifikasi</h3>
                <div class="spec-list">
                  ${Object.entries(item.specifications).map(([key, value]) => `
                    <div class="spec-item">
                      <span class="spec-label">${formatSpecKey(key)}</span>
                      <span class="spec-value">${formatSpecValue(key, value)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Booking Section -->
            <div class="booking-section">
              <h3 class="booking-form-title">Booking Item Ini</h3>

              <div class="form-group">
                <label class="form-label">Pilih Tanggal</label>
                <div class="date-picker-group">
                  <div>
                    <label class="form-label" style="font-size: var(--text-xs); color: var(--text-tertiary);">Tanggal Mulai</label>
                    <input type="text" class="form-input" id="start-date" placeholder="Pilih tanggal mulai">
                  </div>
                  <div>
                    <label class="form-label" style="font-size: var(--text-xs); color: var(--text-tertiary);">Tanggal Selesai</label>
                    <input type="text" class="form-input" id="end-date" placeholder="Pilih tanggal selesai">
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Jumlah Unit</label>
                <div style="display: flex; align-items: center; gap: var(--space-sm);">
                  <button class="btn btn-outline btn-sm" id="qty-minus" onclick="updateQuantity(-1)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                  </button>
                  <input type="number" class="form-input" id="quantity" value="1" min="1" max="${item.stock}" style="width: 80px; text-align: center;">
                  <button class="btn btn-outline btn-sm" id="qty-plus" onclick="updateQuantity(1)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </div>
              </div>

              <button class="btn btn-primary btn-lg btn-block" id="add-to-cart-btn" ${!isAvailable ? 'disabled' : ''} onclick="addToCartItem()">
                ${isAvailable ? 'Tambah ke Keranjang' : 'Tidak Tersedia'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Initialize Flatpickr
  initializeDatePicker(item.id);

  // Store item data globally for booking
  window.currentItem = item;
}

function initializeDatePicker(itemId) {
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');

  const fp = flatpickr(startInput, {
    minDate: 'today',
    dateFormat: 'Y-m-d',
    locale: 'id',
    onChange: (selectedDates, dateStr) => {
      // Set min date for end date
      if (selectedDates[0]) {
        endPicker.set('minDate', selectedDates[0]);
        Cart.setDates(dateStr, endInput.value);
      }
    },
  });

  const endPicker = flatpickr(endInput, {
    minDate: 'today',
    dateFormat: 'Y-m-d',
    locale: 'id',
    onChange: (selectedDates, dateStr) => {
      if (selectedDates[0] && startInput.value) {
        Cart.setDates(startInput.value, dateStr);
      }
    },
  });
}

function updateQuantity(delta) {
  const input = document.getElementById('quantity');
  const max = parseInt(input.max) || 10;
  let value = parseInt(input.value) + delta;
  value = Math.max(1, Math.min(value, max));
  input.value = value;
}

function addToCartItem() {
  const item = window.currentItem;
  if (!item) return;

  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;

  if (!startDate || !endDate) {
    Toast.warning('Silakan pilih tanggal mulai dan selesai');
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  Cart.addItem(item, quantity, days);
  Cart.setDates(startDate, endDate);
}

window.changeMainImage = function(url, thumb) {
  const mainImage = document.getElementById('main-image');
  if (mainImage) {
    mainImage.src = url;
  }
  document.querySelectorAll('.item-thumbnail').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
};

window.updateQuantity = updateQuantity;
window.addToCartItem = addToCartItem;

function formatSpecKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatSpecValue(key, value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'number' && key.includes('capacity')) {
    return `${value} orang`;
  }
  return value;
}

export default renderItemDetailPage;
