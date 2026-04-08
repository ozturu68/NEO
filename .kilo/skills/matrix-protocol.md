# Neo Matrix Protocol Skill

## Skill Özeti

Bu skill, Matrix Client-Server API ve matrix-js-sdk kullanımı konusunda uzmanlaşmıştır. Neo projesinde Matrix protokolü entegrasyonu için kullanılır.

## Tetikleme Koşulları

- `matrix` keyword'ü kullanıldığında
- `matrix-js-sdk` kullanımı gerektiğinde  
- E2EE (Olm/Megolm) implementation
- Room, message, auth işlemleri

## Uzmanlık Alanları

### 1. Matrix Client Initialization

```typescript
// MatrixClient singleton pattern
import { createClient, MatrixClient } from 'matrix-js-sdk';

let client: MatrixClient | null = null;

export function initMatrixClient(
  homeserverUrl: string,
  accessToken: string,
  userId: string
): MatrixClient {
  if (client) {
    return client;
  }

  client = createClient({
    baseUrl: homeserverUrl,
    accessToken: accessToken,
    userId: userId,
    store: new IndexedDBStore({
      indexedDB: window.indexedDB,
      localStorage: window.localStorage,
      dbName: 'neo-matrix-store',
    }),
    cryptoStore: new IndexedDBCryptoStore(
      window.indexedDB,
      'neo-crypto-store'
    ),
    deviceId: 'NEO_CLIENT',
    timelineSupport: true,
    cryptoCallbacks: {
      getSecretStorageKey: async () => null,
    },
  });

  return client;
}

export function getMatrixClient(): MatrixClient | null {
  return client;
}
```

### 2. Authentication Flow

```typescript
// Login
import { MatrixClient, createClient } from 'matrix-js-sdk';

export async function loginWithPassword(
  homeserverUrl: string,
  username: string,
  password: string
): Promise<{ userId: string; accessToken: string; deviceId: string }> {
  const client = createClient({ baseUrl: homeserverUrl });
  
  try {
    const response = await client.login('m.login.password', {
      user: username,
      password: password,
      initial_device_display_name: 'Neo Client',
    });

    return {
      userId: response.user_id,
      accessToken: response.access_token,
      deviceId: response.device_id,
    };
  } catch (error: any) {
    if (error.errcode === 'M_FORBIDDEN') {
      throw new Error('Kullanıcı adı veya şifre hatalı');
    } else if (error.errcode === 'M_USER_DEACTIVATED') {
      throw new Error('Hesap devre dışı bırakılmış');
    }
    throw new Error(`Giriş başarısız: ${error.message}`);
  }
}

// Logout
export async function logout(client: MatrixClient): Promise<void> {
  try {
    await client.logout();
    await client.stopClient();
    await client.clearStores();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}
```

### 3. E2EE Setup (Olm/Megolm)

```typescript
import { MatrixClient } from 'matrix-js-sdk';

export async function setupE2EE(client: MatrixClient): Promise<void> {
  // Crypto başlatma
  await client.initCrypto();
  
  // Verify edilmemiş cihazları kontrol et
  const devices = await client.getCrypto()?.getUserDeviceInfo([client.getUserId()!]);
  
  // Cross-signing kontrolü
  const crossSigningReady = await client.isCrossSigningReady();
  if (!crossSigningReady) {
    console.warn('Cross-signing not ready - kullanıcıya setup uyarısı göster');
  }
  
  // Key backup kontrolü
  const backupInfo = await client.getKeyBackupVersion();
  if (!backupInfo) {
    console.warn('Key backup yok - kullanıcıya uyarı göster');
  }
  
  // Cihaz doğrulama event'lerini dinle
  client.on('crypto.verification.request', (request) => {
    console.log('Verification request:', request);
    // UI'da doğrulama modal'ı göster
  });
}
```

### 4. Room Management

```typescript
import { MatrixClient, Visibility, Preset } from 'matrix-js-sdk';

// E2EE ile oda oluşturma
export async function createEncryptedRoom(
  client: MatrixClient,
  roomName: string,
  inviteUserIds: string[] = []
): Promise<string> {
  const options = {
    name: roomName,
    visibility: Visibility.Private,
    preset: Preset.TrustedPrivateChat,
    invite: inviteUserIds,
    initial_state: [
      {
        type: 'm.room.encryption',
        state_key: '',
        content: {
          algorithm: 'm.megolm.v1.aes-sha2',
        },
      },
    ],
  };

  try {
    const { room_id } = await client.createRoom(options);
    return room_id;
  } catch (error: any) {
    throw new Error(`Oda oluşturulamadı: ${error.message}`);
  }
}

// Odaya katılma
export async function joinRoom(
  client: MatrixClient,
  roomIdOrAlias: string
): Promise<void> {
  try {
    await client.joinRoom(roomIdOrAlias);
  } catch (error: any) {
    if (error.errcode === 'M_FORBIDDEN') {
      throw new Error('Bu odaya katılma izniniz yok');
    }
    throw new Error(`Odaya katılamadı: ${error.message}`);
  }
}

// Odadan ayrılma
export async function leaveRoom(
  client: MatrixClient,
  roomId: string
): Promise<void> {
  await client.leave(roomId);
}
```

### 5. Messaging

```typescript
import { MatrixClient, MatrixEvent } from 'matrix-js-sdk';

// Metin mesajı gönderme
export async function sendTextMessage(
  client: MatrixClient,
  roomId: string,
  text: string
): Promise<void> {
  if (!text.trim()) {
    throw new Error('Mesaj boş olamaz');
  }

  try {
    await client.sendTextMessage(roomId, text);
  } catch (error: any) {
    throw new Error(`Mesaj gönderilemedi: ${error.message}`);
  }
}

// Mesaj düzenleme
export async function editMessage(
  client: MatrixClient,
  roomId: string,
  originalEventId: string,
  newText: string
): Promise<void> {
  const content = {
    'msgtype': 'm.text',
    'body': `* ${newText}`,
    'm.new_content': {
      msgtype: 'm.text',
      body: newText,
    },
    'm.relates_to': {
      rel_type: 'm.replace',
      event_id: originalEventId,
    },
  };

  await client.sendMessage(roomId, content);
}

// Typing indicator
export async function setTyping(
  client: MatrixClient,
  roomId: string,
  isTyping: boolean,
  timeoutMs: number = 10000
): Promise<void> {
  await client.sendTyping(roomId, isTyping, timeoutMs);
}

// Read marker
export async function markRoomAsRead(
  client: MatrixClient,
  roomId: string,
  eventId: string
): Promise<void> {
  await client.sendReadReceipt(roomId, eventId);
}
```

### 6. Media Upload/Download

```typescript
import { MatrixClient } from 'matrix-js-sdk';

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

export async function uploadFile(
  client: MatrixClient,
  file: File
): Promise<string> {
  // Validasyon
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Dosya boyutu 50 MB\'ı aşamaz');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Desteklenmeyen dosya tipi');
  }

  // Dosya adı sanitization
  const safeName = file.name.replace(/[^\w\s.-]/g, '_');

  try {
    const { content_uri } = await client.uploadContent(file, {
      name: safeName,
      type: file.type,
      onlyContentUri: false,
    });

    return content_uri;
  } catch (error: any) {
    throw new Error(`Dosya yüklenemedi: ${error.message}`);
  }
}

export async function sendFileMessage(
  client: MatrixClient,
  roomId: string,
  file: File
): Promise<void> {
  const mxcUrl = await uploadFile(client, file);

  const content = {
    msgtype: file.type.startsWith('image/') ? 'm.image' : 'm.file',
    body: file.name,
    url: mxcUrl,
    info: {
      mimetype: file.type,
      size: file.size,
    },
  };

  await client.sendMessage(roomId, content);
}

// MXC URL'den HTTP URL'e dönüştürme
export function getHttpUrlForMxc(
  client: MatrixClient,
  mxcUrl: string,
  width?: number,
  height?: number
): string {
  return client.mxcUrlToHttp(mxcUrl, width, height) || '';
}
```

### 7. Sync ve Timeline

```typescript
import { MatrixClient, Room, MatrixEvent } from 'matrix-js-sdk';

export function startSync(client: MatrixClient): void {
  client.startClient({ initialSyncLimit: 20 });

  client.once('sync', (state) => {
    if (state === 'PREPARED') {
      console.log('Sync tamamlandı');
    }
  });

  // Yeni mesaj event'i
  client.on('Room.timeline', (event: MatrixEvent, room: Room | undefined) => {
    if (event.getType() !== 'm.room.message') return;
    if (room && event.getRoomId() === room.roomId) {
      // Mesajı UI'da göster
      console.log('Yeni mesaj:', event.getContent().body);
    }
  });

  // Oda güncelleme event'i
  client.on('Room', (room: Room) => {
    console.log('Yeni oda:', room.roomId);
  });
}

export function stopSync(client: MatrixClient): void {
  client.stopClient();
}

// Mesaj geçmişi çekme (pagination)
export async function loadMoreMessages(
  client: MatrixClient,
  roomId: string,
  limit: number = 30
): Promise<MatrixEvent[]> {
  const room = client.getRoom(roomId);
  if (!room) {
    throw new Error('Oda bulunamadı');
  }

  await client.scrollback(room, limit);
  return room.timeline;
}
```

### 8. VoIP Integration (Element Call)

```typescript
import { MatrixClient } from 'matrix-js-sdk';

// Widget oluşturma
export async function startCall(
  client: MatrixClient,
  roomId: string,
  callType: 'voice' | 'video'
): Promise<string> {
  const widgetId = `neo_call_${Date.now()}`;
  const widgetUrl = `https://element.ozturu.com/?roomId=${roomId}&type=${callType}`;

  const content = {
    type: 'm.call.invite',
    room_id: roomId,
    version: '1',
    call_id: widgetId,
    lifetime: 60000,
    offer: {
      type: callType,
      sdp: '',
    },
  };

  await client.sendEvent(roomId, 'm.call.invite', content);
  
  return widgetUrl;
}
```

## Güvenlik Kuralları

### E2EE Zorunluluğu

- Tüm DM ve private odalar **varsayılan olarak** E2EE ile oluşturulmalı
- `m.megolm.v1.aes-sha2` algoritması kullanılmalı
- Cihaz doğrulama yapılmadıysa kullanıcı uyarılmalı
- Key backup yoksa kullanıcıya uyarı gösterilmeli

### Error Handling

```typescript
try {
  await matrixOperation();
} catch (error: any) {
  // Matrix hata kodlarını yakala
  switch (error.errcode) {
    case 'M_FORBIDDEN':
      // İzin hatası
      break;
    case 'M_NOT_FOUND':
      // Bulunamadı
      break;
    case 'M_LIMIT_EXCEEDED':
      // Rate limiting
      break;
    default:
      // Genel hata
      console.error('Matrix error:', error);
  }
  throw error;
}
```

### Rate Limiting

- Synapse'in rate limit'leri var (10 req/s default)
- Flood protection için client-side throttling kullan
- Batch operations için queue kullan

## Test Stratejisi

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { sendTextMessage } from './messages';

describe('Matrix Messages', () => {
  it('should send text message', async () => {
    const mockClient = {
      sendTextMessage: vi.fn().mockResolvedValue({}),
    };

    await sendTextMessage(mockClient as any, '!room:matrix.org', 'Hello');
    
    expect(mockClient.sendTextMessage).toHaveBeenCalledWith(
      '!room:matrix.org',
      'Hello'
    );
  });

  it('should throw error for empty message', async () => {
    const mockClient = { sendTextMessage: vi.fn() };
    
    await expect(
      sendTextMessage(mockClient as any, '!room:matrix.org', '')
    ).rejects.toThrow('Mesaj boş olamaz');
  });
});
```

## Kaynaklar

- [Matrix Client-Server API Spec](https://spec.matrix.org/latest/client-server-api/)
- [matrix-js-sdk Documentation](https://matrix-org.github.io/matrix-js-sdk/)
- [Matrix E2EE Implementation Guide](https://matrix.org/docs/guides/end-to-end-encryption-implementation-guide)
- [Element's matrix-react-sdk](https://github.com/matrix-org/matrix-react-sdk) (referans)