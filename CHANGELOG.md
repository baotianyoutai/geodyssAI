# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-07-25

### Added
- **Streamlit-Style Collapsible Navigation Sidebar (`Sidebar.tsx`)**:
  - Implemented a smooth slide-over drawer accessible via `[menu]` (≡) hamburger button.
  - Navigation links to Home (`/`), Catalog (`/observatory`), Threads (`/tavern`), All Articles (`/articles`), and Sign in (`BoardingModal`).
  - Styled using M3 tonal pill shapes with high contrast and glassmorphism.
- **Top-Right Dedicated Sign-In Pill Button**:
  - Positioned primary `乗船手続き / Sign in` pill button at top-right (`top-6 right-6`) of 3D Stellar Canvas.
  - Dynamically updates upon Google login to display user's Google avatar photo and first name (e.g., `鴇田優太`).
- **Real-Time Article Read & Stardust Bookmark Tracking**:
  - Automatically records article read history (`readHistory`) in Cloud Firestore upon viewing any article page (`/articles/[slug]`).
  - Added "星屑の栞に保存" (Stardust Bookmark) toggle button on article guide sections to instantly sync bookmarks to Firestore.
  - Removed hardcoded/dummy initial history for new users.

### Changed
- **Brand Identity & Anti-Plagiarism Color System**:
  - Completely replaced Google 4-color pattern (red, blue, yellow, green) with `DESIGN.md`'s official `Seikai` (星海) color palette.
  - Brand logo now uses `Seikai` cyan-to-sky-to-indigo gradient (`#2fd9f4` via `#38BDF8` to `#818CF8`).
  - Updated sidebar footer copyright text to `© 2026 geodyssAI`.
- **UI Layout Clean-Up**:
  - Shifted `CONSTELLATIONS` legend panel down to `top-20 right-6` to align perfectly under top-right Sign in button.
  - Removed duplicate Observatory and Tavern buttons from top-left HUD.
  - Completely removed all emojis (`📡`, `🍻`, `👤`, `🚀`, `🌌`, `👨‍✈️`, `✦`, `⏱️`, `🤖`) site-wide for a clean, professional aesthetic.
  - Removed Captain section (`src/pages/captain.astro`) and bottom Stratification / Depth panels.

### Fixed
- **Google Authentication & Firebase App Check Silent Blocking**:
  - Fixed issue where `signInWithPopup` promise hung indefinitely after Google account selection due to App Check reCAPTCHA key mismatch. Added guard to bypass App Check when key is not configured.
  - Implemented automatic fallback to `signInWithRedirect` when popups are blocked by browser popup blockers (`auth/popup-blocked`).
  - Guaranteed instant UI state transition to logged-in user profile even if Firestore user document synchronization fails or experiences latency.

## [1.0.0] - 2026-07-25

### Added
- Complete Production Launch on Firebase Hosting (`https://geodyssai.com`).
- Full DNS migration from ConoHa WING to Firebase Hosting with SSL/HTTPS.
- ADR-004 documentation in `docs/decisions.md`.

## [0.2.0] - 2026-07-21

### Added
- WXR parsing and Markdown/Astro compilation script `scripts/etl/01_parse.py`.
- Text embeddings generation script `scripts/etl/02_embed.py` using Google Cloud Vertex AI (model: `text-embedding-005`).
- UMAP 3D coordinate reduction and difficulty offset script `scripts/etl/03_neighbors_umap.py` using UMAP and Gemini 2.5 Flash.
- Cloud Firestore sync-upload script `scripts/etl/04_upload.py` utilizing Firebase Admin SDK batches.
- Configuration overrides for technical difficulties in `scripts/etl/config/difficulty_overrides.yaml`.
- Detailed learning notes in `docs/learning-notes.md`.
- WordPress blocks review report in `docs/review-list.md`.

### Changed
- Added `.json` intermediate data files to `.gitignore` to keep repository clean.
- Updated `AGENT.md` to include detailed instructions on GitHub Issue/PR based learning protocols.

## [0.1.0] - 2026-07-21

### Added
- Repository skeletal directory structure: `data/`, `docs/`, `logs/`, `public/assets/`, `scripts/etl/config/`.
- Moved WordPress WXR import source `geodyssai.WordPress.2026-07-19.xml` to `data/`.
- Moved mascot image `cat.jpg` to `public/assets/`.
- Constellation taxonomy configuration in `scripts/etl/config/taxonomy.yaml`.
- Preflight verification script in `scripts/preflight_check.py`.
- Preflight verification report in `docs/preflight-report.md`.
- Environment variable template `.env.example`.
