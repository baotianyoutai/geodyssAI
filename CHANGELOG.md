# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-07-30

### Added & Refactored
- **Admin CMS Live Preview Split View & Dynamic Category Management (`AdminCMS.tsx`)**:
  - Reimagined Admin CMS editor with a 50:50 Live Preview Split View featuring real-time hero image render and markdown toolbars.
  - Added dynamic category management with interactive `<select>` dropdown and `＋ 新規カテゴリを追加` capability (e.g. `Machine Learning`).
  - Added Gemini AI-powered 1-click excerpt generator (`✨ AIで要約を自動生成`).
- **Firestore SSOT Real-time Architecture (`AdminCMS.tsx`, `MunchkinNavigator.tsx`, `AGENT.md`)**:
  - Completely removed legacy `all-articles-data.json` imports across all frontend components and RAG chat modules.
  - Connected `onSnapshot` and `getDocs` directly to Google Cloud Firestore (`db.collection('articles')`) as the Single Source of Truth (SSOT).
  - Documented strict SSOT Firestore database rules in `AGENT.md` (§ 2.1.1).
- **100% Article Direct Link Jumping & URL Encoding Safety (`[slug].astro`, `AdminCMS.tsx`)**:
  - Resolved double URL encoding bugs (`getSafeArticleUrl`) and expanded Astro static/dynamic routing for seamless 100% link navigation across all 46 published/draft articles.

## [1.2.2] - 2026-07-25

### Added & Fixed
- **DRAFT Article Status Badge Tag UI Integration (`StellarCanvas.tsx`, `[slug].astro`, `firebase-server.ts`)**:
  - Restored `status` field mapping in `firebase-server.ts` to properly identify draft articles (`status === 'draft'`).
  - Added amber glowing `✦ DRAFT (下書き)` badge tags on 3D Canvas desktop HUD card, Mobile Bottom Sheet, and article detail header.
- **Google Cloud Next Tokyo Official Presentation Deck (`scripts/generate_pptx.cjs`, `geodyssAI_Presentation.pptx`)**:
  - Created a 12-slide wide-format presentation using `pptxgenjs`, strictly adhering to `DESIGN.md` (Dark Theme `#090F1E`, Seikai Accent `#2fd9f4`-`#818CF8`).
  - Embedded Accenture Song 73% Sea of Sameness data & 6x profit growth, Think with Google 11M page speed 123% bounce rate prevention, MOOC 5-13% vs 30% Constellation completion KPI, and Agentic Era tech stack (NotebookLM x Stitch x Antigravity).
  - Embedded complete Speaker Notes across all 12 slides.

## [1.2.0] - 2026-07-25

### Added
- **Firebase AI Logic & @google/genai SDK Integration**:
  - Integrated official `@google/genai` (Google Gen AI SDK) with current `gemini-3.5-flash` model for high-speed AI responses.
  - Built `src/lib/ai-logic.ts` module handling article summaries, 3-step action roadmaps, and 3D Stellar Canvas RAG chat.
  - Enabled **Google Search Grounding (`tools: [{ googleSearch: {} }]`)** for real-time web-enhanced AI responses.
- **Firebase App Check with Official reCAPTCHA Enterprise**:
  - Applied official reCAPTCHA Enterprise site key (`6LfdWbQsAAAAAGht9Q4Os6xikVRfFBhL8I3GZaBn`) in `src/lib/firebase-client.ts`.
  - Enabled `window.useEnterprise = true` to protect API endpoints and Firestore resources from unauthorized domain access.
- **Cross-Device Firestore Thread Synchronization (`StellarTavernView.tsx`)**:
  - Configured Firestore Security Rules and auto anonymous authentication (`signInAnonymously`) for seamless cross-device thread post synchronization across desktop and mobile devices.
  - Added `searchQueries` Firestore collection logging to record user search intent for continuous content optimization.

## [1.1.1] - 2026-07-25

### Fixed
- **Article Content Restoration (`contentMd`)**:
  - Fixed issue where article Markdown body text was missing on individual article pages (`/articles/[slug]`).
  - Corrected field mapping in `src/lib/firebase-server.ts` `getArticles()` to properly extract `contentMd: data.contentMd || data.content || ''` from Cloud Firestore.
  - Re-generated static pre-rendered HTML files for all 28 articles with full body content, headings, and code blocks intact.

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
  - Completely removed all emojis (`📡`, `🍻`, `👤`, `🚀`, `🌌`, `👨‍✈️`, `✦`, `⏱️`, `🤖`) site-wide for a clean, minimalist aesthetic.
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
