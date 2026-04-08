# Neo Güvenlik Kuralları

## Güvenlik Felsefesi

> **"Güvenlik birinci prensip, son adım değil"**

Neo projesi güvenliği icat etmez, Matrix protokolünden miras alır. Ancak her katmanda güvenlik önlemleri uygulanmalı, hiçbir özellik güvenlik katmanı atlanarak eklenmemelidir.

---

## Güvenlik Katmanları

```
┌─────────────────────────────────────────────────────┐
│  KATMAN 6: İZLEME VE YANIT                          │
│  Logging, monitoring, incident response             │
├─────────────────────────────────────────────────────┤
│  KATMAN 5: UYGULAMA GÜVENLİĞİ (Neo İstemci)       │
│  Tauri CSP, IPC, sandbox, dependency scanning      │
├─────────────────────────────────────────────────────┤
│  KATMAN 4: VERİ GÜVENLİĞİ                          │
│  E2EE (Olm/Megolm), TLS, database security         │
├─────────────────────────────────────────────────────┤
│  KATMAN 3: KİMLİK DOĞRULAMA                        │
│  Synapse auth, rate limiting, JWT, password policy │
├─────────────────────────────────────────────────────┤
│  KATMAN 2: SUNUCU SERTLEŞTİRME                     │
│  fail2ban, Nginx, Docker isolation, auto-updates   │
├─────────────────────────────────────────────────────┤
│  KATMAN 1: AĞ ALTYAPI GÜVENLİĞİ                   │
│  TLS 1.3, HSTS, CSP, DDoS, UFW                     │
└─────────────────────────────────────────────────────┘
```

---

## KATMAN 1: Ağ Altyapı Güvenliği

### TLS/SSL Zorunluluğu

**Kural:** Tüm istemci-sunucu iletişimi TLS 1.3 ile şifreli olmalıdır.

```nginx
# ✅ DOĞRU - Nginx yapılandırması
ssl_protocols TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

# HSTS zorunlu (1 yıl)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

**Kontrol:**
```bash
# TLS versiyonunu doğrula
curl -I https://matrix.ozturu.com | grep -i strict-transport
```

### Güvenlik HTTP Başlıkları

**Zorunlu başlıklar:**

```nginx
# XSS koruması
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;

# CSP (Content Security Policy)
add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https://matrix.ozturu.com wss://matrix.ozturu.com https://element.ozturu.com https://rtc.ozturu.com; img-src 'self' data: https://matrix.ozturu.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self' 'wasm-unsafe-eval'" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(self), camera=(self)" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### UFW (Firewall) Kuralları

**Kural:** Yalnızca SSH ve Cloudflare IP aralıkları açık olmalıdır.

```bash
# ✅ DOĞRU
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
# Cloudflare IP'leri (https://www.cloudflare.com/ips/)
sudo ufw allow from 173.245.48.0/20
sudo ufw allow from 103.21.244.0/22
# ... diğer Cloudflare IP aralıkları

# ❌ YANLIŞ - Direkt port açımı
sudo ufw allow 8008/tcp  # Synapse'i dışa açma!
```

### DDoS ve Bot Koruması

**Strateji:** Cloudflare katmanında tüm trafiği filtrele.

- **Bot Fight Mode:** Aktif
- **Challenge Passage:** 30 dakika
- **Rate Limiting:** 
  - API: 100 req/min per IP
  - Static: 1000 req/min per IP

---

## KATMAN 2: Sunucu Sertleştirme

### fail2ban Yapılandırması

**Kural:** SSH ve Synapse giriş denemelerini izle ve otomatik banla.

```ini
# ✅ DOĞRU - /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
maxretry = 3
bantime = 3600
findtime = 600

[synapse]
enabled = true
port = http,https
filter = synapse
logpath = /var/log/synapse/homeserver.log
maxretry = 5
bantime = 3600
```

### Docker İç Ağ İzolasyonu

**Kural:** PostgreSQL ve internal servisler dışa kapalı olmalıdır.

```yaml
# ✅ DOĞRU - docker-compose.yml
services:
  postgres:
    image: postgres:17
    networks:
      - internal
    # ports: AÇMA! Yalnızca internal network

  synapse:
    image: matrixdotorg/synapse:v1.149.1
    networks:
      - internal
      - web
    ports:
      - "127.0.0.1:8008:8008"  # Localhost'a bind et

networks:
  internal:
    internal: true  # Dışa kapalı
  web:
    external: true
```

### Sır Yönetimi

**Kural:** Hiçbir sır (şifre, token, key) plain text olarak repo'ya girmemeli.

```bash
# ✅ DOĞRU - .env dosyası (Git'te ignore)
POSTGRES_PASSWORD=<güvenli_şifre>
SYNAPSE_REGISTRATION_SHARED_SECRET=<random_token>
LIVEKIT_API_KEY=<livekit_key>
LIVEKIT_API_SECRET=<livekit_secret>

# .gitignore
.env
*.key
*.pem
secrets/
```

**Docker Secrets kullanımı (production için):**
```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### Otomatik Güvenlik Güncellemeleri

**Kural:** Sunucu kritik güvenlik güncellemelerini otomatik almalıdır.

```bash
# ✅ DOĞRU - Unattended-upgrades kurulumu
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::Automatic-Reboot "false";
```

---

## KATMAN 3: Kimlik Doğrulama Güvenliği

### Synapse Kayıt Kapatma

**Kural:** Public kayıt kapalı, yalnızca davet ile üyelik.

```yaml
# ✅ DOĞRU - homeserver.yaml
enable_registration: false
registration_shared_secret: "RANDOM_STRONG_SECRET"  # Admin kayıt için

# Davet sistemi aktif
allow_guest_access: false
```

**Admin kullanıcı oluşturma (güvenli):**
```bash
docker exec -it synapse register_new_matrix_user \
  -c /data/homeserver.yaml \
  -a  # Admin flag
```

### Şifre Politikası

**Kural:** Güçlü şifre zorunlu.

```yaml
# ✅ DOĞRU - homeserver.yaml
password_config:
  enabled: true
  policy:
    min_length: 12
    require_digit: true
    require_symbol: true
    require_uppercase: true
    require_lowercase: true
```

### Rate Limiting

**Kural:** Brute-force saldırılarını engelle.

```yaml
# ✅ DOĞRU - homeserver.yaml
rc_login:
  address:
    per_second: 0.17  # ~10 deneme/dakika
    burst_count: 3
  account:
    per_second: 0.17
    burst_count: 3
  failed_attempts:
    per_second: 0.17
    burst_count: 3
```

### JWT Token Güvenliği (LiveKit)

**Kural:** JWT token'lar kısa ömürlü ve strong secret ile imzalı olmalı.

```javascript
// ✅ DOĞRU - lk-jwt-service
const token = new AccessToken(apiKey, apiSecret, {
  identity: userId,
  ttl: 3600, // 1 saat
  name: userName,
});

// ❌ YANLIŞ
const token = new AccessToken(apiKey, apiSecret, {
  ttl: 86400 * 30, // 30 gün - çok uzun!
});
```

---

## KATMAN 4: Veri Güvenliği

### E2EE (End-to-End Encryption)

**Kural:** Tüm DM ve grup odaları varsayılan olarak E2EE ile oluşturulmalıdır.

```typescript
// ✅ DOĞRU - lib/matrix/rooms.ts
import { MatrixClient } from 'matrix-js-sdk';

export async function createRoom(
  client: MatrixClient,
  roomName: string,
  isEncrypted: boolean = true  // Varsayılan true!
): Promise<string> {
  const options: any = {
    name: roomName,
    preset: 'trusted_private_chat',
  };
  
  if (isEncrypted) {
    options.initial_state = [
      {
        type: 'm.room.encryption',
        state_key: '',
        content: {
          algorithm: 'm.megolm.v1.aes-sha2',
        },
      },
    ];
  }
  
  const { room_id } = await client.createRoom(options);
  return room_id;
}

// ❌ YANLIŞ - Encryption parametresi yok
export async function createRoom(client: MatrixClient, roomName: string) {
  return client.createRoom({ name: roomName }); // E2EE yok!
}
```

### Crypto Storage Güvenliği

**Kural:** E2EE key'ler güvenli şekilde saklanmalı, kullanıcıya backup uyarısı gösterilmeli.

```typescript
// ✅ DOĞRU - lib/matrix/crypto.ts
import { MatrixClient } from 'matrix-js-sdk';

export async function setupCrypto(client: MatrixClient): Promise<void> {
  await client.initCrypto();
  
  // Cross-signing kurulumu
  const crossSigningReady = await client.isCrossSigningReady();
  if (!crossSigningReady) {
    console.warn('Cross-signing not ready - kullanıcıya uyarı göster');
    // UI'da "Cihaz doğrulama gerekli" banner göster
  }
  
  // Key backup kontrolü
  const backupInfo = await client.getKeyBackupVersion();
  if (!backupInfo) {
    console.warn('Key backup yok - kullanıcıya uyarı göster');
    // UI'da "Anahtar yedeği oluştur" uyarısı göster
  }
}
```

### Medya Güvenliği

**Kural:** Dosya yükleme/indirme sırasında güvenlik kontrolleri yapılmalı.

```typescript
// ✅ DOĞRU - lib/matrix/media.ts
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm',
  'application/pdf',
  'text/plain',
];

export async function uploadFile(
  client: MatrixClient,
  file: File
): Promise<string> {
  // Boyut kontrolü
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Dosya boyutu 50 MB\'ı aşamaz');
  }
  
  // MIME type kontrolü
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Desteklenmeyen dosya tipi');
  }
  
  // Dosya adı sanitization
  const safeName = file.name.replace(/[^\w\s.-]/g, '');
  
  const { content_uri } = await client.uploadContent(file, {
    name: safeName,
    type: file.type,
    onlyContentUri: false,
  });
  
  return content_uri;
}

// ❌ YANLIŞ - Hiç kontrol yok
export async function uploadFile(client: MatrixClient, file: File) {
  return client.uploadContent(file); // Güvensiz!
}
```

### Database Güvenliği

**Kural:** PostgreSQL yalnızca Docker internal network'te erişilebilir.

```yaml
# ✅ DOĞRU - docker-compose.yml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    networks:
      - internal  # Yalnızca internal
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    # ports: AÇMA!

# ✅ DOĞRU - PostgreSQL sertleştirme
# postgresql.conf
ssl = on
ssl_cert_file = '/var/lib/postgresql/server.crt'
ssl_key_file = '/var/lib/postgresql/server.key'
password_encryption = scram-sha-256
```

---

## KATMAN 5: Uygulama Güvenliği (Neo İstemci)

### Tauri CSP (Content Security Policy)

**Kural:** CSP sıkı tutulmalı, yalnızca güvenilir kaynaklar izinli.

```json
// ✅ DOĞRU - src-tauri/tauri.conf.json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://matrix.ozturu.com wss://matrix.ozturu.com https://element.ozturu.com https://rtc.ozturu.com; img-src 'self' data: https://matrix.ozturu.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self' 'wasm-unsafe-eval'"
    }
  }
}
```

**CSP Kuralları:**
- `default-src 'self'` - Varsayılan yalnızca kendi kaynak
- `connect-src` - API endpoint'leri whitelist
- `img-src` - Resimler için Matrix media repo izinli
- `style-src 'unsafe-inline'` - Tailwind için (gerekli)
- `script-src 'wasm-unsafe-eval'` - WASM için (matrix-js-sdk olm)

### Tauri IPC Güvenliği

**Kural:** Frontend yalnızca explicit whitelist'teki komutları çağırabilir.

```rust
// ✅ DOĞRU - src-tauri/src/main.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_session_token,
            get_session_token,
            clear_session,
            show_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Her command explicit tanımlanmalı
#[tauri::command]
fn save_session_token(token: String) -> Result<(), String> {
    // Input validation
    if token.is_empty() || token.len() > 1024 {
        return Err("Invalid token".to_string());
    }
    
    // Güvenli kaydetme işlemi
    // ...
    Ok(())
}
```

```typescript
// ✅ DOĞRU - TypeScript tarafında
import { invoke } from '@tauri-apps/api';

async function saveToken(token: string): Promise<void> {
  // Type-safe çağrı
  await invoke<void>('save_session_token', { token });
}

// ❌ YANLIŞ - Dinamik komut adı
async function dangerousCall(cmd: string, args: any) {
  await invoke(cmd, args); // Güvensiz!
}
```

### Tauri Allowlist

**Kural:** API'ler minimum gerekli izinlerle kısıtlanmalı.

```json
// ✅ DOĞRU - tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "all": false,  // Tümünü kapalı
      "fs": {
        "all": false,
        "scope": ["$APPDATA/neo/*"],  // Yalnızca app data
        "readFile": true,
        "writeFile": true,
        "createDir": true
      },
      "shell": {
        "all": false,
        "open": true  // Yalnızca xdg-open/open
      },
      "notification": {
        "all": true  // Bildirimler açık
      },
      "clipboard": {
        "all": false,
        "writeText": true,
        "readText": false  // Okuma kapalı (privacy)
      },
      "http": {
        "all": false,
        "scope": [
          "https://matrix.ozturu.com/*",
          "https://element.ozturu.com/*",
          "https://rtc.ozturu.com/*"
        ]
      }
    }
  }
}
```

### XSS Koruması

**Kural:** Kullanıcı input'ları sanitize edilmeli, dangerouslySetInnerHTML yasak.

```typescript
// ✅ DOĞRU - Metin escape edilmiş
import DOMPurify from 'dompurify';

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  // Plain text olarak göster
  return <p className="message-text">{text}</p>;
};

// Eğer HTML render gerekiyorsa (örn: markdown)
const MarkdownMessage: React.FC<{ markdown: string }> = ({ markdown }) => {
  const sanitized = DOMPurify.sanitize(markdown);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// ❌ YANLIŞ - Direkt HTML render
const UnsafeMessage = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />; // XSS risk!
};
```

### Dependency Scanning

**Kural:** npm/cargo bağımlılıkları düzenli taranmalı.

```bash
# ✅ DOĞRU - CI/CD pipeline'da
npm audit --audit-level=moderate
cargo audit

# package.json scripts
"scripts": {
  "audit": "npm audit --audit-level=moderate",
  "audit:fix": "npm audit fix"
}
```

**CI/CD Entegrasyonu:**
```yaml
# .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: npm audit
        run: npm audit --audit-level=moderate
      - name: cargo audit
        run: cargo install cargo-audit && cargo audit
```

---

## KATMAN 6: İzleme ve Yanıt

### Logging Stratejisi

**Kural:** Güvenlik olayları loglanmalı, ancak sensitive data loglanmamalı.

```typescript
// ✅ DOĞRU
console.log('User logged in', { userId: user.id });

// ❌ YANLIŞ
console.log('User logged in', { 
  userId: user.id, 
  password: user.password  // Asla!
});
```

**Synapse log izleme:**
```bash
# Failed login attempts
tail -f /var/log/synapse/homeserver.log | grep "Failed password"

# Rate limit triggers
tail -f /var/log/synapse/homeserver.log | grep "Ratelimiter"
```

### fail2ban İzleme

```bash
# Banlanan IP'leri görüntüle
sudo fail2ban-client status synapse

# Bir IP'yi manual unban
sudo fail2ban-client set synapse unbanip 1.2.3.4
```

### Güvenlik Incident Response

**Acil durum prosedürü:**

1. **Tespit:** Anormal aktivite loglandı
2. **İzolasyon:** Şüpheli bağlantılar kesildi
3. **Analiz:** Root cause belirlendi
4. **Yanıt:** Güvenlik yaması uygulandı
5. **Dokümantasyon:** Incident raporu yazıldı
6. **İyileştirme:** Süreç güncellendi

```bash
# Acil durum - Synapse kapatma
docker-compose down synapse

# Acil durum - Tüm oturumları invalidate et
docker exec -it synapse python -m synapse.app.admin_cmd -c /data/homeserver.yaml invalidate_all_tokens
```

---

## Güvenlik Test Checklist

### Pre-deployment Checklist

Her deployment öncesi kontrol edilmeli:

- [ ] TLS 1.3 aktif
- [ ] HSTS header mevcut
- [ ] CSP header doğru yapılandırılmış
- [ ] UFW yalnızca SSH + Cloudflare açık
- [ ] fail2ban aktif ve çalışıyor
- [ ] PostgreSQL dışa kapalı
- [ ] .env dosyası Git'te yok
- [ ] Synapse kayıt kapalı
- [ ] Rate limiting yapılandırılmış
- [ ] E2EE varsayılan aktif
- [ ] Tauri allowlist minimum izinlerle
- [ ] npm audit clean
- [ ] cargo audit clean
- [ ] XSS koruması tüm input'larda
- [ ] Dosya upload kısıtlamaları mevcut

### Penetration Testing (Opsiyonel)

```bash
# SSL/TLS testi
testssl.sh https://matrix.ozturu.com

# HTTP headers testi
curl -I https://matrix.ozturu.com

# Port scanning
nmap -sV <sunucu-ip>

# OWASP ZAP automated scan (dikkatli kullan!)
zap-cli quick-scan https://app.ozturu.com
```

---

## Güvenlik İhlali Durumunda

### Kritik Aksiyon Planı

**Senaryo 1: Matrix access token sızdı**
```bash
# 1. Tüm oturumları invalidate et
docker exec -it synapse python -m synapse.app.admin_cmd -c /data/homeserver.yaml invalidate_all_tokens

# 2. Kullanıcılara bildirim gönder
# 3. Sızıntı kaynağını patch'le
# 4. Incident raporu yaz
```

**Senaryo 2: Sunucuya yetkisiz erişim**
```bash
# 1. Sunucuyu ağdan izole et
sudo ufw default deny incoming
sudo ufw default deny outgoing

# 2. Forensic analiz
last -a  # Son girişler
sudo ausearch -m LOGIN  # Audit log

# 3. Sistem yeniden kurulumu değerlendirmesi
# 4. Backup'tan restore
```

**Senaryo 3: Dependency vulnerability**
```bash
# 1. Güvenlik advisory oku
npm audit

# 2. Patch yükle
npm audit fix

# 3. Test et
npm run test

# 4. Deploy et
cargo tauri build
```

---

## Güvenlik Eğitimi ve Farkındalık

### Geliştirici için Temel Prensipler

1. **Varsayılan Olarak Güvensiz:** Her input'u validate et
2. **Least Privilege:** Minimum gerekli izinleri ver
3. **Defense in Depth:** Çok katmanlı güvenlik
4. **Fail Securely:** Hata durumunda güvenli taraf
5. **Keep it Simple:** Karmaşıklık güvenlik açığıdır

### OWASP Top 10 (Web)

Neo bağlamında dikkat edilecekler:

1. **Broken Access Control** → Tauri allowlist + IPC whitelist
2. **Cryptographic Failures** → E2EE + TLS 1.3
3. **Injection** → Input validation (XSS, SQL)
4. **Insecure Design** → Architecture review
5. **Security Misconfiguration** → CSP, HSTS, UFW
6. **Vulnerable Components** → npm audit, cargo audit
7. **Authentication Failures** → Synapse rate limiting
8. **Software & Data Integrity** → Git signed commits
9. **Logging Failures** → Structured logging
10. **SSRF** → HTTP scope kısıtlamaları

---

## Güvenlik Sorumlulukları

### Geliştirici Sorumlulukları

- Her PR'da security checklist kontrolü
- Dependency güncellemeleri haftalık
- Security advisory takibi
- Kod review'da güvenlik odağı
- Incident response planını bilme

### Kullanıcı Sorumluluğu

- Güçlü şifre kullanma
- Cihaz doğrulama yapma
- Key backup oluşturma
- Şüpheli aktiviteleri raporlama

---

## Kaynaklar

### Matrix Güvenlik Dokümantasyonu

- [Matrix Security Disclosure Policy](https://matrix.org/security-disclosure-policy/)
- [Matrix E2EE Spec](https://spec.matrix.org/latest/client-server-api/#end-to-end-encryption)
- [Olm/Megolm Cryptographic Review](https://matrix.org/blog/2016/11/21/matrixs-olm-end-to-end-encryption-security-assessment-released)

### Tauri Güvenlik

- [Tauri Security Guide](https://tauri.app/v1/guides/security/)
- [Tauri CSP Configuration](https://tauri.app/v1/api/config#securityconfig)

### Genel Güvenlik

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## Güvenlik Versiyonlama

Bu doküman ile birlikte güvenlik yapılandırmaları versiyonlanmalıdır:

- **v1.0.0** - İlk güvenlik baseline (M1 tamamlandığında)
- **v1.1.0** - Tauri güvenlik katmanı (M2 tamamlandığında)
- **v1.2.0** - E2EE doğrulama (M3 tamamlandığında)
- **v2.0.0** - Penetration test sonrası sertleştirme (M5 tamamlandığında)
