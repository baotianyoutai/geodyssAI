# learning-notes.md - Phase 1: Foundation 開発ログ ＆ ラーニングノート

This document details all the commands, logs, errors, and learning points encountered during Phase 1: Foundation of the **geodyssAI** project. It is structured for step-by-step reproduction.

---

## 1. Directory Structure Setup (フォルダ構成の構築)

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

## 2. Taxonomy & Configuration (タクソノミ設定の作成)

We created the taxonomy configuration file:
- **File Created**: [taxonomy.yaml](file:///Users/tokitayuta/geodyssAI/scripts/etl/config/taxonomy.yaml)
- **Purpose**: Defines the 7 categories (constellations), their colors, labels, and keywords for text embedding classification.

---

## 3. Python Virtual Environment Setup (Python 仮想環境の作成とライブラリインストール)

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

## 4. Google Cloud & Vertex AI Configuration (Google Cloud API および IAM 権限の有効化)

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

## 5. Preflight Verification Report (疎通テスト)

We ran the verification check script:
```bash
.venv/bin/python scripts/preflight_check.py
```

- **Output**: [preflight-report.md](file:///Users/tokitayuta/geodyssAI/docs/preflight-report.md) showing `Overall result: SUCCESS`.

---

## 6. Git & GitHub Initial Setup (Git ＆ GitHub の初期設定)

We initialized Git, added `.gitignore` to prevent secret leaks, and linked our local repo to a new GitHub repo.

### Commands Executed:
```bash
# 1. Link remote
git remote add origin https://github.com/baotianyoutai/geodyssAI.git

# 2. Checkout branch
git checkout -b phase/1-foundation

# 3. Commit files
git add .
git commit -m "chore(phase1): initialize foundation skeleton and preflight report"
```

---

## 7. Step-Up References (ステップアップのための参考資料 ＆ 公式ドキュメントリンク)

* **Google Cloud SDK CLI コマンドリファレンス**:
  - API の有効化 (`gcloud services`): https://cloud.google.com/sdk/gcloud/reference/services/enable
  - IAM 権限の操作 (`gcloud projects add-iam-policy-binding`): https://cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding
* **Vertex AI (Google GenAI) Python SDK**:
  - Python での Vertex AI クライアント初期化ガイド: https://cloud.google.com/vertex-ai/docs/generative-ai/start/quickstart-multimodal
  - 利用可能な Vertex AI モデルのロケーション一覧: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations
* **Python uv ツール公式ガイド**:
  - 仮想環境の作成と管理: https://docs.astral.sh/uv/concepts/environments/
* **Git 除外設定 (.gitignore) 公式ドキュメント**:
  - ファイルや機密情報の除外パターン記述方法: https://git-scm.com/docs/gitignore
