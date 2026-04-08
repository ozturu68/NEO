import type { SecureStorage } from './index';

/**
 * Web implementation of SecureStorage using localStorage
 * Note: This is less secure than Tauri keyring and should only be used
 * for development or when Tauri is not available
 */
export class WebStorage implements SecureStorage {
  private readonly SESSION_TOKEN_KEY = 'neo_session_token';
  private readonly PREFIX = 'neo_storage_';

  async saveSessionToken(token: string): Promise<void> {
    localStorage.setItem(this.SESSION_TOKEN_KEY, token);
  }

  async getSessionToken(): Promise<string | null> {
    return localStorage.getItem(this.SESSION_TOKEN_KEY);
  }

  async clearSession(): Promise<void> {
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(`${this.PREFIX}${key}`, value);
  }

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(`${this.PREFIX}${key}`);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(`${this.PREFIX}${key}`);
  }
}

/**
 * Singleton instance for web storage
 */
export const webStorage = new WebStorage();