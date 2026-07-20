# -*- coding: utf-8 -*-
"""
scripts/etl/02_embed.py
各記事の Markdown 本文から Vertex AI を用いて埋め込み（Embedding）ベクトルを生成し、中間データとして保存するスクリプト。
"""

import os
import json
import hashlib
from dotenv import load_dotenv

# 1. パスの解決と環境変数の読み込み
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))  # geodyssAI ルート
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Google SDK が利用する GCP プロジェクト ID を明示的に設定
if os.environ.get("VERTEX_AI_PROJECT"):
    os.environ["GOOGLE_CLOUD_PROJECT"] = os.environ["VERTEX_AI_PROJECT"]

# サービスアカウント鍵の絶対パスを設定して認証を通す
if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    # 相対パスの場合はベースディレクトリからの絶対パスに変換
    cred_path = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
    if not os.path.isabs(cred_path):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(os.path.join(BASE_DIR, cred_path))

from google import genai
from google.genai import types

# 2. 定数の定義
INPUT_JSON_PATH = os.path.join(BASE_DIR, "data/parsed_articles.json")
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, "data/embedded_articles.json")
EMBEDDING_MODEL = "text-embedding-005"  # 最新の最高性能埋め込みモデル

def get_content_hash(text: str) -> str:
    """コンテンツの MD5 ハッシュ値を生成して冪等性を担保する"""
    return hashlib.md5(text.encode("utf-8")).hexdigest()

def main():
    # 入力ファイルの存在確認
    if not os.path.exists(INPUT_JSON_PATH):
        print(f"Error: Input file not found at {INPUT_JSON_PATH}")
        return

    # パース済み記事データの読み込み
    with open(INPUT_JSON_PATH, "r", encoding="utf-8") as f:
        articles = json.load(f)

    # 既存の埋め込みデータをロードして差分更新（コスト削減と冪等性の確保）
    existing_data = {}
    if os.path.exists(OUTPUT_JSON_PATH):
        try:
            with open(OUTPUT_JSON_PATH, "r", encoding="utf-8") as f:
                for art in json.load(f):
                    existing_data[art['slug']] = art
            print(f"Loaded {len(existing_data)} existing embedded articles for delta update.")
        except Exception as e:
            print(f"Warning: Failed to load existing embedded articles: {e}")

    # Vertex AI クライアントの初期化
    client = genai.Client(
        vertexai=True,
        project=os.environ.get("VERTEX_AI_PROJECT"),
        location=os.environ.get("VERTEX_AI_LOCATION", "asia-northeast1")
    )

    embedded_articles = []
    updated_count = 0

    print("Generating embeddings using Vertex AI...")
    for idx, art in enumerate(articles):
        slug = art['slug']
        content_md = art['contentMd']
        current_hash = get_content_hash(content_md)

        # すでに同じハッシュ値の埋め込みデータが存在する場合は再計算をスキップ
        if slug in existing_data and existing_data[slug].get('contentHash') == current_hash and 'embedding' in existing_data[slug]:
            print(f"[{idx+1}/{len(articles)}] Skipping {slug} (Content unchanged)")
            # 既存の埋め込みデータを再利用
            art['embedding'] = existing_data[slug]['embedding']
            art['contentHash'] = current_hash
            art['embeddingModel'] = EMBEDDING_MODEL
            embedded_articles.append(art)
            continue

        print(f"[{idx+1}/{len(articles)}] Computing embedding for {slug}...")
        # 埋め込み入力テキストの作成 (タイトル + 本文を組み合わせることで文脈の精度向上)
        text_to_embed = f"Title: {art['title']}\n\nContent:\n{content_md}"

        try:
            # Vertex AI の Embed Content API を呼び出し
            response = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=text_to_embed
            )
            # レスポンスからベクトル値（768次元のfloat配列）を取得
            vector = response.embeddings[0].values
            
            art['embedding'] = vector
            art['contentHash'] = current_hash
            art['embeddingModel'] = EMBEDDING_MODEL
            
            updated_count += 1
        except Exception as e:
            print(f"Error computing embedding for {slug}: {e}")
            # エラーの場合は空の配列を入れてスキップ
            art['embedding'] = []
            art['contentHash'] = ""
            art['embeddingModel'] = ""

        embedded_articles.append(art)

    # 埋め込み結果の保存
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(embedded_articles, f, ensure_ascii=False, indent=2)

    print(f"Successfully processed {len(embedded_articles)} articles.")
    print(f"Updated embeddings count: {updated_count}")
    print(f"Embedded data saved to {OUTPUT_JSON_PATH}")

if __name__ == "__main__":
    main()

# ==========================================
# 【意図】
# 各記事の本文とタイトルから、Vertex AIの最新テキスト埋め込みモデル（text-embedding-005）を用いて、
# 意味的特徴を表す768次元の多次元ベクトルを算出します。
# コスト管理のためにMD5ハッシュを用いた差分更新（冪等性）の仕組みを組み込み、無駄なAPI呼び出しを削減しています。
# 
# 【学習ポイント】
# 1. テキスト埋め込み (Text Embeddings): テキストを数値ベクトル空間にマッピングする手法。
#    これにより、単なるキーワードの一致度ではなく、文章の「意味の近さ（類似度）」で記事を検索・レコメンドすることが可能になります。
# 2. 冪等性とコストガード: 記事のハッシュ値（MD5）をキャッシュとして保持し、変更があった記事のみを埋め込む設計は、
#    本番運用のAPI課金を最小限に抑えるための必須のベストプラクティスです。
#
# 【ステップアップ WEB リンク】
# - Vertex AI Embed Content API Guide: https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-text-embeddings
# - Keep a Changelog Standard: https://keepachangelog.com/en/1.1.0/
# ==========================================
