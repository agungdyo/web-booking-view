/**
 * Validation Utilities
 */

/**
 * Email regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Indonesian phone regex (08xxxxxxxxxx or +628xxxxxxxxx)
 */
const PHONE_REGEX = /^(\+?62|0)[2-9]\d{7,11}$/;

/**
 * Validate email
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, message: 'Email wajib diisi' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Format email tidak valid' };
  }
  return { valid: true };
}

/**
 * Validate phone
 */
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, message: 'Nomor telepon wajib diisi' };
  }
  if (!PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
    return { valid: false, message: 'Format nomor telepon tidak valid' };
  }
  return { valid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} wajib diisi` };
  }
  return { valid: true };
}

/**
 * Validate minimum length
 */
export function validateMinLength(value, minLength, fieldName = 'Field') {
  if (!value || value.length < minLength) {
    return { valid: false, message: `${fieldName} minimal ${minLength} karakter` };
  }
  return { valid: true };
}

/**
 * Validate password
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password wajib diisi' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter' };
  }
  return { valid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate) {
  if (!startDate) {
    return { valid: false, message: 'Tanggal mulai wajib diisi' };
  }
  if (!endDate) {
    return { valid: false, message: 'Tanggal selesai wajib diisi' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return { valid: false, message: 'Tanggal mulai tidak boleh di masa lalu' };
  }
  if (end < start) {
    return { valid: false, message: 'Tanggal selesai tidak boleh sebelum tanggal mulai' };
  }

  return { valid: true };
}

/**
 * Validate form object
 */
export function validateForm(data, rules) {
  const errors = {};
  let isValid = true;

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];

    for (const validator of validators) {
      const result = validator(value, field);

      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
        break;
      }
    }
  }

  return { valid: isValid, errors };
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  name: [validateRequired, (v) => validateMinLength(v, 2, 'Nama')],
  email: [validateRequired, validateEmail],
  phone: [validateRequired, validatePhone],
  password: [validateRequired, validatePassword],
  passwordConfirm: [(v, _, data) => {
    if (v !== data.password) {
      return { valid: false, message: 'Konfirmasi password tidak cocok' };
    }
    return { valid: true };
  }],
};

/**
 * Get first error from validation result
 */
export function getFirstError(result) {
  if (result.valid) return null;
  const firstField = Object.keys(result.errors)[0];
  return result.errors[firstField];
}
