/**
 * Format Utilities - Currency, Date, and other formatters
 */

/**
 * Format currency (Indonesian Rupiah)
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format date (Indonesian format)
 */
export function formatDate(date, options = {}) {
  if (!date) return '-';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  const dateObj = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat('id-ID', { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format date range
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '-';

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startStr = formatDate(start, { day: 'numeric', month: 'short' });
  const endStr = formatDate(end, { day: 'numeric', month: 'short', year: 'numeric' });

  return `${startStr} - ${endStr}`;
}

/**
 * Format time
 */
export function formatTime(date) {
  if (!date) return '-';
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 jam yang lalu")
 */
export function formatRelativeTime(date) {
  if (!date) return '-';

  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });

  if (diffSecs < 60) {
    return rtf.format(-diffSecs, 'second');
  } else if (diffMins < 60) {
    return rtf.format(-diffMins, 'minute');
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  } else if (diffDays < 30) {
    return rtf.format(-diffDays, 'day');
  } else {
    return formatDate(dateObj);
  }
}

/**
 * Format phone number
 */
export function formatPhone(phone) {
  if (!phone) return '-';

  // Remove non-digits
  const digits = phone.replace(/\D/g, '');

  // Format Indonesian phone
  if (digits.startsWith('0')) {
    return digits.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
  } else if (digits.startsWith('62')) {
    return '+' + digits.replace(/(\d{2})(\d{3})(\d{4})(\d+)/, '$1-$2-$3-$4');
  }

  return phone;
}

/**
 * Format item type to readable label
 */
export function formatItemType(type) {
  const types = {
    gedung: 'Gedung / Ruangan',
    kendaraan: 'Kendaraan',
    alat: 'Alat / Peralatan',
    lapangan: 'Lapangan',
  };
  return types[type] || type;
}

/**
 * Format booking status to readable label
 */
export function formatBookingStatus(status) {
  const statuses = {
    pending: { label: 'Menunggu Pembayaran', color: 'warning' },
    confirmed: { label: 'Dikonfirmasi', color: 'success' },
    cancelled: { label: 'Dibatalkan', color: 'error' },
    completed: { label: 'Selesai', color: 'gray' },
  };
  return statuses[status] || { label: status, color: 'gray' };
}

/**
 * Format payment status
 */
export function formatPaymentStatus(status) {
  const statuses = {
    pending: { label: 'Menunggu', color: 'warning' },
    paid: { label: 'Lunas', color: 'success' },
    failed: { label: 'Gagal', color: 'error' },
    refunded: { label: 'Dikembalikan', color: 'gray' },
  };
  return statuses[status] || { label: status, color: 'gray' };
}

/**
 * Get badge class by color
 */
export function getBadgeClass(color) {
  const classes = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    gray: 'badge-gray',
  };
  return classes[color] || 'badge-gray';
}

/**
 * Truncate text
 */
export function truncate(text, length = 50) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Format price type
 */
export function formatPriceType(type) {
  const types = {
    per_unit: '/ unit',
    per_hour: '/ jam',
    per_day: '/ hari',
  };
  return types[type] || '';
}
