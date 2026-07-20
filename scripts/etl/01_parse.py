# -*- coding: utf-8 -*-
"""
scripts/etl/01_parse.py
WordPress XML (WXR) をパースし、Gutenberg ブロックを Markdown/Astro タグへコンパイルして中間 JSON を出力するスクリプト。
"""

import os
import re
import json
import yaml
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from markdownify import markdownify as md

# 1. 各種定数と名前空間の定義
WXR_FILE_PATH = "data/geodyssai.WordPress.2026-07-19.xml"
TAXONOMY_FILE_PATH = "scripts/etl/config/taxonomy.yaml"
OUTPUT_JSON_PATH = "data/parsed_articles.json"
REVIEW_LIST_PATH = "docs/review-list.md"

NAMESPACES = {
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'wp': 'http://wordpress.org/export/1.2/',
    'dc': 'http://purl.org/dc/elements/1.1/'
}

# 2. ブロックパース用正規表現の定義
# Gutenberg ブロックの開始・終了タグを抽出するための正規表現
# 開始タグ: <!-- wp:block-name {"attr": "val"} -->
BLOCK_START_RE = re.compile(r'<!--\s+(wp:[\w/-]+)(?:\s+(\{.*?\}))?\s*(?:/)?-->')
BLOCK_END_RE = re.compile(r'<!--\s+/(wp:[\w/-]+)\s*-->')

def load_taxonomy() -> dict:
    """taxonomy.yaml から星座タクソノミ設定を読み込む"""
    with open(TAXONOMY_FILE_PATH, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config.get("constellations", {})

def classify_constellation(title: str, content: str, categories: list, tags: list, taxonomy: dict) -> str:
    """記事のタイトル、本文、タグ等から、最も合致する星座 ID を自動分類する"""
    # もし既存のカテゴリ名がタクソノミ定義と部分一致していればそれを優先
    for cat in categories:
        cat_lower = cat.lower()
        if "genai" in cat_lower or "generative" in cat_lower:
            return "genai-foundations"
        if "agent" in cat_lower:
            return "ai-agents"
        if "firebase" in cat_lower or "gcp" in cat_lower:
            return "firebase-cloud"
        if "claude" in cat_lower:
            return "claude"
        if "deep learning" in cat_lower or "deeplearning" in cat_lower:
            return "deep-learning"
        if "logical" in cat_lower or "thinking" in cat_lower:
            return "logical-thinking"
        if "design" in cat_lower or "tool" in cat_lower:
            return "design-tools"

    # キーワードマッチングによる自動分類
    text_to_search = f"{title} {content} {' '.join(tags)}".lower()
    score = {cid: 0 for cid in taxonomy.keys()}

    for cid, info in taxonomy.items():
        keywords = info.get("keywords", [])
        for kw in keywords:
            # 大文字小文字を区別せず出現回数をカウント
            score[cid] += text_to_search.count(kw.lower())

    # 最多得点の星座を選択。同点の場合はデフォルト値にする
    best_cid = max(score, key=score.get)
    if score[best_cid] > 0:
        return best_cid
    
    return "genai-foundations"  # デフォルト分類

def parse_gutenberg_blocks(html_content: str) -> list:
    """Gutenberg ブロックコメントを解析し、ネスト対応の構造化ブロックリストを返す"""
    tokens = []
    last_idx = 0
    # 開始・終了タグの全出現位置をスキャン
    positions = []
    for m in BLOCK_START_RE.finditer(html_content):
        positions.append(('start', m.start(), m.end(), m.group(1), m.group(2)))
    for m in BLOCK_END_RE.finditer(html_content):
        positions.append(('end', m.start(), m.end(), m.group(1), None))
    
    # 位置順にソート
    positions.sort(key=lambda x: x[1])

    # スタックを用いたネストブロックの解析
    stack = []
    root_blocks = []
    cursor = 0

    for pos_type, start, end, block_name, attrs_json in positions:
        # タグの前の地の文（非ブロックHTML）を保存
        if cursor < start and not stack:
            raw_text = html_content[cursor:start].strip()
            if raw_text:
                root_blocks.append({
                    'type': 'raw',
                    'content': raw_text,
                    'children': []
                })
        
        if pos_type == 'start':
            # 属性 JSON のパース
            attrs = {}
            if attrs_json:
                try:
                    attrs = json.loads(attrs_json)
                except Exception:
                    pass
            
            block_node = {
                'type': block_name,
                'attrs': attrs,
                'start_pos': end,
                'children': []
            }
            if stack:
                stack[-1]['children'].append(block_node)
            else:
                root_blocks.append(block_node)
            stack.append(block_node)
        elif pos_type == 'end':
            if stack and stack[-1]['type'] == block_name:
                closed_block = stack.pop()
                closed_block['content'] = html_content[closed_block['start_pos']:start]
                del closed_block['start_pos']
            
        cursor = end

    # 残りの末尾のテキストを格納
    if cursor < len(html_content) and not stack:
        raw_text = html_content[cursor:].strip()
        if raw_text:
            root_blocks.append({
                'type': 'raw',
                'content': raw_text,
                'children': []
            })
            
    return root_blocks

def convert_block_to_markdown(block: dict, review_items: list, title: str) -> str:
    """解析された構造化ブロックを対応する Markdown / Astro コンポーネント文字列に変換する"""
    b_type = block.get('type')
    
    # 1. 地の文 (raw text) または標準段落 (wp:paragraph)
    if b_type in ['raw', 'wp:paragraph']:
        raw_html = block.get('content', '')
        # HTML 属性のクレンジングを行い、markdownify で変換
        cleaned_md = md(raw_html).strip()
        return cleaned_md + "\n\n"

    # 2. 見出し (wp:heading)
    elif b_type == 'wp:heading':
        attrs = block.get('attrs', {})
        level = attrs.get('level', 2)  # デフォルトは H2
        raw_html = block.get('content', '')
        # テキスト部分のみを抽出
        soup = BeautifulSoup(raw_html, "lxml")
        text = soup.get_text().strip()
        return f"{'#' * level} {text}\n\n"

    # 3. 箇条書きリスト (wp:list)
    elif b_type == 'wp:list':
        # 箇条書き内部の子ブロック (wp:list-item) を処理
        list_md = ""
        attrs = block.get('attrs', {})
        ordered = attrs.get('ordered', False)
        
        idx = 1
        for child in block.get('children', []):
            if child.get('type') == 'wp:list-item':
                item_content = md(child.get('content', '')).strip()
                prefix = f"{idx}. " if ordered else "- "
                list_md += f"{prefix}{item_content}\n"
                idx += 1
        return list_md + "\n"

    # 4. 画像 (wp:image)
    elif b_type == 'wp:image':
        raw_html = block.get('content', '')
        soup = BeautifulSoup(raw_html, "lxml")
        img_tag = soup.find('img')
        if img_tag:
            src = img_tag.get('src', '')
            alt = img_tag.get('alt', '')
            # 画像再ホストは移行後のバックログとするため、元の URL を維持
            return f"![{alt}]({src})\n\n"
        return ""

    # 4.5 引用 (wp:quote)
    elif b_type == 'wp:quote':
        inner_md = ""
        for child in block.get('children', []):
            inner_md += convert_block_to_markdown(child, review_items, title)
        quoted_lines = [f"> {line}" for line in inner_md.strip().split("\n")]
        return "\n".join(quoted_lines) + "\n\n"

    # 4.6 区切り線 (wp:separator)
    elif b_type == 'wp:separator':
        return "---\n\n"

    # 5. コードブロック (wp:code / wp:loos-hcb/code-block)
    elif b_type in ['wp:code', 'wp:loos-hcb/code-block']:
        attrs = block.get('attrs', {})
        lang = attrs.get('language', 'text') # デフォルトは text
        raw_html = block.get('content', '')
        # <code> タグの内容を抽出
        soup = BeautifulSoup(raw_html, "lxml")
        code_tag = soup.find('code')
        code_content = code_tag.get_text() if code_tag else raw_html
        return f"```{lang}\n{code_content.strip()}\n```\n\n"

    # 6. コクーンの吹き出しブロック (wp:cocoon-blocks/balloon-ex-box-1) -> MunchkinSpeech
    elif b_type == 'wp:cocoon-blocks/balloon-ex-box-1':
        attrs = block.get('attrs', {})
        name = attrs.get('name', 'マンチカン')
        # icon 指定がない場合は default-avatar などのフォールバック
        icon = attrs.get('icon', 'cat')
        
        # 内包する子ブロックの markdown を再帰的にコンパイル
        inner_md = ""
        for child in block.get('children', []):
            inner_md += convert_block_to_markdown(child, review_items, title)
        
        return f'<MunchkinSpeech name="{name}" icon="{icon}">\n{inner_md.strip()}\n</MunchkinSpeech>\n\n'

    # 7. コクーンの枠囲みボックス系 -> InfoBox
    elif b_type in [
        'wp:cocoon-blocks/blank-box-1',
        'wp:cocoon-blocks/info-box',
        'wp:cocoon-blocks/icon-box',
        'wp:cocoon-blocks/sticky-box'
    ]:
        # 種類のマッピング
        kind_map = {
            'wp:cocoon-blocks/blank-box-1': 'blank',
            'wp:cocoon-blocks/info-box': 'info',
            'wp:cocoon-blocks/icon-box': 'icon',
            'wp:cocoon-blocks/sticky-box': 'sticky'
        }
        kind = kind_map.get(b_type, 'info')
        
        inner_md = ""
        for child in block.get('children', []):
            inner_md += convert_block_to_markdown(child, review_items, title)
            
        return f'<InfoBox kind="{kind}">\n{inner_md.strip()}\n</InfoBox>\n\n'

    # 8. コクーンのタブボックス (wp:cocoon-blocks/tab-box-1) -> 平坦化 (そのまま中身を展開)
    elif b_type == 'wp:cocoon-blocks/tab-box-1':
        inner_md = ""
        for child in block.get('children', []):
            inner_md += convert_block_to_markdown(child, review_items, title)
        return inner_md

    # 9. その他の未対応ブロック (wp:html やショートコード等) -> docs/review-list.md に出力しつつ保全
    else:
        raw_content = block.get('content', '')
        # 地の文などの空要素は無視
        if not raw_content.strip():
            return ""
        
        # レビューが必要な項目として記録
        review_items.append({
            'title': title,
            'block_type': b_type,
            'content': raw_content.strip()
        })
        # 安全のため、HTML / ショートコードのまま Markdown に埋め込む
        return f"\n{raw_content.strip()}\n\n"

def parse_wxr_xml() -> list:
    """WordPress WXR XML を読み込んでパースし、クレンジングされた記事データのリストを生成する"""
    tree = ET.parse(WXR_FILE_PATH)
    root = tree.getroot()
    taxonomy = load_taxonomy()

    parsed_articles = []
    review_items = []

    # XML 内の各 <item> を走査
    for item in root.findall('.//item'):
        post_type = item.find('wp:post_type', NAMESPACES).text
        # 'post' (投稿記事) のみに対象を限定
        if post_type != 'post':
            continue

        title = item.find('title').text or "無題"
        post_id = item.find('wp:post_id', NAMESPACES).text
        slug = item.find('wp:post_name', NAMESPACES).text
        
        # スラッグが空の場合は post_id で代替
        if not slug:
            slug = f"post-{post_id}"

        status = item.find('wp:status', NAMESPACES).text
        content_html = item.find('content:encoded', NAMESPACES).text or ""
        excerpt = item.find('excerpt:encoded', NAMESPACES).text or ""
        
        # 日付データのパース
        published_at = item.find('wp:post_date_gmt', NAMESPACES).text
        if not published_at or published_at == '0000-00-00 00:00:00':
            published_at = item.find('wp:post_date', NAMESPACES).text
            
        updated_at = published_at  # 初期は同じ値に設定

        # カテゴリおよびタグの取得
        categories = []
        tags = []
        for cat_elem in item.findall('category'):
            domain = cat_elem.get('domain')
            nicename = cat_elem.get('nicename')
            if domain == 'category':
                categories.append(cat_elem.text)
            elif domain == 'post_tag':
                tags.append(cat_elem.text)

        # Gutenberg ブロック構造の解析
        blocks = parse_gutenberg_blocks(content_html)
        
        # 各ブロックを Markdown 化
        content_md = ""
        for block in blocks:
            content_md += convert_block_to_markdown(block, review_items, title)

        # 自動分類の適用
        assigned_category = classify_constellation(title, content_html, categories, tags, taxonomy)

        # アイキャッチ画像のデフォルト (あとで Firestore 側で必要なら補完)
        hero_image = ""

        # 推定読了時間の計算 (日本語 400文字/分 として算出)
        char_count = len(content_md)
        reading_time = max(1, round(char_count / 400))

        # 中間 JSON 用のオブジェクト
        article_data = {
            'id': post_id,
            'title': title,
            'slug': slug,
            'status': status,
            'contentMd': content_md.strip(),
            'excerpt': excerpt[:120].strip() or content_md[:120].replace("\n", " ").strip(),
            'category': assigned_category,
            'tags': tags,
            'publishedAt': published_at,
            'updatedAt': updated_at,
            'heroImage': hero_image,
            'readingTime': reading_time,
            'sourceUrl': f"https://www.geodyssai.com/{slug}"
        }
        parsed_articles.append(article_data)

    # 4. docs/review-list.md の書き出し
    write_review_list(review_items)

    return parsed_articles

def write_review_list(review_items: list):
    """手動変換が必要なショートコード等の項目をレビューリストに出力する"""
    report = "# WordPress Migration Review List\n\n"
    report += "以下の要素は自動パースできなかったため、移行後に手動で置換または修正が必要です。\n\n"
    report += "| 記事タイトル | ブロックタイプ | 内容 (HTML) |\n"
    report += "| :--- | :--- | :--- |\n"
    
    for item in review_items:
        escaped_content = item['content'].replace("\n", " ").replace("|", "\\|")
        report += f"| {item['title']} | `{item['block_type']}` | `{escaped_content}` |\n"
        
    with open(REVIEW_LIST_PATH, "w", encoding="utf-8") as f:
        f.write(report)

def main():
    print("Parsing WXR XML...")
    articles = parse_wxr_xml()
    
    # データの保存
    os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully parsed {len(articles)} articles.")
    print(f"Intermediate JSON saved to {OUTPUT_JSON_PATH}")
    print(f"Review list outputted to {REVIEW_LIST_PATH}")

if __name__ == "__main__":
    main()

# ==========================================
# 【意図】
# WordPressのWXRファイル内に埋め込まれたGutenbergブロック形式のHTMLコメントを、
# 高性能な字句解析（スタックマシン）によって構造化ブロックへ変換し、Astro向けカスタムコンポーネント（MunchkinSpeech等）を
# 含むマークダウン文字列として再生成することで、Headless環境へのデータ移行を自動化します。
# 
# 【学習ポイント】
# 1. 構造化パース: Gutenbergのようなコメントでネストされたマークアップは、単純な正規表現置換では崩れやすいため、
#    開始・終了タグの位置をソートした上でスタック（Stack）を用いて構文解析（AST化）することが、崩れのない安全なパースの鍵です。
# 2. 自動分類 (Taxonomy Classifier): 未分類記事（Uncategorized）に対して、`taxonomy.yaml`のキーワード出現頻度を
#    スコアリング計算することで、カテゴリ分けの自動マッピングを実現しています。
#
# 【ステップアップ WEB リンク】
# - WordPress WXR Schema: https://codex.wordpress.org/Theme_Unit_Test
# - BeautifulSoup4 Documentation: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
# ==========================================
