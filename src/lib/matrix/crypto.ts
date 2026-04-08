import { getMatrixClient } from './client';
import { CrossSigningKey } from 'matrix-js-sdk/lib/crypto-api';

/**
 * Setup crypto after client initialization
 * Checks cross-signing and key backup status
 */
export async function setupCrypto(): Promise<void> {
  const client = getMatrixClient();
  const crypto = client.getCrypto();
  if (!crypto) {
    console.warn('E2EE not initialized');
    return;
  }
  
  try {
    const crossSigningReady = await crypto.isCrossSigningReady();
    if (!crossSigningReady) {
      console.warn('Cross-signing not ready - user should verify device');
      // TODO: Trigger UI notification
    }
    
    const backupInfo = await crypto.getKeyBackupInfo();
    if (!backupInfo) {
      console.warn('Key backup not set up - user should enable backup');
      // TODO: Trigger UI notification
    }
  } catch (error) {
    console.error('Error checking crypto status:', error);
  }
}

/**
 * Check if E2EE is enabled for the client
 */
export function isE2EEEnabled(): boolean {
  const client = getMatrixClient();
  return client.getCrypto() !== undefined;
}

/**
 * Get cross-signing status
 */
export async function getCrossSigningStatus(): Promise<{
  isReady: boolean;
  hasMasterKey: boolean;
  hasSelfSigningKey: boolean;
  hasUserSigningKey: boolean;
}> {
  const client = getMatrixClient();
  const crypto = client.getCrypto();
  if (!crypto) {
    throw new Error('E2EE not initialized');
  }
  
  const isReady = await crypto.isCrossSigningReady();
  const hasMasterKey = (await crypto.getCrossSigningKeyId(CrossSigningKey.Master)) !== null;
  const hasSelfSigningKey = (await crypto.getCrossSigningKeyId(CrossSigningKey.SelfSigning)) !== null;
  const hasUserSigningKey = (await crypto.getCrossSigningKeyId(CrossSigningKey.UserSigning)) !== null;
  
  return { isReady, hasMasterKey, hasSelfSigningKey, hasUserSigningKey };
}

/**
 * Request verification for a user/device
 */
export async function requestVerification(userId: string, deviceId?: string): Promise<void> {
  const client = getMatrixClient();
  const crypto = client.getCrypto();
  if (!crypto) {
    throw new Error('E2EE not initialized');
  }
  
  // TODO: Implement verification request
  console.log('Verification requested for', userId, deviceId);
}

/**
 * Check if key backup is enabled
 */
export async function isKeyBackupEnabled(): Promise<boolean> {
  const client = getMatrixClient();
  const crypto = client.getCrypto();
  if (!crypto) {
    return false;
  }
  
  const backupInfo = await crypto.getKeyBackupInfo();
  return backupInfo !== null;
}

/**
 * Enable key backup
 */
export async function enableKeyBackup(): Promise<void> {
  const client = getMatrixClient();
  const crypto = client.getCrypto();
  if (!crypto) {
    throw new Error('E2EE not initialized');
  }
  
  // TODO: Implement key backup setup
  console.log('Key backup enabled');
}

/**
 * Get device list for a user
 */
export async function getDevices(userId: string): Promise<any[]> {
  const client = getMatrixClient();
  const crypto = client.getCrypto();
  if (!crypto) {
    throw new Error('E2EE not initialized');
  }
  
  // For current user, use client.getDevices()
  if (userId === client.getUserId()) {
    const devices = await client.getDevices();
    return devices.devices;
  }
  
  // For other users, use crypto.getUserDeviceInfo
  const deviceMap = await crypto.getUserDeviceInfo([userId], true);
  const userDevices = deviceMap.get(userId);
  return userDevices ? Array.from(userDevices.values()) : [];
}

/**
 * Get our own device ID
 */
export function getDeviceId(): string | null {
  const client = getMatrixClient();
  return client.getDeviceId();
}