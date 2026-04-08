import { MatrixClient, createClient } from 'matrix-js-sdk';
import { setupSyncHandlers } from './syncHandler';

let clientInstance: MatrixClient | null = null;

/**
 * Initialize Matrix client with given credentials
 */
export async function initMatrixClient(
  baseUrl: string,
  accessToken: string,
  userId: string
): Promise<MatrixClient> {
  if (clientInstance) {
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
  const cleanupSyncHandlers = setupSyncHandlers(client);
  
  // Store cleanup function to call when stopping client
  (client as any).__syncCleanup = cleanupSyncHandlers;

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
    const cleanup = (clientInstance as any).__syncCleanup;
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
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
  const authData = await fetch(`${baseUrl}/_matrix/client/v3/login`, {
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
  }).then(res => res.json());

  if (authData.error) {
    throw new Error(authData.error);
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