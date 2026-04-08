# KISIM A — Proje Tanımı

---

## A1. Yönetici Özeti

Neo; Fedora, Debian ve Türkiye'nin millî işletim sistemi Pardus için, Matrix açık protokolü üzerine **sıfırdan** geliştirilmiş; uçtan uca şifreli, sesli ve görüntülü görüşme destekli, açık kaynaklı bir masaüstü iletişim platformudur.

Proje üç temel kararın üzerine inşa edilmiştir:

**Birinci karar — Protokol:** Matrix. NATO, Bundeswehr ve onlarca ulusal hükümet tarafından üretimde kullanılan, bağımsız güvenlik denetiminden geçmiş bir açık standart. Güvenlik mirasla gelir, icat edilmez.

**İkinci karar — Sunucu:** Synapse homeserver + LiveKit SFU + PostgreSQL. Docker Compose ile Türkiye'deki fiziksel sunucuda çalışır. Tüm veriler Türkiye'de kalır.

**Üçüncü karar — İstemci:** Sıfırdan. Cinny fork'u değil. Tauri v2 (Rust) + React + TypeScript + matrix-js-sdk ile tamamen özgün bir masaüstü uygulaması. Pardus'un görsel kimliği, Türk kullanıcı deneyimi ve Pardus ekosistemiyle derin entegrasyon bu kararda gizlidir.

Bu üçüncü karar projenin ruhunu değiştirir. Fork almak hızlı başlangıç sağlar; sıfırdan geliştirmek ise Neo'yu gerçek anlamda Neo yapar. Kodun her satırı ekibe aittir, her tasarım kararı Pardus için alınmıştır, her bileşen bu projenin ihtiyaçları gözetilerek yazılmıştır.

**Demo hedefi:** Discord'un sunduğu temel özellikleri (kanal yapısı, sesli/görüntülü görüşme, dosya paylaşımı, emoji reaksiyonları) karşılayan; 10 eş zamanlı kullanıcıyla stabil çalışan; mesajlaşma, dosya paylaşımı, sesli ve görüntülü görüşme özelliklerini kapsayan; E2EE varsayılan olarak aktif; Fedora, Debian ve Pardus 25 GNOME/XFCE üzerinde `.deb` ve `.rpm` paketleri ile kurulabilen tam işlevsel bir platform.

**Kritik bağlam:** Projenin tüm yazılım geliştirmesi tek bir geliştirici tarafından yürütülmektedir. Proje yönetimi yapay zeka desteğiyle sağlanmakta, geliştirme laptop üzerinde gerçekleştirilmektedir. Kapsam her zaman bu gerçeği yansıtmalıdır.

---

## A2. Proje Şartı

### Kimlik

| Alan                     | Değer                                                                           |
| ------------------------ | ------------------------------------------------------------------------------- |
| Proje Adı                | Neo                                                                             |
| İstemci Yaklaşımı        | Sıfırdan geliştirme                                                 |
| İstemci Teknolojisi      | Tauri v2 (Rust) + React + TypeScript                                            |
| Matrix SDK               | matrix-js-sdk (Element/Matrix.org tarafından geliştirilen resmî SDK)            |
| Homeserver               | Synapse                                                                         |
| Ses/Video Altyapısı      | LiveKit SFU + Element Call (widget olarak gömülü)                               |
| Veritabanı               | PostgreSQL                                                                      |
| Lisans                   | AGPL-3.0                                                                        |
| Hedef Platform           | Fedora, Debian ve Pardus 25 "Bilge" (Debian 13 tabanlı)                         |
| Hedef Masaüstü Ortamları | GNOME 48, XFCE 4.20, KDE Plasma (Fedora, Debian, Pardus için)                   |
| Demo Hedefi              | 10 eş zamanlı kullanıcı                                                         |
| Deadline                 | 15 Mayıs 2026                                                                   |
| Yarışma                  | Teknofest 2026 — Pardus Hata Yakalama ve Öneri Yarışması, Geliştirme Kategorisi |

### Paydaşlar

| Rol                       | Kişi / Sistem               | Sorumluluk                                                    |
| ------------------------- | --------------------------- | ------------------------------------------------------------- |
| Proje Yöneticisi          | Muzaffer Umut Öztürk        | Tüm kararlar, strateji, önceliklendirme, yazılım geliştirme   |
| Proje Yönetici Yardımcısı | Claude (Anthropic)          | Dokümantasyon, analiz, araştırma, mimari danışmanlık          |
| Danışman Öğretmen         | Ayşen Alçakır               | Akademik rehberlik, yarışma koordinasyonu                     |

### Geliştirme Ortamı

| Donanım                  | Yazılım                                   |
| ------------------------ | ----------------------------------------- |
| Intel i5-12450H (12 çekirdek) | Fedora Linux 43 KDE Plasma (Wayland)  |
| NVIDIA RTX 3050 4 GB     | Visual Studio Code                        |
| 16 GB DDR4 RAM           | Kilo Code eklentisi (AI destekli geliştirme) |
| 1 TB SSD (btrfs)         | Docker + Docker Compose                   |
| Excalibur G770 Laptop    | Node.js + Rust + Cargo + Tauri CLI        |

### Vizyon

> "Pardus işletim sistemi kullanıcıları için; verisi Türkiye'de tutulan, uçtan uca şifreli, sesli ve görüntülü iletişim destekli, sıfırdan Pardus ruhuyla inşa edilmiş güvenli bir iletişim platformu."

### Misyon

> "Pardus'u, güvenli ve egemen bir iletişim altyapısıyla bütünleşik bir iş ve yaşam istasyonuna dönüştürmek; kullanıcıları yabancı veri işlemcilerinden bağımsız kılmak; ve bunu başkasının kodunu boyayarak değil, kendi kodunu yazarak yapmak."

---

## A3. Proje Felsefesi ve Yaklaşımı

Bu bölüm projenin ruhunu tanımlar. Gelecekte alınacak her teknik karar bu felsefeyle tutarlı olmalıdır.

### Neo güvenliği icat etmez, miras alır

Matrix protokolünün Olm/Megolm şifreleme katmanı bağımsız denetimden geçmiş, NATO ve 35'ten fazla ülke hükümeti tarafından üretimde kullanılmaktadır. Neo bu güvenliği temel alır. Geliştirici zamanı şifreleme algoritması yazmaya değil, Pardus ekosistemiyle özgün entegrasyona harcanır.

### Neo taklit etmez, tanımlar

Cinny fork'u almak "Neo benzeri bir Cinny" ortaya çıkarırdı. Sıfırdan geliştirme "Neo" ortaya çıkarır. Her UI bileşeni, her renk kararı, her etkileşim tasarımı Pardus kullanıcısı gözetilerek alınır. Bu hem teknik bağımsızlık hem de yarışmada özgünlük anlamına gelir.

### Güvenlik birinci prensip, son adım değil

E2EE varsayılan gelir. Sunucu yapılandırmasının her katmanında güvenlik önlemleri uygulanır. Hiçbir özellik güvenlik katmanı atlanarak eklenmez.

### Dürüst kapsam yönetimi

Tek geliştirici ve sıkışık zaman çizelgesi gerçeklerini görmezden gelmenin bedeli projenin tamamını riske atmaktır. Her milestone kapsam gerçekçi tutulur. Bir özellik tamamlanamayacaksa açıkça belgelenir ve sonraki versiyona planlanır.

### Geliştirme yaklaşımı: Katmanlı inşa

```
YAKLAŞIM HİYERARŞİSİ

Önce protokol bağlantısını kur, sonra arayüz yaz.
Önce çalıştır, sonra güzelleştir.
Önce güvenliği doğrula, sonra özellik ekle.

Katman 0 — Sunucu Altyapısı      ✅ TAMAMLANDI
           (Synapse + PostgreSQL + Docker + Cloudflare)

Katman 1 — Tauri + Matrix Bağlantısı   ← ŞU AN
           (Proje iskeleti, auth, temel sync)

Katman 2 — Temel İstemci UI
           (Oda listesi, mesajlaşma, dosya paylaşımı)

Katman 3 — Ses/Video
           (LiveKit + Element Call entegrasyonu)

Katman 4 — Güvenlik Sertleştirme
           (Sunucu + istemci güvenlik katmanları)

Katman 5 — Pardus Markalaşması
           (Görsel kimlik, Türkçe, Atatürk köşesi)

Katman 6 — Paketleme ve Test
           (.deb üretimi, Pardus 25 entegrasyon testi)
```

Her katman önce çalışır hale getirilir, sonra bir üst katmana geçilir.
