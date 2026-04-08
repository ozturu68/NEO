# KISIM C — Mimari ve Teknik Temel

---

## C1. Temel Yazılım: Matrix Ekosistemi

### Matrix Protokolü

Matrix; gerçek zamanlı iletişim için tasarlanmış, açık ve merkezi olmayan bir standarttır. Tıpkı e-postanın SMTP protokolü üzerine kurulması gibi, Matrix de farklı sunucular ve istemciler arasında güvenli iletişimi standartlaştırır. Projenin güvenlik altyapısının tamamı bu protokolden miras alınmaktadır.

**Şifreleme:** Olm (1:1 oturumlar) ve Megolm (grup oturumları) kütüphaneleri. Signal protokolüyle aynı kriptografik temelden gelir. Bağımsız güvenlik denetiminden geçmiştir.

**Referanslar:** NATO, Almanya Bundeswehr, Fransa hükümeti (Tchap), İngiltere hükümeti, BM Bilişim Merkezi, ABD Uzay Kuvvetleri — 35'ten fazla ülkede kurumsal kullanım.

### Bağımlılık Envanteri

| Bileşen                  | Teknoloji / Repo              | Açıklama                                            | Öncelik   |
| ------------------------ | ----------------------------- | --------------------------------------------------- | --------- |
| **İstemci çerçevesi**    | Tauri v2 (Rust + WebView2)    | Masaüstü sarmalayıcı — sıfırdan geliştirilecek      | 🔴 Kritik |
| **UI katmanı**           | React 18 + TypeScript         | Kullanıcı arayüzü — sıfırdan geliştirilecek         | 🔴 Kritik |
| **Matrix SDK**           | matrix-js-sdk (matrix.org)    | Matrix protokol iletişim katmanı                    | 🔴 Kritik |
| **Stil sistemi**         | Tailwind CSS v4               | Yardımcı-öncelikli CSS çerçevesi                    | 🔴 Kritik |
| **Homeserver**           | Synapse (Python) — Docker     | Matrix homeserver                                   | 🔴 Kritik |
| **Veritabanı**           | PostgreSQL 17 — Docker        | Synapse'in zorunlu kıldığı veritabanı               | 🔴 Kritik |
| **Ses/Video SFU**        | LiveKit — Docker              | WebRTC medya sunucusu                               | 🔴 Kritik |
| **JWT Köprüsü**          | lk-jwt-service — Docker       | LiveKit ↔ Synapse kimlik doğrulama köprüsü          | 🔴 Kritik |
| **Ses/Video Widget**     | Element Call (gömülü iframe)  | Sesli/görüntülü görüşme arayüzü                     | 🟡 Yüksek |
| **Durum yönetimi**       | Zustand                       | Hafif React state yönetimi                          | 🟡 Yüksek |
| **i18n**                 | i18next + react-i18next       | Çok dil desteği (Türkçe birincil)                   | 🟡 Yüksek |
| **Bildirimler**          | Tauri notification plugin     | Sistem bildirimleri (libnotify entegrasyonu)        | 🟡 Yüksek |
| **Ekran paylaşımı**      | PipeWire (Wayland) + X11      | Tauri getDisplayMedia API üzerinden                 | 🟡 Yüksek |
| **Paketleme**            | Tauri bundler                 | `.deb` otomatik üretimi                             | 🔴 Kritik |

---

## C2. İstemci Mimarisi: Sıfırdan Geliştirme

### Neden Sıfırdan?

Fork almak belirli bir noktaya kadar hız kazandırır; ancak beraberinde getirdiği yükler bu hızı kısa sürede siler:

* Upstream değişikliklerini takip etme zorunluluğu
* Yabancı kodun davranışını anlama maliyeti
* Tasarım kararlarını kendi vizyonunla hizalama güçlüğü
* Yarışmada özgünlük kaybı

Neo'nun sıfırdan geliştirilmesi şu somut avantajları sağlar:
* Her satır kod anlaşılmış ve tasarlanmıştır
* Fedora, Debian ve Pardus'a özel her tasarım kararı en başından alınmıştır
* Codebase zamanla büyümek için temiz bir zemin sunar
* Teknofest'te "Bu bizim yazdığımız kod" denilebilir

### Proje Yapısı

```
neo/
├── src-tauri/                      # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs                 # Tauri giriş noktası
│   │   ├── commands/               # IPC komutları (frontend → Rust)
│   │   │   ├── auth.rs             # Giriş/çıkış komutları
│   │   │   ├── notifications.rs    # Sistem bildirimleri
│   │   │   └── system.rs           # OS entegrasyonu
│   │   └── lib.rs
│   ├── icons/                      # Uygulama ikonları (Fedora, Debian, Pardus kimliği)
│   ├── Cargo.toml
│   └── tauri.conf.json             # Tauri yapılandırması
│
├── src/                            # React + TypeScript frontend
│   ├── main.tsx                    # React giriş noktası
│   ├── App.tsx                     # Kök bileşen, yönlendirme
│   │
│   ├── lib/                        # Çekirdek kütüphaneler
│   │   ├── matrix/                 # Matrix SDK katmanı
│   │   │   ├── client.ts           # MatrixClient başlatma ve singleton
│   │   │   ├── auth.ts             # Giriş, kayıt, oturum yönetimi
│   │   │   ├── rooms.ts            # Oda listeleme, oluşturma, üyelik
│   │   │   ├── messages.ts         # Mesaj gönderme, alma, sayfalama
│   │   │   ├── crypto.ts           # E2EE, cihaz doğrulama, key backup
│   │   │   ├── media.ts            # Dosya yükleme, indirme, önizleme
│   │   │   ├── voip.ts             # Element Call entegrasyon köprüsü
│   │   │   └── sync.ts             # Gerçek zamanlı sync yönetimi
│   │   │
│   │   ├── store/                  # Zustand store'ları
│   │   │   ├── auth.store.ts       # Oturum durumu
│   │   │   ├── rooms.store.ts      # Oda listesi ve aktif oda
│   │   │   ├── messages.store.ts   # Mesaj geçmişi cache'i
│   │   │   └── ui.store.ts         # UI durumu (sidebar, modal vb.)
│   │   │
│   │   └── i18n/                   # Çok dil altyapısı
│   │       ├── index.ts
│   │       └── locales/
│   │           ├── tr.json         # Türkçe (birincil)
│   │           └── en.json         # İngilizce (ikincil)
│   │
│   ├── components/                 # UI Bileşenleri
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Sol panel: alanlar + odalar
│   │   │   ├── MainPanel.tsx       # Orta panel: sohbet alanı
│   │   │   └── RightPanel.tsx      # Sağ panel: üye listesi, detaylar
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx     # Giriş ekranı (Pardus temalı)
│   │   │   ├── RegisterScreen.tsx  # Kayıt ekranı
│   │   │   └── HomeserverPicker.tsx# Homeserver seçimi
│   │   │
│   │   ├── rooms/
│   │   │   ├── RoomList.tsx        # Oda listesi (DM + gruplar)
│   │   │   ├── RoomItem.tsx        # Tek oda öğesi
│   │   │   └── SpaceTree.tsx       # Alan (Space) hiyerarşisi
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatView.tsx        # Ana sohbet görünümü
│   │   │   ├── MessageList.tsx     # Mesaj akışı (sanal kaydırma)
│   │   │   ├── MessageItem.tsx     # Tek mesaj bileşeni
│   │   │   ├── MessageInput.tsx    # Metin girişi + ek düğmeleri
│   │   │   ├── FileUpload.tsx      # Dosya yükleme bileşeni
│   │   │   └── TypingIndicator.tsx # "Yazıyor..." göstergesi
│   │   │
│   │   ├── voip/
│   │   │   ├── CallBar.tsx         # Aktif arama çubuğu
│   │   │   └── ElementCallFrame.tsx# Element Call iframe sarmalayıcı
│   │   │
│   │   ├── settings/
│   │   │   ├── SettingsModal.tsx   # Ayarlar modali
│   │   │   ├── ProfileSettings.tsx # Profil yönetimi
│   │   │   ├── NotificationSettings.tsx
│   │   │   ├── SecuritySettings.tsx# E2EE, cihaz yönetimi
│   │   │   └── AboutScreen.tsx     # Hakkında + Lisans
│   │   │
│   │   └── neo/                    # Neo'ya özgü bileşenler
│   │       ├── AtatürkKöşesi.tsx   # Atatürk köşesi bileşeni
│   │       ├── NeoLogo.tsx         # Marka logosu
│   │       └── WelcomeScreen.tsx   # İlk açılış karşılama ekranı
│   │
│   ├── styles/
│   │   ├── globals.css             # Genel stiller + CSS değişkenleri
│   │   ├── pardus-theme.css        # Pardus renk paleti ve tipografi
│   │   └── components.css          # Bileşene özel stiller
│   │
│   └── utils/
│       ├── format.ts               # Tarih, dosya boyutu formatlama
│       ├── crypto.ts               # Yardımcı şifreleme fonksiyonları
│       └── constants.ts            # Sabitler (homeserver URL, vb.)
│
├── public/
│   ├── icons/                      # Pardus Neo ikonları
│   ├── logo.svg                    # Ana logo
│   └── favicon.ico
│
├── packaging/
│   ├── neo.desktop                 # Pardus/GNOME .desktop dosyası
│   └── postinstall.sh              # .deb kurulum sonrası betik
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

### Teknoloji Seçim Gerekçeleri

**Tauri v2 (Electron yerine)**
| Metrik          | Electron (Discord) | Tauri (Neo hedef) |
| --------------- | ------------------ | ----------------- |
| Boşta RAM       | 300–500 MB         | < 120 MB          |
| Paket boyutu    | ~200 MB            | < 20 MB           |
| Başlangıç süresi| 3–8 sn             | < 2 sn            |
| Güvenlik modeli | Chromium tabanlı   | Rust sandbox + CSP |

Tauri, native sistem WebView'ını kullanır (WebKitGTK on Linux). Chromium'u bundle etmediği için hem küçük hem hızlı hem güvenlidir. `cargo tauri build` komutu doğrudan `.deb` paketi üretir.

**matrix-js-sdk (Özel SDK yazmak yerine)**
Matrix.org'un resmî TypeScript SDK'sı. E2EE (Olm/Megolm), sync, media upload, VoIP sinyalizasyonu — tümü dahil. Binlerce üretim saatinde test edilmiş. Özel SDK yazmak bu proje kapsamında anlamsız risk olurdu.

**Zustand (Redux yerine)**
Redux'un boilerplate yükü olmadan güçlü, minimal state yönetimi. TypeScript ile mükemmel entegrasyon. Bundle'a eklediği ağırlık ihmal düzeyi.

**Tailwind CSS v4**
Pardus renk paletini CSS değişkenleri üzerinden tanımlamak ve tüm bileşenlere tutarlı biçimde uygulamak için ideal. JIT derleyici ile gereksiz CSS çıkmaz.

---

## C3. Sistem Mimarisi

### Genel Bağlantı Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                         KULLANICI                           │
│              Pardus 25 — Neo Masaüstü (.deb)                │
│         Tauri v2 · React · matrix-js-sdk · Tailwind         │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / WSS (TLS 1.3)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE                            │
│       CDN · DDoS Koruması · Bot Koruması                    │
│       TLS Sonlandırma · TURN/TLS Fallback                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ Cloudflare Tunnel (cloudflared)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 FİZİKSEL SUNUCU (Türkiye)                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │    UFW Güvenlik Duvarı                                │  │
│  │    (Yalnızca SSH + Cloudflare IP aralıkları)          │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │    Nginx — Reverse Proxy                              │  │
│  │    HSTS · CSP · X-Frame-Options · Rate Limiting       │  │
│  └──┬──────────────┬─────────────────┬───────────────────┘  │
│     │              │                 │                      │
│  ┌──▼────────┐ ┌───▼────────┐  ┌────▼──────┐               │
│  │  Neo Web  │ │  Synapse   │  │  LiveKit  │               │
│  │  (static) │ │  :8008     │  │  SFU      │               │
│  └───────────┘ └───┬────────┘  └────┬──────┘               │
│                    │                │                       │
│               ┌────▼────────┐  ┌────▼──────────┐           │
│               │ PostgreSQL  │  │ lk-jwt-service│           │
│               │ (iç ağ)     │  │ (iç ağ)       │           │
│               └─────────────┘  └───────────────┘           │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   fail2ban  │  cloudflared  │  Element Call (static)  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Domain Yapısı

| Subdomain          | Yönlendirme               | Açıklama                        |
| ------------------ | ------------------------- | ------------------------------- |
| `app.ozturu.com`   | → Neo web / static        | İstemci web arayüzü             |
| `matrix.ozturu.com`| → Synapse :8008            | Matrix homeserver API           |
| `element.ozturu.com`| → Element Call (static)  | Ses/video görüşme widget'ı      |
| `rtc.ozturu.com`   | → LiveKit + lk-jwt        | WebRTC SFU + auth köprüsü       |

### Ses/Video Bağlantı Stratejisi

```
1. ICE/UDP   (50000–50100) → En iyi performans [UDP port açıksa]
2. TURN/TLS  (TCP 443)     → Cloudflare Tunnel üzerinden ✓
3. ICE/TCP   (TCP 7881)    → İkincil fallback

Demo fazında TURN/TLS yeterlidir.
UDP portları ISP ile çözülerek ilerleyen aşamada performans artırılır.
```

### Element Call Entegrasyon Modeli

Neo istemcisi sesli/görüntülü görüşme için Element Call widget'ını bir iframe içinde barındırır. Bu yaklaşım, olgunlaşmış WebRTC altyapısını kısa sürede kullanıma sokar. Gelecekte MatrixRTC spesifikasyonu olgunlaştığında tam istemci entegrasyonuna geçiş yapılabilir.

```
Neo İstemci (Tauri)
  └── ElementCallFrame.tsx
        └── <iframe src="https://element.ozturu.com">
              └── Element Call (LiveKit ↔ Synapse JWT)
```

---

## C4. Donanım Envanteri

### Geliştirici Makinesi

| Özellik         | Değer                                             |
| --------------- | ------------------------------------------------- |
| Model           | Casper Excalibur G770                             |
| İşlemci         | Intel Core i5-12450H (12 çekirdek @ 4.40 GHz)    |
| Ekran Kartı     | NVIDIA GeForce RTX 3050 Mobile (4 GB GDDR6)       |
| RAM             | 16 GB DDR4                                        |
| Depolama        | 1 TB SSD (btrfs)                                  |
| İşletim Sistemi | Fedora Linux 43 KDE Plasma (Wayland)              |
| IDE             | Visual Studio Code + Kilo Code eklentisi          |

### Demo / Üretim Sunucusu

| Özellik         | Değer                       | Not                                                           |
| --------------- | --------------------------- | ------------------------------------------------------------- |
| İşlemci         | Intel Core i5 (2. Nesil)    | Sanallaştırma desteği var; düşük güç tüketimi                 |
| RAM             | 16 GB                       | Docker servisleri için yeterli                                |
| Depolama        | 300 GB HDD                  | **Performans riski** — M3'te SSD yükseltmesi değerlendirilecek |
| Ekran Kartı     | Yok                         | WebRTC işlemleri CPU üzerinden yürütülecek                    |
| İşletim Sistemi | Ubuntu Server 24.04.4 LTS   | Kurulu ve yapılandırılmış (Milestone 1 tamamlandı)            |
| Bağlantı        | Cloudflare Tunnel           | 4 subdomain yönlendirmesi aktif                               |

---

## C5. Güvenlik Mimarisi

### Güvenlik Katmanları

```
KATMAN 1 — AĞ ALTYAPI GÜVENLİĞİ
├── TLS 1.3 (Cloudflare üzerinden zorunlu)
├── HSTS (HTTP Strict Transport Security)
├── Güvenlik başlıkları (CSP, X-Frame-Options, Permissions-Policy)
├── DDoS koruması (Cloudflare)
├── Bot koruması (Cloudflare)
└── UFW: Yalnızca SSH + Cloudflare IP aralıkları açık

KATMAN 2 — SUNUCU SERTLEŞTİRME
├── fail2ban: SSH + Synapse giriş denemesi izleme
├── Nginx rate limiting
├── Docker iç ağı: PostgreSQL dışa kapalı
├── .env dosyası: Sırlar Docker Compose'da plain text değil
└── Unattended-upgrades: Otomatik güvenlik güncellemeleri

KATMAN 3 — KİMLİK DOĞRULAMA GÜVENLİĞİ
├── Synapse kayıt kapalı (yalnızca davet ile üyelik)
├── Synapse rate limiting (giriş denemesi sınırlama)
├── Güçlü şifre politikası (Synapse password_config)
├── JWT token güvenliği (lk-jwt-service)
└── Synapse admin API yalnızca iç ağda erişilebilir

KATMAN 4 — VERİ GÜVENLİĞİ
├── E2EE: Olm/Megolm (Matrix protokolü, varsayılan aktif)
├── TLS: Tüm istemci-sunucu trafiği şifreli
├── PostgreSQL: Yalnızca iç Docker ağında erişilebilir
└── Medya dosyaları: Synapse erişim kontrolü altında

KATMAN 5 — UYGULAMA GÜVENLİĞİ (Neo İstemci)
├── Tauri CSP (Content Security Policy): XSS koruması
├── Tauri IPC kısıtlamaları: Frontend yalnızca izinli komutlara erişir
├── Tauri sandbox mimarisi: Rust backend izole çalışır
├── npm audit: Bağımlılık güvenlik taraması CI'da zorunlu
└── matrix-js-sdk: 0 açık güvenlik bildirimi (güncel sürüm)

KATMAN 6 — İZLEME VE YANIT
├── Docker container log yönetimi
├── Synapse access log analizi
├── fail2ban aktif blok izleme
└── Düzenli yedekleme (PostgreSQL dump + medya)
```

### Tauri Güvenlik Avantajı (Electron Kıyaslaması)

| Güvenlik Boyutu    | Electron                      | Tauri                              |
| ------------------ | ----------------------------- | ---------------------------------- |
| Backend dili       | Node.js (GC, dinamik tip)     | Rust (bellek güvenli, statik tip)  |
| IPC modeli         | Her şey erişilebilir          | Açıkça izin verilenlere erişim     |
| Saldırı yüzeyi     | Full Chromium + Node.js       | Native WebView + minimal Rust API  |
| Buffer overflow    | Mümkün                        | Rust'ta derleme zamanında engellenir |
| CSP               | Yapılandırma gerektirir       | Varsayılan sıkı politika           |
