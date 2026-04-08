# Katkıda Bulunma Rehberi

Neo projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye nasıl katkı sağlayabileceğinizi açıklar.

## 🎯 Katkı Türleri

Aşağıdaki alanlarda katkılarınızı bekliyoruz:

1. **🐛 Hata Raporları** — Uygulamada bulduğunuz hataları bildirin
2. **✨ Özellik Önerileri** — Yeni özellik fikirlerinizi paylaşın
3. **📚 Dokümantasyon** — Türkçe dokümantasyon geliştirin
4. **🔧 Kod Katkıları** — Yeni özellikler ekleyin veya mevcut kodu iyileştirin
5. **🌍 Çeviriler** — İngilizce içerikleri Türkçe'ye çevirin
6. **🧪 Test Yazımı** — Unit ve integration testleri yazın

## 📋 Katkı Süreci

### 1. Issue Açma
- Öncelikle [GitHub Issues](https://github.com/ozturu68/NEO/issues) sayfasında benzer bir issue olup olmadığını kontrol edin
- Yeni bir issue açarken şablonu doldurun:
  - **Hata Raporu:** Beklenen davranış, gerçekleşen davranış, adımlar
  - **Özellik Önerisi:** Problemin tanımı, önerilen çözüm, alternatifler
- Issue'yu uygun etiketlerle etiketleyin (`bug`, `enhancement`, `documentation`, vb.)

### 2. Geliştirme Ortamı Kurulumu
```bash
# 1. Repo'yu fork'layın ve klonlayın
git clone https://github.com/ozturu68/NEO.git
cd NEO

# 2. Geliştirme branch'i oluşturun
git checkout -b feature/amazing-feature

# 3. Bağımlılıkları yükleyin
npm install

# 4. Geliştirme sunucusunu başlatın
npm run tauri dev
```

### 3. Kod Standartları
- **TypeScript:** `.kilo/rules/code-style.md` dosyasındaki kurallara uyun
- **React:** Functional components, TypeScript strict mode, proper prop typing
- **Matrix SDK:** Direct SDK kullanımı yasak! `src/lib/matrix/` wrapper'larını kullanın
- **Error Handling:** Tüm async fonksiyonlar try-catch içinde, Türkçe hata mesajları
- **Commit Mesajları:** Conventional commits formatını kullanın:
  ```
  feat(auth): matrix-js-sdk ile giriş akışı eklendi
  fix(messages): mesaj gönderme hatası düzeltildi
  docs(readme): kurulum talimatları güncellendi
  ```

### 4. Test Yazma
- Yeni özellikler için unit testler yazın (Vitest kullanarak)
- Kritik modüller için %80+ test kapsamı hedefleyin
- Testleri çalıştırın: `npm run test`
- TypeScript kontrolü: `npm run type-check`
- ESLint kontrolü: `npm run lint`

### 5. Pull Request Gönderme
1. Değişikliklerinizi commit'leyin:
   ```bash
   git add .
   git commit -m "feat(component): yeni özellik eklendi"
   ```

2. Branch'inizi push edin:
   ```bash
   git push origin feature/amazing-feature
   ```

3. GitHub'da Pull Request oluşturun
4. PR şablonunu doldurun:
   - Değişikliklerin özeti
   - Related issue'lar
   - Test sonuçları
   - Ekran görüntüleri (UI değişiklikleri için)

5. Code review sürecini bekleyin

## 🏗️ Proje Mimarisi

Neo 6 katmanlı bir mimariye sahiptir. Katkıda bulunurken hangi katmanda çalıştığınızı bilin:

| Katman | Dosya Yolu | Teknoloji |
|--------|------------|-----------|
| **Katman 6: UI Markalaşma** | `src/components/`, `src/styles/` | React, Tailwind CSS |
| **Katman 5: UI Bileşenleri** | `src/components/` | React, TypeScript |
| **Katman 4: State Yönetimi** | `src/lib/store/` | Zustand |
| **Katman 3: Matrix SDK Wrapper** | `src/lib/matrix/` | matrix-js-sdk |
| **Katman 2: Tauri IPC** | `src-tauri/src/commands/` | Rust |
| **Katman 1: Sunucu Altyapısı** | `docker-compose.yml`, `nginx.conf` | Docker, Nginx |

## 🔒 Güvenlik Politikası

- **Güvenlik açığı bulursanız:** Lütfen hemen bir issue açmak yerine e-posta ile bildirin: `m.umut.ozturk@protonmail.com`
- **E2EE önceliği:** Tüm yeni özellikler E2EE ile uyumlu olmalı
- **Input validation:** Tüm kullanıcı input'ları validate edilmeli
- **Secret management:** Hiçbir secret (token, şifre) kod içinde hardcode edilmemeli

## 🌍 Türkçe Dokümantasyon

- Tüm dokümantasyon Türkçe olarak yazılmalı
- Kod içi yorumlar Türkçe olabilir (karmaşık mantık açıklamaları için)
- README, CONTRIBUTING, CODE_OF_CONDUCT dosyaları Türkçe tutulmalı
- İngilizce terimler parantez içinde açıklanmalı

## 🤝 Code Review Süreci

1. **Otomatik kontroller:** GitHub Actions linting, testing, building
2. **Manuel review:** En az bir maintainer tarafından review
3. **Review kriterleri:**
   - Kod standartlarına uygunluk
   - Test kapsamı
   - Güvenlik kontrolleri
   - Performans etkisi
   - Dokümantasyon tamamlığı

4. **Değişiklik istekleri:** Reviewer gerekli değişiklikleri isteyebilir
5. **Onay:** Tüm kontroller geçtikten sonra PR merge edilir

## 🙏 Teşekkürler

Neo projesine katkıda bulunduğunuz için teşekkür ederiz! Her katkı, Pardus ekosistemi için daha güvenli ve özgür bir iletişim platformu yaratmamıza yardımcı oluyor.

**"Güvenlik birinci prensip, son adım değil."** — Neo Proje Felsefesi