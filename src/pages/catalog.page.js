/**
 * Catalog Page
 */
import { itemService } from '../services/item.service.js';
import { renderItemCard, renderItemCardSkeleton } from '../components/item-card.component.js';
import { formatItemType } from '../utils/format.js';

export async function renderCatalogPage({ query }) {
  const content = document.getElementById('page-content');
  const typeFilter = query.get('type') || '';
  const searchQuery = query.get('search') || '';

  content.innerHTML = `
    <section class="section">
      <div class="page-container">
        <div class="catalog-header">
          <h1 class="catalog-title">Katalog Item</h1>
          <p class="text-secondary">Temukan item yang Anda butuhkan</p>

          <div class="catalog-filters">
            <div class="filter-group" style="flex: 1; min-width: 200px;">
              <div class="search-input">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" class="form-input" id="search-input" placeholder="Cari item..." value="${searchQuery}">
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Kategori</label>
              <select class="form-input form-select" id="type-filter" style="min-width: 150px;">
                <option value="">Semua Kategori</option>
                <option value="gedung" ${typeFilter === 'gedung' ? 'selected' : ''}>Gedung / Ruangan</option>
                <option value="kendaraan" ${typeFilter === 'kendaraan' ? 'selected' : ''}>Kendaraan</option>
                <option value="alat" ${typeFilter === 'alat' ? 'selected' : ''}>Alat / Peralatan</option>
                <option value="lapangan" ${typeFilter === 'lapangan' ? 'selected' : ''}>Lapangan</option>
              </select>
            </div>
          </div>
        </div>

        <div class="items-grid" id="items-grid">
          ${Array(8).fill(renderItemCardSkeleton()).join('')}
        </div>

        <div class="pagination" id="pagination"></div>
      </div>
    </section>
  `;

  // Setup filter events
  setupFilterEvents();

  // Load items
  loadItems({ type: typeFilter, search: searchQuery });
}

async function loadItems(params = {}) {
  const container = document.getElementById('items-grid');
  container.innerHTML = Array(8).fill(renderItemCardSkeleton()).join('');

  try {
    const response = await itemService.getItems({
      ...params,
      limit: 12,
      is_available: true,
    });

    if (response.success && response.data.length > 0) {
      container.innerHTML = response.data.map(item => renderItemCard(item)).join('');
      renderPagination(response.meta);
    } else {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-state-icon">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <h3 class="empty-state-title">Item Tidak Ditemukan</h3>
          <p class="empty-state-description">Coba ubah filter atau kata kunci pencarian Anda</p>
          <button class="btn btn-primary" onclick="resetFilters()">Reset Filter</button>
        </div>
      `;
      document.getElementById('pagination').innerHTML = '';
    }
  } catch (error) {
    console.error('Failed to load items:', error);
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p class="text-error">Gagal memuat item. Silakan refresh halaman.</p>
        <button class="btn btn-primary" style="margin-top: var(--space-md);" onclick="loadItems(${JSON.stringify(params)})">Coba Lagi</button>
      </div>
    `;
  }
}

function renderPagination(meta) {
  const container = document.getElementById('pagination');
  if (!meta || meta.total_pages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  // Previous button
  html += `<button class="pagination-btn" ${meta.page <= 1 ? 'disabled' : ''} onclick="goToPage(${meta.page - 1})">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  </button>`;

  // Page numbers
  const start = Math.max(1, meta.page - 2);
  const end = Math.min(meta.total_pages, meta.page + 2);

  if (start > 1) {
    html += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
    if (start > 2) {
      html += `<span style="padding: 0 var(--space-sm);">...</span>`;
    }
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="pagination-btn ${i === meta.page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  if (end < meta.total_pages) {
    if (end < meta.total_pages - 1) {
      html += `<span style="padding: 0 var(--space-sm);">...</span>`;
    }
    html += `<button class="pagination-btn" onclick="goToPage(${meta.total_pages})">${meta.total_pages}</button>`;
  }

  // Next button
  html += `<button class="pagination-btn" ${meta.page >= meta.total_pages ? 'disabled' : ''} onclick="goToPage(${meta.page + 1})">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </button>`;

  container.innerHTML = html;
}

function setupFilterEvents() {
  const searchInput = document.getElementById('search-input');
  const typeFilter = document.getElementById('type-filter');

  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      updateFilters({ search: e.target.value });
    }, 500);
  });

  typeFilter?.addEventListener('change', (e) => {
    updateFilters({ type: e.target.value });
  });
}

function updateFilters(updates) {
  const params = new URLSearchParams(window.location.search);

  if (updates.search !== undefined) {
    if (updates.search) {
      params.set('search', updates.search);
    } else {
      params.delete('search');
    }
  }

  if (updates.type !== undefined) {
    if (updates.type) {
      params.set('type', updates.type);
    } else {
      params.delete('type');
    }
  }

  params.delete('page'); // Reset to page 1

  window.history.pushState({}, '', `?${params.toString()}`);
  loadItems({
    search: params.get('search') || '',
    type: params.get('type') || '',
  });
}

window.goToPage = function(page) {
  const params = new URLSearchParams(window.location.search);
  params.set('page', page);
  window.history.pushState({}, '', `?${params.toString()}`);
  loadItems({
    search: params.get('search') || '',
    type: params.get('type') || '',
    page,
  });
};

window.resetFilters = function() {
  window.history.pushState({}, '', window.location.pathname);
  document.getElementById('search-input').value = '';
  document.getElementById('type-filter').value = '';
  loadItems({});
};

export default renderCatalogPage;
