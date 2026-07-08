/**
 * Item Card Component
 */
import { formatCurrency, formatItemType, formatPriceType } from '../utils/format.js';

/**
 * Get primary image from item
 */
function getPrimaryImage(item) {
  if (!item.images || item.images.length === 0) {
    return null;
  }
  const primary = item.images.find(img => img.isPrimary);
  return primary?.url || item.images[0]?.url || null;
}

/**
 * Get availability status
 */
function getAvailabilityStatus(item) {
  const isAvailable = item.isAvailable && (item.availableStock > 0 || item.stock > 0);
  return {
    isAvailable,
    label: isAvailable ? 'Tersedia' : 'Tidak Tersedia',
    stock: item.availableStock ?? item.stock
  };
}

/**
 * Render item card HTML
 */
export function renderItemCard(item) {
  const imageUrl = getPrimaryImage(item);
  const availability = getAvailabilityStatus(item);

  return `
    <article class="item-card" onclick="window.navigateTo('/item/${item.id}')">
      <div class="item-card-image">
        ${imageUrl
          ? `<img src="${imageUrl}" alt="${item.name}" loading="lazy" onerror="this.parentElement.innerHTML='${getPlaceholderHTML()}'">`
          : getPlaceholderHTML()
        }
        <span class="item-card-badge badge badge-primary">${formatItemType(item.type)}</span>
        ${availability.isAvailable
          ? `<div class="item-card-availability available">
               <span class="availability-dot available"></span>
               <span>${availability.stock > 1 ? `${availability.stock} unit` : 'Tersedia'}</span>
             </div>`
          : `<div class="item-card-availability unavailable">
               <span class="availability-dot unavailable"></span>
               <span>Tidak Tersedia</span>
             </div>`
        }
      </div>
      <div class="item-card-body">
        <p class="item-card-type">${formatItemType(item.type)}</p>
        <h3 class="item-card-title">${item.name}</h3>
        <div class="item-card-price">
          <span class="price-value">${formatCurrency(item.price)}</span>
          <span class="price-type">${formatPriceType(item.priceType)}</span>
        </div>
        <div class="item-card-footer">
          <button
            class="btn ${availability.isAvailable ? 'btn-primary' : 'btn-secondary'} btn-block"
            ${!availability.isAvailable ? 'disabled' : ''}
            onclick="event.stopPropagation(); window.addToCart('${item.id}')"
          >
            ${availability.isAvailable
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                   <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                 </svg>
                 Tambah`
              : 'Tidak Tersedia'
            }
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Render item card skeleton for loading state
 */
export function renderItemCardSkeleton() {
  return `
    <article class="item-card skeleton-card">
      <div class="item-card-image">
        <div class="skeleton skeleton-image"></div>
      </div>
      <div class="item-card-body">
        <div class="skeleton skeleton-text" style="width: 40%; height: 12px;"></div>
        <div class="skeleton skeleton-title" style="height: 24px;"></div>
        <div class="skeleton skeleton-text" style="width: 60%; height: 28px; margin-top: 8px;"></div>
        <div class="skeleton skeleton-btn" style="height: 40px; margin-top: 16px;"></div>
      </div>
    </article>
  `;
}

/**
 * Get placeholder HTML for missing images
 */
function getPlaceholderHTML() {
  return `
    <div class="item-card-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
      <span>Tidak ada gambar</span>
    </div>
  `;
}

/**
 * Render compact item card (for lists)
 */
export function renderItemCardCompact(item) {
  const imageUrl = getPrimaryImage(item);
  const availability = getAvailabilityStatus(item);

  return `
    <div class="item-card-compact">
      <div class="item-card-compact-image">
        ${imageUrl
          ? `<img src="${imageUrl}" alt="${item.name}" loading="lazy">`
          : `<div class="item-card-placeholder-sm">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
               </svg>
             </div>`
        }
      </div>
      <div class="item-card-compact-info">
        <p class="item-card-compact-type">${formatItemType(item.type)}</p>
        <h4 class="item-card-compact-title">${item.name}</h4>
        <p class="item-card-compact-price">${formatCurrency(item.price)}${formatPriceType(item.priceType)}</p>
      </div>
      <div class="item-card-compact-action">
        <span class="availability-dot ${availability.isAvailable ? 'available' : 'unavailable'}"></span>
      </div>
    </div>
  `;
}

export default renderItemCard;
