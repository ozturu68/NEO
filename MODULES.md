# Neo Module Documentation

## Overview

Neo follows a 6-layer architecture (see `.kilo/rules/architecture.md`). This document describes each module's responsibility and dependencies.

## Layer 1: Matrix SDK Wrapper (`src/lib/matrix/`)

### Purpose
Type-safe, error-handled wrapper around matrix-js-sdk v41.3.0. Prevents direct SDK usage in components.

### Modules

#### `client.ts`
- **Responsibility:** Singleton MatrixClient instance with E2EE initialization
- **Exports:** `getMatrixClient()`, `initMatrixClient()`, `isClientReady()`
- **Dependencies:** matrix-js-sdk, `initRustCrypto` for E2EE
- **Error Handling:** Throws descriptive Turkish errors if client not initialized

#### `auth.ts`
- **Responsibility:** Authentication flow (login, logout, session management)
- **Exports:** `login()`, `logout()`, `getSession()`, `isLoggedIn()`
- **Dependencies:** `client.ts`, Tauri commands for secure token storage
- **Error Handling:** Turkish error messages, validation of credentials

#### `rooms.ts`
- **Responsibility:** Room management (create, join, leave, invite, list)
- **Exports:** `createRoom()`, `joinRoom()`, `leaveRoom()`, `inviteUser()`, `getRooms()`, `getRoom()`
- **Dependencies:** `client.ts`, `types/matrix.ts` for RoomSummary
- **Error Handling:** All functions wrapped in try-catch with Turkish errors
- **E2EE Default:** Rooms created with encryption by default (Megolm v1)

#### `messages.ts`
- **Responsibility:** Messaging operations (send, receive, edit, delete)
- **Exports:** `sendMessage()`, `getMessages()`, `editMessage()`, `deleteMessage()`
- **Dependencies:** `client.ts`, `types/matrix.ts` for MessageEvent
- **Error Handling:** Input validation, Turkish error messages

#### `crypto.ts`
- **Responsibility:** E2EE operations (device verification, key backup)
- **Exports:** `setupCrypto()`, `verifyDevice()`, `backupKeys()`
- **Dependencies:** matrix-js-sdk crypto module
- **Note:** Uses Rust crypto backend via `initRustCrypto`

#### `sync.ts`
- **Responsibility:** Matrix sync event handling
- **Exports:** `startSync()`, `stopSync()`, `registerEventHandler()`
- **Dependencies:** `client.ts`, Zustand stores for state updates

#### `media.ts`
- **Responsibility:** File upload/download with security restrictions
- **Exports:** `uploadFile()`, `downloadFile()`
- **Validation:** File size (50 MB max), MIME type whitelist

#### `voip.ts`
- **Responsibility:** VoIP integration with Element Call
- **Exports:** `startCall()`, `joinCall()`, `endCall()`
- **Dependencies:** Element Call widget, LiveKit JWT service

## Layer 2: State Management (`src/lib/store/`)

### Purpose
Centralized application state using Zustand with persistence.

### Modules

#### `auth.store.ts`
- **Responsibility:** Authentication state (userId, accessToken, isAuthenticated)
- **Persistence:** `zustand/persist` middleware (localStorage)
- **Actions:** `login()`, `logout()`, `setSession()`

#### `rooms.store.ts`
- **Responsibility:** Room list and current room state
- **Actions:** `setRooms()`, `setCurrentRoom()`, `addRoom()`, `removeRoom()`
- **Synced by:** Matrix sync handler

#### `messages.store.ts`
- **Responsibility:** Messages per room with pagination
- **Actions:** `addMessages()`, `clearMessages()`, `editMessage()`, `deleteMessage()`
- **Optimization:** Virtual scrolling support

#### `ui.store.ts`
- **Responsibility:** UI state (theme, sidebar visibility, loading states)
- **Actions:** `setTheme()`, `toggleSidebar()`, `setLoading()`

## Layer 3: UI Components (`src/components/`)

### Purpose
Reusable React components following Pardus design system.

### Module Categories

#### `auth/` - Authentication screens
- `LoginScreen.tsx` - Primary login with homeserver selection

#### `rooms/` - Room management
- `RoomList.tsx` - Sidebar room list with unread counts
- `RoomItem.tsx` - Individual room display

#### `chat/` - Messaging interface
- `MessageList.tsx` - Virtual-scrolling message timeline
- `MessageBubble.tsx` - Individual message display
- `MessageInput.tsx` - Text input with send button

#### `voip/` - Voice/Video calls
- `CallBar.tsx` - Active call controls
- `ElementCallFrame.tsx` - Element Call iframe wrapper

#### `settings/` - User preferences
- `SettingsModal.tsx` - Application settings

#### `neo/` - Neo-specific features
- `AtatürkKöşesi.tsx` - Atatürk corner component

## Layer 4: Tauri Backend (`src-tauri/`)

### Purpose
Rust backend for system integration and security.

### Modules

#### `src/commands/auth.rs`
- **Responsibility:** Secure session token storage via system keyring
- **Commands:** `save_session_token`, `get_session_token`, `clear_session`
- **Security:** Input validation, keyring integration

#### `src/commands/notifications.rs`
- **Responsibility:** System notifications
- **Commands:** `show_notification`

#### `src/commands/system.rs`
- **Responsibility:** System operations (file I/O, clipboard)
- **Commands:** Minimal, allowlist-restricted

#### `tauri.conf.json`
- **Security:** CSP, allowlist, permissions configuration
- **Target:** Linux/Wayland with PipeWire support

## Layer 5: Internationalization (`src/lib/i18n/`)

### Purpose
Multi-language support with Turkish as primary.

### Modules

#### `index.ts`
- **Responsibility:** i18next initialization
- **Languages:** Turkish (tr), English (en) fallback

#### `locales/tr.json`
- **Coverage:** Full UI translation (primary)

#### `locales/en.json`
- **Coverage:** English fallback translations

## Layer 6: Styling (`src/styles/`)

### Purpose
Consistent styling with Pardus theme.

### Modules

#### `globals.css`
- **Responsibility:** Global CSS reset and base styles

#### `pardus-theme.css`
- **Responsibility:** Pardus color palette CSS variables
- **Colors:** `--pardus-primary` (#00AEEF), `--pardus-secondary` (#E30613)

#### `components.css`
- **Responsibility:** Component-specific styles (if needed)

## Dependency Graph

```
┌─────────────────┐    ┌─────────────────┐
│   UI Components │───▶│  Zustand Stores │
└─────────────────┘    └─────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Matrix Wrappers │◀───│  Matrix SDK     │
└─────────────────┘    └─────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Tauri Backend  │    │   Matrix API    │
└─────────────────┘    └─────────────────┘
```

## Testing Strategy

- **Unit Tests:** Each wrapper function in `src/lib/matrix/`
- **Component Tests:** React components with React Testing Library
- **Integration Tests:** Matrix SDK + Zustand store integration
- **Coverage Target:** 80%+ (critical modules 90%+)

## Security Notes

- All Matrix wrapper functions include Turkish error messages
- Input validation at every layer
- E2EE enabled by default via `initRustCrypto`
- Tauri CSP restricts connections to `matrix.ozturu.com`
- Session tokens stored via system keyring (not localStorage)
