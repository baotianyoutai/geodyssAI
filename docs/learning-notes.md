# learning-notes.md - Phase 1, Sprint 1, ＆ Sprint 2 開発ログ ＆ ラーニングノート

This document details all the commands, logs, errors, and learning points encountered during Phase 1: Foundation, Sprint 1: Data Voyage (ETL), and Sprint 2: Visual Voyage (星海図3D UIの構築) of the **geodyssAI** project. It is structured for step-by-step reproduction and learning.

---

## 1. Directory Structure Setup (Phase 1) - フォルダ構成の構築

We created the target directory skeleton and moved files into their corresponding folders.

### Commands Executed:
```bash
# 1. Create skeletal folders
mkdir -p data docs logs scripts/etl/config public/assets

# 2. Move source assets
mv geodyssai.WordPress.2026-07-19.xml data/geodyssai.WordPress.2026-07-19.xml
mv cat.jpg public/assets/cat.jpg
```

---

## 2. Python Virtual Environment & dependencies (Phase 1) - 仮想環境の作成とライブラリインストール

We used `uv` to build the Python virtual environment and install packages.

### Commands Executed:
```bash
# 1. Initialize virtual environment
uv venv

# 2. Install dependencies
uv pip install google-generativeai google-genai firebase-admin umap-learn scikit-learn lxml markdownify python-dotenv pyyaml
```

### 💡 Learning Point: Sourcing the Activation Script
To activate the virtual environment on macOS/Linux shell:
- **Correct**: `source .venv/bin/activate` (loads environment variables into the current terminal session).
- **Incorrect**: `.venv/bin/activate` directly (throws "Permission denied" or "is a directory" because it is a shell script, not an executable binary).

---

## 3. Google Cloud & Vertex AI Configuration (Phase 1) - API ＆ IAM 権限の有効化

Since we are utilizing Google Cloud Vertex AI for text embeddings and chat in the ETL, we enabled the required APIs and roles.

### Commands Executed:
```bash
# 1. Enable Vertex AI Agent Platform API
gcloud services enable aiplatform.googleapis.com --project=my-geodyssai-pro-1744456051163

# 2. Grant Vertex AI Admin role to the Service Account
gcloud projects add-iam-policy-binding my-geodyssai-pro-1744456051163 \
  --member="serviceAccount:firebase-adminsdk-fbsvc@my-geodyssai-pro-1744456051163.iam.gserviceaccount.com" \
  --role="roles/aiplatform.admin"
```

### 💡 Troubleshooting Vertex AI Connection:
1. **IAM Propagation Delay**: After binding IAM policies via `gcloud`, Google Cloud can take 1-2 minutes to propagate permissions. Early checks will return `403 PERMISSION_DENIED`. Waiting 2 minutes solves this.
2. **Model Name Availability**: Attempting to use `gemini-1.5-flash` in this project region resulted in a `404 NOT_FOUND` error. Running a listing script revealed `gemini-2.5-flash` is active. We updated the connection test to use `gemini-2.5-flash`.
3. **Region Selection**: Changed testing location to `asia-northeast1` (Tokyo) for low latency, which successfully passed connectivity tests.

---

## 4. Preflight Verification Report (Phase 1) - 疎通テスト

We ran the verification check script to ensure Vertex AI API, Firestore API connectivity, and all package imports are working:
```bash
.venv/bin/python scripts/preflight_check.py
```

- **Output**: [preflight-report.md](file:///Users/tokitayuta/geodyssAI/docs/preflight-report.md) showing `Overall result: SUCCESS`.

---

## 5. Git & GitHub Initial Setup (Phase 1) - Git ＆ GitHub の初期設定

We initialized Git, added `.gitignore` to prevent secret leaks, and linked our local repo to a new GitHub repo.

### Commands Executed:
```bash
# 1. Link remote
git remote add origin https://github.com/baotianyoutai/geodyssAI.git

# 2. Configure Token URL for automated pushes
git remote set-url origin https://github_pat_<TOKEN>@github.com/baotianyoutai/geodyssAI.git

# 3. Checkout main branch and commit baseline
git checkout -b main
git add .
git commit -m "chore(phase1): initialize foundation skeleton and preflight report"
git push origin main
```

---

## 6. Sprint 1: Data Voyage (ETL Pipeline) - WXRデータ移行

We implemented a 4-step Python ETL pipeline to parse WordPress XML, calculate Vertex AI embeddings, map 3D coordinates, and batch stage them to Cloud Firestore.

### 6.1 Step 1: WXR XML Parsing and Markdown Compilation (01_parse.py)
* **Script**: [01_parse.py](file:///Users/tokitayuta/geodyssAI/scripts/etl/01_parse.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/etl/01_parse.py
  ```

### 6.2 Step 2: Generating Text Embeddings via Vertex AI (02_embed.py)
* **Script**: [02_embed.py](file:///Users/tokitayuta/geodyssAI/scripts/etl/02_embed.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/etl/02_embed.py
  ```

#### 💡 Troubleshooting GCP Project Billing Error
* **Error**: Calling the Vertex AI embedding API returned a `403 PERMISSION_DENIED: Billing not enabled on project iconic-episode-492109-n5`.
* **Cause**: The `google-genai` SDK was falling back to the shell's active default project (`iconic-episode-492109-n5`) instead of loading `VERTEX_AI_PROJECT` from our local `.env`.
* **Fix**: Force `os.environ["GOOGLE_CLOUD_PROJECT"] = os.environ["VERTEX_AI_PROJECT"]` in the Python script. Additionally, specified the absolute path `/Users/tokitayuta/geodyssAI/.env` in `load_dotenv()` to ensure environmental variables load reliably regardless of task execution directories.

### 6.3 Step 3: 3D Coordinate Mapping (UMAP) & Z-Depth Offset (03_neighbors_umap.py)
* **Script**: [03_neighbors_umap.py](file:///Users/tokitayuta/geodyssAI/scripts/etl/03_neighbors_umap.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/etl/03_neighbors_umap.py
  ```

### 6.4 Step 4: Staged Upload to Cloud Firestore (04_upload.py)
* **Script**: [04_upload.py](file:///Users/tokitayuta/geodyssAI/scripts/etl/04_upload.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/etl/04_upload.py
  ```

#### 💡 Troubleshooting Database Creation & APIs
When executing the upload for the first time, we encountered two errors:
1. **Firestore API Disabled**: Enabled via `gcloud services enable firestore.googleapis.com --project=my-geodyssai-pro-1744456051163`.
2. **(default) Database Not Found**: Firestore API was active but the `(default)` database instance had not been created. We initialized it in Native mode located in Tokyo:
   ```bash
   gcloud firestore databases create --location=asia-northeast1 --type=firestore-native --project=my-geodyssai-pro-1744456051163
   ```
   Rerunning the upload script successfully completed the synchronization of all 28 articles.

---

## 7. Sprint 2: Visual Voyage (星海図3D UIの構築) - フロントエンド構築

We initialized the Astro framework, automated design tokens conversion, and built the interactive 3D constellation map alongside readable article pages.

### 7.1 Initialization & Package Integrations (プロジェクト初期化 ＆ パッケージ導入)
We initialized Astro and installed packages:
```bash
# 1. Setup Astro
npx create-astro@latest tmp-astro --template minimal --install --no-git --yes --skip-houston
# (Move files to root)

# 2. Add React & Tailwind CSS
npx astro add react -y
npx astro add tailwind -y

# 3. Add WebGL & Shaders (R3F)
npm install three @types/three @react-three/fiber @react-three/drei @react-three/postprocessing --legacy-peer-deps

# 4. Add Firestore NodeJS Client & Markdown Compilers
npm install firebase-admin marked @types/marked
```

### 7.2 Design Tokens Automation (generate_tokens.py) - デザイントークン自動変換
* **Script**: [generate_tokens.py](file:///Users/tokitayuta/geodyssAI/scripts/generate_tokens.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/generate_tokens.py
  ```
* **What it does**: 
  - Extracts the branding colors and sizes from [DESIGN.md](file:///Users/tokitayuta/geodyssAI/DESIGN.md) frontmatter.
  - Automatically compiles them to `src/styles/tokens.css` inside a Tailwind CSS v4 `@theme` block.
  - Keeps design styling tokens strictly in sync with the design guidelines SSOT.

### 7.3 Interactive 3D Stellar Chart (StellarCanvas.tsx / StellarChart.tsx) - 3D星海図マップ
* **Component Canvas**: [StellarCanvas.tsx](file:///Users/tokitayuta/geodyssAI/src/components/StellarCanvas.tsx)
* **Component 3D nodes**: [StellarChart.tsx](file:///Users/tokitayuta/geodyssAI/src/components/StellarChart.tsx)
* **Nebula Shader**: [NebulaShader.ts](file:///Users/tokitayuta/geodyssAI/src/components/NebulaShader.ts)
* **Features**:
  - Volumetric noise Nebula background rendered in GLSL.
  - Twinkling stars sized by reading time, with color maps matching category constellations.
  - **Constellation Lines**: Uses Prim's algorithm on the server to draw a Minimum Spanning Tree connecting all stars in the same constellation.
  - **Threads of Light**: Draws bright lines connecting hovered stars to their 3 similar neighbor stars.
  - **Mist Effect**: Animates rotating particles around unpublished draft posts.
  - **Performance Fallback**: Automatically disables `@react-three/postprocessing` Bloom on mobile devices and low-resolution screen indicators.

### 7.4 Dynamic Article Layout (Lighthouse Pages) - 記事詳細ページ
* **Page Route**: [src/pages/articles/[slug].astro](file:///Users/tokitayuta/geodyssAI/src/pages/articles/%5Bslug%5D.astro)
* **Features**:
  - Compiles content using the `marked` library at build time.
  - Utilizes a server-side segment splitter to identify custom tags and binds them to native Astro components: `<MunchkinSpeech>` and `<InfoBox>`.
  - Sidebar dynamically renders linked neighbor cards using "threads of light" connections.

#### 💡 Troubleshooting URL Encoded Slugs in Astro
* **Error**: Build failed during generation with `NoMatchingStaticPathFound` for Japanese slugs.
* **Cause**: Japanese article slugs (like `gemini-api...ハンズオン`) are urlencoded (`%e3%81%a8...`) in Firestore, but Astro matches static paths against fully decoded URLs.
* **Fix**: Applied `decodeURIComponent(art.slug)` in `getStaticPaths()` of `[slug].astro` and all navigation links to guarantee route matching.

---

## 8. Step-Up References (ステップアップのための参考資料 ＆ 公式ドキュメントリンク)

* **Astro & React Integration**:
  - Astro client directive documentation: https://docs.astro.build/en/reference/directives-reference/#client-directives
* **Tailwind CSS v4 Configuration**:
  - Styling theme extensions in Tailwind v4: https://tailwindcss.com/docs/theme
* **React Three Fiber & Drei**:
  - Getting started with 3D canvas on React: https://r3f.docs.pmnd.rs/getting-started/introduction
  - Post-processing effects (Bloom): https://r3f.docs.pmnd.rs/advanced/post-processing
* **WebGL GLSL Shaders**:
  - Volumetric Fractal Brownian Motion: https://thebookofshaders.com/13/
* **Google Cloud SDK CLI**:
  - API の有効化 (`gcloud services`): https://cloud.google.com/sdk/gcloud/reference/services/enable
  - IAM 権限の操作 (`gcloud projects add-iam-policy-binding`): https://cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding
  - Firestore データベースの作成 (`gcloud firestore databases create`): https://cloud.google.com/sdk/gcloud/reference/firestore/databases/create

---

## 9. Phase 4: Production Deployment & DNS Migration (本番公開 ＆ DNS移行)

### 9.1 Astro Build & Firebase Deploy Verification
* **Commands Executed**:
  ```bash
  npm run build
  npx -p firebase-tools firebase deploy --only hosting
  ```
* **Dist Architecture Breakdown**:
  - **`dist/client`**: Static pre-rendered HTML files (`/index.html`, `/articles/*/index.html`, `/captain/index.html`), bundled JavaScript (`_astro/`), CSS, and media assets served directly via Firebase Hosting CDN.
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

