# geodyssAI — Learning Notes & Operational Logs

This document details all the commands, logs, errors, and learning points encountered during Phase 1: Foundation, Sprint 1: Data Voyage (ETL), Sprint 2: Visual Voyage (3D UI), Phase 4: Production Deployment, and Sprint 5: UI & Auth Refinement of the **geodyssAI** project.

---

## 9. Phase 4: Production Deployment & DNS Migration (本番公開 ＆ DNS移行)

### 9.1 Astro Build & Firebase Deploy Verification
* **Commands Executed**:
  ```bash
  npm run build
  npx -p firebase-tools firebase deploy --only hosting
  ```
* **Dist Architecture Breakdown**:
  - **`dist/client`**: Static pre-rendered HTML files (`/index.html`, `/articles/*/index.html`, `/observatory/index.html`, `/tavern/index.html`), bundled JavaScript (`_astro/`), CSS, and media assets served directly via Firebase Hosting CDN.
  - **`dist/server`**: Node.js SSR runtime entrypoints (`entry.mjs`) and backend API route handlers (`/api/chat` for Munchkin Navigator RAG chatbot).

### 9.2 ConoHa WING DNS Migration (`geodyssai.com`)
* **DNS Record Changes**:
  - **A Record**: Pointed `@` and `www` from ConoHa IP (`118.27.122.217`) to Firebase Hosting IP (`199.36.158.100`).
  - **TXT Record**: Added domain verification token (`hosting-site=my-geodyssai-pro-1744456051163`) at `@`.
* **Key Learning Concepts**:
  - **A Record vs TXT Record**: A Record dictates packet routing target; TXT Record acts as unroutable metadata proof for SSL/Domain ownership verification.
  - **ACME Challenge & Auto SSL**: Automatic issuance of Let's Encrypt / Google Trust Services SSL certificates upon A Record resolution.
  - **Cost Architecture Impact**: Eliminated ~15,000 JPY/year fixed WordPress hosting fees; transitioned to ~2,000 JPY/year domain-only model leveraging Firebase Free Tier.
  - **Safety Rollback Protocol**: Maintaining ConoHa server subscription for 30 days post-migration to enable 5-minute A-record rollback if required.

---

## 10. Sprint 5: UI, Brand Identity & Real-Time Auth Synchronization (UI/ブランド統一と認証連動)

### 10.1 Key Discussions & Design Rationale
* **Anti-Plagiarism Brand Mandate**:
  - **Problem**: Earlier iterations experimented with Google's 4-color pattern (blue, red, yellow, green) for text logos.
  - **Resolution & Decision**: Explicitly forbidden to copy external service brand styling. Replaced with `DESIGN.md`'s official `Seikai` (星海) theme gradient (`#2fd9f4` via `#38BDF8` to `#818CF8`).
* **Streamlit-Style Collapsible Sidebar (`Sidebar.tsx`)**:
  - Created a collapsible slide-over drawer triggered by a `[menu]` (≡) button at top-left.
  - Cleanly centralizes navigation links (Home, Catalog, Threads, All Articles, Sign in) and eliminates redundant UI buttons from the 3D HUD.
* **UI decluttering**:
  - Removed Captain route, Stratification/Depth bottom panels, and all emojis (`📡`, `🍻`, `👤`, `🚀`, `🌌`, `👨‍✈️`, `✦`, `⏱️`, `🤖`) across 12+ files for a clean, minimalist aesthetic.

### 10.2 Firebase Auth & App Check Debugging Log
* **Symptom**: Popup opened and user selected Google Account, but original window did not transition state or show any logs/errors.
* **Root Cause Investigation**:
  1. `signInWithPopup(auth, googleProvider)` promise hung indefinitely because `initializeAppCheck` was invoked with an unconfigured or dummy reCAPTCHA site key.
  2. Firebase Auth SDK silently waits for App Check tokens when initialized, resulting in unresolved promises.
  3. Browser popup blockers occasionally blocked popup windows (`auth/popup-blocked`).
* **Fix & Architecture Solution**:
  - Guarded `initializeAppCheck` so it only initializes when a valid production reCAPTCHA key is present.
  - Added automatic fallback to `signInWithRedirect` upon `auth/popup-blocked`.
  - Decoupled `setUser` state update from Firestore `syncUserProfile` so UI updates instantly even if Firestore operations experience latency.

### 10.3 Real-Time Firestore Data Sync
* **Read Article History (`readHistory`)**:
  - Integrated `markArticleAsRead(uid, slug)` in `[slug].astro` script, utilizing Firestore `arrayUnion` to add viewed slugs to user profile.
* **Stardust Bookmarks (`stardustBookmarks`)**:
  - Added "星屑の栞に保存" toggle button on `ArticleNavigator.tsx`, executing `toggleStardustBookmark` to update Firestore `stardustBookmarks`.
  - Cleaned all hardcoded initial dummy arrays (`['post-131', 'post-135']`), establishing a 100% clean user-specific history.

### 10.4 Missing Article Body Fix (`contentMd` Mapping Bug)
* **Symptom**: On `/articles/[slug]`, header titles and Munchkin Navigator guides rendered, but the primary Markdown article body text was missing.
* **Root Cause**: `src/lib/firebase-server.ts` `getArticles()` mapped Firestore doc fields into an article object but omitted `contentMd` (or `content`). `[slug].astro` received `undefined` for `article.contentMd`.
* **Fix**: Updated `getArticles()` to map `contentMd: data.contentMd || data.content || ''`. Verified full HTML generation across all 28 articles in `dist/client/articles/*/index.html`.

## Section 11: Firebase AI Logic, App Check & Multi-Device Thread Sync

### 11.1 Firebase AI Logic & @google/genai SDK Integration
* **Model Migration**: Deprecated models (`gemini-1.5-flash`, `gemini-2.5-flash`) returned `404 NOT_FOUND`. Migrated to official `@google/genai` (Google Gen AI SDK) using current `gemini-3.5-flash`.
* **Google Search Grounding**: Enabled `tools: [{ googleSearch: {} }]` for real-time web-enhanced AI responses.
* **Module Architecture (`src/lib/ai-logic.ts`)**: Centralized AI Logic functions (`generateArticleStepUpGuide`, `askArticleAI`, `generateStellarChatAI`).

### 11.2 App Check & Multi-Device Threads Sync
* **reCAPTCHA Enterprise**: Applied production key (`6LfdWbQsAAAAAGht9Q4Os6xikVRfFBhL8I3GZaBn`) and `window.useEnterprise = true`.
* **Firestore Security Rules**: Configured `threads` collection read/write rules, allowing seamless cross-device synchronization between Mac and mobile browsers.
