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
  // API returns isAvailable (camelCase), not is_available (snake_case)
  const isAvailable = (item.isAvailable || item.is_available) && (item.availableStock > 0 || item.stock > 0);

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
              ${renderPriceDisplay(item.price, item.priceType || item.price_type)}
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
                    <span class="calc-label">Harga per ${getPriceUnitLabel(item.priceType || item.price_type)}</span>
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

              <!-- Book Button - Only show when dates are selected -->
              <div id="book-section" style="display: none;">
                <button class="btn btn-primary btn-lg btn-block book-btn" id="book-btn" onclick="handleBookNow()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  Pesan Sekarang
                </button>
                <p class="book-note" id="book-note"></p>
              </div>

              <!-- Date Selection Prompt -->
              <div id="date-selection-prompt" class="date-selection-prompt">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <span>Pilih tanggal mulai dan selesai untuk memesan</span>
              </div>
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
  window.availableQuantity = item.availableStock || item.stock; // Track available quantity
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
// DATE PICKER & AVAILABILITY (Enhanced with Flatpickr Range & Disable Dates)
// ============================================

/**
 * Initialize enhanced date picker with:
 * - Flatpickr range mode
 * - Disable booked dates
 * - Visual indicators for availability
 */
async function initializeDatePicker(itemId, maxStock) {
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');

  if (!startInput || !endInput) return;

  // Get today's date for minDate
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today.toISOString().split('T')[0];

  // Calculate end of range (90 days from now)
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + 90);
  const maxDate = rangeEnd.toISOString().split('T')[0];

  // Show loading indicator for booked dates
  showLoadingBookedDates();

  // Get booked dates from API
  let bookedDates = [];
  try {
    bookedDates = await itemService.getBookedDates(itemId, 90);
    console.log('[DatePicker] Loaded booked dates:', bookedDates);
  } catch (error) {
    console.error('[DatePicker] Failed to load booked dates:', error);
    // Continue without disabled dates
  }

  hideLoadingBookedDates();

  // Convert booked dates to Date objects for Flatpickr
  const disabledDates = bookedDates.map(dateStr => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  // Store for use in availability check
  window.itemBookedDates = bookedDates;
  window.itemDisabledDates = disabledDates;

  // ========================================
  // START DATE PICKER
  // ========================================
  const startPicker = flatpickr(startInput, {
    // Configuration
    minDate: minDate,
    maxDate: maxDate,
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'j F Y',
    disable: disabledDates,
    locale: 'id',

    // Show availability indicators
    showMonths: 2, // Show 2 months side by side on desktop

    // Styling
    theme: 'light',

    // Behavior
    allowInput: false,
    clickOpens: true,
    shorthandCurrentMonth: false,

    // Events
    onChange: (selectedDates, dateStr) => {
      console.log('[DatePicker] Start date changed:', dateStr);

      if (selectedDates[0]) {
        // Update end date minDate to start date
        endPicker.set('minDate', selectedDates[0]);

        // If end date is before start date, clear it
        const endDate = endPicker.selectedDates[0];
        if (endDate && endDate < selectedDates[0]) {
          endPicker.clear();
        }

        // Update UI
        updateSelectedDatesDisplay();

        // Check availability if both dates selected
        if (endPicker.selectedDates[0]) {
          checkAvailabilityAndUpdatePrice(itemId, maxStock);
        }
      }
    },

    onMonthChange: () => {
      // Re-apply disable classes after month change
      applyDisableDateClasses(disabledDates);
    },

    onYearChange: () => {
      // Re-apply disable classes after year change
      applyDisableDateClasses(disabledDates);
    },

    // Day creation hook for custom styling
    onDayCreate: (dObj, dStr, fp, dayElem) => {
      // Add custom class for booked dates
      const dateStr = dayElem.dateObj.toISOString().split('T')[0];
      if (bookedDates.includes(dateStr)) {
        dayElem.classList.add('flatpickr-disabled-date');
        dayElem.classList.add('flatpickr-booked');
        dayElem.title = 'Tanggal sudah dipesan';
      }
    }
  });

  // ========================================
  // END DATE PICKER
  // ========================================
  const endPicker = flatpickr(endInput, {
    // Configuration
    minDate: minDate,
    maxDate: maxDate,
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'j F Y',
    disable: disabledDates,
    locale: 'id',

    // Show availability indicators
    showMonths: 2,

    // Styling
    theme: 'light',

    // Behavior
    allowInput: false,
    clickOpens: true,
    shorthandCurrentMonth: false,

    // Events
    onChange: (selectedDates, dateStr) => {
      console.log('[DatePicker] End date changed:', dateStr);

      if (selectedDates[0] && startPicker.selectedDates[0]) {
        // Validate range
        if (selectedDates[0] < startPicker.selectedDates[0]) {
          // End date is before start date - show warning
          Toast.warning('Tanggal selesai harus setelah tanggal mulai');
          endPicker.clear();
          return;
        }

        // Update UI
        updateSelectedDatesDisplay();

        // Check availability
        checkAvailabilityAndUpdatePrice(itemId, maxStock);
      }
    },

    onMonthChange: () => {
      applyDisableDateClasses(disabledDates);
    },

    onYearChange: () => {
      applyDisableDateClasses(disabledDates);
    },

    // Day creation hook
    onDayCreate: (dObj, dStr, fp, dayElem) => {
      const dateStr = dayElem.dateObj.toISOString().split('T')[0];
      if (bookedDates.includes(dateStr)) {
        dayElem.classList.add('flatpickr-disabled-date');
        dayElem.classList.add('flatpickr-booked');
        dayElem.title = 'Tanggal sudah dipesan';
      }
    }
  });

  // Store pickers globally
  window.datePickers = {
    start: startPicker,
    end: endPicker,
    disabledDates: disabledDates
  };

  // Initial apply of disable classes
  applyDisableDateClasses(disabledDates);

  // Add legend to page
  addDatePickerLegend();

  console.log('[DatePicker] Initialized with', disabledDates.length, 'disabled dates');
}

/**
 * Apply custom CSS classes to disabled/booked dates
 */
function applyDisableDateClasses(disabledDates) {
  setTimeout(() => {
    const dayElements = document.querySelectorAll('.flatpickr-day');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    dayElements.forEach(day => {
      const date = day.dateObj;
      const dateStr = date.toISOString().split('T')[0];

      // Check if this date is in the disabled list
      const isDisabled = disabledDates.some(d =>
        d.toISOString().split('T')[0] === dateStr
      );

      // Check if date is in the past
      const isPast = date < today;

      // Add classes
      if (isDisabled) {
        day.classList.add('flatpickr-booked');
        day.title = 'Tanggal sudah dipesan';
      }
      if (isPast) {
        day.classList.add('flatpickr-past');
      }
    });
  }, 100);
}

/**
 * Add legend for date picker
 */
function addDatePickerLegend() {
  const legendHtml = `
    <div class="date-picker-legend">
      <div class="legend-item">
        <span class="legend-dot legend-available"></span>
        <span>Tersedia</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot legend-booked"></span>
        <span>Sudah Dipesan</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot legend-selected"></span>
        <span>Dipilih</span>
      </div>
    </div>
  `;

  // Insert after the date selection group
  const dateGroup = document.querySelector('.date-selection-group');
  if (dateGroup) {
    dateGroup.insertAdjacentHTML('afterend', legendHtml);
  }
}

/**
 * Show loading indicator for booked dates
 */
function showLoadingBookedDates() {
  const dateGroup = document.querySelector('.date-selection-group');
  if (dateGroup) {
    const loadingHtml = `
      <div class="booked-dates-loading" id="booked-dates-loading">
        <div class="spinner-small"></div>
        <span>Memuat tanggal yang tersedia...</span>
      </div>
    `;
    dateGroup.insertAdjacentHTML('afterend', loadingHtml);
  }
}

/**
 * Hide loading indicator
 */
function hideLoadingBookedDates() {
  const loading = document.getElementById('booked-dates-loading');
  if (loading) {
    loading.remove();
  }
}

/**
 * Update selected dates display
 */
function updateSelectedDatesDisplay() {
  const startPicker = window.datePickers?.start;
  const endPicker = window.datePickers?.end;

  if (!startPicker || !endPicker) return;

  const startDate = startPicker.selectedDates[0];
  const endDate = endPicker.selectedDates[0];

  // Could add a visual summary here if needed
  console.log('[DatePicker] Selected range:', {
    start: startDate?.toISOString().split('T')[0],
    end: endDate?.toISOString().split('T')[0]
  });
}

/**
 * Validate date range - check if any booked dates are in the range
 */
function validateDateRange(startDate, endDate, bookedDates) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const bookedInRange = [];

  bookedDates.forEach(booked => {
    const bookedDate = new Date(booked);
    if (bookedDate >= start && bookedDate <= end) {
      bookedInRange.push(booked);
    }
  });

  return {
    valid: bookedInRange.length === 0,
    bookedInRange
  };
}

/**
 * Check availability and update price calculation
 */
async function checkAvailabilityAndUpdatePrice(itemId, maxStock) {
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');
  const quantityInput = document.getElementById('quantity');

  if (!startInput?.value || !endInput?.value) {
    updateBookButtonVisibility(false);
    return;
  }

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

  // First, validate against locally known booked dates
  const bookedDates = window.itemBookedDates || [];
  const validation = validateDateRange(startDate, endDate, bookedDates);

  if (!validation.valid) {
    if (availabilityLoading) availabilityLoading.style.display = 'none';
    if (availabilityStatus) {
      availabilityStatus.style.display = 'block';
      availabilityStatus.innerHTML = `
        <div class="avail-status avail-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          <span>Maaf, tanggal ${validation.bookedInRange[0]} sudah dipesan. Silakan pilih tanggal lain.</span>
        </div>
      `;
    }
    // Hide book button when dates are invalid
    updateBookButtonVisibility(false);
    return;
  }

  try {
    // Check availability from API
    const result = await itemService.checkAvailability(itemId, startDate, endDate, quantity);
    console.log('[DatePicker] Availability check result:', result);

    if (availabilityLoading) availabilityLoading.style.display = 'none';

    if (result.success && result.data) {
      const { isAvailable, availableQuantity, message, dates } = result.data;

      // Store available quantity globally for quantity control
      window.availableQuantity = availableQuantity;

      // Update quantity buttons based on availability
      if (availableQuantity !== undefined && availableQuantity !== null) {
        updateQuantityMax(availableQuantity);
      }

      if (availabilityStatus) {
        availabilityStatus.style.display = 'block';

        if (isAvailable) {
          // Check if any dates in range are unavailable
          const unavailableDates = dates?.filter(d => !d.available) || [];
          if (unavailableDates.length > 0) {
            availabilityStatus.innerHTML = `
              <div class="avail-status avail-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                <span>Maaf, beberapa tanggal dalam range tidak tersedia. Silakan pilih tanggal lain.</span>
              </div>
            `;
            updateBookButtonVisibility(true, false, 'Beberapa tanggal tidak tersedia');
          } else if (availableQuantity < quantity) {
            availabilityStatus.innerHTML = `
              <div class="avail-status avail-warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                <span>Hanya ${availableQuantity} unit tersedia</span>
              </div>
            `;
            updatePriceCalculation(startDate, endDate, availableQuantity);
            updateBookButtonVisibility(true, availableQuantity > 0, `Hanya ${availableQuantity} unit tersedia`);
          } else {
            availabilityStatus.innerHTML = `
              <div class="avail-status avail-ok">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                <span>Tersedia untuk ${availableQuantity} unit</span>
              </div>
            `;
            updatePriceCalculation(startDate, endDate, quantity);
            // Show and enable book button
            updateBookButtonVisibility(true, true, '');
          }
        } else {
          availabilityStatus.innerHTML = `
            <div class="avail-status avail-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              <span>${message || 'Tidak tersedia untuk tanggal tersebut'}</span>
            </div>
          `;
          // Show book button but disabled
          updateBookButtonVisibility(true, false, 'Item tidak tersedia untuk tanggal tersebut');
        }
      }
    } else {
      // API returned error but dates might still be available
      console.log('[DatePicker] API check failed, showing price anyway');
      updatePriceCalculation(startDate, endDate, quantity);
    }
  } catch (error) {
    console.error('Availability check failed:', error);
    // On error, still show price calculation but with warning
    if (availabilityLoading) availabilityLoading.style.display = 'none';
    if (availabilityStatus) {
      availabilityStatus.style.display = 'block';
      availabilityStatus.innerHTML = `
        <div class="avail-status avail-warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <span>Ketersediaan akan dikonfirmasi saat checkout</span>
        </div>
      `;
    }
    updatePriceCalculation(startDate, endDate, quantity);
    // Show book button with warning message
    updateBookButtonVisibility(true, true, 'Ketersediaan akan dikonfirmasi saat checkout');
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

  switch (item.priceType || item.price_type) {
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

/**
 * Show or hide the book button based on date selection and availability
 * @param {boolean} show - Whether to show the button
 * @param {boolean} enabled - Whether the button should be enabled
 * @param {string} message - Optional message to show below the button
 */
function updateBookButtonVisibility(show, enabled = true, message = '') {
  const bookSection = document.getElementById('book-section');
  const datePrompt = document.getElementById('date-selection-prompt');
  const bookBtn = document.getElementById('book-btn');
  const bookNote = document.getElementById('book-note');

  if (!bookSection) return;

  if (show) {
    bookSection.style.display = 'block';
    if (datePrompt) datePrompt.style.display = 'none';

    if (bookBtn) {
      bookBtn.disabled = !enabled;
      if (!enabled) {
        bookBtn.classList.add('btn-disabled');
      } else {
        bookBtn.classList.remove('btn-disabled');
      }
    }

    if (bookNote) {
      bookNote.innerHTML = message ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        ${message}
      ` : '';
    }
  } else {
    bookSection.style.display = 'none';
    if (datePrompt) datePrompt.style.display = 'flex';
  }
}

// ============================================
// QUANTITY CONTROL
// ============================================
function initializeQuantityControl(maxStock) {
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const quantityInput = document.getElementById('quantity');

  if (!minusBtn || !plusBtn || !quantityInput) return;

  // Use availableQuantity from global or fall back to maxStock
  const availableQty = window.availableQuantity || maxStock;

  minusBtn.addEventListener('click', () => updateQuantity(-1, availableQty));
  plusBtn.addEventListener('click', () => updateQuantity(1, availableQty));

  // Update button states
  updateQuantityButtons(availableQty);
}

function updateQuantity(delta, maxStock) {
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const quantityInput = document.getElementById('quantity');
  if (!quantityInput) return;

  const currentQty = parseInt(quantityInput.value) || 1;
  const availableQty = window.availableQuantity || maxStock || currentQty;

  let newValue = currentQty + delta;
  newValue = Math.max(1, Math.min(newValue, availableQty));
  quantityInput.value = newValue;

  updateQuantityButtons(availableQty);

  // Re-check availability if dates are selected
  const item = window.currentItem;
  if (item) {
    checkAvailabilityAndUpdatePrice(item.id, item.availableStock || item.stock);
  }
}

function updatePlusButtonState(maxStock) {
  const availableQty = window.availableQuantity || maxStock || 1;
  updateQuantityButtons(availableQty);
}

/**
 * Update quantity buttons based on available quantity
 */
function updateQuantityButtons(availableQuantity) {
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const quantityInput = document.getElementById('quantity');
  const stockInfo = document.querySelector('.stock-info');

  if (!quantityInput) return;

  const currentValue = parseInt(quantityInput.value) || 1;
  const available = availableQuantity || 1;

  // Disable minus if at minimum
  if (minusBtn) {
    minusBtn.disabled = currentValue <= 1;
  }

  // Disable plus if at max available
  if (plusBtn) {
    plusBtn.disabled = currentValue >= available;
  }

  // Update stock info
  if (stockInfo) {
    stockInfo.textContent = `Tersedia: ${available} unit`;
    stockInfo.style.color = available < 2 ? 'var(--color-warning-dark)' : 'var(--text-tertiary)';
  }
}

/**
 * Update quantity control max based on available quantity from API
 */
function updateQuantityMax(availableQuantity) {
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const quantityInput = document.getElementById('quantity');
  const stockInfo = document.querySelector('.stock-info');

  if (!quantityInput) return;

  const currentValue = parseInt(quantityInput.value) || 1;

  // If current quantity exceeds available, adjust it
  if (currentValue > availableQuantity) {
    quantityInput.value = Math.max(1, availableQuantity);
    Toast.warning(`Jumlah disesuaikan menjadi ${quantityInput.value} unit`);
  }

  // Disable minus if at minimum
  if (minusBtn) {
    minusBtn.disabled = parseInt(quantityInput.value) <= 1;
  }

  // Disable plus if at max available
  if (plusBtn) {
    plusBtn.disabled = parseInt(quantityInput.value) >= availableQuantity;
  }

  // Update stock info
  if (stockInfo) {
    stockInfo.textContent = `Tersedia: ${availableQuantity} unit`;
    stockInfo.style.color = availableQuantity < 2 ? 'var(--color-warning-dark)' : 'var(--text-tertiary)';
  }
}

// ============================================
// BOOKING HANDLER - Add to Cart
// ============================================

/**
 * Handle "Pesan Sekarang" button click
 * Validates input and adds item to cart
 */
window.handleBookNow = async function() {
  const item = window.currentItem;
  if (!item) {
    Toast.error('Item tidak ditemukan');
    return;
  }

  const startDate = document.getElementById('start-date')?.value;
  const endDate = document.getElementById('end-date')?.value;
  const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
  const bookBtn = document.getElementById('book-btn');

  // Validation
  if (!startDate || !endDate) {
    Toast.warning('Silakan pilih tanggal mulai dan selesai');
    // Scroll to date picker
    document.querySelector('.date-selection-group')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    Toast.warning('Tanggal selesai harus setelah tanggal mulai');
    return;
  }

  // Show loading state on button
  if (bookBtn) {
    bookBtn.disabled = true;
    bookBtn.innerHTML = `
      <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
      Memproses...
    `;
  }

  try {
    // Calculate duration based on price type
    let duration = 1;
    switch (item.priceType || item.price_type) {
      case 'per_day':
        duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        break;
      case 'per_hour':
        duration = 8; // Default 8 hours
        break;
      default:
        duration = 1;
    }

    // Verify availability with API before adding to cart
    console.log('[ItemDetail] Verifying availability...', { itemId: item.id, startDate, endDate, quantity });

    const availabilityResult = await itemService.checkAvailability(item.id, startDate, endDate, quantity);

    if (availabilityResult.success && availabilityResult.data) {
      const { isAvailable, availableQuantity, message } = availabilityResult.data;

      if (!isAvailable) {
        Toast.error(message || 'Item tidak tersedia untuk tanggal tersebut');
        resetBookButton(bookBtn);
        return;
      }

      // Check if requested quantity is available
      if (quantity > availableQuantity) {
        Toast.warning(`Hanya ${availableQuantity} unit tersedia untuk tanggal tersebut`);
        // Update quantity selector
        const qtyInput = document.getElementById('quantity');
        if (qtyInput) {
          qtyInput.value = availableQuantity;
          qtyInput.max = availableQuantity;
        }
        resetBookButton(bookBtn);
        return;
      }
    }

    // Calculate price
    const subtotal = item.price * duration * quantity;

    // Add to cart with full item data
    const { tenantService } = await import('../services/tenant.service.js');
    const kodeTenant = tenantService.getKodeTenant();

    const cartData = {
      ...item,
      kodeTenant: kodeTenant
    };

    Cart.addItem(cartData, quantity, duration);
    Cart.setDates(startDate, endDate);

    // Store calculated price for booking
    Cart.setBookingPrice({
      itemId: item.id,
      kodeTenant: kodeTenant,
      pricePerUnit: item.price,
      priceType: item.priceType || item.price_type,
      duration: duration,
      quantity: quantity,
      subtotal: subtotal,
      startDate: startDate,
      endDate: endDate
    });

    // Success feedback
    Toast.success(`${item.name} ditambahkan ke keranjang!`);

    // Show cart drawer
    setTimeout(() => {
      Cart.openDrawer();
    }, 300);

    // Update UI
    Cart.updateUI();

    console.log('[ItemDetail] Item added to cart:', {
      name: item.name,
      quantity,
      duration,
      subtotal,
      kodeTenant: kodeTenant
    });

  } catch (error) {
    console.error('[ItemDetail] Failed to add to cart:', error);

    // If API is unavailable, still add to cart (offline mode)
    if (error.message.includes('fetch') || error.message.includes('network')) {
      console.log('[ItemDetail] API unavailable, adding to cart in offline mode');

      let duration = 1;
      const start = new Date(startDate);
      const end = new Date(endDate);

      switch (item.priceType || item.price_type) {
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

      const { tenantService: tenantSvcOffline } = await import('../services/tenant.service.js');
      const kodeTenantOffline = tenantSvcOffline.getKodeTenant();

      const cartData = {
        ...item,
        kodeTenant: kodeTenantOffline
      };

      Cart.addItem(cartData, quantity, duration);
      Cart.setDates(startDate, endDate);
      Cart.setBookingPrice({
        itemId: item.id,
        kodeTenant: kodeTenantOffline,
        pricePerUnit: item.price,
        priceType: item.priceType || item.price_type,
        duration: duration,
        quantity: quantity,
        subtotal: subtotal,
        startDate: startDate,
        endDate: endDate
      });

      Toast.success(`${item.name} ditambahkan ke keranjang (verifikasi akan dilakukan saat checkout)`);
      setTimeout(() => {
        Cart.openDrawer();
      }, 300);
    } else {
      Toast.error('Gagal menambahkan ke keranjang. Silakan coba lagi.');
    }
  } finally {
    resetBookButton(bookBtn);
  }
};

/**
 * Reset book button to original state
 */
function resetBookButton(btn) {
  if (!btn) return;

  const item = window.currentItem;
  // API returns isAvailable (camelCase), not is_available (snake_case)
  const isAvailable = (item?.isAvailable || item?.is_available) && (item.availableStock > 0 || item.stock > 0);

  btn.disabled = !isAvailable;
  btn.innerHTML = isAvailable ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    Pesan Sekarang
  ` : 'Tidak Tersedia';
}

/**
 * Quick add to cart from item card (without dates)
 * Opens a modal to select dates first
 */
window.quickAddToCart = function(itemId) {
  // Navigate to item detail page
  window.navigateTo(`/item/${itemId}`);
};

/**
 * Update cart badge animation
 */
function animateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.classList.add('cart-badge-pulse');
    setTimeout(() => {
      badge.classList.remove('cart-badge-pulse');
    }, 500);
  }
}

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
