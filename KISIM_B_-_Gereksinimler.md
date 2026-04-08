# KISIM B — Gereksinimler

---

## B1. Problem Tanımı

Pardus; TÜBİTAK BİLGEM/YTE tarafından geliştirilen, Debian tabanlı Türkiye'nin millî işletim sistemidir. Kamu kurumlarından üniversitelere, bireysel kullanıcılara kadar geniş bir kitleye hitap eder. Ancak Windows ve macOS'un aksine, Fedora, Debian ve Pardus ekosistemlerinde **entegre bir iletişim platformu yoktur.**

Fedora, Debian ve Pardus kullanıcıları; anlık mesajlaşma, sesli/görüntülü görüşme ve dosya paylaşımı için Microsoft Teams, Zoom, WhatsApp veya Telegram gibi yabancı platformlara mecbur kalmaktadır. Bu durum yapısal riskler doğurur:

* Kurumsal yazışmalar ve veriler yabancı sunucularda işlenir ve saklanır
* KVKK kapsamında yurt dışı veri aktarımı hukuki sorun oluşturur
* Reklam destekli platformlar kullanıcı verisini işler ve satar
* Yabancı şirket kararları anlık erişim kesintisine yol açabilir
* Discord, Slack, Teams gibi alternatifler yüksek kaynak tüketir (Electron tabanlı)
* Fedora, Debian ve Pardus deneyimi iletişim katmanında bütünleşik ve yerli değildir

Matrix protokolü üzerine sıfırdan inşa edilecek ve Türkiye'deki fiziksel sunucuda çalışacak Neo, bu risklerin tamamını giderme potansiyeline sahiptir.

---

## B2. Fonksiyonel Gereksinimler

Neo, Discord'un sunduğu temel özellikleri (kanal yapısı, sesli/görüntülü görüşme, dosya paylaşımı, emoji reaksiyonları, thread'ler vb.) Matrix protokolü üzerinden karşılayacak şekilde tasarlanmıştır. Aşağıdaki gereksinimler demo için zorunlu olanları listelemektedir.

### Demo için zorunlu (Milestone 1–6)

| #   | Gereksinim                                    | Öncelik | Bileşen Karşılığı                      |
| --- | --------------------------------------------- | ------- | -------------------------------------- |
| F1  | Kullanıcı kaydı ve kimlik doğrulama           | Kritik  | Neo İstemci — Auth modülü              |
| F2  | Özel mesajlaşma (DM)                          | Kritik  | Neo İstemci — Chat modülü              |
| F3  | Grup kanalları ve alan yapısı                 | Kritik  | Neo İstemci — Rooms modülü             |
| F4  | Dosya paylaşımı                               | Kritik  | Neo İstemci — Media modülü             |
| F5  | E2EE (DM ve grup sohbetlerde varsayılan)      | Kritik  | matrix-js-sdk — Olm/Megolm             |
| F6  | Sesli görüşme (1:1 ve grup)                   | Kritik  | LiveKit SFU + Element Call widget      |
| F7  | Görüntülü görüşme (1:1 ve grup)               | Kritik  | LiveKit SFU + Element Call widget      |
| F8  | Ekran paylaşımı                               | Kritik  | PipeWire (Wayland) + X11 fallback      |
| F9  | Tam Türkçe arayüz                             | Yüksek  | Neo İstemci — i18n modülü             |
| F10 | Masaüstü bildirimleri                         | Yüksek  | Tauri notification API + libnotify     |
| F11 | Kullanıcı profil yönetimi                     | Yüksek  | Neo İstemci — Profile modülü           |
| F12 | Atatürk köşesi özel bileşeni                  | Yüksek  | Neo İstemci — özgün bileşen           |
| F13 | Fedora, Debian ve Pardus görsel kimliği (logo, renkler, ikonlar)| Yüksek  | Neo İstemci — tema sistemi             |
| F14 | Hakkında / Lisans ekranı                      | Orta    | Neo İstemci — Settings modülü          |
| F15 | Sistem tepsisi (tray) entegrasyonu            | Orta    | Tauri system-tray API                  |
| F16 | Otomatik oturum yenileme                      | Orta    | matrix-js-sdk token yönetimi           |
| F17 | Emoji reaksiyonları                           | Yüksek  | matrix-js-sdk reactions API            |
| F18 | Thread (konu) desteği                         | Yüksek  | matrix-js-sdk threads API              |
| F19 | Pinned (sabitlenmiş) mesajlar                 | Yüksek  | matrix-js-sdk pinned events            |
| F20 | Mesaj arama                                    | Yüksek  | matrix-js-sdk search API               |
| F21 | Koyu/açık tema desteği                        | Orta    | Neo İstemci — tema sistemi             |
| F22 | Kullanıcı çevrimiçi durumu                    | Orta    | matrix-js-sdk presence                 |
| F23 | Temel rol ve izin yönetimi                    | Orta    | Neo İstemci — permissions modülü       |

### Demo sonrası — ileriki sürümler

| #   | Gereksinim                                              |
| --- | ------------------------------------------------------- |
| F24 | Mobil uygulama (Android/iOS) — Neo markalaşması         |
| F25 | Federasyon ve çoklu homeserver desteği                  |
| F26 | Sesli/görüntülü görüşmeler için E2EE (MatrixRTC olgunlaşınca) |
| F27 | Bot API'si ve otomasyon desteği                         |
| F28 | Pardus resmî uygulama deposuna dahil edilme             |
| F29 | Spaces (Matrix uzayları) tam desteği                    |
| F30 | Zengin mesaj formatı (embed, code blocks, markdown)     |

---

## B3. Fonksiyonel Olmayan Gereksinimler

| Alan                | Gereksinim              | Hedef Metrik                                                       |
| ------------------- | ----------------------- | ------------------------------------------------------------------ |
| **Performans**      | RAM tüketimi (boşta)    | < 120 MB (Electron tabanlı Discord: 300–500 MB)                    |
| **Performans**      | Başlangıç süresi        | < 2 saniye (soğuk başlatma)                                        |
| **Performans**      | Demo kararlılığı        | 10 eş zamanlı kullanıcı, < 200 ms mesaj gecikmesi                  |
| **Güvenlik**        | Şifreleme               | TLS 1.3 zorunlu, E2EE varsayılan aktif                             |
| **Güvenlik**        | Sunucu sertleştirme     | UFW + fail2ban + Nginx güvenlik başlıkları + rate limiting         |
| **Güvenlik**        | Kimlik doğrulama        | Synapse kayıt kapalı (davet sistemi), giriş rate limiting aktif    |
| **Güvenlik**        | İstemci güvenliği       | Tauri CSP, IPC kısıtlamaları, sandbox mimarisi                     |
| **Veri Egemenliği** | Veri konumu             | Tüm veriler Türkiye'deki fiziksel sunucuda                         |
| **Uyumluluk**       | İşletim sistemi         | Fedora, Debian ve Pardus 25 GNOME, XFCE ve KDE Plasma'da sorunsuz çalışır |
| **Uyumluluk**       | Kurulum                 | `sudo apt install ./neo.deb` (Debian/Pardus) veya `sudo dnf install ./neo.rpm` (Fedora) ile tek komutla kurulabilir |
| **Uyumluluk**       | Yasal                   | KVKK uyumlu; AGPL-3.0 lisans gereklilikleri karşılanmış            |
| **Sürdürülebilirlik**| Kaynak kod             | Tüm geliştirmeler kamuya açık, her değişiklik belgelenmiş          |
| **UX**              | Erişilebilirlik         | Klavye navigasyonu, ekran okuyucu uyumu (temel düzey)              |

---

## B4. Kapsam Sınırları

### Kapsam İçi

* Tauri v2 + React + TypeScript ile sıfırdan masaüstü istemci geliştirme
* matrix-js-sdk entegrasyonu (auth, sync, mesajlaşma, E2EE)
* Synapse homeserver kurulumu, yapılandırması ve güvenlik sertleştirmesi
* PostgreSQL veritabanı kurulumu ve yapılandırması
* LiveKit SFU + lk-jwt-service kurulumu ve Element Call entegrasyonu
* Nginx reverse proxy güvenlik yapılandırması
* Cloudflare Tunnel entegrasyonu
* UFW + fail2ban sunucu güvenliği
* Pardus görsel kimliği: logo, renk paleti, ikonlar, tipografi sistemi
* Tam Türkçe arayüz (i18n altyapısı ile)
* Atatürk köşesi özgün bileşeni
* Hakkında, takım ve lisans ekranları
* Fedora, Debian ve Pardus masaüstü entegrasyonu (.desktop dosyası, app-id)
* Fedora, Debian ve Pardus GNOME, XFCE, KDE Plasma uyumluluk testi
* Tauri ile `.deb` ve `.rpm` paketi üretimi
* Tüm geliştirmelerin belgelenmesi (AGPL-3.0 zorunluluğu)

### Kapsam Dışı

* Herhangi bir mevcut Matrix istemcisinin (Cinny, Element, Fractal) fork'u
* Matrix protokolünde değişiklik veya geliştirme
* Synapse kaynak kodunda değişiklik
* Mobil uygulama (Android/iOS) — ileriki sürüm
* Federasyon ve çoklu homeserver desteği — ileriki sürüm
* Sesli/görüntülü görüşmeler için E2EE — MatrixRTC olgunlaşınca
* TÜBİTAK/YTE ile resmî kurumsal logo/marka anlaşması
* Pardus resmî uygulama deposuna dahil edilme — bu sürüm için değil
* Flatpak/Snap paketleme — ileriki sürüm
