import { invoke } from '@tauri-apps/api/core';
import type { SecureStorage } from './index';

/**
 * Tauri-specific implementation of SecureStorage
 * Uses Tauri commands for secure token storage via keyring,
 * and localStorage for general key-value storage
 */
export class TauriStorage implements SecureStorage {
  private readonly PREFIX = 'neo_storage_';

  async saveSessionToken(token: string): Promise<void> {
    await invoke<void>('save_session_token', { token });
  }

  async getSessionToken(): Promise<string | null> {
    try {
      const token = await invoke<string>('get_session_token');
      return token || null;
    } catch {
      return null;
    }
  }

  async clearSession(): Promise<void> {
    await invoke<void>('clear_session');
  }

  async setItem(key: string, value: string): Promise<void> {
    // Use localStorage for general key-value storage in Tauri
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
 * Singleton instance for Tauri storage
 */
export const tauriStorage = new TauriStorage();