# Neo Installation Guide

## System Dependencies

Neo uses Tauri v2 which requires specific system libraries for Linux desktop integration.

### Fedora 42 / RHEL-based
```bash
sudo dnf install -y \
  pkg-config \
  webkit2gtk4.1-devel \
  gtk3-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  clang \
  openssl-devel \
  curl \
  libsoup-devel \
  libxkbcommon-devel \
  dbus-devel
```

### Debian 13 / Ubuntu 24.04 / Pardus 25
```bash
sudo apt install -y \
  pkg-config \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  clang \
  libssl-dev \
  curl \
  libsoup-3.0-dev \
  libxkbcommon-dev \
  libdbus-1-dev
```

### Verification
After installation, verify Tauri dependencies:
```bash
cargo tauri info
```

Expected output should show "✔ All checks passed" for Linux.

## Rust Installation

If Rust is not already installed:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

**Rust Version:** Neo requires Rust 1.70+ for Tauri v2 compatibility.
```bash
rustc --version  # Should show 1.70 or higher
```

## Project Setup

1. Clone the repository
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Build the Tauri backend:
   ```bash
   cd src-tauri
   cargo build
   ```

## Development

### Frontend Development
Run Vite development server (React hot reload):
```bash
npm run dev
```

### Full Stack Development (Tauri + React)
Run Tauri development with hot reload:
```bash
npm run tauri dev
```

### First-Time Setup
1. Install system dependencies (above)
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Verify Tauri setup:
   ```bash
   cd src-tauri
   cargo build
   cd ..
   ```
4. Start development:
   ```bash
   npm run tauri dev
   ```

## Building .deb Package

Build production package:
```bash
npm run tauri build -- --bundles deb
```

The .deb package will be located in `src-tauri/target/release/bundle/deb/`

## Testing

### Test Suite
Neo uses Vitest for fast unit testing with Matrix SDK mocking.

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode (development)
npm run test:coverage # Generate coverage report
```

### Test Structure
- **Unit Tests:** `src/lib/matrix/*.test.ts` - Matrix wrapper functions
- **Component Tests:** `src/components/**/*.test.tsx` - React components
- **Mocking:** `vi.mock()` for matrix-js-sdk and Tauri commands
- **Coverage:** Target 80%+ (critical modules 90%+)

### Running Specific Tests
```bash
# Run Matrix wrapper tests only
npm run test -- src/lib/matrix/

# Run component tests
npm run test -- src/components/
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for project structure and design decisions.

## Security

- E2EE enabled by default for all rooms
- Secure session token storage via system keyring
- CSP headers configured in Tauri
- Input validation and sanitization

## Contributing

1. Follow code style guidelines in `.kilo/rules/`
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## License

[Your License Here]