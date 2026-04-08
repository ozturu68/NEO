import { getMatrixClient, initMatrixClient, loginWithPassword, isClientInitialized } from './client';
import { storageHelpers } from '../storage';

export interface LoginCredentials {
  baseUrl: string;
  username: string;
  password: string;
}

/**
 * Login to Matrix server and persist session
 * @returns userId and accessToken for state management
 */
export async function matrixLogin(credentials: LoginCredentials): Promise<{ userId: string; accessToken: string }> {
  try {
    const { accessToken, userId } = await loginWithPassword(
      credentials.baseUrl,
      credentials.username,
      credentials.password
    );

    // Save token securely via storage abstraction
    await storageHelpers.saveSessionToken(accessToken);

    console.log('Login successful:', userId);
    return { userId, accessToken };
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('Matrix girişi başarısız: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Try to restore session from stored token
 * @param serverUrl Optional server URL for validation
 * @param userId Optional user ID for validation
 * @returns true if valid session exists
 */
export async function restoreSession(serverUrl?: string, userId?: string): Promise<boolean> {
  try {
    const token = await storageHelpers.getSessionToken();
    if (!token) {
      return false;
    }

    // If we have serverUrl and userId, try to initialize client
    if (serverUrl && userId) {
      try {
        await initMatrixClient(serverUrl, token, userId);
        console.log('Session restored successfully');
        return true;
      } catch (error) {
        console.warn('Failed to restore session with stored token:', error);
        // Token might be invalid, clear it
        await storageHelpers.clearSession();
        return false;
      }
    }
    
    // If we don't have serverUrl/userId, assume token exists but we can't verify
    console.log('Session token found but missing serverUrl/userId');
    return true;
  } catch {
    return false;
  }
}

/**
 * Logout and clear session
 */
export async function matrixLogout(): Promise<void> {
  try {
    const client = getMatrixClient();
    await client.logout();
  } catch {
    // Ignore if client not initialized
  }

  // Clear stored token
  await storageHelpers.clearSession();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await storageHelpers.getSessionToken();
    return token !== null && isClientInitialized();
  } catch {
    return false;
  }
}