# Tauri Desktop Build - Taaloum

## Prérequis
- [Rust](https://rustup.rs/)
- Node.js 18+

## Installation
```bash
npm install
cd src-tauri
cargo install tauri-cli
```

## Développement
```bash
cargo tauri dev
```

## Build production
```bash
cargo tauri build
```
→ Génère MSI/EXE (Windows), .dmg (macOS), .deb/.AppImage (Linux) dans `src-tauri/target/release/bundle/`

## Notes
- Le front-end est servi depuis `../dist` (build Vite)
- Les icônes doivent être placées dans `src-tauri/icons/`
- Utiliser `cargo tauri icon public/taalam-icon.png` pour générer toutes les tailles
