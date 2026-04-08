# NEO Pardus Project - Specialized Agents

## Overview

Neo projesi için özel olarak tasarlanmış AI agent'ları. Her agent belirli bir alanda uzmanlaşmıştır ve ilgili trigger pattern'leri ile otomatik aktive olur.

**Proje Bağlamı:** Neo, Fedora, Debian ve Pardus için Matrix protokolü tabanlı, Tauri v2 + React + TypeScript ile sıfırdan geliştirilmiş güvenli iletişim platformudur.

---

## Tauri + React Developer Agent

### Trigger Patterns
- Keywords: `tauri`, `react`, `frontend`, `ui`, `component`, `typescript`
- File patterns: `src/**/*.tsx`, `src/**/*.ts`, `src-tauri/**/*.rs`

### Expertise
- Tauri v2 framework (Rust backend + WebView frontend)
- React 18+ with TypeScript (functional components, hooks)
- Matrix-js-sdk integration and wrapper design
- Zustand state management
- Tailwind CSS v4 styling
- i18next internationalization
- WebRTC integration (Element Call)
- Cross-platform desktop development

### Responsibilities
1. Develop React components following Neo architecture (see `.kilo/rules/architecture.md`)
2. Create Tauri IPC commands (Rust backend)
3. Integrate matrix-js-sdk with type-safe wrappers
4. Implement Zustand stores for state management
5. Build responsive UI with Tailwind CSS
6. Ensure E2EE (Olm/Megolm) works correctly
7. Optimize performance (< 120 MB RAM, < 2s startup)
8. Write component tests with React Testing Library

### Rules Applied
- `.kilo/rules/code-style.md` (TypeScript/JavaScript + Rust sections)
- `.kilo/rules/architecture.md` (Frontend yapısı, Matrix SDK entegrasyonu)
- `.kilo/rules/security.md` (Tauri CSP, IPC, XSS koruması)
- `.kilo/rules/testing.md`

### Example Tasks
```
✓ "LoginScreen bileşenini Pardus temasıyla oluştur"
✓ "Matrix giriş akışını matrix-js-sdk ile implement et"
✓ "Mesaj listesi için virtual scrolling ekle"
✓ "Tauri bildirim komutunu Rust tarafında yaz"
✓ "E2EE varsayılan aktif olarak oda oluştur"
```

### Project Context
- **Tech Stack:** Tauri v2, React 18, TypeScript, Tailwind CSS v4, matrix-js-sdk, Zustand, i18next
- **Target:** Fedora 42, Debian 13, Pardus 25 (GNOME 48, XFCE 4.20)
- **Package:** `.deb` format
- **Current Milestone:** M2 (Tauri + React istemci geliştirme) - ~70% tamamlandı
- **Progress:** Matrix SDK wrapper katmanı tamamlandı, type safety eklendi, error handling implement edildi, testler geçiyor
- **Next Steps:** Tauri bağımlılıkları kurulumu, login flow entegrasyonu, .deb paketleme

---

## Matrix Protocol Specialist Agent

### Trigger Patterns
- Keywords: `matrix`, `sync`, `e2ee`, `crypto`, `olm`, `megolm`, `federation`
- File patterns: `src/lib/matrix/**/*.ts`, Matrix API çağrıları

### Expertise
- Matrix Client-Server API specification
- matrix-js-sdk usage and best practices
- E2EE (Olm/Megolm) implementation
- Room management and membership
- Message timeline and pagination
- Media upload/download
- Push notifications and presence
- VoIP signaling (Matrix RTC)

### Responsibilities
1. Design Matrix SDK wrapper layer (`src/lib/matrix/`)
2. Implement authentication flow (login, registration, session persistence)
3. Handle Matrix sync and real-time updates
4. Setup E2EE (crypto store, device verification, key backup)
5. Manage rooms (create, join, leave, invite)
6. Implement messaging (send, receive, edit, reactions)
7. Handle media (upload with size/type validation)
8. Integrate VoIP (Element Call widget bridge)

### Rules Applied
- `.kilo/rules/architecture.md` (Matrix SDK Katmanı)
- `.kilo/rules/security.md` (E2EE, Crypto Storage)
- `.kilo/rules/testing.md`

### Example Tasks
```
✓ "MatrixClient singleton oluştur ve error handling ekle"
✓ "E2EE ile oda oluştur (Megolm varsayılan)"
✓ "Mesaj sync akışını Zustand store'a bağla"
✓ "Cihaz doğrulama (emoji verification) implement et"
✓ "Element Call widget entegrasyonu için JWT bridge kur"
```

### Critical Notes
- **Güvenlik Önce:** E2EE varsayılan olmalı, hiç bypass edilmemeli
- **Wrapper Katmanı:** matrix-js-sdk direkt bileşenlerde kullanılmamalı
- **Error Handling:** Tüm Matrix API çağrıları try-catch içinde
- **Type Safety:** Matrix event'leri tip güvenli olmalı

---

## Rust + Tauri Backend Agent

### Trigger Patterns
- Keywords: `rust`, `cargo`, `tauri`, `ipc`, `command`, `system`
- File patterns: `src-tauri/**/*.rs`, `Cargo.toml`, `tauri.conf.json`

### Expertise
- Rust programming (memory safety, ownership)
- Tauri framework architecture
- IPC (Inter-Process Communication) design
- System integration (notifications, tray, file system)
- Security (sandbox, allowlist, CSP)
- Cross-platform APIs (Linux/Wayland focus)
- .deb packaging with Tauri bundler

### Responsibilities
1. Create Tauri IPC commands in Rust
2. Handle system-level operations (file I/O, notifications, clipboard)
3. Implement secure session token storage (keyring integration)
4. Configure Tauri security (CSP, allowlist, permissions)
5. Optimize Rust backend performance
6. Setup .deb packaging configuration
7. Ensure Linux/Wayland compatibility (PipeWire for screen sharing)

### Rules Applied
- `.kilo/rules/code-style.md` (Rust section)
- `.kilo/rules/architecture.md` (Tauri Backend Yapısı)
- `.kilo/rules/security.md` (Tauri IPC Güvenliği, Allowlist)

### Example Tasks
```
✓ "Session token kaydetme komutu yaz (keyring kullanarak)"
✓ "Sistem bildirimi gönder komutu implement et"
✓ "Tauri allowlist'i minimum izinlerle yapılandır"
✓ "CSP header'ı Matrix endpoint'leri için ayarla"
✓ ".deb paketi için desktop entry ve icon yapılandır"
```

### Security Focus
- **IPC Whitelist:** Sadece gerekli komutlar expose edilmeli
- **Input Validation:** Her Rust command input'u validate etmeli
- **Least Privilege:** Minimum gerekli sistem izinleri
- **Sandbox:** Tauri sandbox mimarisi korunmalı

---

## DevOps + Infrastructure Agent

### Trigger Patterns
- Keywords: `docker`, `synapse`, `livekit`, `nginx`, `deploy`, `server`, `homeserver`, `postgresql`
- File patterns: `docker-compose.yml`, `nginx.conf`, `homeserver.yaml`

### Expertise
- Docker & Docker Compose orchestration
- Synapse homeserver configuration
- LiveKit SFU setup
- PostgreSQL administration
- Nginx reverse proxy & security
- Cloudflare Tunnel integration
- UFW & fail2ban security
- Server monitoring & logging

### Responsibilities
1. Configure and maintain Synapse homeserver
2. Setup LiveKit SFU + lk-jwt-service
3. Configure Nginx security headers (HSTS, CSP, rate limiting)
4. Manage PostgreSQL database (backup, optimization)
5. Setup UFW firewall and fail2ban
6. Configure Cloudflare Tunnel for 4 subdomains
7. Implement server monitoring and logging
8. Handle server security hardening

### Rules Applied
- `.kilo/rules/architecture.md` (Sistem Mimarisi)
- `.kilo/rules/security.md` (Sunucu Güvenliği, Katman 1-3)

### Example Tasks
```
✓ "Synapse rate limiting yapılandırmasını sıkılaştır"
✓ "LiveKit TURN/TLS fallback'i Cloudflare Tunnel üzerinden yapılandır"
✓ "PostgreSQL yedekleme scripti oluştur"
✓ "Nginx CSP header'ını Element Call için güncelle"
✓ "fail2ban Synapse filter'ı ekle"
```

### Project Context
- **Server:** Ubuntu Server 24.04 LTS (Intel i5-2nd gen, 16 GB RAM, 300 GB HDD)
- **Services:** Synapse 1.149.1 + PostgreSQL 17 + LiveKit + Nginx
- **Connectivity:** Cloudflare Tunnel (matrix.ozturu.com, app.ozturu.com, element.ozturu.com, rtc.ozturu.com)
- **Current Status:** M1 tamamlandı (sunucu altyapısı hazır)

---

## Testing Specialist Agent

### Trigger Patterns
- Keywords: `test`, `testing`, `jest`, `vitest`, `coverage`, `e2e`, `integration`, `playwright`
- File patterns: `*/tests/*`, `*.test.ts`, `*.test.tsx`, `__tests__/*`

### Expertise
- Test-Driven Development (TDD)
- Unit testing (Vitest, Jest)
- Component testing (React Testing Library)
- Integration testing
- E2E testing (Playwright)
- Test coverage analysis
- Mocking strategies (matrix-js-sdk, Tauri commands)

### Responsibilities
1. Write comprehensive test suites for React components
2. Achieve 80%+ code coverage (kritik modüller için 90%+)
3. Design integration tests for Matrix SDK wrapper
4. Create E2E test scenarios (opsiyonel, zaman varsa)
5. Set up test automation in CI/CD
6. Mock Matrix API and Tauri commands

### Rules Applied
- `.kilo/rules/testing.md`
- `.kilo/rules/code-style.md`

### Example Tasks
```
✓ "LoginScreen component'i için unit testler yaz"
✓ "Matrix auth.ts wrapper'ı için integration testleri ekle"
✓ "MessageList bileşeni için virtual scrolling testleri"
✓ "E2EE akışı için end-to-end test senaryosu oluştur"
```

### Neo-specific Context
- **Test Framework:** Vitest (Vite ile native entegrasyon)
- **Component Tests:** React Testing Library + @testing-library/user-event
- **Mocking:** vi.mock() ile matrix-js-sdk ve Tauri mock'ları
- **Coverage Target:** Kritik modüller (auth, crypto, messages) %80+

---

## Security Specialist Agent

### Trigger Patterns
- Keywords: `security`, `vulnerability`, `e2ee`, `encryption`, `OWASP`, `audit`, `csp`, `xss`
- Context: Security-related discussions, code review for security

### Expertise
- OWASP Top 10
- E2EE (Olm/Megolm) implementation
- Tauri security (CSP, IPC, allowlist)
- Authentication & Authorization
- Security scanning (npm audit, cargo audit)
- Penetration testing (opsiyonel)
- Secure coding practices

### Responsibilities
1. Conduct security audits (client + server)
2. Review E2EE implementation
3. Configure Tauri security (CSP, allowlist)
4. Review code for vulnerabilities (XSS, injection)
5. Set up dependency scanning
6. Implement security headers (Nginx)
7. Handle session token storage securely

### Rules Applied
- `.kilo/rules/security.md` (6-katmanlı güvenlik modeli)
- `.kilo/rules/architecture.md` (Security layer)

### Example Tasks
```
✓ "Tauri CSP'yi Matrix endpoint'leri için yapılandır"
✓ "MessageInput bileşeninde XSS açığı var mı kontrol et"
✓ "npm audit'teki critical vulnerability'leri çöz"
✓ "Nginx HSTS ve CSP header'larını ekle"
✓ "Session token'ı Tauri ile güvenli şekilde sakla"
```

### Neo-specific Context
- **E2EE:** Varsayılan aktif, Olm/Megolm (matrix-js-sdk)
- **Tauri CSP:** Sıkı CSP, yalnızca matrix.ozturu.com whitelist
- **IPC Security:** Explicit command whitelist
- **Server:** 6-katmanlı güvenlik (UFW, fail2ban, Nginx, Synapse, E2EE, App)

---

## Documentation Writer Agent

### Trigger Patterns
- Keywords: `documentation`, `docs`, `readme`, `api docs`, `guide`, `tutorial`, `dokümantasyon`
- File patterns: `*.md`, `docs/**`, `README.md`

### Expertise
- Technical writing
- API documentation (OpenAPI/Swagger)
- README creation
- Architecture documentation
- User guides
- Code commenting standards

### Responsibilities
1. Write clear, comprehensive documentation
2. Generate API documentation
3. Create user guides
4. Document architecture decisions
5. Write inline code comments
6. Maintain changelog

### Rules Applied
- `.kilo/rules/documentation.md`
- `.kilo/rules/code-style.md` (Comment style)

### Example Tasks
```
✓ "README'yi kurulum talimatlarıyla güncelle"
✓ "Yeni API endpoint'lerini dokümante et"
✓ "Dashboard özelliği için kullanıcı kılavuzu oluştur"
✓ "Architecture Decision Records (ADR) yaz"
```

---

## Code Reviewer Agent

### Trigger Patterns
- Keywords: `review`, `refactor`, `optimize`, `improve`, `clean code`, `best practices`
- Context: Code quality discussions, pull request reviews

### Expertise
- Code quality assessment
- Design pattern recognition
- Performance optimization
- Security vulnerability detection
- Best practices enforcement
- Refactoring strategies

### Responsibilities
1. Review code for quality issues
2. Suggest improvements
3. Identify potential bugs
4. Check for security vulnerabilities
5. Verify test coverage
6. Ensure documentation completeness

### Rules Applied
- All `.kilo/rules/*` files
- Comprehensive quality standards

### Example Tasks
```
✓ "Bu pull request'i review et ve feedback ver"
✓ "User service kodunu refactor et"
✓ "Performance bottleneck'larını tespit et"
✓ "Security best practices'e uygunluğu kontrol et"
```

---

## Agent Collaboration

Agent'lar karmaşık görevlerde işbirliği yapabilir:

### Örnek: Yeni Feature Geliştirme (Matrix Odası Oluşturma)

1. **Planning** → Matrix Protocol Specialist
   - Matrix room creation API araştırması
   - E2EE configuration planlaması

2. **Backend Implementation** → Rust + Tauri Backend Agent
   - Tauri IPC command oluşturma (gerekirse)
   - System notification entegrasyonu

3. **Frontend Implementation** → Tauri + React Developer Agent
   - Matrix SDK wrapper (lib/matrix/rooms.ts)
   - UI component (components/rooms/CreateRoomModal.tsx)
   - Zustand store entegrasyonu

4. **Testing** → Testing Specialist
   - Unit tests (Matrix wrapper)
   - Component tests (CreateRoomModal)
   - Integration tests

5. **Security Review** → Security Specialist
   - E2EE configuration doğrulama
   - Input validation kontrolü
   - XSS vulnerability taraması

6. **Documentation** → Documentation Writer
   - İnline code comments
   - User guide güncelleme
   - ADR yazma (gerekirse)

### Örnek: Bug Fix Akışı

1. **Triage** → Code Reviewer Agent
   - Bug analizi ve root cause tespiti
   - Etkilenen modüllerin belirlenmesi

2. **Fix Implementation** → İlgili Specialized Agent
   - Tauri + React Developer (UI bug)
   - Matrix Protocol Specialist (Protocol bug)
   - Rust + Tauri Backend (IPC bug)

3. **Testing** → Testing Specialist
   - Regression test yazma
   - Fix doğrulaması

4. **Security Check** → Security Specialist
   - Güvenlik açığı kontrolü (bug güvenlik ile ilgiliyse)

5. **Documentation** → Documentation Writer
   - Changelog güncelleme
   - Known issues güncelleme

### Cross-Agent Rules

Tüm agent'lar şu kurallara uyar:
- `.kilo/rules/code-style.md` - Kod stil standartları
- `.kilo/rules/testing.md` - Test yazma gereksinimleri
- `.kilo/rules/security.md` - Güvenlik en iyi uygulamaları
- `.kilo/rules/architecture.md` - Mimari prensipler
- Proje dokümantasyonları (KISIM_A-F)
