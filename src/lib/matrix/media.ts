import { getMatrixClient } from './client';
import type { UploadOpts, UploadResponse } from 'matrix-js-sdk/lib/http-api';
import { Method } from 'matrix-js-sdk/lib/http-api';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'application/pdf',
  'text/plain',
];

export interface UploadOptions extends UploadOpts {
  // Our custom options if needed
}

/**
 * Upload a file to Matrix media repository
 */
export async function uploadFile(file: File, options?: UploadOptions): Promise<string> {
  const client = getMatrixClient();
  
  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Dosya boyutu 50 MB\'ı aşamaz');
  }
  
  // MIME type validation
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Desteklenmeyen dosya tipi');
  }
  
  // Sanitize filename
  const safeName = file.name.replace(/[^\w\s.-]/g, '');
  
  const { content_uri } = await client.uploadContent(file, {
    name: safeName,
    type: file.type,
    includeFilename: options?.includeFilename,
  });
  
  return content_uri;
}

/**
 * Download media from URI
 */
export async function downloadMedia(mxcUri: string): Promise<Blob> {
  const client = getMatrixClient();
  const response = await client.http.authedRequest<Blob>(
    Method.Get,
    `/media/v3/download/${mxcUri.replace('mxc://', '')}`,
    undefined,
    undefined,
    { rawResponseBody: true }
  );
  return response;
}

/**
 * Get thumbnail for media
 */
export async function getThumbnail(
  mxcUri: string,
  width: number,
  height: number,
  method: 'scale' | 'crop' = 'scale'
): Promise<string> {
  const client = getMatrixClient();
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    method,
  });
  
  const url = `/media/v3/thumbnail/${mxcUri.replace('mxc://', '')}?${params.toString()}`;
  const response = await client.http.authedRequest<UploadResponse>(Method.Get, url);
  return response.content_uri;
}