/**
 * Item Card Component
 */
import { formatCurrency, formatItemType, formatPriceType } from '../utils/format.js';

export function renderItemCard(item) {
  const primaryImage = item.images?.find(img => img.is_primary)?.url || item.images?.[0]?.url || null;
  const isAvailable = item.is_available && item.stock > 0;

  return `
    <div class="item-card" onclick="window.navigateTo('/item/${item.id}')">
      <div class="item-card-image">
        ${primaryImage
          ? `<img src="${primaryImage}" alt="${item.name}" loading="lazy">`
          : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary);">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary);">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
               </svg>
             </div>`
        }
        <span class="item-card-badge badge badge-primary">${formatItemType(item.type)}</span>
        <div class="item-card-availability">
          <span class="availability-dot ${isAvailable ? 'available' : 'unavailable'}"></span>
          ${isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
        </div>
      </div>
      <div class="item-card-body">
        <p class="item-card-type">${formatItemType(item.type)}</p>
        <h3 class="item-card-title">${item.name}</h3>
        <p class="item-card-price">
          ${formatCurrency(item.price)}
          <span>${formatPriceType(item.price_type)}</span>
        </p>
        <div class="item-card-footer">
          <button class="btn btn-primary btn-sm btn-block" ${!isAvailable ? 'disabled' : ''} onclick="event.stopPropagation(); window.addToCart('${item.id}')">
            ${isAvailable ? 'Tambah ke Keranjang' : 'Tidak Tersedia'}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderItemCardSkeleton() {
  return `
    <div class="item-card" style="cursor: default;">
      <div class="item-card-image">
        <div class="skeleton skeleton-image"></div>
      </div>
      <div class="card-body">
        <div class="skeleton skeleton-text" style="width: 40%;"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text" style="width: 60%;"></div>
      </div>
    </div>
  `;
}

export default renderItemCard;
