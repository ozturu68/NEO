import { MatrixClient, createClient } from 'matrix-js-sdk';
import { setupSyncHandlers } from './syncHandler';

let clientInstance: MatrixClient | null = null;
let cleanupSyncHandlers: (() => void) | null = null;

/**
 * Initialize Matrix client with given credentials
 */
export async function initMatrixClient(
  baseUrl: string,
  accessToken: string,
  userId: string
): Promise<MatrixClient> {
  if (clientInstance) {
    if (cleanupSyncHandlers) {
      cleanupSyncHandlers();
      cleanupSyncHandlers = null;
    }
    await clientInstance.stopClient();
    clientInstance = null;
  }

  const client = createClient({
    baseUrl,
    accessToken,
    userId,
    // Use localStorage for crypto store in Tauri environment
    store: new window.localStorage.Store(),
  });

  // Initialize E2EE crypto with Rust implementation
  await client.initRustCrypto({ useIndexedDB: true });

  // Setup crypto (cross-signing, key backup checks)
  import('./crypto').then(async (cryptoModule) => {
    await cryptoModule.setupCrypto();
  }).catch(err => console.error('Failed to setup crypto:', err));

  // Start client sync
  await client.startClient({
    initialSyncLimit: 20,
  });

  // Setup sync handlers to update Zustand stores
  cleanupSyncHandlers = setupSyncHandlers(client);

  clientInstance = client;
  return client;
}

/**
 * Get current Matrix client instance
 * @throws {Error} If client not initialized
 */
export function getMatrixClient(): MatrixClient {
  if (!clientInstance) {
    throw new Error('Matrix client not initialized. Call initMatrixClient first.');
  }
  return clientInstance;
}

/**
 * Check if client is initialized
 */
export function isClientInitialized(): boolean {
  return clientInstance !== null;
}

/**
 * Stop client and clean up
 */
export async function stopMatrixClient(): Promise<void> {
  if (clientInstance) {
    // Cleanup sync handlers if attached
    if (cleanupSyncHandlers) {
      cleanupSyncHandlers();
      cleanupSyncHandlers = null;
    }
    await clientInstance.stopClient();
    clientInstance = null;
  }
}

/**
 * Login with username and password
 */
export async function loginWithPassword(
  baseUrl: string,
  username: string,
  password: string
): Promise<{ client: MatrixClient; accessToken: string; userId: string }> {
  // Input validation
  if (!baseUrl || baseUrl.trim() === '') {
    throw new Error('Sunucu URL\'si gereklidir');
  }
  if (!username || username.trim() === '') {
    throw new Error('Kullanıcı adı gereklidir');
  }
  if (!password || password.trim() === '') {
    throw new Error('Şifre gereklidir');
  }
  
  // Validate URL format
  try {
    new URL(baseUrl);
  } catch {
    throw new Error('Geçersiz sunucu URL formatı');
  }

  let authData;
  try {
    const response = await fetch(`${baseUrl}/_matrix/client/v3/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'm.login.password',
        identifier: {
          type: 'm.id.user',
          user: username,
        },
        password,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    authData = await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Matrix sunucusuna bağlanılamadı: ${error.message}`);
    }
    throw new Error('Matrix sunucusuna bağlanılamadı');
  }

  if (authData.error) {
    throw new Error(authData.error);
  }
  
  if (!authData.access_token || !authData.user_id) {
    throw new Error('Geçersiz yanıt: eksik kimlik bilgileri');
  }

  const client = await initMatrixClient(
    baseUrl,
    authData.access_token,
    authData.user_id
  );

  return {
    client,
    accessToken: authData.access_token,
    userId: authData.user_id,
  };
}