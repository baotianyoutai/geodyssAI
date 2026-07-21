# -*- coding: utf-8 -*-
"""
scripts/generate_tokens.py
DESIGN.md の Frontmatter からデザイントークンを抽出し、
Tailwind v4 互換の @theme 定義を含む CSS トークンファイル (src/styles/tokens.css) を自動生成するスクリプト。
"""

import os
import yaml

# 1. パスの設定
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESIGN_MD_PATH = os.path.join(BASE_DIR, "DESIGN.md")
TOKENS_CSS_PATH = os.path.join(BASE_DIR, "src/styles/tokens.css")

def parse_frontmatter(file_path: str) -> dict:
    """Markdown ファイルの Frontmatter (YAML部分) を抽出して辞書として返す"""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 最初の '---' と二番目の '---' の間を切り出す
    parts = content.split("---")
    if len(parts) >= 3:
        yaml_content = parts[1]
        try:
            return yaml.safe_load(yaml_content) or {}
        except Exception as e:
            print(f"Error parsing YAML frontmatter: {e}")
    return {}

def main():
    if not os.path.exists(DESIGN_MD_PATH):
        print(f"Error: DESIGN.md not found at {DESIGN_MD_PATH}")
        return

    print("Parsing DESIGN.md frontmatter...")
    design_data = parse_frontmatter(DESIGN_MD_PATH)
    if not design_data:
        print("Error: No frontmatter found or empty in DESIGN.md")
        return

    colors = design_data.get("colors", {})
    rounded = design_data.get("rounded", {})
    spacing = design_data.get("spacing", {})
    
    # 2. CSS トークンの生成開始
    # Tailwind v4 の @theme ディレクティブを使用して変数をマッピングします
    css_content = """/*
 * src/styles/tokens.css
 * DESIGN.md の Frontmatter から自動生成されたデザイントークンです。
 * 手動で編集しないでください。
 */

@theme {
"""

    # ① カラーパレットのマッピング
    css_content += "  /* --- Colors (M3 Roles & Constellations) --- */\n"
    for name, value in colors.items():
        css_content += f"  --color-{name}: {value};\n"

    # ② AGENT.md §2.4 に基づく欠落トークンの補完
    css_content += "\n  /* --- Missing Constellations & Custom tokens (AGENT.md §2.4) --- */\n"
    css_content += "  --color-current: #3B82F6;\n"
    css_content += "  --color-const-genai: #3B82F6;\n"
    css_content += "  --color-const-agents: #10B981;\n"
    css_content += "  --color-const-logic: #F59E0B;\n"
    css_content += "  --color-const-design: #EC4899;\n"
    css_content += "  --color-surface-glass: rgba(14, 20, 22, 0.75);\n"
    
    # ③ 角丸（Rounded / Border Radius）のマッピング
    css_content += "\n  /* --- Border Radius --- */\n"
    for name, value in rounded.items():
        key_name = "default" if name == "DEFAULT" else name
        css_content += f"  --radius-{key_name}: {value};\n"

    # ④ レイアウト用余白（Spacing / Margin / Gutter）のマッピング
    css_content += "\n  /* --- Spacing --- */\n"
    for name, value in spacing.items():
        css_content += f"  --spacing-{name}: {value};\n"

    # ⑤ フォントファミリーのマッピング
    css_content += "\n  /* --- Font Family --- */\n"
    css_content += '  --font-display: "Space Grotesk", "sans-serif";\n'
    css_content += '  --font-body: "Inter", "sans-serif";\n'
    css_content += '  --font-code: "JetBrains Mono", "monospace";\n'
    
    css_content += "}\n\n"

    # ⑥ @theme 定義外の非標準・カスタムCSS変数の定義 (例: オーロラグラデーションやグラスモーフィズム)
    css_content += """/* --- Custom Visual Utilities --- */
:root {
  --aurora: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%);
  --glow-starlight: drop-shadow(0 0 8px rgba(237, 242, 251, 0.8));
  --backdrop-glass: blur(12px) saturate(180%);
}
"""

    # ⑦ CSS ファイルへの書き出し
    os.makedirs(os.path.dirname(TOKENS_CSS_PATH), exist_ok=True)
    with open(TOKENS_CSS_PATH, "w", encoding="utf-8") as f:
        f.write(css_content)

    print(f"Successfully generated CSS tokens at {TOKENS_CSS_PATH}")

if __name__ == "__main__":
    main()

# ==========================================
# 【意図】
# デザイン仕様のSSOTである DESIGN.md のフロントマターを読み取り、
# Tailwind v4 のネイティブCSSテーマ定義（@theme）に準拠した CSS 変数ファイル（tokens.css）を自動構築します。
# これにより、手作業での値の二重定義や入力ミス（タイポ）を完全に排除します。
# 
# 【学習ポイント】
# 1. Tailwind v4 @theme: 従来の tailwind.config.js に代わり、
#    CSSの `@theme` ディレクティブを用いることで、ビルドエンジン（Vite）が変数を自動検出し、
#    `bg-surface-dim` や `text-primary` といったクラスユーティリティを自動で生成する最新の仕様です。
# 2. 自動コード生成 (Codegen): 設計書（DESIGN.md）を入力としてプログラムコードを自動生成する手法は、
#    一貫性を担保する仕様駆動開発（SDD）の基本的なプラクティスです。
#
# 【ステップアップ WEB リンク】
# - Tailwind CSS v4 Theme Configuration: https://tailwindcss.com/docs/theme
# - PyYAML Documentation: https://pyyaml.org/wiki/PyYAMLDocumentation
# ==========================================
