# KISIM E — Karar Günlüğü (ADR)

> ADR: Architecture Decision Record — Mimari Karar Kaydı.
> Her kritik teknik karar burada tarih, gerekçe ve sonuçlarıyla birlikte belgelenir.
> Kararlar geri alınamaz; yalnızca yeni bir ADR ile geçersiz kılınabilir.

---

### ADR-001 — Temel Platform: Stoat Chat

* **Tarih:** 2 Mart 2026
* **Durum:** ❌ Geçersiz kılındı — ADR-005 tarafından
* **Bağlam:** Sınırlı sürede sıfırdan sistem kurmak risklidir. Açık kaynaklı, projeye uygun bir sistem belirlenip geliştirilecekti.
* **Karar:** Stoat Chat temel alınacaktı.
* **Geçersiz kılınma gerekçesi:** Stoat Chat'te E2EE varsayılan olarak yoktu; eklenmesi tek geliştirici için ayrı bir proje niteliğinde iş yükü oluşturuyordu.

---

### ADR-002 — Sunucu İşletim Sistemi: Ubuntu Server LTS

* **Tarih:** 2 Mart 2026
* **Durum:** ✅ Kabul Edildi — Aktif
* **Bağlam:** Sunucu makinesi için stabil, geniş ekosistemli bir işletim sistemi gerekli.
* **Karar:** Ubuntu Server 24.04.4 LTS tercih edildi.
* **Sonuçlar:** Geniş Docker ekosistemi desteği, uzun vadeli güvenlik güncellemeleri, `unattended-upgrades` ile otomatik yama.

---

### ADR-003 — Sunucu Bağlantısı: Cloudflare Tunnel

* **Tarih:** 2 Mart 2026
* **Durum:** ✅ Kabul Edildi — Aktif
* **Bağlam:** Statik IP ve port açımı güvenlik açısından riskli ve zahmetli; ISP koşulları belirsiz.
* **Karar:** Cloudflare Tunnel (cloudflared) ile sunucunun dış dünyayla bağlantısı kuruldu.
* **Sonuçlar:** Cloudflare'e bağımlılık; ancak DDoS koruması, otomatik TLS ve CDN ücretsiz olarak geliyor. Demo için fazlasıyla yeterli.

---

### ADR-004 — Versiyon Kontrolü: GitHub

* **Tarih:** 4 Mart 2026
* **Durum:** ✅ Kabul Edildi — Aktif
* **Bağlam:** Sürüm kontrolü ve kod yedeklemesi için Git altyapısına ihtiyaç var.
* **Karar:** GitHub kullanılacak. SSH key yapılandırıldı.
  * Fedora Laptop: `SHA256:HbDjlQfD6c9nqYRsF/O1q4uQGEYZ/hikBgwf1o5VXkw`
* **Sonuçlar:** Microsoft'a kısmi bağımlılık. Uzun vadede öz-barındırmalı Gitea değerlendirilebilir.

---

### ADR-005 — Temel Platform Değişikliği: Matrix Protokolü

* **Tarih:** 15 Mart 2026
* **Durum:** ✅ Kabul Edildi — Aktif
* **Bağlam:** Kapsamlı araştırma sonucunda Stoat Chat'in projenin "güvenlik birinci" prensibini karşılamadığı tespit edildi.
* **Karar:** Temel platform Matrix protokolü + Synapse homeserver + LiveKit SFU olarak belirlendi.
* **Gerekçe:**
  1. Matrix'in Olm/Megolm şifreleme katmanı bağımsız denetimden geçmiş; NATO ve 35+ ülke hükümeti tarafından kullanımda.
  2. E2EE Stoat Chat'te sıfırdan yazılması gerekirken Matrix'te protokolün ta kendisi.
  3. LiveKit + Element Call olgun bir ses/video yığını sunuyor.
* **Sonuçlar:** (+) Güvenlik katmanı temelden sağlandı. (-) Synapse Python tabanlı; i5-2. nesil sunucuda bellek kullanımı izlenecek.

---

### ADR-006 — Masaüstü Teknolojisi: Tauri v2

* **Tarih:** 15 Mart 2026
* **Durum:** ✅ Kabul Edildi — Aktif — ADR-008 ile kapsamı genişletildi
* **Bağlam:** Electron, Discord'un kaynak tüketim sorunlarının temel sebebidir.
* **Karar:** Masaüstü uygulaması Tauri v2 (Rust + native WebView) ile geliştirilecek.
* **Sonuçlar:**
  * Uygulama boyutu Electron'a kıyasla ~10x küçük
  * Bellek tüketimi önemli ölçüde düşük (< 120 MB hedef)
  * Rust güvenlik mimarisi (sandbox, IPC kısıtlamaları)
  * `cargo tauri build` komutu doğrudan `.deb` üretiyor

---

### ADR-007 — Veritabanı: PostgreSQL

* **Tarih:** 15 Mart 2026
* **Durum:** ✅ Kabul Edildi — Aktif
* **Bağlam:** Synapse production ortamında PostgreSQL gerektiriyor; SQLite yalnızca geliştirme için uygun.
* **Karar:** PostgreSQL 17, Docker iç ağında çalışacak; dışa hiçbir port açılmayacak.
* **Sonuçlar:** Güvenli izolasyon, Synapse ile tam uyumluluk, olgun altyapı. HDD üzerinde I/O performansı izlenecek.

---

### ADR-008 — İstemci Geliştirme Yaklaşımı: Sıfırdan (Cinny Fork'undan Kopuş)

* **Tarih:** 8 Nisan 2026
* **Durum:** ✅ Kabul Edildi — Aktif
* **Bağlam:**
  Proje başlangıçta Cinny istemcisinin fork'u olarak planlandı (ADR-005). Geliştirme sürecine girildiğinde fork yaklaşımının getirdiği kısıtlamalar ve maliyetler net biçimde ortaya çıktı:
  * Yabancı codebase'i anlamak ve üzerine geliştirme yapmak, sıfırdan yazmak kadar — hatta daha fazla — zaman alabilir
  * Upstream güncellemelerini takip etme zorunluluğu süregelen bir bakım yükü doğurur
  * Cinny'nin tasarım kararları Neo'nun vizyonuyla çakışıyor; her UI değişikliği Cinny'nin yapısıyla müzakere gerektiriyor
  * Teknofest değerlendirmesinde "fork alınmış ve markalaştırılmış" yaklaşımı, "sıfırdan geliştirilmiş" yaklaşımına kıyasla özgünlük açısından dezavantajlı
  * matrix-js-sdk tek başına Matrix protokolü iletişiminin tamamını sağlıyor; Cinny'nin arayüz kodu bu SDK'nın üzerinde bir katman; bu katmanı biz de yazabiliriz
* **Karar:** Neo istemcisi, Cinny kaynak kodundan bağımsız olarak **sıfırdan** geliştirilecektir.
  * **İstemci çerçevesi:** Tauri v2 (Rust backend)
  * **UI katmanı:** React 18 + TypeScript (sıfırdan yazılacak)
  * **Stil:** Tailwind CSS v4
  * **Matrix iletişim katmanı:** matrix-js-sdk (Element/Matrix.org resmî SDK'sı)
  * **Durum yönetimi:** Zustand
  * **i18n:** i18next + react-i18next
  Cinny ve diğer istemciler referans olarak incelenebilir; ancak kaynak kodları Neo codebase'ine dahil edilmeyecektir.
* **Gerekçe:**
  1. **Tam sahiplik:** Her satır kod anlaşılmış ve tasarlanmıştır. Hata ayıklamak, özellik eklemek, bakım yapmak çok daha hızlıdır.
  2. **Tasarım özgürlüğü:** Pardus'a özel her UX kararı en başından alınır; upstream kısıtlaması yoktur.
  3. **Teknofest özgünlüğü:** "Sıfırdan geliştirdik" ifadesi, "fork aldık ve özelleştirdik" ifadesinden çok daha güçlü bir yarışma argümanıdır.
  4. **Uzun vadeli sürdürülebilirlik:** Upstream bağımlılığı olmayan, tamamen kontrol edilen bir codebase gelecekteki geliştirmeleri kolaylaştırır.
  5. **matrix-js-sdk yeterliliği:** Protocol katmanı SDK tarafından tam olarak sağlanmaktadır. UI katmanını yeniden kullanmak için zorlayıcı bir neden yoktur.
* **Risk ve Azaltma:**
  * **Risk:** Sıfırdan geliştirme daha uzun sürebilir.
  * **Azaltma:** Kapsamlı özellik listesi değil, demo için MVP (Minimum Viable Product) önceliklendirilmiştir. Scope her milestone'da gerçekçi tutulacaktır. Kalan 5.5 haftalık sürede tamamlanabilecek özellikler net biçimde tanımlanmıştır (bkz. KISIM D).
* **Sonuçlar:**
  * (+) Tam kod sahipliği ve anlaşılabilirliği
  * (+) Upstream bağımlılığı sıfır
  * (+) Yarışmada özgünlük iddiası güçlü
  * (+) Pardus'a özel tasarım kararları en baştan uygulanabilir
  * (-) İlk sürüm için daha fazla geliştirme zamanı gerekiyor
  * (-) Cinny'nin olgun bazı özellikleri (reactions, threads, spaces) demo kapsamı dışında kalacak

---

### ADR-009 — Teknik Implementasyon Pattern'leri: TypeScript Tipleri, Matrix SDK Wrapper, Zustand Store'lar, Tauri IPC

* **Tarih:** 8 Nisan 2026
* **Durum:** ✅ Kabul Edildi — Aktif
* **Bağlam:** Sıfırdan istemci geliştirmeye başlandığında, kod kalitesi, güvenlik ve sürdürülebilirlik için standart pattern'ler belirlenmesi gerekiyordu.
* **Karar:** Aşağıdaki teknik pattern'ler benimsendi:
  1. **TypeScript Type Definitions:** Tüm Matrix event'leri için kapsamlı tip tanımları (`src/types/matrix.ts`). Bu, Matrix SDK'dan gelen verilerin tip güvenliği sağlar.
  2. **Matrix SDK Wrapper Katmanı:** `matrix-js-sdk` direkt bileşenlerde kullanılmaz; tüm API çağrıları `src/lib/matrix/` altında wrapper fonksiyonlarıyla yapılır. Her wrapper Türkçe hata mesajları ve try-catch içerir.
  3. **Zustand State Management:** Durum yönetimi için Redux yerine hafif ve modern Zustand kütüphanesi tercih edildi. Kritik state'ler (auth, UI tercihleri) localStorage'a persist edilir.
  4. **Tauri IPC Pattern:** Frontend ve Rust backend arasındaki tüm iletişim Tauri IPC komutları üzerinden yapılır. Her komut input validation ve proper error handling içerir.
  5. **Error Handling Standardı:** Tüm async operasyonlar try-catch bloğu içinde, kullanıcı dostu Türkçe hata mesajları ile işlenir.
* **Gerekçe:**
  1. **Tip Güvenliği:** Matrix SDK'dan gelen dinamik verilerin tip güvenliği sağlanır, runtime hataları azalır.
  2. **Separation of Concerns:** UI bileşenleri protokol detaylarından izole edilir, bakım kolaylaşır.
  3. **Güvenlik:** Tüm input'lar validate edilir, hatalar uygun şekilde loglanır.
  4. **Kullanıcı Deneyimi:** Hata mesajları Türkçe ve anlaşılır olur.
  5. **Sürdürülebilirlik:** Standart pattern'ler ile yeni geliştiriciler projeye kolayca adapte olabilir.
* **Sonuçlar:**
  * (+) Kod kalitesi artar, hata ayıklama kolaylaşır.
  * (+) Güvenlik iyileştirilir (input validation, error handling).
  * (+) Kullanıcı dostu hata mesajları.
  * (+) Bakım ve geliştirme hızı artar.
  * (-) İlk implementasyon için ekstra zaman gerektirir.
  * (-) Wrapper katmanı nedeniyle bazı Matrix SDK özelliklerine erişim bir katman daha ekler.

---
