# -*- coding: utf-8 -*-
"""
scripts/etl/04_upload.py
最終処理された3D座標・難易度・近傍リストを含む全記事データを Firebase Admin SDK を用いて
Cloud Firestore の 'articles' コレクションへアップロード（冪等同期）するスクリプト。
"""

import os
import json
from dotenv import load_dotenv

# 1. パスの解決と環境変数の読み込み
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))  # geodyssAI ルート
load_dotenv(os.path.join(BASE_DIR, ".env"))

# サービスアカウント鍵の絶対パスを設定
if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    cred_path = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
    if not os.path.isabs(cred_path):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(os.path.join(BASE_DIR, cred_path))

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# 2. 定数の定義
INPUT_JSON_PATH = os.path.join(BASE_DIR, "data/coordinate_articles.json")

def main():
    if not os.path.exists(INPUT_JSON_PATH):
        print(f"Error: Coordinate data file not found at {INPUT_JSON_PATH}")
        print("Please run scripts/etl/03_neighbors_umap.py first.")
        return

    with open(INPUT_JSON_PATH, "r", encoding="utf-8") as f:
        articles = json.load(f)

    # 3. Firebase Admin SDK の初期化
    cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not cred_path:
        print("Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.")
        return
    
    print(f"Initializing Firebase Admin SDK using: {cred_path}")
    try:
        cred = credentials.Certificate(cred_path)
        # 二重初期化防止
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        return

    # 4. Firestore へのバッチ同期処理
    print(f"Syncing {len(articles)} articles to Firestore...")
    
    # Firestore には 500 件制限の write_batch がありますが、28件のため
    # 逐次処理またはバッチ処理のどちらでも高速に同期可能です。
    # 冪等性を確保するため、slug をドキュメント ID（キー）として同期します。
    batch = db.batch()
    
    for idx, art in enumerate(articles):
        slug = art['slug']
        doc_ref = db.collection('articles').document(slug)
        
        # doc_ref に対する書き込み操作をバッチに格納
        batch.set(doc_ref, art)
        print(f"[{idx+1}/{len(articles)}] Staged upload for: {slug}")

    try:
        # 一括コミット（アトミックな書き込み）
        batch.commit()
        print("\nSuccessfully uploaded all articles to Cloud Firestore!")
        print("Firestore path: my-geodyssai-pro-1744456051163 / databases / (default) / documents / articles")
    except Exception as e:
        print(f"Error committing batch upload to Firestore: {e}")

if __name__ == "__main__":
    main()

# ==========================================
# 【意図】
# 計算・クレンジング処理を終えた中間データ（3D座標、難易度、近傍 Slug）を、
# Firebase Admin SDK を用いてアトミックかつ冪等に Cloud Firestore 上へ同期・アップロードします。
# 記事の slug をドキュメント ID とすることで、再実行時でもデータが重複せず、常に最新状態に上書きされる冪等性を確保しています。
# 
# 【学習ポイント】
# 1. 冪等なデータ同期 (Idempotent Sync): ドキュメントIDをFirestoreの自動生成IDにせず、
#    記事固有の `slug` に設定することで、何度スクリプトを再実行してもレコードが二重に作られない安全なETL設計になります。
# 2. ライトバッチ (Write Batch): 複数のドキュメント書き込みをアトミック（一括で成功か失敗か）に実行する仕組み。
#    ネットワーク往復時間を削減し、Firestore の利用料金や負荷も低く抑えることができます。
#
# 【ステップアップ WEB リンク】
# - Firebase Admin SDK for Python: https://firebase.google.com/docs/admin/setup?hl=ja
# - Firestore Write Batches: https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
# ==========================================
