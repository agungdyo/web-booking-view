/**
 * Footer Component
 */
import Storage from '../utils/storage.js';

export function renderFooter() {
  const footer = document.getElementById('footer');
  const tenant = Storage.get('tenant');

  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-grid">
        <div class="footer-section">
          <h4>${tenant?.name || 'Booking'}</h4>
          <div class="footer-links">
            <p style="color: var(--color-gray-400); font-size: var(--text-sm); line-height: var(--leading-relaxed);">
              Platform booking online terpercaya untuk semua kebutuhan Anda.
            </p>
          </div>
        </div>

        <div class="footer-section">
          <h4>Layanan</h4>
          <div class="footer-links">
            <a href="/katalog?type=gedung" class="footer-link">Sewa Gedung</a>
            <a href="/katalog?type=kendaraan" class="footer-link">Sewa Kendaraan</a>
            <a href="/katalog?type=alat" class="footer-link">Sewa Peralatan</a>
            <a href="/katalog?type=lapangan" class="footer-link">Sewa Lapangan</a>
          </div>
        </div>

        <div class="footer-section">
          <h4>Bantuan</h4>
          <div class="footer-links">
            <a href="/lacak" class="footer-link">Lacak Booking</a>
            <a href="/faq" class="footer-link">FAQ</a>
            <a href="/kontak" class="footer-link">Hubungi Kami</a>
          </div>
        </div>

        <div class="footer-section">
          <h4>Kontak</h4>
          <div class="footer-links">
            <span class="footer-link">Email: info@booking.id</span>
            <span class="footer-link">Telepon: (021) 123-4567</span>
            <span class="footer-link">Jam Operasional: 08:00 - 17:00</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${tenant?.name || 'Booking'}. Hak cipta dilindungi.</p>
      </div>
    </div>
  `;
}

export default renderFooter;
