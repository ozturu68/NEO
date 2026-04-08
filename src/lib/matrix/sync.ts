import { getMatrixClient } from './client';
import { ClientEvent, SyncState } from 'matrix-js-sdk';
import type { ISyncStateData } from 'matrix-js-sdk/lib/sync';

export interface SyncOptions {
  filter?: any;
  fullState?: boolean;
  since?: string;
}

/**
 * Start syncing with the server
 */
export async function startSync(options?: SyncOptions): Promise<void> {
  const client = getMatrixClient();
  await client.startClient({
    initialSyncLimit: 20,
    ...options,
  });
}

/**
 * Stop syncing
 */
export async function stopSync(): Promise<void> {
  const client = getMatrixClient();
  await client.stopClient();
}

/**
 * Get sync state
 */
export function getSyncState(): SyncState | null {
  const client = getMatrixClient();
  return client.getSyncState();
}

/**
 * Listen to sync events
 */
export function onSync(listener: (state: SyncState, prevState: SyncState | null, data?: ISyncStateData) => void): () => void {
  const client = getMatrixClient();
  const handler = (state: SyncState, prevState: SyncState | null, data?: ISyncStateData) => listener(state, prevState, data);
  client.on(ClientEvent.Sync, handler);
  return () => client.removeListener(ClientEvent.Sync, handler);
}

/**
 * Listen to room events
 */
export function onRoomEvent(
  eventType: string,
  listener: (event: any, room: any) => void
): () => void {
  const client = getMatrixClient();
  const handler = (event: any, room: any) => listener(event, room);
  client.on(eventType as any, handler);
  return () => client.removeListener(eventType as any, handler);
}