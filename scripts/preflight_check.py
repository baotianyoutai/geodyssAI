# -*- coding: utf-8 -*-
"""
scripts/preflight_check.py
geodyssAI の前提環境およびファイルの充足度を検証する事前検査スクリプト。
"""

import os
import sys
import yaml

# 1. 依存ライブラリのインポートテスト
try:
    import dotenv
    # .env ファイルの読み込み
    dotenv.load_dotenv()
except ImportError:
    print("Error: python-dotenv がインストールされていません。")
    sys.exit(1)

# 必要なライブラリの確認用辞書
REQUIRED_PACKAGES = {
    "google.generativeai": "google-generativeai",
    "google.genai": "google-genai",
    "firebase_admin": "firebase-admin",
    "umap": "umap-learn",
    "sklearn": "scikit-learn",
    "lxml": "lxml",
    "markdownify": "markdownify",
    "yaml": "pyyaml"
}

def check_imports():
    """必要なパッケージが正しくインポートできるか確認する"""
    results = {}
    for module_name, package_name in REQUIRED_PACKAGES.items():
        try:
            __import__(module_name)
            results[package_name] = True
        except ImportError:
            results[package_name] = False
    return results

def check_files():
    """必要な必須ファイルの存在を確認する"""
    target_files = [
        "data/geodyssai.WordPress.2026-07-19.xml",
        "public/assets/cat.jpg",
        "AGENT.md",
        "DESIGN.md",
        "KICKOFF.md",
        "scripts/etl/config/taxonomy.yaml"
    ]
    results = {}
    for f in target_files:
        results[f] = os.path.exists(f)
    return results

def check_env():
    """環境変数および接続性の検証"""
    results = {
        "GEMINI_API_KEY": False,
        "GOOGLE_APPLICATION_CREDENTIALS": False,
        "CREDENTIALS_FILE_EXISTS": False,
        "VERTEX_AI_MODE": False,
        "FIREBASE_WEB_CONFIG": False,
        "AI_CONNECTIVITY": False,
        "FIREBASE_CONNECTIVITY": False
    }

    # API キー等の取得
    gemini_key = os.getenv("GEMINI_API_KEY")
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    # Vertex AI 用設定の取得
    vertex_project = os.getenv("VERTEX_AI_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT")
    vertex_location = os.getenv("VERTEX_AI_LOCATION") or os.getenv("GOOGLE_CLOUD_REGION") or "us-central1"

    # キーの存在確認
    if gemini_key:
        results["GEMINI_API_KEY"] = True
    if creds_path:
        results["GOOGLE_APPLICATION_CREDENTIALS"] = True
        if os.path.exists(creds_path):
            results["CREDENTIALS_FILE_EXISTS"] = True

    if vertex_project:
        results["VERTEX_AI_MODE"] = True

    # Web SDK 用設定の簡易存在確認 (代表して PROJECT_ID)
    if os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID") or os.getenv("FIREBASE_PROJECT_ID"):
        results["FIREBASE_WEB_CONFIG"] = True

    # AI 疎通テスト (Vertex AI もしくは Gemini API)
    if results["VERTEX_AI_MODE"] and results["CREDENTIALS_FILE_EXISTS"]:
        # Vertex AI モードでの接続検証
        print(f"Vertex AI モードで接続検証を実行します (Project: {vertex_project}, Location: {vertex_location})...")
        try:
            from google import genai
            # Vertex AI クライアントの初期化 (credentials は環境変数 GOOGLE_APPLICATION_CREDENTIALS から自動ロードされます)
            client = genai.Client(vertexai=True, project=vertex_project, location=vertex_location)
            # 最も軽量なモデルで検証
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents="Ping"
            )
            if response.text:
                results["AI_CONNECTIVITY"] = True
                print("Vertex AI 接続疎通確認に成功しました。")
        except Exception as e:
            print(f"Vertex AI 接続エラー: {e}")
    elif results["GEMINI_API_KEY"]:
        # 通常の Gemini API (AI Studio) 接続検証
        print("Google AI Studio (Gemini API) モードで接続検証を実行します...")
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents="Ping"
            )
            if response.text:
                results["AI_CONNECTIVITY"] = True
                print("Gemini API (AI Studio) 接続疎通確認に成功しました。")
        except Exception as e:
            print(f"Gemini API 接続エラー: {e}")

    # Firebase Admin SDK 疎通テスト
    if results["CREDENTIALS_FILE_EXISTS"]:
        try:
            import firebase_admin
            from firebase_admin import credentials
            from firebase_admin import firestore

            if not firebase_admin._apps:
                cred = credentials.Certificate(creds_path)
                firebase_admin.initialize_app(cred)
            
            db = firestore.client()
            db.collections()
            results["FIREBASE_CONNECTIVITY"] = True
        except Exception as e:
            print(f"Firebase Admin 疎通エラー: {e}")

    return results

def main():
    print("=== geodyssAI Preflight Check ===")
    
    # 1. 依存ライブラリのチェック
    print("Checking dependencies...")
    imports = check_imports()
    for pkg, ok in imports.items():
        status = "OK" if ok else "FAILED"
        print(f"  - {pkg}: {status}")

    # 2. ファイル存在チェック
    print("Checking required files...")
    files = check_files()
    for f, ok in files.items():
        status = "OK" if ok else "FAILED"
        print(f"  - {f}: {status}")

    # 3. 環境変数と接続チェック
    print("Checking env & credentials...")
    env_results = check_env()
    for key, ok in env_results.items():
        status = "OK" if ok else "FAILED"
        print(f"  - {key}: {status}")

    # 4. レポートファイルの書き出し
    print("Writing report to docs/preflight-report.md...")
    
    report_content = f"""# Preflight Report

Preflight check executed to verify environment and file structure readiness.

## 1. Package Dependency Checklist

| Package | Status |
| :--- | :--- |
"""
    for pkg, ok in imports.items():
        status = "✅ OK" if ok else "❌ MISSING"
        report_content += f"| {pkg} | {status} |\n"

    report_content += """
## 2. Required Files Checklist

| File Path | Status |
| :--- | :--- |
"""
    for f, ok in files.items():
        status = "✅ OK" if ok else "❌ MISSING"
        report_content += f"| `{f}` | {status} |\n"

    report_content += """
## 3. Environment & Connectivity Checklist

| Check Point | Status | Description |
| :--- | :--- | :--- |
"""
    check_descriptions = {
        "GEMINI_API_KEY": "Presence of Gemini API key in .env (For Google AI Studio)",
        "GOOGLE_APPLICATION_CREDENTIALS": "Presence of Google Application Credentials path in .env",
        "CREDENTIALS_FILE_EXISTS": "Existence of the service account JSON file",
        "VERTEX_AI_MODE": "Vertex AI mode active (VERTEX_AI_PROJECT is configured)",
        "FIREBASE_WEB_CONFIG": "Presence of Firebase Web SDK Config key in .env",
        "AI_CONNECTIVITY": "Successful ping to Gemini AI / Vertex AI API",
        "FIREBASE_CONNECTIVITY": "Successful connection to Google Cloud Firestore"
    }
    for key, ok in env_results.items():
        status = "✅ OK" if ok else "❌ FAILED"
        desc = check_descriptions.get(key, "")
        report_content += f"| {key} | {status} | {desc} |\n"

    # 総合判定
    # 接続要件: AI_CONNECTIVITY と FIREBASE_CONNECTIVITY は必須。
    # 認証手段: GEMINI_API_KEY もしくは (VERTEX_AI_MODE かつ CREDENTIALS_FILE_EXISTS) のいずれかが有効であること。
    ai_ok = env_results["AI_CONNECTIVITY"]
    firebase_ok = env_results["FIREBASE_CONNECTIVITY"]
    
    all_ok = all(imports.values()) and all(files.values()) and ai_ok and firebase_ok
    overall_status = "SUCCESS" if all_ok else "WARNING/FAILED"
    
    report_content += f"\n## 4. Overall Judgment\n\n**Result**: {overall_status}\n"
    if not all_ok:
        report_content += "\n> [!WARNING]\n> Some checks have failed. Please review the checklist above and fix the environment before running the main ETL scripts.\n"
    else:
        report_content += "\n> [!NOTE]\n> All checks passed successfully. Ready to start Sprint 1 ETL processes.\n"

    # レポート保存
    os.makedirs("docs", exist_ok=True)
    with open("docs/preflight-report.md", "w", encoding="utf-8") as f:
        f.write(report_content)

    print(f"Preflight Check finished. Overall result: {overall_status}")
    if not all_ok:
        sys.exit(1)

if __name__ == "__main__":
    main()

# ==========================================
# 【意図】
# AI Studio(Gemini API Key) に加え、Google Cloud Vertex AI 接続モードをサポートし、
# ユーザーが指定する環境下での AI API 通信可否を同一のスクリプトで事前検証できるように機能拡張しました。
# 
# 【学習ポイント】
# 1. マルチプラットフォーム対応: 新しい `google-genai` SDK は `vertexai=True` オプションを渡すことで、
#    AI Studio 向けと同一のシンプルな Client API で Google Cloud Vertex AI にアクセス可能です。
# 2. 認証情報の優先制御: Vertex AI モード時は `GOOGLE_APPLICATION_CREDENTIALS` を自動読込するため、
#    事前にサービスアカウント JSON の物理存在を確認しています。
#
# 【ステップアップ WEB リンク】
# - Vertex AI Client Library (google-genai): https://github.com/google/generative-ai-python
# - Vertex AI Authentication: https://cloud.google.com/vertex-ai/docs/authentication
# ==========================================
