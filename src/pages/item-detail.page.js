/**
 * Item Detail Page - Complete item detail with gallery, specs, price, and availability
 */
import { itemService } from '../services/item.service.js';
import { formatCurrency, formatItemType, formatPriceType, formatDate } from '../utils/format.js';
import Cart from '../components/cart.component.js';
import Toast from '../components/toast.component.js';

export async function renderItemDetailPage({ params }) {
  const content = document.getElementById('page-content');
  const { id } = params;

  // Show loading state
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

  // Get images - handle various formats
  let images = [];
  if (item.images && Array.isArray(item.images)) {
    images = item.images.map(img => {
      if (typeof img === 'string') {
        return { url: img, is_primary: false };
      }
      return img;
    });
  }

  const primaryImage = images.find(img => img.is_primary)?.url || images[0]?.url || null;
  const isAvailable = item.is_available && (item.availableStock > 0 || item.stock > 0);

  // Process specifications
  const specs = item.specifications || {};
  const specEntries = Object.entries(specs).filter(([_, value]) => value !== null && value !== undefined && value !== '');

  content.innerHTML = `
    <section class="item-detail-page">
      <div class="page-container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/" class="breadcrumb-link">Beranda</a>
          <span class="breadcrumb-separator">/</span>
          <a href="/katalog" class="breadcrumb-link">Katalog</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">${escapeHtml(item.name)}</span>
        </nav>

        <div class="item-detail-layout">
          <!-- Left Column: Gallery -->
          <div class="item-gallery-section">
            ${renderGallery(primaryImage, images, item.name)}
          </div>

          <!-- Right Column: Info & Booking -->
          <div class="item-info-section">
            <!-- Item Header -->
            <div class="item-header">
              <span class="item-type-badge">${formatItemType(item.type)}</span>
              <h1 class="item-title">${escapeHtml(item.name)}</h1>

              <!-- Availability Status -->
              <div class="item-availability-status">
                ${renderAvailabilityBadge(isAvailable, item.availableStock || item.stock)}
              </div>
            </div>

            <!-- Price Display -->
            <div class="item-price-section">
              ${renderPriceDisplay(item.price, item.price_type)}
            </div>

            <!-- Description -->
            ${item.description ? `
              <div class="item-description-section">
                <h3 class="section-title">Deskripsi</h3>
                <p class="item-description">${escapeHtml(item.description)}</p>
              </div>
            ` : ''}

            <!-- Specifications -->
            ${specEntries.length > 0 ? `
              <div class="item-specs-section">
                <h3 class="section-title">Spesifikasi</h3>
                <div class="specs-grid">
                  ${specEntries.map(([key, value]) => `
                    <div class="spec-item">
                      <span class="spec-label">${formatSpecLabel(key)}</span>
                      <span class="spec-value">${formatSpecValue(key, value)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Booking Section -->
            <div class="booking-section">
              <h3 class="section-title">Pesan Item Ini</h3>

              <!-- Date Selection -->
              <div class="date-selection-group">
                <div class="date-picker-wrapper">
                  <label class="form-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    Tanggal Mulai
                  </label>
                  <input type="text" class="form-input" id="start-date" placeholder="Pilih tanggal mulai" readonly>
                </div>
                <div class="date-picker-wrapper">
                  <label class="form-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    Tanggal Selesai
                  </label>
                  <input type="text" class="form-input" id="end-date" placeholder="Pilih tanggal selesai" readonly>
                </div>
              </div>

              <!-- Quantity Selection -->
              <div class="quantity-section">
                <label class="form-label">Jumlah Unit</label>
                <div class="quantity-control">
                  <button type="button" class="qty-btn qty-minus" id="qty-minus" aria-label="Kurangi jumlah">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                  </button>
                  <input type="number" class="qty-input" id="quantity" value="1" min="1" max="${item.availableStock || item.stock}" readonly>
                  <button type="button" class="qty-btn qty-plus" id="qty-plus" aria-label="Tambah jumlah">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </div>
                <span class="stock-info">Tersedia: ${item.availableStock || item.stock} unit</span>
              </div>

              <!-- Availability Checker Result -->
              <div class="availability-result" id="availability-result" style="display: none;">
                <div class="availability-loading" id="availability-loading">
                  <div class="spinner-small"></div>
                  <span>Memeriksa ketersediaan...</span>
                </div>
                <div class="availability-status" id="availability-status" style="display: none;"></div>
              </div>

              <!-- Price Calculation -->
              <div class="price-calculation" id="price-calculation" style="display: none;">
                <h4 class="calculation-title">Ringkasan Harga</h4>
                <div class="calculation-rows">
                  <div class="calc-row">
                    <span class="calc-label">Harga per ${getPriceUnitLabel(item.price_type)}</span>
                    <span class="calc-value">${formatCurrency(item.price)}</span>
                  </div>
                  <div class="calc-row">
                    <span class="calc-label">Durasi</span>
                    <span class="calc-value" id="calc-duration">-</span>
                  </div>
                  <div class="calc-row">
                    <span class="calc-label">Jumlah</span>
                    <span class="calc-value" id="calc-quantity">-</span>
                  </div>
                  <div class="calc-row calc-subtotal">
                    <span class="calc-label">Subtotal</span>
                    <span class="calc-value" id="calc-subtotal">-</span>
                  </div>
                </div>
              </div>

              <!-- Book Button -->
              <button class="btn btn-primary btn-lg btn-block book-btn" id="book-btn" ${!isAvailable ? 'disabled' : ''} onclick="handleBookNow()">
                ${isAvailable ? `
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  Pesan Sekarang
                ` : 'Tidak Tersedia'}
              </button>

              <p class="book-note">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                ${isAvailable ? 'Pilih tanggal untuk melihat total harga' : 'Maaf, item ini sedang tidak tersedia'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox Modal -->
    <div class="lightbox-modal" id="lightbox-modal">
      <button class="lightbox-close" onclick="closeLightbox()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <button class="lightbox-nav lightbox-prev" onclick="navigateLightbox(-1)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button class="lightbox-nav lightbox-next" onclick="navigateLightbox(1)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <img class="lightbox-image" id="lightbox-image" src="" alt="">
      <div class="lightbox-counter" id="lightbox-counter"></div>
    </div>
  `;

  // Initialize components
  initializeGallery(images, item.name);
  initializeDatePicker(item.id, item.availableStock || item.stock);
  initializeQuantityControl(item.availableStock || item.stock);

  // Store item data globally
  window.currentItem = item;
  window.itemImages = images;
}

// ============================================
// GALLERY COMPONENT
// ============================================
function renderGallery(primaryImage, images, itemName) {
  if (images.length === 0) {
    return `
      <div class="gallery-main" onclick="openLightbox(0)">
        <div class="gallery-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <span>Tidak ada foto</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="gallery-container">
      <div class="gallery-main" onclick="openLightbox(0)">
        <img src="${primaryImage}" alt="${escapeHtml(itemName)}" id="main-gallery-image">
        <div class="gallery-expand-hint">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
        </div>
        ${images.length > 1 ? `<span class="gallery-count">+${images.length - 1} foto</span>` : ''}
      </div>
      ${images.length > 1 ? `
        <div class="gallery-thumbnails">
          ${images.slice(0, 5).map((img, i) => `
            <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="event.stopPropagation(); changeGalleryImage(${i})">
              <img src="${img.url}" alt="${escapeHtml(itemName)} - Foto ${i + 1}">
            </div>
          `).join('')}
          ${images.length > 5 ? `
            <div class="gallery-thumb gallery-thumb-more" onclick="openLightbox(5)">
              <span>+${images.length - 5}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function initializeGallery(images, itemName) {
  window.galleryImages = images;
  window.currentGalleryIndex = 0;
}

window.changeGalleryImage = function(index) {
  const images = window.galleryImages || [];
  if (index >= 0 && index < images.length) {
    window.currentGalleryIndex = index;
    const mainImage = document.getElementById('main-gallery-image');
    if (mainImage && images[index]) {
      mainImage.src = images[index].url;
    }
    document.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }
};

window.openLightbox = function(index) {
  const images = window.galleryImages || [];
  if (images.length === 0) return;

  window.currentGalleryIndex = index;
  updateLightbox();

  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

window.navigateLightbox = function(direction) {
  const images = window.galleryImages || [];
  if (images.length === 0) return;

  window.currentGalleryIndex += direction;
  if (window.currentGalleryIndex < 0) window.currentGalleryIndex = images.length - 1;
  if (window.currentGalleryIndex >= images.length) window.currentGalleryIndex = 0;

  updateLightbox();
};

function updateLightbox() {
  const images = window.galleryImages || [];
  const index = window.currentGalleryIndex || 0;

  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCounter = document.getElementById('lightbox-counter');

  if (lightboxImage && images[index]) {
    lightboxImage.src = images[index].url;
  }
  if (lightboxCounter) {
    lightboxCounter.textContent = `${index + 1} / ${images.length}`;
  }
}

// Close lightbox on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

// ============================================
// AVAILABILITY BADGE
// ============================================
function renderAvailabilityBadge(isAvailable, stock) {
  if (isAvailable) {
    return `
      <div class="availability-badge available">
        <span class="availability-dot"></span>
        <span class="availability-text">Tersedia</span>
        <span class="availability-stock">(${stock} unit)</span>
      </div>
    `;
  }
  return `
    <div class="availability-badge unavailable">
      <span class="availability-dot"></span>
      <span class="availability-text">Tidak Tersedia</span>
    </div>
  `;
}

// ============================================
// PRICE DISPLAY
// ============================================
function renderPriceDisplay(price, priceType) {
  const priceTypeLabel = formatPriceType(priceType);
  return `
    <div class="price-display">
      <span class="price-amount">${formatCurrency(price)}</span>
      <span class="price-unit">${priceTypeLabel}</span>
    </div>
  `;
}

function getPriceUnitLabel(priceType) {
  const units = {
    per_unit: 'unit',
    per_hour: 'jam',
    per_day: 'hari',
  };
  return units[priceType] || 'unit';
}

// ============================================
// SPECIFICATIONS
// ============================================
function formatSpecLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatSpecValue(key, value) {
  // Handle arrays
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Handle capacity with "orang" suffix
  const capacityKeys = ['kapasitas', 'capacity', 'penumpang', 'max_capacity'];
  if (capacityKeys.some(k => key.toLowerCase().includes(k)) && typeof value === 'number') {
    return `${value} orang`;
  }

  // Handle dimensi/ukuran
  const sizeKeys = ['ukuran', 'dimensi', 'size', 'luas'];
  if (sizeKeys.some(k => key.toLowerCase().includes(k))) {
    return value;
  }

  return String(value);
}

// ============================================
// DATE PICKER & AVAILABILITY
// ============================================
function initializeDatePicker(itemId, maxStock) {
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');

  if (!startInput || !endInput) return;

  // Get today's date for minDate
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Initialize start date picker
  const startPicker = flatpickr(startInput, {
    minDate: minDate,
    dateFormat: 'Y-m-d',
    locale: 'id',
    altInput: true,
    altFormat: 'j F Y',
    onChange: (selectedDates, dateStr) => {
      if (selectedDates[0]) {
        // Update end date minDate
        endPicker.set('minDate', selectedDates[0]);

        // If end date is before start date, reset it
        const endDate = endPicker.selectedDates[0];
        if (endDate && endDate < selectedDates[0]) {
          endPicker.clear();
        }

        checkAvailabilityAndUpdatePrice(itemId, maxStock);
      }
    },
  });

  // Initialize end date picker
  const endPicker = flatpickr(endInput, {
    minDate: minDate,
    dateFormat: 'Y-m-d',
    locale: 'id',
    altInput: true,
    altFormat: 'j F Y',
    onChange: (selectedDates, dateStr) => {
      if (selectedDates[0] && startPicker.selectedDates[0]) {
        checkAvailabilityAndUpdatePrice(itemId, maxStock);
      }
    },
  });

  window.datePickers = { start: startPicker, end: endPicker };
}

async function checkAvailabilityAndUpdatePrice(itemId, maxStock) {
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');
  const quantityInput = document.getElementById('quantity');

  if (!startInput?.value || !endInput?.value) return;

  const startDate = startInput.value;
  const endDate = endInput.value;
  const quantity = parseInt(quantityInput?.value) || 1;

  // Show loading
  const availabilityResult = document.getElementById('availability-result');
  const availabilityLoading = document.getElementById('availability-loading');
  const availabilityStatus = document.getElementById('availability-status');
  const priceCalculation = document.getElementById('price-calculation');

  if (availabilityResult) availabilityResult.style.display = 'block';
  if (availabilityLoading) availabilityLoading.style.display = 'flex';
  if (availabilityStatus) availabilityStatus.style.display = 'none';
  if (priceCalculation) priceCalculation.style.display = 'none';

  try {
    // Check availability from API
    const result = await itemService.checkAvailability(itemId, startDate, endDate, quantity);

    if (availabilityLoading) availabilityLoading.style.display = 'none';

    if (result.success && result.data) {
      const { isAvailable, availableQuantity, message } = result.data;

      if (availabilityStatus) {
        availabilityStatus.style.display = 'block';
        if (isAvailable) {
          availabilityStatus.innerHTML = `
            <div class="avail-status avail-ok">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              <span>Tersedia untuk ${availableQuantity} unit</span>
            </div>
          `;
        } else {
          availabilityStatus.innerHTML = `
            <div class="avail-status avail-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              <span>${message || 'Tidak tersedia untuk tanggal tersebut'}</span>
            </div>
          `;
        }
      }

      if (isAvailable) {
        updatePriceCalculation(startDate, endDate, quantity);
      }
    } else {
      // If API fails, still show price calculation
      updatePriceCalculation(startDate, endDate, quantity);
    }
  } catch (error) {
    console.error('Availability check failed:', error);
    // On error, still show price calculation
    if (availabilityLoading) availabilityLoading.style.display = 'none';
    if (availabilityStatus) {
      availabilityStatus.style.display = 'block';
      availabilityStatus.innerHTML = `
        <div class="avail-status avail-warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <span>Tidak dapat memeriksa ketersediaan otomatis</span>
        </div>
      `;
    }
    updatePriceCalculation(startDate, endDate, quantity);
  }
}

function updatePriceCalculation(startDate, endDate, quantity) {
  const item = window.currentItem;
  if (!item || !startDate || !endDate) return;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate duration based on price type
  let duration = 1;
  let durationLabel = '1 unit';

  switch (item.price_type) {
    case 'per_day':
      duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      durationLabel = `${duration} hari`;
      break;
    case 'per_hour':
      duration = 8; // Default assumption
      durationLabel = `${duration} jam`;
      break;
    default:
      duration = 1;
      durationLabel = '1 unit';
  }

  const subtotal = item.price * duration * quantity;

  // Update calculation display
  const calcDuration = document.getElementById('calc-duration');
  const calcQuantity = document.getElementById('calc-quantity');
  const calcSubtotal = document.getElementById('calc-subtotal');
  const priceCalculation = document.getElementById('price-calculation');

  if (calcDuration) calcDuration.textContent = durationLabel;
  if (calcQuantity) calcQuantity.textContent = `${quantity} unit`;
  if (calcSubtotal) calcSubtotal.textContent = formatCurrency(subtotal);
  if (priceCalculation) priceCalculation.style.display = 'block';
}

// ============================================
// QUANTITY CONTROL
// ============================================
function initializeQuantityControl(maxStock) {
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const quantityInput = document.getElementById('quantity');

  if (!minusBtn || !plusBtn || !quantityInput) return;

  minusBtn.addEventListener('click', () => updateQuantity(-1, maxStock));
  plusBtn.addEventListener('click', () => updateQuantity(1, maxStock));

  // Update plus button state based on stock
  updatePlusButtonState(maxStock);
}

function updateQuantity(delta, maxStock) {
  const input = document.getElementById('quantity');
  if (!input) return;

  let value = parseInt(input.value) + delta;
  value = Math.max(1, Math.min(value, maxStock));
  input.value = value;

  updatePlusButtonState(maxStock);

  // Re-check availability if dates are selected
  const item = window.currentItem;
  if (item) {
    checkAvailabilityAndUpdatePrice(item.id, maxStock);
  }
}

function updatePlusButtonState(maxStock) {
  const plusBtn = document.getElementById('qty-plus');
  const quantityInput = document.getElementById('quantity');

  if (plusBtn && quantityInput) {
    const currentValue = parseInt(quantityInput.value) || 1;
    plusBtn.disabled = currentValue >= maxStock;
  }
}

// ============================================
// BOOKING HANDLER
// ============================================
window.handleBookNow = function() {
  const item = window.currentItem;
  if (!item) return;

  const startDate = document.getElementById('start-date')?.value;
  const endDate = document.getElementById('end-date')?.value;
  const quantity = parseInt(document.getElementById('quantity')?.value) || 1;

  // Validation
  if (!startDate || !endDate) {
    Toast.warning('Silakan pilih tanggal mulai dan selesai');
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    Toast.warning('Tanggal selesai harus setelah tanggal mulai');
    return;
  }

  // Calculate duration and price
  let duration = 1;
  switch (item.price_type) {
    case 'per_day':
      duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      break;
    case 'per_hour':
      duration = 8;
      break;
    default:
      duration = 1;
  }

  const subtotal = item.price * duration * quantity;

  // Add to cart
  Cart.addItem(item, quantity, duration);
  Cart.setDates(startDate, endDate);

  // Store calculated price for booking
  Cart.setBookingPrice({
    pricePerUnit: item.price,
    duration: duration,
    quantity: quantity,
    subtotal: subtotal,
    priceType: item.price_type
  });

  Toast.success('Item ditambahkan ke keranjang');

  // Navigate to cart/booking page
  setTimeout(() => {
    window.navigateTo('/keranjang');
  }, 500);
};

// ============================================
// UTILITIES
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default renderItemDetailPage;
