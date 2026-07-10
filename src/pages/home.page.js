/**
 * Home Page with Loading States
 */
import { itemService } from '../services/item.service.js';
import { renderItemCard, renderItemCardSkeleton } from '../components/item-card.component.js';

export async function renderHomePage() {
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <!-- Hero Section -->
    <section class="hero">
      <div class="page-container">
        <div class="hero-content">
          <h1 class="hero-title">Booking Mudah & Cepat</h1>
          <p class="hero-description">
            Sewa gedung, kendaraan, peralatan, dan sarana lainnya dengan mudah.
            Pesan online,Bayar fleksibel, proses cepat.
          </p>
          <div class="hero-actions">
            <a href="/katalog" class="btn btn-primary btn-lg">Lihat Katalog</a>
            <a href="/lacak" class="btn btn-outline btn-lg">Lacak Booking</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Items Section -->
    <section class="section">
      <div class="page-container">
        <div class="catalog-header">
          <h2 class="catalog-title">Item Populer</h2>
          <p class="text-secondary">Pilihan terbaik untuk kebutuhan Anda</p>
        </div>

        <!-- Loading State -->
        <div class="items-grid" id="featured-items">
          ${Array(4).fill(renderItemCardSkeleton()).join('')}
        </div>

        <!-- Loading Indicator -->
        <div class="loading-indicator" id="featured-loading" style="display: none; text-align: center; padding: var(--space-lg);">
          <div class="spinner"></div>
          <p style="margin-top: var(--space-sm);">Memuat item...</p>
        </div>

        <div style="text-align: center; margin-top: var(--space-xl);">
          <a href="/katalog" class="btn btn-outline">Lihat Semua Katalog</a>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="section" style="background: var(--bg-primary);">
      <div class="page-container">
        <div class="catalog-header">
          <h2 class="catalog-title">Kategori Layanan</h2>
          <p class="text-secondary">Temukan berbagai jenis item yang bisa Anda sewa</p>
        </div>

        <div class="grid grid-cols-2" style="gap: var(--space-lg);">
          <a href="/katalog?type=gedung" class="card" style="text-decoration: none; transition: transform var(--transition-fast);">
            <div class="card-body" style="display: flex; align-items: center; gap: var(--space-lg);">
              <div style="width: 64px; height: 64px; background: var(--color-primary-100); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
              </div>
              <div>
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-xs);">Sewa Gedung</h3>
                <p class="text-sm text-secondary">Ruang meeting, aula, ballroom</p>
              </div>
            </div>
          </a>

          <a href="/katalog?type=kendaraan" class="card" style="text-decoration: none;">
            <div class="card-body" style="display: flex; align-items: center; gap: var(--space-lg);">
              <div style="width: 64px; height: 64px; background: #d1fae5; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
              </div>
              <div>
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-xs);">Sewa Kendaraan</h3>
                <p class="text-sm text-secondary">Mobil, bus, dan kendaraan lainnya</p>
              </div>
            </div>
          </a>

          <a href="/katalog?type=alat" class="card" style="text-decoration: none;">
            <div class="card-body" style="display: flex; align-items: center; gap: var(--space-lg);">
              <div style="width: 64px; height: 64px; background: #fef3c7; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <div>
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-xs);">Sewa Peralatan</h3>
                <p class="text-sm text-secondary">Proyektor, sound system, kamera</p>
              </div>
            </div>
          </a>

          <a href="/katalog?type=lapangan" class="card" style="text-decoration: none;">
            <div class="card-body" style="display: flex; align-items: center; gap: var(--space-lg);">
              <div style="width: 64px; height: 64px; background: #fee2e2; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </div>
              <div>
                <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-xs);">Sewa Lapangan</h3>
                <p class="text-sm text-secondary">Futsal, tennis, basket, voli</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="section">
      <div class="page-container">
        <div class="catalog-header" style="text-align: center;">
          <h2 class="catalog-title">Cara Kerja</h2>
          <p class="text-secondary">Booking dalam 3 langkah mudah</p>
        </div>

        <div class="grid grid-cols-3" style="gap: var(--space-xl); margin-top: var(--space-2xl);">
          <div style="text-align: center;">
            <div style="width: 64px; height: 64px; background: var(--color-primary-100); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-md);">
              <span style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary);">1</span>
            </div>
            <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-sm);">Pilih Item</h3>
            <p class="text-sm text-secondary">Jelajahi katalog dan pilih item yang Anda butuhkan</p>
          </div>

          <div style="text-align: center;">
            <div style="width: 64px; height: 64px; background: var(--color-primary-100); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-md);">
              <span style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary);">2</span>
            </div>
            <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-sm);">Atur Tanggal</h3>
            <p class="text-sm text-secondary">Pilih tanggal mulai dan selesai penyewaan</p>
          </div>

          <div style="text-align: center;">
            <div style="width: 64px; height: 64px; background: var(--color-primary-100); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-md);">
              <span style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary);">3</span>
            </div>
            <h3 style="font-weight: var(--font-semibold); margin-bottom: var(--space-sm);">Bayar</h3>
            <p class="text-sm text-secondary">Lakukan pembayaran dan dapatkan konfirmasi</p>
          </div>
        </div>
      </div>
    </section>
  `;

  // Load featured items
  loadFeaturedItems();
}

/**
 * Load featured items with loading states
 */
async function loadFeaturedItems() {
  const container = document.getElementById('featured-items');
  const loadingIndicator = document.getElementById('featured-loading');

  try {
    console.log('[Home] Loading featured items...');

    // Show loading state
    container.innerHTML = Array(4).fill(renderItemCardSkeleton()).join('');
    loadingIndicator.style.display = 'block';

    const response = await itemService.getItems({ limit: 4 });
    console.log('[Home] Featured items response:', response);

    // Hide loading indicator
    loadingIndicator.style.display = 'none';

    if (response.success) {
      let items = response.data || [];

      // Handle nested data structure
      if (items.items) {
        items = items.items;
      }

      if (items.length > 0) {
        container.innerHTML = items.map(item => renderItemCard(item)).join('');
      } else {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <h3 class="empty-state-title">Belum Ada Item</h3>
            <p class="empty-state-description">Item akan segera ditambahkan</p>
            <a href="/katalog" class="btn btn-primary" style="margin-top: var(--space-md);">Lihat Katalog</a>
          </div>
        `;
      }
    } else {
      throw new Error(response.error?.message || 'Gagal memuat data');
    }
  } catch (error) {
    console.error('[Home] Failed to load featured items:', error);

    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-error);">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3 class="empty-state-title">Gagal Memuat Item</h3>
        <p class="empty-state-description">${error.message || 'Terjadi kesalahan saat memuat data'}</p>
        <button class="btn btn-primary" style="margin-top: var(--space-md);" onclick="window.homeRetryLoad()">
          Muat Ulang
        </button>
      </div>
    `;
  }
}

// Global retry function
window.homeRetryLoad = function() {
  loadFeaturedItems();
};

export default renderHomePage;
