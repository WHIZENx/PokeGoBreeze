import { LocalStorageConfig } from './constants/localStorage';

/**
 * Clears all localStorage items except for the specified keys to preserve
 * @param keysToKeep Array of localStorage keys to preserve
 */
export const clearLocalStorageExcept = () => {
  // Create a Set for faster lookups
  const keepsSet = new Set([LocalStorageConfig.Theme, LocalStorageConfig.Timestamp]);

  // Get all keys
  const allKeys = Object.keys(localStorage);

  // Remove all keys except those in the keepsSet
  allKeys.forEach((key) => {
    if (!keepsSet.has(key)) {
      localStorage.removeItem(key);
    }
  });
};
