import { initializeStorage, storage } from './index';
import { tauriStorage } from './tauri';
import { webStorage } from './web';

let initialized = false;

/**
 * Initialize platform-appropriate storage
 * This should be called early in application startup
 */
export function initializePlatformStorage(): void {
  if (initialized) {
    return;
  }
  
  // Check if we're running in Tauri environment
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
  
  if (isTauri) {
    console.log('Initializing Tauri storage');
    initializeStorage(tauriStorage);
  } else {
    console.log('Initializing web storage (development mode)');
    initializeStorage(webStorage);
  }
  
  initialized = true;
}

/**
 * Check if storage has been initialized
 */
export function isStorageInitialized(): boolean {
  return initialized && storage !== undefined;
}

/**
 * Ensure storage is initialized before use
 * Call this in modules that use storage
 */
export function ensureStorageInitialized(): void {
  if (!isStorageInitialized()) {
    initializePlatformStorage();
  }
}