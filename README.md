# Neo — Pardus için Güvenli İletişim Platformu

![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)
![Matrix Protocol](https://img.shields.io/badge/Protocol-Matrix-green.svg)
![Tauri v2](https://img.shields.io/badge/Framework-Tauri%20v2-FFC131.svg)
![React 18](https://img.shields.io/badge/UI-React%2018-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)
![Platform: Fedora/Debian/Pardus](https://img.shields.io/badge/Platform-Fedora%2FDebian%2FPardus-orange.svg)

**Neo**, Fedora, Debian ve Türkiye'nin millî işletim sistemi **Pardus** için, Matrix açık protokolü üzerine **sıfırdan** geliştirilmiş; uçtan uca şifreli, sesli ve görüntülü görüşme destekli, açık kaynaklı bir masaüstü iletişim platformudur.

> ⚡ **Teknofest 2026 — Pardus Hata Yakalama ve Öneri Yarışması** Geliştirme Kategorisi projesi

## 🚀 Özellikler

- **🔐 Uçtan Uca Şifreleme (E2EE)** — Matrix'in Olm/Megolm şifreleme katmanı (NATO ve 35+ ülke hükümeti tarafından kullanılan)
- **🎨 Pardus Görsel Kimliği** — Resmi Pardus renk paleti (#00AEEF mavi, #E30613 kırmızı), ikonlar ve tipografi
- **💬 Gerçek Zamanlı Mesajlaşma** — Özel mesajlar, grup kanalları, dosya paylaşımı
- **📞 Sesli/Görüntülü Görüşme** — LiveKit SFU + Element Call entegrasyonu
- **🛡️ Güvenlik Öncelikli** — Tauri sandbox mimarisi, CSP, IPC kısıtlamaları, sunucu sertleştirme
- **🌍 Tam Türkçe Arayüz** — i18next ile çok dil desteği (Türkçe birincil)
- **📦 Native Paketleme** — `.deb` (Debian/Pardus) ve `.rpm` (Fedora) paketleri
- **⚡ Performans Optimize** — < 120 MB RAM, < 2 saniye başlangıç süresi (Electron'a göre 10x daha hafif)

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **İstemci Çerçevesi** | Tauri v2 (Rust + WebView2) | Native masaüstü sarmalayıcı |
| **UI Katmanı** | React 18 + TypeScript | Kullanıcı arayüzü |
| **Protokol Katmanı** | matrix-js-sdk v41.3.0 | Matrix protokol iletişimi |
| **Stil Sistemi** | Tailwind CSS v4 | Yardımcı-öncelikli CSS |
| **Durum Yönetimi** | Zustand | Hafif React state yönetimi |
| **Ses/Video** | LiveKit SFU + Element Call | WebRTC medya sunucusu |
| **Homeserver** | Synapse + PostgreSQL | Matrix homeserver |
| **Sunucu Güvenliği** | Nginx + UFW + fail2ban + Cloudflare Tunnel | 6 katmanlı güvenlik |

## 📦 Kurulum

### Geliştirme Ortamı

```bash
# 1. Sistem bağımlılıklarını kur
sudo apt update && sudo apt install -y curl wget git build-essential libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# 2. Rust kurulumu (rustup ile)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 3. Node.js kurulumu (nvm ile)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 4. Projeyi klonla
git clone https://github.com/ozturu68/NEO.git
cd NEO

# 5. Bağımlılıkları yükle
npm install

# 6. Geliştirme sunucusunu başlat
npm run tauri dev
```

### Production Kurulumu (.deb Paketi)

```bash
# .deb paketi oluştur
cargo tauri build --bundles deb

# Debian/Pardus'ta kur
sudo apt install ./src-tauri/target/release/bundle/deb/neo_0.1.0_amd64.deb

# Fedora'da kur (rpm)
sudo dnf install ./src-tauri/target/release/bundle/rpm/neo-0.1.0-1.x86_64.rpm
```

## 🎯 Mimari

Neo, 6 katmanlı bir güvenlik mimarisi üzerine inşa edilmiştir:

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

## 🧪 Test ve Kalite Kontrol

```bash
# TypeScript tip kontrolü
npm run type-check

# ESLint ile kod kalitesi kontrolü
npm run lint

# Vitest ile unit testler
npm run test

# Kapsam raporu
npm run test:coverage
```

**Test Kapsamı Hedefleri:**
- Kritik modüller (auth, crypto, messages): %80+
- UI bileşenleri: %60+
- Utility fonksiyonlar: %90+

## 🤝 Katkıda Bulunma

Neo, açık kaynaklı bir projedir ve katkılarınızı bekliyoruz! Katkıda bulunmak için:

1. [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun
2. GitHub'da bir issue açın veya mevcut bir issue'ya atanın
3. Bir feature branch oluşturun (`feature/amazing-feature`)
4. Değişikliklerinizi yapın ve test edin
5. Pull Request gönderin

**Katkı Kuralları:**
- Kod stil kurallarına uyun ([.kilo/rules/code-style.md](.kilo/rules/code-style.md))
- Tüm yeni özellikler için test yazın
- Türkçe dokümantasyon sağlayın
- Güvenlik önceliğini koruyun

## 📄 Lisans

Neo, **GNU Affero General Public License v3.0** (AGPL-3.0) altında lisanslanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakın.

```
Copyright (C) 2026 Muzaffer Umut Öztürk

Bu program özgür yazılımdır: Özgür Yazılım Vakfı tarafından
yayımlanan GNU Affero Genel Kamu Lisansı’nın 3. ya da
(isteğinize bağlı olarak) daha sonraki sürümünün hükümlerine göre
yeniden dağıtabilir ve/veya değiştirebilirsiniz.

Bu program, yararlı olması umuduyla dağıtılmış olup, ancak
HİÇBİR GARANTİ VERMEMEKTEDİR; TİCARİ KULLANILABİLİRLİK veya
BELİRLİ BİR AMACA UYGUNLUK garantisi de yoktur. Daha fazla ayrıntı için
GNU Affero Genel Kamu Lisansı’na bakın.

Bu programla birlikte GNU Affero Genel Kamu Lisansı’nın
bir kopyasını almış olmalısınız. Almadıysanız, <https://www.gnu.org/licenses/> adresine bakın.
```

## 📞 İletişim

- **Proje Yöneticisi:** Muzaffer Umut Öztürk
- **GitHub:** [@ozturu68](https://github.com/ozturu68)
- **E-posta:** m.umut.ozturk@protonmail.com
- **Matrix:** @ozturu68:matrix.ozturu.com
- **Proje Linki:** https://github.com/ozturu68/NEO

## 🌟 Teşekkürler

- **Matrix.org** ekibine açık ve güvenli bir iletişim protokolü sağladıkları için
- **Tauri** ekibine hafif ve güvenli masaüstü çerçevesi için
- **Pardus/TÜBİTAK BİLGEM** ekibine millî işletim sistemi için
- **Teknofest** organizatörlerine bu fırsatı sağladıkları için

---

**"Güvenlik birinci prensip, son adım değil."** — Neo Proje Felsefesi