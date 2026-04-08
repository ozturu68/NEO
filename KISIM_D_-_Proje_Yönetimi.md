# KISIM D — Proje Yönetimi

---

## D1. Yol Haritası ve Milestone'lar

* **Başlangıç:** 2 Mart 2026
* **Deadline:** 15 Mayıs 2026
* **Toplam süre:** ~10.5 hafta
* **Mevcut tarih:** 8 Nisan 2026
* **Kalan süre:** ~5.5 hafta

> **Kapsam notu:** Milestone 0 ve Milestone 1 tamamlanmıştır. Kalan 5.5 haftada Milestone 2–7 tamamlanacaktır. Takvim sıkıdır; her milestone sonunda kapsam gözden geçirilecek ve gerekirse bir sonraki milestone'a taşıma yapılacaktır.

---

### ✅ Milestone 0 — Dokümantasyon ve Zemin Hazırlığı

**Durum: TAMAMLANDI**

* [x] Proje dokümantasyonu v1.0.0 oluşturuldu
* [x] Affine proje alanı yapılandırıldı
* [x] GitHub repo kurulumu ve SSH key yapılandırması
* [x] Stoat Chat araştırması yapıldı (ADR-001)
* [x] Platform değişikliği kararı alındı: Matrix + Cinny (ADR-005)
* [x] Proje dokümantasyonu v2.0.0 olarak güncellendi
* [x] Ubuntu Server 24.04.4 LTS sunucuya kuruldu

---

### ✅ Milestone 1 — Sunucu Altyapısı ve Ortam Hazırlığı

**Durum: TAMAMLANDI**

* [x] Ubuntu Server 24.04 LTS kurulumu ve minimal sertleştirme
* [x] Docker ve Docker Compose kurulumu
* [x] Nginx kurulumu ve temel yapılandırması
* [x] Cloudflare Tunnel kurulumu ve 4 subdomain yapılandırması
  * `matrix.ozturu.com` → Synapse :8008
  * `app.ozturu.com` → İstemci :8080
  * `element.ozturu.com` → Element Call :8081
  * `rtc.ozturu.com` → LiveKit :7880
* [x] UFW yapılandırması (SSH + Cloudflare IP aralıkları)
* [x] fail2ban kurulumu ve yapılandırması
* [x] PostgreSQL 17 container kurulumu ve sağlık doğrulaması
* [x] Synapse 1.149.1 container kurulumu + PostgreSQL bağlantısı
* [x] `matrix.ozturu.com` üzerinden HTTPS Matrix API erişimi doğrulandı
* [x] Admin kullanıcısı oluşturuldu ve temel mesajlaşma test edildi
* [x] Tüm adımlar belgelendi

---

### 🔄 Milestone 2 — Neo İstemci: Proje İskeleti ve Kimlik Doğrulama

**Durum: AKTİF**
**Tahmini süre: 1 hafta (8–15 Nisan 2026)**
**Tamamlanma: ~70%**

Bu milestone'da sıfırdan bir Tauri + React projesi oluşturulur ve Matrix sunucusuna bağlanarak giriş yapılır.

* [x] Tauri v2 + React + TypeScript proje iskeleti oluşturuldu
* [x] Proje dizin yapısı (`src/`, `src-tauri/`, `components/` vb.) kuruldu
* [x] Tailwind CSS v4 entegre edildi
* [x] matrix-js-sdk bağımlılığı eklendi ve temel client test edildi
* [x] Zustand state yönetimi kuruldu (auth.store, ui.store)
* [x] i18next entegre edildi; Türkçe dil dosyası oluşturuldu
* [x] Giriş ekranı (LoginScreen) geliştirildi ve Pardus teması uygulandı
* [ ] Homeserver seçici bileşeni geliştirildi (varsayılan: matrix.ozturu.com)
* [x] matrix-js-sdk ile giriş akışı çalışır hale getirildi (wrapper implement edildi, error handling eklendi)
* [x] Oturum kalıcılığı sağlandı (token localStorage / Tauri store)
* [x] Çıkış işlevi geliştirildi
* [ ] `cargo tauri dev` ile geliştirme ortamı sorunsuz çalışıyor (Tauri bağımlılıkları eksik)
* [ ] Tüm adımlar belgelendi (dokümantasyon güncelleniyor)

---

### Milestone 3 — Temel Mesajlaşma ve Oda Yönetimi

**Tahmini süre: 1.5 hafta (15–25 Nisan 2026)**

Bu milestone'da kullanıcı giriş yaptıktan sonra odaları görebilmeli, mesaj gönderip alabilmeli.

* [ ] Matrix sync akışı kuruldu (rooms.store güncelleniyor)
* [ ] Sidebar bileşeni geliştirildi: Oda listesi (DM + gruplar ayrı bölümler)
* [ ] RoomItem bileşeni: oda adı, avatar, okunmamış sayısı
* [ ] MainPanel bileşeni: aktif oda seçimine göre içerik değişimi
* [ ] ChatView bileşeni: mesaj akışı (sanal kaydırma ile)
* [ ] MessageItem bileşeni: metin, zaman, gönderen adı, avatar
* [ ] MessageInput bileşeni: metin girişi, gönder düğmesi, Enter kısayolu
* [ ] Dosya yükleme ve indirme (FileUpload bileşeni)
* [ ] Resim önizleme desteği
* [ ] "Yazıyor..." göstergesi (TypingIndicator)
* [ ] Okunmamış mesaj atlaması
* [ ] E2EE varsayılan aktif — Olm/Megolm doğrulandı
* [ ] Tüm adımlar belgelendi

---

### Milestone 4 — Ses/Video ve Ekran Paylaşımı

**Tahmini süre: 1 hafta (25 Nisan – 2 Mayıs 2026)**

* [ ] LiveKit SFU container kurulumu
* [ ] lk-jwt-service container kurulumu
* [ ] Synapse ↔ LiveKit entegrasyon yapılandırması
* [ ] Element Call widget `element.ozturu.com`'da yayınlandı
* [ ] TURN/TLS yapılandırması tamamlandı (Cloudflare Tunnel üzerinden)
* [ ] ElementCallFrame bileşeni geliştirildi (iframe sarmalayıcı)
* [ ] CallBar bileşeni: aktif arama durumu, kapat düğmesi
* [ ] 1:1 sesli görüşme test edildi ✓
* [ ] 1:1 görüntülü görüşme test edildi ✓
* [ ] Ekran paylaşımı test edildi (Wayland PipeWire + X11) ✓
* [ ] Grup sesli/görüntülü görüşme test edildi (3–5 kullanıcı) ✓
* [ ] Tüm adımlar belgelendi

---

### Milestone 5 — Güvenlik Sertleştirme ve Yük Testi

**Tahmini süre: 0.5 hafta (2–5 Mayıs 2026)**

* [ ] Nginx güvenlik başlıkları eklendi (HSTS, CSP, X-Frame-Options, Permissions-Policy)
* [ ] Nginx rate limiting ince ayarı tamamlandı
* [ ] Synapse password_config güçlendirildi
* [ ] Docker iç ağ izolasyonu doğrulandı (PostgreSQL dışa kapalı)
* [ ] .env dosyası yapılandırması tamamlandı (plain text sır yok)
* [ ] Unattended-upgrades etkinleştirildi
* [ ] Synapse admin API erişim kısıtlaması doğrulandı
* [ ] npm audit (Neo bağımlılıkları) — açık varsa çözüldü
* [ ] Tauri CSP ve IPC yapılandırması doğrulandı
* [ ] 10 eş zamanlı kullanıcı yük testi yapıldı (< 200 ms mesaj gecikmesi)
* [ ] Bütünleşik güvenlik taraması yapıldı ve belgelendi

---

### Milestone 6 — Fedora, Debian ve Pardus Markalaşması ve Özelleştirme

**Tahmini süre: 1 hafta (5–12 Mayıs 2026)**

* [ ] Fedora, Debian ve Pardus renk paletleri CSS değişkenlerine işlendi (theme.css)
* [ ] Fedora, Debian ve Pardus logoları ile Neo logosu entegre edildi
* [ ] Giriş ekranı Fedora, Debian ve Pardus kimliğine uyarlandı (arka plan, logo, renkler)
* [ ] Tüm ikonlar Fedora, Debian ve Pardus uyumlu set ile değiştirildi
* [ ] `src-tauri/tauri.conf.json` güncellendi: uygulama adı "Neo", ikon
* [ ] Atatürk köşesi bileşeni (AtatürkKöşesi.tsx) tasarlandı ve geliştirildi
* [ ] Hakkında ekranı: proje adı, geliştirici, lisans (AGPL-3.0), sürüm
* [ ] Fedora, Debian ve Pardus GNOME, XFCE, KDE Plasma `.desktop` dosyaları hazırlandı (app-id, ikon, kategori)
* [ ] Türkçe dil dosyası (tr.json) tamamlandı — tüm arayüz öğeleri kapsandı
* [ ] Tauri ile `.deb` ve `.rpm` paketleri derlendi
* [ ] `sudo apt install ./neo.deb` ile Debian/Pardus ve `sudo dnf install ./neo.rpm` ile Fedora sanal makinede kurulum test edildi
* [ ] Fedora GNOME, Debian GNOME ve Pardus GNOME sanal makinelerde baştan sona test edildi
* [ ] Debian XFCE ve Pardus XFCE sanal makinelerde baştan sona test edildi
* [ ] 10 eş zamanlı kullanıcı entegrasyon testi (mesajlaşma + ses/video)
* [ ] Performans ölçümleri belgelendi (RAM, CPU, başlangıç süresi)
* [ ] Bulunan hatalar giderildi

---

### Milestone 7 — Sunum Hazırlığı

**Tahmini süre: 0.5 hafta (12–15 Mayıs 2026)**

* [ ] GitHub repo README güncellendi (ekran görüntüleri, kurulum kılavuzu)
* [ ] Kullanım kılavuzu oluşturuldu (Türkçe)
* [ ] Teknofest 2026 tanıtım sunumu hazırlandı
* [ ] Demo videosu kaydedildi
* [ ] Sosyal medya tanıtımları hazırlandı

---

## D2. Risk Kayıt Defteri

| Risk                                          | Olasılık  | Etki   | Azaltma Stratejisi                                              |
| --------------------------------------------- | --------- | ------ | --------------------------------------------------------------- |
| Tauri sıfırdan geliştirme M2 süre aşımı        | Yüksek    | Yüksek | M3'e taşınabilir özellikler önceden belirlenmeli                |
| matrix-js-sdk E2EE entegrasyon karmaşıklığı   | Orta      | Yüksek | Crypto modülü erken test edilmeli; olmayan özellik demo dışı    |
| HDD I/O darboğazı (PostgreSQL + LiveKit)      | Orta      | Yüksek | M4'te erken yük testi; gerekirse SSD yükseltme                 |
| LiveKit TURN/TLS performans sorunu            | Düşük     | Orta   | UDP portları açılarak fallback kaldırılabilir                   |
| Synapse bellek tüketimi (i5-2. nesil)         | Düşük     | Orta   | Synapse cache ayarları optimize edilecek                        |
| Wayland ekran paylaşımı PipeWire uyumsuzluğu | Orta      | Orta   | X11 fallback her zaman hazır; Wayland testi erken yapılmalı     |
| Cloudflare ücretsiz tier kısıtlamaları        | Çok Düşük | Düşük  | Demo için yeterli; uzun vadede Pro değerlendirilebilir          |
| Tailwind + WebKitGTK görsel uyumsuzluğu       | Düşük     | Düşük  | Her bileşen Tauri dev modunda anlık test edilecek               |

---

## D3. Başarı Kriterleri

| Milestone | Kriter                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------|
| M0        | Zemin hazırlığı tamamlanmış, platform kararı belgelenmiş, dokümantasyon güncel                              |
| M1        | Synapse çalışıyor, temel mesajlaşma ve admin erişimi doğrulanmış, tüm güvenlik önlemleri temel seviyede aktif|
| M2        | Neo istemcisi derleniyor, Matrix sunucusuna giriş yapılabiliyor, oturum kalıcı                              |
| M3        | Oda listesi görüntüleniyor, mesaj gönderilebiliyor/alınabiliyor, E2EE aktif, dosya paylaşımı çalışıyor      |
| M4        | 1:1 ve grup sesli/görüntülü görüşme + ekran paylaşımı Cloudflare Tunnel üzerinden çalışıyor                |
| M5        | Güvenlik katmanları tamamlanmış, 10 kullanıcı yük testi geçilmiş (< 200 ms)                                 |
| M6        | Pardus markalaşması tamamlanmış, Türkçe arayüz hazır, `.deb` paketi Pardus 25'te kurulabiliyor             |
| M7        | Teknofest sunumu hazır, demo videosu tamamlanmış, GitHub kılavuzları güncel                                  |
