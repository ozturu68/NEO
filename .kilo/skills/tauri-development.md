# Neo Tauri Development Skill

## Skill Özeti

Bu skill, Tauri v2 framework kullanımı, Rust IPC komutları ve desktop entegrasyonu konusunda uzmanlaşmıştır.

## Tetikleme Koşulları

- `tauri` keyword'ü kullanıldığında
- IPC command geliştirme
- Desktop integration (notification, tray, file system)
- Rust backend development

## Uzmanlık Alanları

### 1. Tauri Project Setup

```bash
# Yeni Tauri projesi (zaten varsa atlayın)
npm create tauri-app@latest

# Development
npm run tauri dev

# Production build
npm run tauri build -- --bundles deb
```

### 2. Tauri Configuration (tauri.conf.json)

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Neo",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "scope": ["$APPDATA/neo/*"],
        "readFile": true,
        "writeFile": true,
        "createDir": true,
        "exists": true
      },
      "shell": {
        "all": false,
        "open": true
      },
      "notification": {
        "all": true
      },
      "clipboard": {
        "all": false,
        "writeText": true,
        "readText": false
      },
      "http": {
        "all": false,
        "scope": [
          "https://matrix.ozturu.com/*",
          "https://element.ozturu.com/*",
          "https://rtc.ozturu.com/*"
        ]
      },
      "window": {
        "all": false,
        "create": false,
        "center": true,
        "setTitle": true,
        "setResizable": true,
        "setMinimizable": true,
        "setMaximizable": true,
        "setClosable": true,
        "setPosition": true,
        "setSize": true
      }
    },
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://matrix.ozturu.com wss://matrix.ozturu.com https://element.ozturu.com https://rtc.ozturu.com; img-src 'self' data: https://matrix.ozturu.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self' 'wasm-unsafe-eval'",
      "dangerousDisableAssetCspModification": false
    },
    "windows": [
      {
        "title": "Neo",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "transparent": false
      }
    ],
    "bundle": {
      "active": true,
      "targets": ["deb"],
      "identifier": "com.neo.client",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "deb": {
        "depends": [],
        "files": {
          "/usr/share/applications/neo.desktop": "packaging/neo.desktop"
        }
      }
    }
  }
}
```

### 3. IPC Commands (Rust Backend)

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{auth, notifications, system};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            auth::save_session_token,
            auth::get_session_token,
            auth::clear_session,
            notifications::show_notification,
            system::get_platform_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```rust
// src-tauri/src/commands/auth.rs
use tauri::State;
use keyring::Entry;

const SERVICE_NAME: &str = "com.neo.client";
const USERNAME: &str = "neo_user";

#[tauri::command]
pub fn save_session_token(token: String) -> Result<(), String> {
    // Input validation
    if token.is_empty() || token.len() > 2048 {
        return Err("Invalid token".to_string());
    }

    // Keyring'e kaydet (güvenli)
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring error: {}", e))?;
    
    entry.set_password(&token)
        .map_err(|e| format!("Failed to save token: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_session_token() -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring error: {}", e))?;
    
    entry.get_password()
        .map_err(|e| format!("Token not found: {}", e))
}

#[tauri::command]
pub fn clear_session() -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, USERNAME)
        .map_err(|e| format!("Keyring error: {}", e))?;
    
    entry.delete_password()
        .map_err(|e| format!("Failed to clear token: {}", e))?;

    Ok(())
}
```

```rust
// src-tauri/src/commands/notifications.rs
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn show_notification(
    app: AppHandle,
    title: String,
    body: String
) -> Result<(), String> {
    use tauri::api::notification::Notification;

    // Input sanitization
    let safe_title = title.chars().take(100).collect::<String>();
    let safe_body = body.chars().take(256).collect::<String>();

    Notification::new(&app.config().tauri.bundle.identifier)
        .title(&safe_title)
        .body(&safe_body)
        .show()
        .map_err(|e| format!("Notification failed: {}", e))?;

    Ok(())
}
```

```rust
// src-tauri/src/commands/system.rs
use serde::Serialize;

#[derive(Serialize)]
pub struct PlatformInfo {
    os: String,
    arch: String,
    version: String,
}

#[tauri::command]
pub fn get_platform_info() -> Result<PlatformInfo, String> {
    Ok(PlatformInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}
```

### 4. TypeScript Tauri API Usage

```typescript
// src/lib/tauri/auth.ts
import { invoke } from '@tauri-apps/api/tauri';

export async function saveSessionToken(token: string): Promise<void> {
  await invoke<void>('save_session_token', { token });
}

export async function getSessionToken(): Promise<string> {
  return await invoke<string>('get_session_token');
}

export async function clearSession(): Promise<void> {
  await invoke<void>('clear_session');
}
```

```typescript
// src/lib/tauri/notifications.ts
import { invoke } from '@tauri-apps/api/tauri';

export async function showNotification(
  title: string,
  body: string
): Promise<void> {
  await invoke<void>('show_notification', { title, body });
}
```

```typescript
// src/lib/tauri/system.ts
import { invoke } from '@tauri-apps/api/tauri';

interface PlatformInfo {
  os: string;
  arch: string;
  version: string;
}

export async function getPlatformInfo(): Promise<PlatformInfo> {
  return await invoke<PlatformInfo>('get_platform_info');
}
```

### 5. File System Operations

```rust
// src-tauri/src/commands/files.rs
use std::fs;
use std::path::PathBuf;
use tauri::api::path::app_data_dir;

#[tauri::command]
pub fn save_file(
    app: tauri::AppHandle,
    filename: String,
    content: String
) -> Result<(), String> {
    // Güvenlik: Sadece app data directory
    let app_data = app_data_dir(&app.config())
        .ok_or("App data dir not found")?;
    
    let file_path = app_data.join("neo").join(&filename);
    
    // Path traversal koruması
    if !file_path.starts_with(&app_data) {
        return Err("Invalid path".to_string());
    }

    // Dizin oluştur
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create dir: {}", e))?;
    }

    // Dosya yaz
    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn read_file(
    app: tauri::AppHandle,
    filename: String
) -> Result<String, String> {
    let app_data = app_data_dir(&app.config())
        .ok_or("App data dir not found")?;
    
    let file_path = app_data.join("neo").join(&filename);
    
    // Path traversal koruması
    if !file_path.starts_with(&app_data) {
        return Err("Invalid path".to_string());
    }

    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
```

### 6. System Tray Integration

```rust
// src-tauri/src/main.rs (tray ekleme)
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

fn main() {
    // Tray menu oluştur
    let quit = CustomMenuItem::new("quit".to_string(), "Çıkış");
    let hide = CustomMenuItem::new("hide".to_string(), "Gizle");
    let show = CustomMenuItem::new("show".to_string(), "Göster");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 7. Window Management

```typescript
// src/lib/tauri/window.ts
import { appWindow } from '@tauri-apps/api/window';

export async function minimizeWindow(): Promise<void> {
  await appWindow.minimize();
}

export async function maximizeWindow(): Promise<void> {
  await appWindow.toggleMaximize();
}

export async function closeWindow(): Promise<void> {
  await appWindow.close();
}

export async function setWindowTitle(title: string): Promise<void> {
  await appWindow.setTitle(title);
}

// Window close handler
export function onWindowClose(callback: () => void | Promise<void>): void {
  appWindow.onCloseRequested(async (event) => {
    // Cleanup işlemleri
    await callback();
    // Window'u kapat
    await appWindow.close();
  });
}
```

### 8. Deep Linking (matrix: URL handler)

```rust
// Cargo.toml dependencies
[dependencies]
tauri-plugin-deep-link = "0.1"

// src-tauri/src/main.rs
use tauri_plugin_deep_link::DeepLinkExt;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // matrix: protokolü için handler
            app.deep_link().register("matrix")?;
            app.deep_link().on_open_url(|event| {
                println!("Deep link received: {}", event.url());
                // matrix://room/#room:matrix.org -> Parse ve oda aç
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Güvenlik Best Practices

### 1. Input Validation

Tüm Rust command'larda input validation zorunlu:

```rust
#[tauri::command]
pub fn process_input(input: String) -> Result<(), String> {
    // Boş kontrolü
    if input.is_empty() {
        return Err("Input cannot be empty".to_string());
    }

    // Boyut kontrolü
    if input.len() > 10000 {
        return Err("Input too large".to_string());
    }

    // Format kontrolü (örn: email)
    if !input.contains('@') {
        return Err("Invalid format".to_string());
    }

    Ok(())
}
```

### 2. CSP (Content Security Policy)

- `script-src 'self'` - Sadece kendi script'ler
- `connect-src` - Sadece whitelist'teki endpoint'ler
- `'wasm-unsafe-eval'` - Matrix-js-sdk Olm için gerekli

### 3. Allowlist Minimum Permissions

- **Prensip:** Sadece gerekli API'ler açık
- File system sadece `$APPDATA/neo/*` scope'u
- HTTP sadece matrix.ozturu.com domain'i
- Shell sadece `open` (xdg-open/default browser)

## Performance Optimization

### 1. Async Commands

```rust
#[tauri::command]
async fn async_operation() -> Result<String, String> {
    // Uzun süren işlem main thread'i bloklamaz
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    Ok("Done".to_string())
}
```

### 2. Bundle Size Optimization

```toml
# Cargo.toml
[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
panic = "abort"
strip = true
```

## Testing

### Rust Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_save_token_validation() {
        // Empty token
        assert!(save_session_token("".to_string()).is_err());
        
        // Too long token
        let long_token = "a".repeat(3000);
        assert!(save_session_token(long_token).is_err());
        
        // Valid token
        assert!(save_session_token("valid_token_123".to_string()).is_ok());
    }
}
```

## Desktop Entry (.desktop file)

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
StartupWMClass=neo
```

## Kaynaklar

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri Security Guide](https://tauri.app/v1/guides/security/)
- [Rust Keyring Library](https://docs.rs/keyring/latest/keyring/)
- [Linux Desktop Entry Spec](https://specifications.freedesktop.org/desktop-entry-spec/latest/)
