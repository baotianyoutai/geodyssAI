# -*- coding: utf-8 -*-
"""
scripts/etl/03_neighbors_umap.py
高次元の埋め込みベクトルからコサイン類似度で近傍上位3記事（光の糸）を計算し、
UMAPを用いて3次元座標に圧縮した上で、Geminiによる難易度算出をベースにZ軸（深度）オフセットを適用するスクリプト。
"""

import os
import json
import yaml
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import umap
from dotenv import load_dotenv

# 1. パスの解決と環境変数の読み込み
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))  # geodyssAI ルート
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Google SDK の初期化設定
if os.environ.get("VERTEX_AI_PROJECT"):
    os.environ["GOOGLE_CLOUD_PROJECT"] = os.environ["VERTEX_AI_PROJECT"]

if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    cred_path = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
    if not os.path.isabs(cred_path):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(os.path.join(BASE_DIR, cred_path))

from google import genai
from google.genai import types

# 2. 定数の定義
INPUT_JSON_PATH = os.path.join(BASE_DIR, "data/embedded_articles.json")
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, "data/coordinate_articles.json")
OVERRIDES_YAML_PATH = os.path.join(BASE_DIR, "scripts/etl/config/difficulty_overrides.yaml")
GEMINI_MODEL = "gemini-2.5-flash"  # 難易度判定に用いる軽量・高速モデル

def load_difficulty_overrides() -> dict:
    """難易度の上書き設定 YAML をロードする"""
    if os.path.exists(OVERRIDES_YAML_PATH):
        with open(OVERRIDES_YAML_PATH, "r", encoding="utf-8") as f:
            try:
                overrides = yaml.safe_load(f)
                return overrides or {}
            except Exception as e:
                print(f"Warning: Failed to load overrides YAML: {e}")
    return {}

def classify_difficulty_with_gemini(client: genai.Client, title: str, content_md: str) -> int:
    """Gemini API に記事情報を渡し、難易度（1〜5）を判定させる"""
    # 冒頭部分と見出しのみを抽出してトークン消費を抑制
    headings = re.findall(r'^#+\s+.*$', content_md, re.MULTILINE)
    first_lines = "\n".join(content_md.split("\n")[:10])
    summary_for_eval = f"Title: {title}\n\nFirst Paragraph:\n{first_lines}\n\nHeadings:\n" + "\n".join(headings)

    prompt = f"""
You are an expert system that classifies the technical difficulty level of technical articles on a scale of 1 to 5.
Evaluate the required prior knowledge or expertise level for the reader.

Classification Rules:
1: Introduction / Basic concepts (requires no prior knowledge, e.g. hello world, beginner guides, conceptual overviews)
2: Fundamentals / Practical tutorials (shows how to write code for basic tools, setup guides)
3: Intermediate (requires solid basic understanding of AI / Python, handles basic RAG, simple embedding workflows)
4: Advanced (complex systems, agents orchestration, vector search quality, mathematical optimization)
5: Abyss / Deep expert level (highly specialized, deep research papers, mathematical proofs, complex system architectures)

Target Article to Evaluate:
{summary_for_eval}

Respond with ONLY a single integer between 1 and 5. Do not include any other text or reasoning.
"""
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,  # 決定論的な結果を得るために極めて低い値に設定
            )
        )
        result_text = response.text.strip()
        # 数字のみを抽出
        match = re.search(r'\b([1-5])\b', result_text)
        if match:
            return int(match.group(1))
    except Exception as e:
        print(f"Warning: Gemini difficulty classification failed: {e}")
    
    return 3  # デフォルト難易度

def main():
    if not os.path.exists(INPUT_JSON_PATH):
        print(f"Error: Input file not found at {INPUT_JSON_PATH}")
        return

    with open(INPUT_JSON_PATH, "r", encoding="utf-8") as f:
        articles = json.load(f)

    # 1. 高次元空間での近傍（neighbors）上位 3 件の計算
    print("Calculating nearest neighbors in high-dimensional space...")
    embeddings = []
    for art in articles:
        embeddings.append(art['embedding'])
    
    embeddings_matrix = np.array(embeddings)
    # 記事間のコサイン類似度行列を計算 (形状: N x N)
    sim_matrix = cosine_similarity(embeddings_matrix)

    for i, art in enumerate(articles):
        # 自分自身を除外した類似度のインデックスを降順で取得
        sim_scores = sim_matrix[i]
        sorted_indices = np.argsort(sim_scores)[::-1]
        
        neighbors = []
        for idx in sorted_indices:
            if idx == i:
                continue
            neighbors.append(articles[idx]['slug'])
            if len(neighbors) == 3:  # 上位 3 件
                break
        art['neighbors'] = neighbors

    # 2. UMAP による3次元圧縮
    print("Running UMAP dimensionality reduction to 3D...")
    # n_components=3, metric='cosine', random_state=42 のパラメータを厳守
    reducer = umap.UMAP(
        n_components=3,
        metric='cosine',
        random_state=42,
        n_neighbors=min(15, len(articles) - 1)  # 記事数が少ない場合は自動調整
    )
    
    coords = reducer.fit_transform(embeddings_matrix)

    # 3. 半径 R=12 の球に正規化
    # 座標の重心を原点に移動
    coords = coords - coords.mean(axis=0)
    # 原点からの最大L2ノルム（距離）を計算
    max_dist = np.max(np.linalg.norm(coords, axis=1))
    if max_dist > 0:
        # すべての座標をスケールして最大半径12に正規化
        coords = coords * (12.0 / max_dist)

    # 4. 難易度の算出とZ軸オフセットの適用
    client = genai.Client(
        vertexai=True,
        project=os.environ.get("VERTEX_AI_PROJECT"),
        location=os.environ.get("VERTEX_AI_LOCATION", "asia-northeast1")
    )

    overrides = load_difficulty_overrides()
    
    # 手動オーバーライドの初期ファイルが無い場合はプレースホルダー作成
    if not overrides:
        os.makedirs(os.path.dirname(OVERRIDES_YAML_PATH), exist_ok=True)
        with open(OVERRIDES_YAML_PATH, "w", encoding="utf-8") as f:
            yaml.dump({"post-example-slug": 3}, f)

    coordinate_articles = []
    
    print("Determining article difficulty levels...")
    for i, art in enumerate(articles):
        slug = art['slug']
        
        # 難易度決定プロセスの優先順位: 1. YAML上書き 2. 既存データ再利用 3. Gemini判定
        if slug in overrides:
            difficulty = overrides[slug]
            print(f"[{i+1}/{len(articles)}] Difficulty for {slug}: {difficulty} (YAML Override)")
        elif 'difficulty' in art:
            difficulty = art['difficulty']
            print(f"[{i+1}/{len(articles)}] Difficulty for {slug}: {difficulty} (Reused)")
        else:
            # 新規判定
            difficulty = classify_difficulty_with_gemini(client, art['title'], art['contentMd'])
            print(f"[{i+1}/{len(articles)}] Difficulty for {slug}: {difficulty} (Gemini Classified)")

        art['difficulty'] = difficulty

        # 3D座標値の取得
        x = float(coords[i][0])
        y = float(coords[i][1])
        z = float(coords[i][2])

        # 深度オフセットの適用: pos.z = pos.z - (difficulty - 3) * 1.5
        # 難易度が高い（深層）ほど、Zのマイナス方向（深海アビス）へ潜っていく
        shifted_z = z - (difficulty - 3) * 1.5
        
        # 3D座標オブジェクトの設定
        art['pos'] = {
            'x': x,
            'y': y,
            'z': shifted_z
        }
        
        # 不要になった高次元埋め込みベクトルは中間JSONの軽量化のために削除
        if 'embedding' in art:
            del art['embedding']

        coordinate_articles.append(art)

    # 5. 保存
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(coordinate_articles, f, ensure_ascii=False, indent=2)

    print(f"Successfully processed {len(coordinate_articles)} articles with 3D coordinates.")
    print(f"Coordinates saved to {OUTPUT_JSON_PATH}")

if __name__ == "__main__":
    import re
    main()

# ==========================================
# 【意図】
# 高次元の埋め込み空間から「コサイン類似度」を用いて近傍上位3記事を特定し、
# UMAPアルゴリズムによって人間が視覚的に認識できる3次元空間にマッピングします。
# さらに技術難易度（Gemini判定 / YAML上書き）に基づいてZ座標をアビス（深海）方向へ潜航オフセットさせることで、
# 宇宙と深海を融合した「星海」の3D探索UI（Astroフロントエンド）の座標データを構築します。
# 
# 【学習ポイント】
# 1. 類似度の空間: UMAPでの次元圧縮はトポロジー（空間構造）を保持しますが、細かい幾何学的距離は歪みます。
#    よって、近傍計算（neighbors）は必ず圧縮前の高次元（768次元）で行うことが実務上の鉄則です。
# 2. アビス深度設計: `pos.z` の算出式 `z - (difficulty - 3) * 1.5` により、
#    難易度（1〜5）が「深さ」と完全に連動し、データ構造がそのまま演出体験へブリッジされています。
#
# 【ステップアップ WEB リンク】
# - UMAP Mathematical Foundations: https://arxiv.org/abs/1802.03426
# - sklearn.metrics.pairwise.cosine_similarity: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html
# ==========================================
