# Neo Proje Mimarisi Kuralları

## Genel Prensipler

### Proje Felsefesi
- **Güvenlik Önce:** E2EE varsayılan gelir, hiçbir özellik güvenlik katmanı atlanarak eklenmez
- **Fork Değil, Sıfırdan:** Cinny veya başka istemci kodundan bağımsız, tamamen özgün geliştirme
- **Dürüst Kapsam:** Tek geliştirici gerçeğini görmezden gelme; her milestone gerçekçi tutulmalı
- **Katmanlı İnşa:** Önce çalıştır, sonra güzelleştir. Önce protokol, sonra arayüz

### Mimari Katmanlar

```
┌─────────────────────────────────────────────────────────────────────┐
│  KATMAN 6: Fedora/Debian/Pardus UI Markalaşması & Testing          │
│  (Pardus teması, i18n, Vitest + React Testing Library)              │
├─────────────────────────────────────────────────────────────────────┤
│  KATMAN 5: UI Bileşenleri & Chat Akışı                            │
│  (React Components: LoginScreen, RoomList, MessageBubble, sync)     │
├─────────────────────────────────────────────────────────────────────┤
│  KATMAN 4: State Yönetimi & Sync Handlers                         │
│  (Zustand stores + Matrix sync event handlers)                     │
├─────────────────────────────────────────────────────────────────────┤
│  KATMAN 3: Matrix SDK Wrapper Katmanı & E2EE                      │
│  (matrix-js-sdk v41.3.0 wrapper: auth, rooms, messages, crypto)    │
├─────────────────────────────────────────────────────────────────────┤
│  KATMAN 2: Tauri IPC & Secure Storage                             │
│  (Rust IPC commands, keyring token storage, CSP configuration)     │
├─────────────────────────────────────────────────────────────────────┤
│  KATMAN 1: Sunucu Altyapısı & DevOps                              │
│  (Synapse + PostgreSQL + LiveKit + Cloudflare Tunnel)              │
└─────────────────────────────────────────────────────────────────────┘
```

## Dizin Yapısı Standartları

### Frontend Yapısı (`src/`)

```
src/
├── main.tsx                  # React giriş noktası
├── App.tsx                   # Kök bileşen, routing
├── lib/                      # Çekirdek kütüphaneler
│   ├── matrix/              # Matrix SDK wrapper katmanı
│   │   ├── client.ts        # MatrixClient singleton
│   │   ├── auth.ts          # Authentication
│   │   ├── rooms.ts         # Room management
│   │   ├── messages.ts      # Messaging
│   │   ├── crypto.ts        # E2EE operations
│   │   ├── media.ts         # File upload/download
│   │   ├── voip.ts          # VoIP integration
│   │   └── sync.ts          # Sync management
│   ├── store/               # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── rooms.store.ts
│   │   ├── messages.store.ts
│   │   └── ui.store.ts
│   ├── storage/             # Platform abstraction layer
│   │   ├── index.ts         # Storage interface
│   │   ├── tauri.ts         # Tauri implementation
│   │   ├── web.ts           # Web implementation
│   │   └── init.ts          # Platform detection & initialization
│   ├── config/              # Configuration management
│   │   └── index.ts         # Environment-aware config
│   ├── errors/              # Error types and utilities
│   │   └── index.ts         # NeoError hierarchy
│   └── i18n/                # Internationalization
│       ├── index.ts
│       └── locales/
│           ├── tr.json      # Türkçe (birincil)
│           └── en.json      # İngilizce
├── components/              # UI Bileşenleri
│   ├── layout/             # Layout components
│   ├── auth/               # Auth screens
│   ├── rooms/              # Room components
│   ├── chat/               # Chat components
│   ├── voip/               # VoIP components
│   ├── settings/           # Settings
│   └── neo/                # Neo'ya özel (Atatürk köşesi vb.)
├── styles/
│   ├── globals.css
│   ├── pardus-theme.css    # Pardus renk paleti
│   └── components.css
└── utils/
    ├── format.ts
    ├── crypto.ts
    └── constants.ts
```

### Tauri Backend Yapısı (`src-tauri/`)

```
src-tauri/
├── src/
│   ├── main.rs             # Tauri entry point
│   ├── lib.rs
│   └── commands/           # IPC komutları
│       ├── auth.rs
│       ├── notifications.rs
│       └── system.rs
├── icons/                  # Pardus ikonları
├── Cargo.toml
└── tauri.conf.json
```

## Bileşen Geliştirme Kuralları

### React Bileşenleri

1. **Functional Components Only:** Class component yasak
2. **TypeScript Strict Mode:** Her prop ve state tiplendirilmeli
3. **Dosya İsimlendirme:** PascalCase (örn: `MessageList.tsx`)
4. **Hook Kullanımı:** Custom hook'lar `use` prefix ile başlamalı
5. **Props Interface:** Her bileşen props'u export edilmeli

```typescript
// ✅ DOĞRU
interface MessageListProps {
  roomId: string;
  onLoadMore?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({ roomId, onLoadMore }) => {
  // ...
};

// ❌ YANLIŞ
export const MessageList = (props: any) => {
  // ...
};
```

### Matrix SDK Entegrasyonu

1. **Wrapper Katmanı:** `matrix-js-sdk` direkt bileşenlerde kullanılmamalı
2. **Singleton Pattern:** MatrixClient tek instance olmalı
3. **Error Handling:** Tüm Matrix API çağrıları try-catch içinde
4. **Type Safety:** Matrix event'leri tip güvenli wrapper'larla kullanılmalı

```typescript
// ✅ DOĞRU - lib/matrix/messages.ts
import { MatrixClient } from 'matrix-js-sdk';
import { getMatrixClient } from './client';

export async function sendMessage(roomId: string, text: string): Promise<void> {
  const client = getMatrixClient();
  if (!client) throw new Error('Matrix client not initialized');
  
  try {
    await client.sendTextMessage(roomId, text);
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Mesaj gönderilemedi');
  }
}

// ❌ YANLIŞ - Bileşende direkt SDK kullanımı
const MessageInput = () => {
  const client = new MatrixClient(...); // ❌
  client.sendTextMessage(...); // ❌
};
```

### State Yönetimi (Zustand)

1. **Store Separation:** Her domain için ayrı store
2. **Immutable Updates:** State değişiklikleri immutable olmalı
3. **Selectors:** Computed değerler için selector kullan
4. **Persistence:** Kritik state'ler localStorage'a persist edilmeli

```typescript
// ✅ DOĞRU - lib/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (userId: string, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      accessToken: null,
      isAuthenticated: false,
      login: (userId, accessToken) => set({ userId, accessToken, isAuthenticated: true }),
      logout: () => set({ userId: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: 'neo-auth' }
  )
);
```

## Platform Abstraction Layer

### Storage Abstraction

Neo uses a platform abstraction layer for secure storage operations, allowing different implementations for Tauri (keyring), web (localStorage), and other platforms.

1. **Interface-based Design:** All storage operations go through the `SecureStorage` interface
2. **Platform Detection:** Automatic detection of Tauri vs web environment
3. **Session Token Security:** In Tauri, tokens are stored in system keyring; in web, they use localStorage (less secure)

```typescript
// ✅ DOĞRU - Using storage abstraction
import { storageHelpers } from '../storage';

export async function saveAuthToken(token: string): Promise<void> {
  await storageHelpers.saveSessionToken(token);
}

// ❌ YANLIŞ - Direct platform-specific calls
import { invoke } from '@tauri-apps/api'; // Platform-specific!
await invoke('save_session_token', { token });
```

### Configuration Management

Centralized configuration with environment-specific defaults ensures consistent behavior across development and production.

```typescript
import { config } from '../config';

// Use configuration instead of hardcoded values
const serverUrl = config.matrix.defaultServer;
const isDebug = config.features.enableDebugLogging;
```

### Error Handling

Consistent error types and user-friendly error messages with Turkish translations.

```typescript
import { NeoError, MatrixError, errorUtils } from '../errors';

// Creating typed errors
throw new MatrixError('Login failed', 'M_FORBIDDEN', { userId });

// User-friendly error display
const userMessage = errorUtils.toUserFriendly(error, 'tr');
```

## Tauri IPC Kuralları

1. **Command Naming:** Snake_case kullan
2. **Type Safety:** Rust ve TS tarafında aynı tipler
3. **Error Handling:** Result<T, String> dön
4. **Permission Model:** Minimum gerekli izinler

```rust
// ✅ DOĞRU - src-tauri/src/commands/auth.rs
#[tauri::command]
pub async fn save_session_token(token: String) -> Result<(), String> {
    // Token'ı güvenli şekilde sakla
    match save_to_keyring(token) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Token kaydedilemedi: {}", e)),
    }
}
```

```typescript
// ✅ DOĞRU - TypeScript tarafında
import { invoke } from '@tauri-apps/api';

async function saveToken(token: string): Promise<void> {
  await invoke('save_session_token', { token });
}
```

## Stil ve Tema Kuralları

### Tailwind CSS Kullanımı

1. **Utility-First:** Öncelik Tailwind utility class'ları
2. **Custom CSS:** Sadece gerektiğinde, `@apply` ile
3. **Pardus Teması:** CSS değişkenleri ile tanımlanmalı
4. **Responsive:** Mobile-first yaklaşım (Pardus desktop odaklı olsa da)

```css
/* ✅ DOĞRU - styles/pardus-theme.css */
:root {
  --pardus-primary: #00AEEF;
  --pardus-secondary: #E30613;
  --pardus-dark: #1A1A1A;
  --pardus-text: #2C3E50;
  --pardus-bg: #F8F9FA;
}

.btn-pardus {
  @apply bg-[var(--pardus-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity;
}
```

### Pardus Görsel Kimlik

1. **Logo Kullanımı:** Resmi Pardus logosu + Neo logosu birlikte
2. **Renk Paleti:** Pardus mavi (#00AEEF) birincil, kırmızı (#E30613) vurgu
3. **Tipografi:** Noto Sans (Pardus varsayılan font)
4. **İkonlar:** Pardus uyumlu icon set

## Güvenlik Mimarisi

### E2EE Kuralları

1. **Varsayılan Aktif:** Tüm DM ve grup odaları E2EE ile oluşturulmalı
2. **Olm/Megolm:** matrix-js-sdk crypto modülü varsayılan kullanılmalı
3. **Cihaz Doğrulama:** QR code veya emoji verification
4. **Key Backup:** Kullanıcıya key backup uyarısı gösterilmeli

### Tauri Güvenlik

1. **CSP:** Content Security Policy sıkı tutulmalı
2. **IPC Whitelist:** Sadece gerekli komutlar expose edilmeli
3. **Allowlist:** `tauri.conf.json`'da API allowlist tanımlı olmalı
4. **No Eval:** `eval()` veya `Function()` yasak

```json
// tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "scope": ["$APPDATA/neo/*"]
      },
      "shell": {
        "open": true
      },
      "notification": {
        "all": true
      }
    },
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://matrix.ozturu.com wss://matrix.ozturu.com"
    }
  }
}
```

## Ses/Video (VoIP) Mimarisi

### Element Call Entegrasyonu

1. **Widget Model:** Element Call iframe içinde barındırılmalı
2. **JWT Auth:** LiveKit ile Synapse arası lk-jwt-service üzerinden
3. **Fallback Stratejisi:** TURN/TLS birincil, UDP fallback
4. **UI Integration:** CallBar bileşeni + ElementCallFrame

```typescript
// ✅ DOĞRU - components/voip/ElementCallFrame.tsx
interface ElementCallFrameProps {
  roomId: string;
  callType: 'voice' | 'video';
  onCallEnd: () => void;
}

export const ElementCallFrame: React.FC<ElementCallFrameProps> = ({ 
  roomId, 
  callType, 
  onCallEnd 
}) => {
  const widgetUrl = `https://element.ozturu.com/?roomId=${roomId}&type=${callType}`;
  
  return (
    <iframe
      src={widgetUrl}
      allow="camera; microphone; display-capture"
      className="w-full h-full"
      title="Neo Voice/Video Call"
    />
  );
};
```

## Performans Kuralları

### Hedef Metrikler

- **Başlangıç Süresi:** < 2 saniye (soğuk start)
- **RAM Kullanımı (Boşta):** < 120 MB
- **Mesaj Gecikmesi:** < 200 ms (10 eş zamanlı kullanıcı)
- **Bundle Size:** < 5 MB (gzipped)

### Optimizasyon Stratejileri

1. **Code Splitting:** React.lazy() ile route bazlı
2. **Virtual Scrolling:** Mesaj listesi için react-window
3. **Image Optimization:** Lazy loading + thumbnail'ler
4. **Memoization:** React.memo() ve useMemo() uygun yerlerde

```typescript
// ✅ DOĞRU - Lazy loading
const SettingsModal = React.lazy(() => import('./components/settings/SettingsModal'));
const AtatürkKöşesi = React.lazy(() => import('./components/neo/AtatürkKöşesi'));

// ✅ DOĞRU - Virtual scrolling
import { FixedSizeList } from 'react-window';

const MessageList: React.FC = () => {
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={80}
    >
      {({ index, style }) => (
        <MessageItem message={messages[index]} style={style} />
      )}
    </FixedSizeList>
  );
};
```

## Test Stratejisi

### Test Katmanları

1. **Unit Tests:** Utility fonksiyonları, Matrix wrapper'lar
2. **Component Tests:** React Testing Library ile
3. **Integration Tests:** Tauri commands + Matrix SDK
4. **E2E Tests:** Playwright ile (opsiyonel, zaman varsa)

### Test Coverage Hedefi

- **Kritik Modüller:** %80+ (auth, crypto, messages)
- **UI Bileşenleri:** %60+ (temel render testleri)
- **Utility Fonksiyonlar:** %90+

## i18n (Çok Dil Desteği)

### Dil Önceliği

1. **Türkçe (tr):** Birincil, tam kapsam
2. **İngilizce (en):** İkincil, fallback

### Çeviri Kuralları

1. **Namespace:** Modül bazlı namespace kullan
2. **Interpolation:** Dinamik değerler için `{{variable}}`
3. **Pluralization:** i18next plural desteği kullan
4. **No Hardcode:** Hiçbir metin direkt yazılmamalı

```json
// ✅ DOĞRU - locales/tr.json
{
  "auth": {
    "login": "Giriş Yap",
    "logout": "Çıkış Yap",
    "welcome": "Hoş geldin, {{username}}!",
    "error": {
      "invalidCredentials": "Kullanıcı adı veya şifre hatalı"
    }
  },
  "chat": {
    "messageCount": "{{count}} mesaj",
    "messageCount_plural": "{{count}} mesaj",
    "typingIndicator": "{{user}} yazıyor..."
  }
}
```

```typescript
// ✅ DOĞRU - Component içinde
import { useTranslation } from 'react-i18next';

const LoginScreen = () => {
  const { t } = useTranslation('auth');
  
  return <button>{t('login')}</button>;
};
```

## Git Workflow

### Branch Stratejisi

- **main:** Production-ready kod
- **develop:** Development branch
- **feature/milestone-X:** Milestone bazlı feature branch'ler

### Commit Mesajları

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: Yeni özellik
- `fix`: Hata düzeltme
- `docs`: Dokümantasyon
- `style`: Kod formatı (mantık değişikliği yok)
- `refactor`: Refactoring
- `test`: Test ekleme
- `chore`: Build, bağımlılık güncellemeleri

**Örnek:**
```
feat(auth): matrix-js-sdk ile giriş akışı eklendi

- MatrixClient singleton oluşturuldu
- Login/logout fonksiyonları implement edildi
- Session token Zustand store'da persist ediliyor

Refs: Milestone 2, F1 (Kullanıcı kimlik doğrulama)
```

## Dokümantasyon Kuralları

1. **Inline Comments:** Karmaşık mantık açıklanmalı (Türkçe)
2. **JSDoc:** Public API'ler için TypeScript JSDoc
3. **README:** Her modülde README.md (gerekirse)
4. **ADR:** Kritik kararlar `KISIM_E_-_Karar_Günlüğü__ADR_.md`'ye eklenmeli

```typescript
/**
 * Matrix odasına mesaj gönderir
 * @param roomId - Matrix oda ID'si
 * @param text - Gönderilecek metin
 * @throws {Error} Client başlatılmamışsa veya ağ hatası
 * @returns Promise<void>
 */
export async function sendMessage(roomId: string, text: string): Promise<void> {
  // Implementasyon...
}
```

## Paketleme ve Dağıtım

### .deb Paketi Gereksinimleri

1. **App ID:** `com.neo.client`
2. **Desktop Entry:** `packaging/neo.desktop`
3. **Icon:** Pardus uyumlu SVG/PNG
4. **Post-install:** `packaging/postinstall.sh` (gerekirse)

```desktop
[Desktop Entry]
Name=Neo
Comment=Pardus için güvenli iletişim platformu
Exec=neo
Icon=neo
Terminal=false
Type=Application
Categories=Network;InstantMessaging;
Keywords=chat;messaging;matrix;pardus;
```

### Build Komutu

```bash
# Development
cargo tauri dev

# Production .deb
cargo tauri build --bundles deb
```

## Kapsam Yönetimi

### MVP Öncelikleri (Demo için Zorunlu)

1. ✅ **Katman 0:** Sunucu altyapısı (TAMAMLANDI)
2. 🔄 **Katman 1:** Tauri + Matrix bağlantısı (AKTİF - M2)
3. ⏳ **Katman 2:** Temel UI (M3)
4. ⏳ **Katman 3:** Ses/Video (M4)
5. ⏳ **Katman 4:** Güvenlik (M5)
6. ⏳ **Katman 5:** Pardus markalaşması (M6)

### Kapsam Dışı (İleriki Sürümler)

- Thread/Reaction desteği
- Spaces tam desteği
- Mobil uygulama
- Federasyon
- Bot API
- MatrixRTC E2EE

## Kalite Kontrol Checklist

Her PR/Milestone tamamlanmadan önce:

- [ ] TypeScript hataları yok (`npm run type-check`)
- [ ] Linting temiz (`npm run lint`)
- [ ] Unit testler geçiyor (`npm run test`)
- [ ] Build başarılı (`cargo tauri build`)
- [ ] RAM kullanımı < 150 MB
- [ ] Tüm stringler i18n'den geliyor
- [ ] E2EE çalışıyor
- [ ] Dokümantasyon güncellendi
- [ ] ADR eklendi (kritik kararlar için)
