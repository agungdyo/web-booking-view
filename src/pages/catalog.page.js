/**
 * Catalog Page with Sidebar Filters & Loading States
 * Integrates with authenticated API endpoints
 */
import { itemService } from '../services/item.service.js';
import { renderItemCard, renderItemCardSkeleton } from '../components/item-card.component.js';

// State management
let isLoading = false;
let currentTypes = [];

export async function renderCatalogPage({ query }) {
  const content = document.getElementById('page-content');

  // Get filter values from query params
  const typeFilter = query.type || '';
  const searchQuery = query.search || '';
  const minPrice = query.min_price || '';
  const maxPrice = query.max_price || '';
  const availability = query.availability || ''; // 'available', 'unavailable', or ''
  const currentPage = parseInt(query.page) || 1;

  content.innerHTML = `
    <section class="catalog-section">
      <div class="catalog-container">

        <!-- Page Header with Search -->
        <div class="catalog-header">
          <div class="catalog-header-top">
            <div class="catalog-title-area">
              <h1 class="catalog-title">Katalog Item</h1>
              <p class="catalog-subtitle">Temukan item yang Anda butuhkan</p>
            </div>

            <!-- Search Bar -->
            <div class="catalog-search">
              <div class="search-input-wrapper">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="text"
                  class="search-input-field"
                  id="search-input"
                  placeholder="Cari item..."
                  value="${searchQuery}"
                >
                <button class="search-clear-btn" id="search-clear" style="display: ${searchQuery ? 'flex' : 'none'};">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div class="active-filters" id="active-filters" style="display: none;">
            <span class="active-filters-label">Filter aktif:</span>
            <div class="active-filter-tags" id="active-filter-tags"></div>
            <button class="clear-all-filters-btn" onclick="window.clearAllFilters()">Hapus Semua</button>
          </div>
        </div>

        <!-- Main Content: Sidebar + Grid -->
        <div class="catalog-layout">

          <!-- Filter Sidebar -->
          <aside class="filter-sidebar" id="filter-sidebar">
            <div class="filter-sidebar-header">
              <h3 class="filter-sidebar-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filter
              </h3>
              <button class="filter-sidebar-reset" onclick="window.clearAllFilters()">Reset</button>
            </div>

            <!-- Type Filter -->
            <div class="filter-group">
              <h4 class="filter-group-title">Kategori</h4>
              <div class="filter-options">
                <label class="filter-checkbox">
                  <input type="checkbox" name="type" value="gedung" ${typeFilter.includes('gedung') ? 'checked' : ''}>
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">Gedung / Ruangan</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" name="type" value="kendaraan" ${typeFilter.includes('kendaraan') ? 'checked' : ''}>
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">Kendaraan</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" name="type" value="alat" ${typeFilter.includes('alat') ? 'checked' : ''}>
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">Alat / Peralatan</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" name="type" value="lapangan" ${typeFilter.includes('lapangan') ? 'checked' : ''}>
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">Lapangan</span>
                </label>
              </div>
            </div>

            <!-- Price Range Filter -->
            <div class="filter-group">
              <h4 class="filter-group-title">Rentang Harga</h4>
              <div class="price-range-inputs">
                <div class="price-input-group">
                  <label class="price-input-label">Min</label>
                  <div class="price-input-wrapper">
                    <span class="price-currency">Rp</span>
                    <input
                      type="number"
                      class="price-input"
                      id="min-price"
                      placeholder="0"
                      value="${minPrice}"
                      min="0"
                    >
                  </div>
                </div>
                <span class="price-range-separator">-</span>
                <div class="price-input-group">
                  <label class="price-input-label">Max</label>
                  <div class="price-input-wrapper">
                    <span class="price-currency">Rp</span>
                    <input
                      type="number"
                      class="price-input"
                      id="max-price"
                      placeholder="Tanpa batas"
                      value="${maxPrice}"
                      min="0"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Availability Filter -->
            <div class="filter-group">
              <h4 class="filter-group-title">Ketersediaan</h4>
              <div class="filter-options">
                <label class="filter-radio">
                  <input type="radio" name="availability" value="" ${!availability ? 'checked' : ''}>
                  <span class="radio-custom"></span>
                  <span class="radio-label">Semua</span>
                </label>
                <label class="filter-radio">
                  <input type="radio" name="availability" value="available" ${availability === 'available' ? 'checked' : ''}>
                  <span class="radio-custom"></span>
                  <span class="radio-label">
                    <span class="availability-indicator available"></span>
                    Tersedia
                  </span>
                </label>
                <label class="filter-radio">
                  <input type="radio" name="availability" value="unavailable" ${availability === 'unavailable' ? 'checked' : ''}>
                  <span class="radio-custom"></span>
                  <span class="radio-label">
                    <span class="availability-indicator unavailable"></span>
                    Tidak Tersedia
                  </span>
                </label>
              </div>
            </div>

            <!-- Mobile Filter Toggle -->
            <div class="mobile-filter-toggle">
              <button class="btn btn-secondary" onclick="window.toggleMobileFilters()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filter
                <span class="filter-count-badge" id="filter-count" style="display: none;">0</span>
              </button>
            </div>
          </aside>

          <!-- Items Grid -->
          <div class="catalog-content">
            <!-- Results Info -->
            <div class="catalog-results-header">
              <p class="results-count" id="results-count">Memuat...</p>
              <div class="catalog-sort">
                <label class="sort-label">Urutkan:</label>
                <select class="form-select sort-select" id="sort-select">
                  <option value="">Terbaru</option>
                  <option value="price_asc">Harga: Rendah - Tinggi</option>
                  <option value="price_desc">Harga: Tinggi - Rendah</option>
                  <option value="name_asc">Nama: A - Z</option>
                </select>
              </div>
            </div>

            <!-- Items Grid -->
            <div class="items-grid" id="items-grid">
              ${Array(8).fill(renderItemCardSkeleton()).join('')}
            </div>

            <!-- Pagination -->
            <div class="pagination" id="pagination"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile Filter Modal -->
    <div class="filter-modal" id="filter-modal">
      <div class="filter-modal-backdrop" onclick="window.closeMobileFilters()"></div>
      <div class="filter-modal-content">
        <div class="filter-modal-header">
          <h3>Filter</h3>
          <button class="filter-modal-close" onclick="window.closeMobileFilters()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="filter-modal-body">
          <!-- Type Filter -->
          <div class="filter-group">
            <h4 class="filter-group-title">Kategori</h4>
            <div class="filter-options">
              <label class="filter-checkbox">
                <input type="checkbox" name="mobile-type" value="gedung">
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">Gedung / Ruangan</span>
              </label>
              <label class="filter-checkbox">
                <input type="checkbox" name="mobile-type" value="kendaraan">
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">Kendaraan</span>
              </label>
              <label class="filter-checkbox">
                <input type="checkbox" name="mobile-type" value="alat">
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">Alat / Peralatan</span>
              </label>
              <label class="filter-checkbox">
                <input type="checkbox" name="mobile-type" value="lapangan">
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">Lapangan</span>
              </label>
            </div>
          </div>

          <!-- Price Range Filter -->
          <div class="filter-group">
            <h4 class="filter-group-title">Rentang Harga</h4>
            <div class="price-range-inputs">
              <div class="price-input-group">
                <label class="price-input-label">Min</label>
                <div class="price-input-wrapper">
                  <span class="price-currency">Rp</span>
                  <input type="number" class="price-input" id="mobile-min-price" placeholder="0" min="0">
                </div>
              </div>
              <span class="price-range-separator">-</span>
              <div class="price-input-group">
                <label class="price-input-label">Max</label>
                <div class="price-input-wrapper">
                  <span class="price-currency">Rp</span>
                  <input type="number" class="price-input" id="mobile-max-price" placeholder="Tanpa batas" min="0">
                </div>
              </div>
            </div>
          </div>

          <!-- Availability Filter -->
          <div class="filter-group">
            <h4 class="filter-group-title">Ketersediaan</h4>
            <div class="filter-options">
              <label class="filter-radio">
                <input type="radio" name="mobile-availability" value="" checked>
                <span class="radio-custom"></span>
                <span class="radio-label">Semua</span>
              </label>
              <label class="filter-radio">
                <input type="radio" name="mobile-availability" value="available">
                <span class="radio-custom"></span>
                <span class="radio-label">
                  <span class="availability-indicator available"></span>
                  Tersedia
                </span>
              </label>
              <label class="filter-radio">
                <input type="radio" name="mobile-availability" value="unavailable">
                <span class="radio-custom"></span>
                <span class="radio-label">
                  <span class="availability-indicator unavailable"></span>
                  Tidak Tersedia
                </span>
              </label>
            </div>
          </div>
        </div>
        <div class="filter-modal-footer">
          <button class="btn btn-secondary" onclick="window.clearAllFilters()">Reset</button>
          <button class="btn btn-primary" onclick="window.applyMobileFilters()">Tampilkan Hasil</button>
        </div>
      </div>
    </div>
  `;

  // Sync mobile filter values with desktop
  syncMobileFilters();

  // Setup filter events
  setupFilterEvents();

  // Update active filters display
  updateActiveFiltersDisplay();

  // Load item types for filter
  loadItemTypes();

  // Load items
  loadItems({
    type: typeFilter,
    search: searchQuery,
    min_price: minPrice,
    max_price: maxPrice,
    availability,
    page: currentPage
  });
}

/**
 * Load item types from API for dynamic filter
 */
async function loadItemTypes() {
  try {
    console.log('[Catalog] Loading item types...');
    const response = await itemService.getItemTypes();

    if (response.success && response.data) {
      currentTypes = response.data;
      console.log('[Catalog] Item types loaded:', currentTypes);
      // Could update filter UI dynamically based on available types
    }
  } catch (error) {
    console.error('[Catalog] Failed to load item types:', error);
  }
}

/**
 * Set loading state
 */
function setLoading(loading) {
  isLoading = loading;
  const container = document.getElementById('items-grid');
  const resultsCount = document.getElementById('results-count');

  if (loading) {
    container.innerHTML = Array(8).fill(renderItemCardSkeleton()).join('');
    resultsCount.textContent = 'Memuat...';
    // Add loading overlay
    container.classList.add('loading');
  } else {
    container.classList.remove('loading');
  }
}

async function loadItems(params = {}) {
  const container = document.getElementById('items-grid');
  const resultsCount = document.getElementById('results-count');

  // Show loading state
  setLoading(true);

  // Add refresh button to retry
  const retryHandler = () => loadItems(params);

  try {
    console.log('[Catalog] Loading items with params:', params);

    // Build API params
    const apiParams = {
      page: params.page || 1,
      limit: 12,
    };

    if (params.type) {
      apiParams.type = params.type;
    }
    if (params.search) {
      apiParams.search = params.search;
    }
    if (params.availability === 'available') {
      apiParams.is_available = true;
    } else if (params.availability === 'unavailable') {
      apiParams.is_available = false;
    }

    const response = await itemService.getItems(apiParams);
    console.log('[Catalog] API Response:', response);

    if (response.success) {
      let items = response.data || [];

      // Handle nested data structure from API
      if (items.items) {
        items = items.items;
      }

      // Client-side price filtering if min/max specified
      if (params.min_price || params.max_price) {
        items = items.filter(item => {
          const price = parseFloat(item.price) || 0;
          const min = parseFloat(params.min_price) || 0;
          const max = parseFloat(params.max_price);

          if (min && price < min) return false;
          if (max && price > max) return false;
          return true;
        });
      }

      // Update results count
      const total = response.meta?.total || items.length;
      resultsCount.textContent = `Menampilkan ${items.length} dari ${total} item`;

      if (items.length > 0) {
        container.innerHTML = items.map(item => renderItemCard(item)).join('');
        renderPagination(response.meta, params);
      } else {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-state-icon">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <h3 class="empty-state-title">Item Tidak Ditemukan</h3>
            <p class="empty-state-description">Coba ubah filter atau kata kunci pencarian Anda</p>
            <button class="btn btn-primary" onclick="window.clearAllFilters()">Reset Filter</button>
          </div>
        `;
        document.getElementById('pagination').innerHTML = '';
      }
    } else {
      resultsCount.textContent = 'Gagal memuat item';
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3 class="empty-state-title">Gagal Memuat Data</h3>
          <p class="empty-state-description">Terjadi kesalahan saat mengambil data item</p>
          <button class="btn btn-primary" onclick="window.catalogRetryLoad()">Coba Lagi</button>
        </div>
      `;
      document.getElementById('pagination').innerHTML = '';
    }
  } catch (error) {
    console.error('[Catalog] Failed to load items:', error);
    resultsCount.textContent = 'Error: ' + error.message;
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <h3 class="empty-state-title">Koneksi Gagal</h3>
        <p class="empty-state-description">Tidak dapat terhubung ke server. Periksa koneksi internet Anda.</p>
        <button class="btn btn-primary" onclick="window.catalogRetryLoad()">Coba Lagi</button>
      </div>
    `;
    document.getElementById('pagination').innerHTML = '';
  } finally {
    // Clear loading state
    setLoading(false);
  }
}

function renderPagination(meta, currentParams) {
  const container = document.getElementById('pagination');
  if (!meta || meta.total_pages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  // Previous button
  html += `<button class="pagination-btn" ${meta.page <= 1 ? 'disabled' : ''} onclick="window.goToPage(${meta.page - 1})">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    <span>Sebelumnya</span>
  </button>`;

  // Page numbers
  const start = Math.max(1, meta.page - 2);
  const end = Math.min(meta.total_pages, meta.page + 2);

  if (start > 1) {
    html += `<button class="pagination-btn" onclick="window.goToPage(1)">1</button>`;
    if (start > 2) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="pagination-btn ${i === meta.page ? 'active' : ''}" onclick="window.goToPage(${i})">${i}</button>`;
  }

  if (end < meta.total_pages) {
    if (end < meta.total_pages - 1) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
    html += `<button class="pagination-btn" onclick="window.goToPage(${meta.total_pages})">${meta.total_pages}</button>`;
  }

  // Next button
  html += `<button class="pagination-btn" ${meta.page >= meta.total_pages ? 'disabled' : ''} onclick="window.goToPage(${meta.page + 1})">
    <span>Selanjutnya</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </button>`;

  container.innerHTML = html;
}

function setupFilterEvents() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const typeCheckboxes = document.querySelectorAll('input[name="type"]');
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  const availabilityRadios = document.querySelectorAll('input[name="availability"]');

  let searchTimeout;

  // Search input
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchClear.style.display = e.target.value ? 'flex' : 'none';
    searchTimeout = setTimeout(() => {
      updateFilters({ search: e.target.value });
    }, 500);
  });

  // Search clear button
  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    updateFilters({ search: '' });
  });

  // Type checkboxes
  typeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const selectedTypes = Array.from(typeCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value)
        .join(',');
      updateFilters({ type: selectedTypes });
    });
  });

  // Price range inputs
  minPriceInput?.addEventListener('change', () => {
    updateFilters({ min_price: minPriceInput.value });
  });

  maxPriceInput?.addEventListener('change', () => {
    updateFilters({ max_price: maxPriceInput.value });
  });

  // Availability radios
  availabilityRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateFilters({ availability: radio.value });
    });
  });
}

function updateFilters(updates) {
  const params = new URLSearchParams(window.location.search);

  // Update each filter
  Object.keys(updates).forEach(key => {
    const value = updates[key];
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  // Reset to page 1 when filters change
  params.delete('page');

  window.history.pushState({}, '', `?${params.toString()}`);

  // Reload items with new filters
  loadItems({
    type: params.get('type') || '',
    search: params.get('search') || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    availability: params.get('availability') || '',
  });

  // Update active filters display
  updateActiveFiltersDisplay();

  // Update filter count badge
  updateFilterCount();
}

function updateActiveFiltersDisplay() {
  const params = new URLSearchParams(window.location.search);
  const container = document.getElementById('active-filters');
  const tagsContainer = document.getElementById('active-filter-tags');

  const filters = [];

  // Search filter
  const search = params.get('search');
  if (search) {
    filters.push({ label: `Cari: "${search}"`, key: 'search' });
  }

  // Type filters
  const type = params.get('type');
  if (type) {
    const types = type.split(',');
    types.forEach(t => {
      const labels = {
        'gedung': 'Gedung',
        'kendaraan': 'Kendaraan',
        'alat': 'Alat',
        'lapangan': 'Lapangan'
      };
      filters.push({ label: labels[t] || t, key: 'type', value: t });
    });
  }

  // Price filters
  const minPrice = params.get('min_price');
  const maxPrice = params.get('max_price');
  if (minPrice || maxPrice) {
    let priceLabel = 'Harga: ';
    if (minPrice && maxPrice) {
      priceLabel += `Rp ${formatNumber(minPrice)} - Rp ${formatNumber(maxPrice)}`;
    } else if (minPrice) {
      priceLabel += `Min Rp ${formatNumber(minPrice)}`;
    } else {
      priceLabel += `Max Rp ${formatNumber(maxPrice)}`;
    }
    filters.push({ label: priceLabel, key: 'price' });
  }

  // Availability filter
  const availability = params.get('availability');
  if (availability) {
    const labels = {
      'available': 'Tersedia',
      'unavailable': 'Tidak Tersedia'
    };
    filters.push({ label: labels[availability] || availability, key: 'availability' });
  }

  // Render tags
  if (filters.length > 0) {
    container.style.display = 'flex';
    tagsContainer.innerHTML = filters.map(f => `
      <span class="filter-tag">
        ${f.label}
        <button class="filter-tag-remove" onclick="window.removeFilter('${f.key}', '${f.value || ''}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </span>
    `).join('');
  } else {
    container.style.display = 'none';
  }
}

function updateFilterCount() {
  const params = new URLSearchParams(window.location.search);
  let count = 0;

  if (params.get('type')) count++;
  if (params.get('min_price') || params.get('max_price')) count++;
  if (params.get('availability')) count++;

  const badge = document.getElementById('filter-count');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function formatNumber(num) {
  return parseInt(num).toLocaleString('id-ID');
}

// Global functions
window.goToPage = function(page) {
  const params = new URLSearchParams(window.location.search);
  params.set('page', page);
  window.history.pushState({}, '', `?${params.toString()}`);
  loadItems({
    type: params.get('type') || '',
    search: params.get('search') || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    availability: params.get('availability') || '',
    page,
  });
};

window.catalogRetryLoad = function() {
  const params = new URLSearchParams(window.location.search);
  loadItems({
    type: params.get('type') || '',
    search: params.get('search') || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    availability: params.get('availability') || '',
    page: parseInt(params.get('page')) || 1,
  });
};

window.clearAllFilters = function() {
  window.history.pushState({}, '', window.location.pathname);

  // Reset all form inputs
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const searchClear = document.getElementById('search-clear');
  if (searchClear) searchClear.style.display = 'none';

  document.querySelectorAll('input[name="type"]').forEach(cb => cb.checked = false);

  const minPrice = document.getElementById('min-price');
  const maxPrice = document.getElementById('max-price');
  if (minPrice) minPrice.value = '';
  if (maxPrice) maxPrice.value = '';

  document.querySelectorAll('input[name="availability"]').forEach(r => r.checked = r.value === '');

  // Reset mobile filters
  document.querySelectorAll('input[name="mobile-type"]').forEach(cb => cb.checked = false);
  const mobileMinPrice = document.getElementById('mobile-min-price');
  const mobileMaxPrice = document.getElementById('mobile-max-price');
  if (mobileMinPrice) mobileMinPrice.value = '';
  if (mobileMaxPrice) mobileMaxPrice.value = '';
  document.querySelectorAll('input[name="mobile-availability"]').forEach(r => r.checked = r.value === '');

  loadItems({});
  updateActiveFiltersDisplay();
  updateFilterCount();
};

window.removeFilter = function(key, value) {
  const params = new URLSearchParams(window.location.search);

  if (key === 'search') {
    params.delete('search');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    const searchClear = document.getElementById('search-clear');
    if (searchClear) searchClear.style.display = 'none';
  } else if (key === 'type' && value) {
    const currentTypes = (params.get('type') || '').split(',').filter(t => t && t !== value);
    if (currentTypes.length > 0) {
      params.set('type', currentTypes.join(','));
    } else {
      params.delete('type');
    }
    const checkbox = document.querySelector(`input[name="type"][value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  } else if (key === 'price') {
    params.delete('min_price');
    params.delete('max_price');
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
  } else if (key === 'availability') {
    params.delete('availability');
    document.querySelectorAll('input[name="availability"]').forEach(r => r.checked = r.value === '');
  }

  params.delete('page');
  window.history.pushState({}, '', `?${params.toString()}`);
  loadItems({
    type: params.get('type') || '',
    search: params.get('search') || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    availability: params.get('availability') || '',
  });
  updateActiveFiltersDisplay();
  updateFilterCount();
};

window.toggleMobileFilters = function() {
  const modal = document.getElementById('filter-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    syncMobileFilters();
  }
};

window.closeMobileFilters = function() {
  const modal = document.getElementById('filter-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

window.applyMobileFilters = function() {
  // Get mobile type filters
  const mobileTypes = Array.from(document.querySelectorAll('input[name="mobile-type"]:checked'))
    .map(cb => cb.value)
    .join(',');

  // Get mobile price filters
  const mobileMinPrice = document.getElementById('mobile-min-price')?.value || '';
  const mobileMaxPrice = document.getElementById('mobile-max-price')?.value || '';

  // Get mobile availability filter
  const mobileAvailability = document.querySelector('input[name="mobile-availability"]:checked')?.value || '';

  // Update desktop filters (for display)
  document.querySelectorAll('input[name="type"]').forEach(cb => {
    cb.checked = mobileTypes.split(',').includes(cb.value);
  });

  const minPrice = document.getElementById('min-price');
  const maxPrice = document.getElementById('max-price');
  if (minPrice) minPrice.value = mobileMinPrice;
  if (maxPrice) maxPrice.value = mobileMaxPrice;

  document.querySelectorAll('input[name="availability"]').forEach(r => {
    r.checked = r.value === mobileAvailability;
  });

  // Update URL and reload
  const params = new URLSearchParams(window.location.search);

  if (mobileTypes) {
    params.set('type', mobileTypes);
  } else {
    params.delete('type');
  }

  if (mobileMinPrice) {
    params.set('min_price', mobileMinPrice);
  } else {
    params.delete('min_price');
  }

  if (mobileMaxPrice) {
    params.set('max_price', mobileMaxPrice);
  } else {
    params.delete('max_price');
  }

  if (mobileAvailability) {
    params.set('availability', mobileAvailability);
  } else {
    params.delete('availability');
  }

  params.delete('page');
  window.history.pushState({}, '', `?${params.toString()}`);

  closeMobileFilters();

  loadItems({
    type: mobileTypes,
    search: params.get('search') || '',
    min_price: mobileMinPrice,
    max_price: mobileMaxPrice,
    availability: mobileAvailability,
  });

  updateActiveFiltersDisplay();
  updateFilterCount();
};

function syncMobileFilters() {
  // Sync desktop filters to mobile modal
  const typeCheckboxes = document.querySelectorAll('input[name="type"]');
  const mobileTypeCheckboxes = document.querySelectorAll('input[name="mobile-type"]');

  typeCheckboxes.forEach((cb, i) => {
    if (mobileTypeCheckboxes[i]) {
      mobileTypeCheckboxes[i].checked = cb.checked;
    }
  });

  const minPrice = document.getElementById('min-price')?.value || '';
  const maxPrice = document.getElementById('max-price')?.value || '';
  const mobileMinPrice = document.getElementById('mobile-min-price');
  const mobileMaxPrice = document.getElementById('mobile-max-price');
  if (mobileMinPrice) mobileMinPrice.value = minPrice;
  if (mobileMaxPrice) mobileMaxPrice.value = maxPrice;

  const availability = document.querySelector('input[name="availability"]:checked')?.value || '';
  const mobileRadios = document.querySelectorAll('input[name="mobile-availability"]');
  mobileRadios.forEach(r => {
    r.checked = r.value === availability;
  });
}

export default renderCatalogPage;
