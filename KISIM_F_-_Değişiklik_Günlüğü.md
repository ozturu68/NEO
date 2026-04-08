# KISIM F — Değişiklik Günlüğü

---

### 4 Mart 2026

* Proje dokümantasyonu v1.0.0 oluşturuldu
* Stoat Chat kaynak kodları indirildi, dosya dizinleri ayarlandı:

```
ozturu68@fedora:~/Projeler/TEKNOFEST/Pardus/Pardus-Akis$ ls -l
toplam 0
drwxr-xr-x. 1 ozturu68 ozturu68 222 Mar  4 20:48 auth
drwxr-xr-x. 1 ozturu68 ozturu68 638 Mar  4 20:48 backend
drwxr-xr-x. 1 ozturu68 ozturu68 848 Mar  4 20:48 desktop
drwxr-xr-x. 1 ozturu68 ozturu68 256 Mar  4 20:48 sdk
drwxr-xr-x. 1 ozturu68 ozturu68 200 Mar  4 20:48 self-hosted
drwxr-xr-x. 1 ozturu68 ozturu68 638 Mar  4 20:48 web
drwxr-xr-x. 1 ozturu68 ozturu68 480 Mar  4 20:48 web-legacy
```

* GitHub reposu yapılandırıldı, SSH key alındı

---

### 15 Mart 2026

**KÖKLÜ PLATFORM DEĞİŞİKLİĞİ — ADR-005**

* Stoat Chat kod tabanı devre dışı bırakıldı; ilgili klasörler arşivlendi
* Yeni temel: Matrix protokolü + Cinny istemcisi (fork) + Synapse homeserver
* Tauri masaüstü teknolojisi benimsendi (ADR-006)
* PostgreSQL veritabanı kararı alındı (ADR-007)
* Proje dokümantasyonu v2.0.0 olarak baştan yazıldı:
  * KISIM A — Vizyon, misyon ve teknik kimlik güncellendi
  * KISIM B — Bileşen karşılıkları eklendi, F8 (ekran paylaşımı) yeni gereksinim olarak eklendi
  * KISIM C — Tüm mimari Matrix ekosistemi üzerine yeniden yazıldı
  * KISIM D — Milestone yapısı ve deadline (15 Mayıs 2026) güncellendi
  * KISIM E — ADR-001 geçersiz kılındı; ADR-005, ADR-006, ADR-007 eklendi
  * KISIM F — Bu kayıt

---

### 18 Mart 2026

**Milestone 1 tamamlandı — Sunucu Altyapısı ve Ortam Hazırlığı**

* Ubuntu Server 24.04.4 LTS sanal makineye kuruldu (KVM/QEMU)
* Docker ve Docker Compose kurulumu tamamlandı
* Nginx kuruldu ve yapılandırıldı: 4 subdomain için reverse proxy ayarları yapıldı
* Cloudflare Tunnel kuruldu, `pardus-akis` tüneli oluşturuldu, 4 route eklendi:
  * `matrix.ozturu.com` → Synapse :8008
  * `app.ozturu.com` → İstemci :8080
  * `element.ozturu.com` → Element Call :8081
  * `rtc.ozturu.com` → LiveKit :7880
* UFW, fail2ban ve SSH yapılandırması tamamlandı
* PostgreSQL 17 container kuruldu, healthy durumu doğrulandı
* Synapse 1.149.1 container kuruldu, PostgreSQL'e bağlantı sağlandı
* `matrix.ozturu.com` üzerinden Matrix API erişimi doğrulandı (HTTPS)
* Admin kullanıcısı oluşturuldu ve temel mesajlaşma test edildi

**Teknik notlar:**

* YAML'da özel karakter içeren şifreler `psycopg2` bağlantısında hata üretir — şifrelerde `^`, `#`, `~` gibi karakterlerden kaçınılmalı
* PostgreSQL data dizini sıfırlanmadan şifre değişikliği etkisiz kalır
* Fiziksel sunucu donanım güçlendirmesi yapılana kadar sanal makine ile devam edilmektedir

---

### 8 Nisan 2026

**KÖKLÜ İSTEMCİ DEĞİŞİKLİĞİ — ADR-008**

* Cinny fork yaklaşımı tamamen terk edildi
* Neo istemcisi Tauri v2 + React + TypeScript + matrix-js-sdk ile **sıfırdan** geliştirilecek
* Proje dokümantasyonu v3.0.0 olarak baştan yazıldı:
  * KISIM A — Proje kimliği "sıfırdan geliştirme" ekseninde yeniden tanımlandı; vizyon ve misyon güncellendi
  * KISIM B — Gereksinimler gözden geçirildi; F12–F16 Neo'ya özgü gereksinimler olarak eklendi; kapsam sınırları netleştirildi
  * KISIM C — İstemci mimarisi bölümü (C2) tamamen yeniden yazıldı: sıfırdan geliştirme gerekçesi, proje dizin yapısı, teknoloji seçim karşılaştırmaları eklendi
  * KISIM D — Milestone'lar yeniden yapılandırıldı: M2 (İstemci İskeleti), M3 (Mesajlaşma), M4 (Ses/Video) olarak ayrıldı; kalan süre (5.5 hafta) gerçekçi biçimde dağıtıldı
  * KISIM E — ADR-008 eklendi (Cinny'den kopuş ve sıfırdan geliştirme kararı)
  * KISIM F — Bu kayıt

**Proje durumu:**

* Milestone 0 ✅ Tamamlandı
* Milestone 1 ✅ Tamamlandı
* Milestone 2 🔄 Aktif — Neo istemci iskeleti geliştirme başlıyor

---

### 8 Nisan 2026 (devam)

**Milestone 2 İlerlemesi — Kod Kalitesi ve Dokümantasyon Geliştirmeleri**

* **TypeScript Tip Tanımları:** Matrix event'leri için kapsamlı tip tanımları `src/types/matrix.ts` dosyasında oluşturuldu. Bu, Matrix SDK'dan gelen verilerin tip güvenliğini sağlar.
* **Matrix SDK Wrapper Katmanı Geliştirmeleri:** `src/lib/matrix/rooms.ts` ve `src/lib/matrix/messages.ts` dosyaları robust error handling ve Türkçe hata mesajları ile güçlendirildi. Tüm fonksiyonlar try-catch içinde, input validation ile implement edildi.
* **Test Güncellemeleri:** Vitest testleri yeni tip imzalarına göre güncellendi; `rooms.test.ts`'deki failing test düzeltildi. Tüm testler (21/21) geçiyor.
* **Tauri Yapılandırması:** `src-tauri/tauri.conf.json` dosyası Tauri v2 schema'sına uygun hale getirildi; CSP ve allowlist ayarları düzeltildi.
* **Dokümantasyon Güncellemeleri:**
  * `AGENTS.md` güncellendi: Teknik detaylar ve agent işbirlikleri eklendi.
  * `INSTALL.md` güncellendi: Fedora/Debian/Pardus sistem bağımlılıkları, Rust kurulumu, geliştirme workflow'u detaylandırıldı.
  * `MODULES.md` oluşturuldu: Projenin 6 katmanlı mimarisi için kapsamlı modül dokümantasyonu.
  * `.kilo/rules/code-style.md` güncellendi: Neo'ya özel kod pattern'leri (Matrix SDK wrapper, Zustand store, Tauri IPC) eklendi.
  * `.kilo/rules/testing.md` ve `.kilo/rules/security.md` güncellendi: Mevkur proje yapılandırmasına uyum sağlandı.
* **ADR Güncellemesi:** ADR-009 eklendi — teknik implementasyon pattern'leri (TypeScript tipleri, Matrix SDK wrapper, Zustand store'lar, Tauri IPC) belgelendi.
* **Proje durumu:**
  * TypeScript derleme hatası yok (`npm run type-check` başarılı)
  * ESLint temiz (`npm run lint` başarılı)
  * Tüm testler geçiyor (`npm run test` 21/21 başarılı)
  * Milestone 2 ilerlemesi: ~%70 tamamlandı (Matrix SDK wrapper katmanı tamamlandı, type safety eklendi, error handling implement edildi, testler geçiyor)

---

*Yeni girdiler her önemli geliştirme adımında bu dosyaya eklenir.*
