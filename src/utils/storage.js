/**
 * Storage Utility - LocalStorage wrapper
 */

const STORAGE_PREFIX = 'wb_';

class Storage {
  /**
   * Get item from localStorage
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Storage.get error for key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set item to localStorage
   */
  static set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Storage.set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (error) {
      console.warn(`Storage.remove error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app storage
   */
  static clear() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (error) {
      console.warn('Storage.clear error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  static has(key) {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  }
}

export default Storage;
