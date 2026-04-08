/**
 * Storage abstraction interface for Neo application
 * 
 * This interface defines a contract for secure storage operations,
 * allowing different implementations for different platforms
 * (Tauri, web localStorage, React Native AsyncStorage, etc.)
 */

import { ensureStorageInitialized } from './init';

export interface SecureStorage {
  /**
   * Save a session token securely
   * @param token - The session token to save
   */
  saveSessionToken(token: string): Promise<void>;

  /**
   * Retrieve the saved session token
   * @returns The session token, or null if not found
   */
  getSessionToken(): Promise<string | null>;

  /**
   * Clear the saved session token
   */
  clearSession(): Promise<void>;

  /**
   * Save arbitrary key-value pair securely
   * @param key - Storage key
   * @param value - Value to store
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Retrieve value by key
   * @param key - Storage key
   * @returns The stored value, or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Remove value by key
   * @param key - Storage key
   */
  removeItem(key: string): Promise<void>;
}

/**
 * Default storage implementation using platform-specific APIs
 * This will be configured based on the runtime environment
 */
export let storage: SecureStorage;

/**
 * Initialize the storage implementation
 * Must be called early in application startup
 */
export function initializeStorage(implementation: SecureStorage): void {
  storage = implementation;
}

/**
 * Convenience functions for common storage operations
 */
export const storageHelpers = {
  async saveSessionToken(token: string): Promise<void> {
    ensureStorageInitialized();
    return storage.saveSessionToken(token);
  },

  async getSessionToken(): Promise<string | null> {
    ensureStorageInitialized();
    return storage.getSessionToken();
  },

  async clearSession(): Promise<void> {
    ensureStorageInitialized();
    return storage.clearSession();
  },
};