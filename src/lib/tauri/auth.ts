import { invoke } from '@tauri-apps/api/core';

export async function saveSessionToken(token: string): Promise<void> {
  await invoke<void>('save_session_token', { token });
}

export async function getSessionToken(): Promise<string> {
  return await invoke<string>('get_session_token');
}

export async function clearSession(): Promise<void> {
  await invoke<void>('clear_session');
}