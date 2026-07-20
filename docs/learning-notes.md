# learning-notes.md - Phase 1 & Sprint 1 (ETL) 開発ログ ＆ ラーニングノート

This document details all the commands, logs, errors, and learning points encountered during Phase 1: Foundation and Sprint 1: Data Voyage (ETL) of the **geodyssAI** project. It is structured for step-by-step reproduction and learning.

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

### Explanations:
- `data/`: Holds the WordPress WXR XML export data (`geodyssai.WordPress.2026-07-19.xml`).
- `public/assets/`: Holds static image assets like `cat.jpg` (mascot image) for Astro.
- `scripts/etl/config/`: Configuration folder for the ETL scripts.
- `docs/`: Verification reports and architectural decisions.

---

## 2. Taxonomy & Configuration (Phase 1) - タクソノミ設定の作成

We created the taxonomy configuration file:
- **File Created**: [taxonomy.yaml](file:///Users/tokitayuta/geodyssAI/scripts/etl/config/taxonomy.yaml)
- **Purpose**: Defines the 7 categories (constellations), their colors, labels, and keywords for text embedding classification.

---

## 3. Python Virtual Environment & dependencies (Phase 1) - 仮想環境の作成とライブラリインストール

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

## 4. Google Cloud & Vertex AI Configuration (Phase 1) - API ＆ IAM 権限の有効化

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

## 5. Preflight Verification Report (Phase 1) - 疎通テスト

We ran the verification check script to ensure Vertex AI API, Firestore API connectivity, and all package imports are working:
```bash
.venv/bin/python scripts/preflight_check.py
```

- **Output**: [preflight-report.md](file:///Users/tokitayuta/geodyssAI/docs/preflight-report.md) showing `Overall result: SUCCESS`.

---

## 6. Git & GitHub Initial Setup (Phase 1) - Git ＆ GitHub の初期設定

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

## 7. Sprint 1: Data Voyage (ETL Pipeline) - WXRデータ移行

We implemented a 4-step Python ETL pipeline to parse WordPress XML, calculate Vertex AI embeddings, map 3D coordinates, and batch stage them to Cloud Firestore.

### 7.1 Step 1: WXR XML Parsing and Markdown Compilation (01_parse.py)
* **Script**: [01_parse.py](file:///Users/tokitayuta/geodyssAI/scripts/etl/01_parse.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/etl/01_parse.py
  ```
* **What it does**: 
  - Parses `data/geodyssai.WordPress.2026-07-19.xml` using `lxml` and a stack-based parser to identify nested Gutenberg blocks.
  - Converts WordPress blocks (`wp:paragraph`, `wp:heading`, `wp:list`, `wp:image`, `wp:quote`, `wp:separator`) to Markdown.
  - Maps custom Cocoon blocks (`balloon-ex-box-1`, `info-box`, `blank-box-1`) to Astro components (`<MunchkinSpeech>` / `<InfoBox>`).
  - Automatically classifies taxonomy categories using keywords matching in [taxonomy.yaml](file:///Users/tokitayuta/geodyssAI/scripts/etl/config/taxonomy.yaml).
  - Logs unhandled elements (like embedded HTML scripts or custom tables) to [docs/review-list.md](file:///Users/tokitayuta/geodyssAI/docs/review-list.md).

### 7.2 Step 2: Generating Text Embeddings via Vertex AI (02_embed.py)
* **Script**: [02_embed.py](file:///Users/tokitayuta/geodyssAI/scripts/etl/02_embed.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/etl/02_embed.py
  ```
* **What it does**:
  - Connects to Google Cloud Vertex AI using the `google-genai` SDK.
  - Uses the latest `text-embedding-005` model to generate 768-dimensional embeddings for each article (using combined Title + Body).
  - Employs MD5 hashes (`contentHash`) of `contentMd` to perform delta updates (saving API costs and ensuring idempotency).

#### 💡 Troubleshooting GCP Project Billing Error
* **Error**: Calling the Vertex AI embedding API returned a `403 PERMISSION_DENIED: Billing not enabled on project iconic-episode-492109-n5`.
* **Cause**: The `google-genai` SDK was falling back to the shell's active default project (`iconic-episode-492109-n5`) instead of loading `VERTEX_AI_PROJECT` from our local `.env`.
* **Fix**: Force `os.environ["GOOGLE_CLOUD_PROJECT"] = os.environ["VERTEX_AI_PROJECT"]` in the Python script. Additionally, specified the absolute path `/Users/tokitayuta/geodyssAI/.env` in `load_dotenv()` to ensure environmental variables load reliably regardless of task execution directories.

### 7.3 Step 3: 3D Coordinate Mapping (UMAP) & Z-Depth Offset (03_neighbors_umap.py)
* **Script**: [03_neighbors_umap.py](file:///Users/tokitayuta/geodyssAI/scripts/etl/03_neighbors_umap.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/etl/03_neighbors_umap.py
  ```
* **What it does**:
  - Computes high-dimensional cosine similarity to identify the top 3 closest neighboring posts (for visual "constellation lines").
  - Runs UMAP (`n_components=3, metric='cosine', random_state=42`) to reduce the 768-dimensional embeddings to 3D coordinates.
  - Centers and normalizes coordinates to fit inside a sphere of maximum radius $R=12$.
  - Evaluates the article difficulty (1 to 5) using Gemini 2.5 Flash (`gemini-2.5-flash`), allowing manual upper override via [difficulty_overrides.yaml](file:///Users/tokitayuta/geodyssAI/scripts/etl/config/difficulty_overrides.yaml).
  - Shifts `pos.z` based on difficulty (`pos.z = pos.z - (difficulty - 3) * 1.5`), pushing advanced posts deeper into the "abyss."

### 7.4 Step 4: Staged Upload to Cloud Firestore (04_upload.py)
* **Script**: [04_upload.py](file:///Users/tokitayuta/geodyssAI/scripts/etl/04_upload.py)
* **Command**:
  ```bash
  .venv/bin/python scripts/etl/04_upload.py
  ```
* **What it does**:
  - Initializes the Firebase Admin SDK using `serviceAccount.json`.
  - Uses `db.batch()` to write all 28 articles to the `articles` collection atomically and idempotently.

#### 💡 Troubleshooting Database Creation & APIs
When executing the upload for the first time, we encountered two errors:
1. **Firestore API Disabled**: Enabled via `gcloud services enable firestore.googleapis.com --project=my-geodyssai-pro-1744456051163`.
2. **(default) Database Not Found**: Firestore API was active but the `(default)` database instance had not been created. We initialized it in Native mode located in Tokyo:
   ```bash
   gcloud firestore databases create --location=asia-northeast1 --type=firestore-native --project=my-geodyssai-pro-1744456051163
   ```
   Rerunning the upload script successfully completed the synchronization of all 28 articles.

---

## 8. Step-Up References (ステップアップのための参考資料 ＆ 公式ドキュメントリンク)

* **Google Cloud SDK CLI コマンドリファレンス**:
  - API の有効化 (`gcloud services`): https://cloud.google.com/sdk/gcloud/reference/services/enable
  - IAM 権限の操作 (`gcloud projects add-iam-policy-binding`): https://cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding
  - Firestore データベースの作成 (`gcloud firestore databases create`): https://cloud.google.com/sdk/gcloud/reference/firestore/databases/create
* **Vertex AI (Google GenAI) Python SDK**:
  - Python での Vertex AI クライアント初期化ガイド: https://cloud.google.com/vertex-ai/docs/generative-ai/start/quickstart-multimodal
  - 利用可能な Vertex AI モデルのロケーション一覧: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations
* **Firebase Admin SDK**:
  - Python Firebase Admin SDK 導入ガイド: https://firebase.google.com/docs/admin/setup?hl=ja
  - Firestore バッチ書き込み: https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
* **Python uv ツール公式ガイド**:
  - 仮想環境の作成と管理: https://docs.astral.sh/uv/concepts/environments/
* **Git 除外設定 (.gitignore) 公式ドキュメント**:
  - ファイルや機密情報の除外パターン記述方法: https://git-scm.com/docs/gitignore
* **UMAP次元削減アルゴリズム**:
  - UMAP パラメータ調整ガイド: https://umap-learn.readthedocs.io/en/latest/parameters.html
* **Gutenberg ブロックエディタの仕組み**:
  - WordPress ブロックデータ構造ガイド: https://developer.wordpress.org/block-editor/explanations/architecture/key-concepts/
