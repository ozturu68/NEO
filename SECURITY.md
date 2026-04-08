# Güvenlik Politikası

## 📞 Güvenlik Açığı Bildirimi

Neo projesi güvenliğini çok ciddiye alır. Bir güvenlik açığı keşfederseniz, lütfen hemen bize bildirin. GitHub Issues üzerinden değil, doğrudan e-posta ile bildirim yapmanızı rica ediyoruz.

**Bildirim adresi:** `m.umut.ozturk@protonmail.com`

### Bildirimde Bulunurken:
- **Konu satırı:** "[NEO SECURITY]" ile başlayın
- **Açıklama:** Güvenlik açığının detaylı açıklaması
- **Etkilenen versiyon:** Hangi versiyon(lar)ın etkilendiği
- **Adımlar:** Açığı reproduce etmek için adımlar
- **Öneriler:** Önerilen çözüm (varsa)
- **İletişim bilgileri:** Size ulaşabileceğimiz bir iletişim yöntemi

### Yanıt süreci:
1. **24 saat içinde:** Bildiriminizi aldığımızı teyit edeceğiz
2. **7 gün içinde:** Sorunu doğrulayacak ve bir çözüm planı oluşturacağız
3. **30 gün içinde:** Güvenlik açığını düzeltecek bir yama yayınlayacağız
4. **Koordinasyon:** CVE ataması ve kamuya açıklama konusunda sizinle işbirliği yapacağız

## 🔒 Güvenlik Mimarisi

Neo, 6 katmanlı bir güvenlik mimarisi üzerine inşa edilmiştir:

### Katman 1: Ağ Altyapı Güvenliği
- **TLS 1.3** zorunlu, HSTS aktif
- **Cloudflare Tunnel** ile DDoS koruması
- **UFW firewall** + **fail2ban** ile yetkisiz erişim engelleme

### Katman 2: Sunucu Sertleştirme
- **Docker izolasyonu** (internal network)
- **PostgreSQL** dışa kapalı
- **Otomatik güvenlik güncellemeleri** (unattended-upgrades)

### Katman 3: Kimlik Doğrulama
- **Synapse kayıt kapalı** (davet sistemi)
- **Rate limiting** aktif (10 giriş denemesi/dakika)
- **Güçlü şifre politikası** (12 karakter, büyük/küçük harf, rakam, sembol)

### Katman 4: Veri Güvenliği
- **E2EE varsayılan aktif** (Olm/Megolm)
- **Matrix protokolü** (bağımsız denetimden geçmiş)
- **Medya dosya kısıtlamaları** (50 MB, whitelist MIME tipleri)

### Katman 5: Uygulama Güvenliği (Neo İstemci)
- **Tauri CSP** (Content Security Policy)
- **IPC whitelist** (minimum gerekli izinler)
- **Input validation** (tüm kullanıcı girdileri)
- **XSS koruması** (DOMPurify, dangerouslySetInnerHTML yasak)

### Katman 6: İzleme ve Yanıt
- **Structured logging** (sensitive data loglanmaz)
- **fail2ban monitoring** (otomatik IP ban)
- **Incident response planı** (acil durum prosedürü)

## 🛡️ Güvenlik En İyi Uygulamaları

### Geliştiriciler İçin:
- **Secret management:** Hiçbir secret (token, şifre) kod içinde hardcode edilmemeli
- **Dependency scanning:** `npm audit` ve `cargo audit` düzenli çalıştırılmalı
- **Code review:** Tüm PR'lar güvenlik açısından review edilmeli
- **Input validation:** Tüm kullanıcı input'ları validate edilmeli

### Kullanıcılar İçin:
- **Şifre güvenliği:** Güçlü, benzersiz şifreler kullanın
- **Cihaz doğrulama:** QR code veya emoji verification ile cihazlarınızı doğrulayın
- **Key backup:** E2EE anahtarlarınızı yedekleyin
- **Güncellemeler:** Neo'yu her zaman en son versiyona güncelleyin

## 🔍 Güvenlik Testleri

### Otomatik Testler:
```bash
# Dependency güvenlik taraması
npm audit --audit-level=moderate
cargo audit

# Static analysis
npm run lint
npm run type-check

# Unit testler (güvenlik modülleri)
npm run test
```

### Manuel Testler (Opsiyonel):
- **Penetration testing:** OWASP Top 10 kontrolü
- **SSL/TLS testi:** `testssl.sh` ile sertifika kontrolü
- **Port scanning:** Açık port'ların kontrolü

## 📋 Güvenlik Checklist

Her yeni özellik için:
- [ ] E2EE ile uyumlu mu?
- [ ] Input validation yapıldı mı?
- [ ] Error handling Türkçe hata mesajları içeriyor mu?
- [ ] Secret management doğru yapıldı mı?
- [ ] Dependency güvenlik taraması temiz mi?
- [ ] Unit testler yazıldı mı?
- [ ] Dokümantasyon güncellendi mi?

## 🚨 Acil Durum Prosedürü

### Senaryo 1: Matrix Access Token Sızdı
```bash
# 1. Tüm oturumları invalidate et
docker exec -it synapse python -m synapse.app.admin_cmd -c /data/homeserver.yaml invalidate_all_tokens

# 2. Kullanıcılara bildirim gönder
# 3. Sızıntı kaynağını patch'le
# 4. Incident raporu yaz
```

### Senaryo 2: Sunucuya Yetkisiz Erişim
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

### Senaryo 3: Dependency Vulnerability
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

## 📚 Kaynaklar

- [Matrix Security Disclosure Policy](https://matrix.org/security-disclosure-policy/)
- [Matrix E2EE Specification](https://spec.matrix.org/latest/client-server-api/#end-to-end-encryption)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Tauri Security Guide](https://tauri.app/v1/guides/security/)

## 🤝 Teşekkürler

Neo projesinin güvenliğine katkıda bulunan herkese teşekkür ederiz. Güvenlik açıklarını sorumlu bir şekilde bildirdiğiniz için minnettarız.

**"Güvenlik birinci prensip, son adım değil."** — Neo Proje Felsefesi