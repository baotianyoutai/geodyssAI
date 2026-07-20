# KICKOFF.md — geodyssAI 仕様駆動開発 着手ガイド

> **読む人**: オーナー（Yuta）本人。初回着手時の手引き書。
> **原則**: 「人間が作るのは仕様の器だけ、コードの器はエージェントに作らせる」
> **参照**: DESIGN.md（Stitch 用）/ AGENT.md（Antigravity 用）/ この KICKOFF.md（着手手順）
> **最終更新**: 2026-07-19

---

## 全体像（3 分で把握する）

```
Phase 0  環境準備          Firebase / API キー / ツール   ← 手作業（半日）
Phase 1  リポジトリ骨格    フォルダ + 仕様コミット        ← 手作業（30 分）
Phase 2  2 レーン並行着手  Stitch (デザイン) ‖ Antigravity (Sprint 1 ETL)
Phase 3  Sprint 2〜4       連携ループ                     ← エージェント主体
Phase 4  本番切替          Firebase Hosting → DNS 切替    ← 最終人間判断
```

**SDD のリズム（Sprint 2 以降は毎回これを繰り返す）**

```
Stitch でデザイン確定
  ↓
Antigravity: Stitch MCP で取得 → DESIGN.md 差分更新（コードはまだ書かない）
  ↓
オーナーが差分を承認
  ↓
Antigravity: 実装（§8 教育規約: 逐行コメント + 3 点セット）
  ↓
オーナーがレビュー → DoD チェック → 次の Sprint へ
```

---

## Phase 0: 環境準備（手作業）

### 0-1. Firebase プロジェクト

| 手順 | 操作 |
|---|---|
| 1 | Firebase Console → 新規プロジェクト「geodyssai」作成 |
| 2 | Firestore Database → **ネイティブモード** / リージョン `asia-northeast1`（東京）で有効化 |
| 3 | Authentication → ログイン方法 → **Google プロバイダ** ON |
| 4 | Project Settings → マイアプリ → Web アプリ追加「geodyssai-web」→ **SDK config を控える**（`.env` 行き）|
| 5 | AI Logic（Vertex AI in Firebase）→ 有効化。同画面で Gemini モデルの利用規約に同意 |
| 6 | App Check は **Sprint 4 の直前**に設定（reCAPTCHA Enterprise）。今は不要 |

> 📝 **学習ポイント**: `asia-northeast1` を選ぶのは「読者が日本人中心 → レイテンシ最小化」のため。
> Firestore の「ネイティブモード」と「データストアモード」は後から変更不可なので要注意。
> → 参考: https://firebase.google.com/docs/firestore/manage-data/enable-offline

### 0-2. 取得する鍵 2 種類

```
① Gemini API キー
   Google AI Studio → 「Get API Key」→ コピー
   用途: ETL スクリプト（Embedding + Embedding コスト追跡）

② Firebase サービスアカウント鍵 JSON
   Firebase Console → Project Settings → サービス アカウント
   → 「新しい秘密鍵を生成」→ JSON をダウンロード
   用途: ETL スクリプトが Firestore に書き込む（Admin SDK）
```

> ⚠️ **どちらも `.env` 管理・コミット禁止**。GitHub に上げたら即失効 + 請求リスク。

### 0-3. ローカル環境

```bash
# Node.js（LTS）
node --version   # v20 系以上であれば OK

# Python 3.11
python3 --version

# Git
git --version

# Python 仮想環境（ETL 用）
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install google-generativeai firebase-admin umap-learn scikit-learn \
            lxml markdownify python-dotenv
```

> 📝 **学習ポイント**: 仮想環境（venv）はプロジェクトごとにライブラリを隔離する仕組み。
> `pip install` をグローバルに打ち続けると依存関係が衝突しやすい。
> → 参考: https://docs.python.org/ja/3/library/venv.html

### 0-4. Stitch

1. https://stitch.withgoogle.com/ にアクセス → Google アカウントでログイン
2. 「New Project」→ 名前「geodyssAI」で作成
3. プロンプト入力前に **パレットアイコン → DESIGN.md** をクリックし、
   DESIGN.md の §2.1〜2.2 のカラー・タイポグラフィをペーストして登録する
   （世界観をプリセットとして固定するのが後の一貫性の要）

### 0-5. Antigravity

1. Antigravity インストール（CLI 版 / VS Code 拡張のどちらでも可）
2. **設定 → MCP Servers → Stitch MCP を追加・接続**
   → これが「Stitch で作ったデザイン → Antigravity が自動取得」の生命線
3. ワークスペースとして `geodyssai/` を開く

> 📝 **学習ポイント**: MCP（Model Context Protocol）は異なる AI ツール間でデータをやり取りするための共通プロトコル。
> Stitch MCP を設定することで、Antigravity が「Stitch の最新デザイン」を毎回人間を介さずに参照できる。
> → 参考: https://modelcontextprotocol.io/introduction

---

## Phase 1: リポジトリ骨格（手作業・30 分）

### 1-1. フォルダ構成を手で作る

```
geodyssai/                       ← git init する場所
│
├─ AGENT.md                      ← Antigravity 向け実装仕様（SSOT）
├─ DESIGN.md                     ← Stitch 向けデザイン仕様（SSOT）
├─ KICKOFF.md                    ← 本ファイル
├─ README.md                     ← プロジェクト概要（下記テンプレ参照）
│
├─ .gitignore                    ← 下記参照
├─ .env.example                  ← 下記参照（実際の .env は作るがコミットしない）
│
├─ data/
│  └─ geodyssai_WordPress_2026-07-19.xml   ← WXR（Sprint 1 の入力）
│
├─ assets/
│  └─ brand/
│     └─ cat.jpg                 ← マンチカン原画（Sprint 2 以降で参照）
│
├─ docs/
│  ├─ decisions.md               ← 意思決定ログ（ADR）。下記テンプレ参照
│  └─ review-list.md             ← ETL が吐く手動レビュー対象の置き場（空で OK）
│
├─ scripts/
│  └─ etl/
│     └─ config/
│        └─ taxonomy.yaml        ← 7 星座の定義（下記参照）
│
└─ logs/                         ← ETL 実行ログの置き場（空ファイルで OK・gitignore 対象）
```

> 📝 `src/` や `package.json` は **Sprint 2 冒頭に Antigravity に生成させる**。
> コードの骨格をここで手作りしてはいけない（SDD の原則：仕様が先、コードが後）。

### 1-2. 各ファイルの中身

**`.gitignore`**
```
# シークレット
.env
*serviceAccount*.json
*service_account*.json

# Python
.venv/
__pycache__/
*.pyc

# Node / Astro
node_modules/
dist/
.astro/

# ログ・一時
logs/
*.log
```

**`.env.example`**（実際の `.env` はこれをコピーして値を埋める）
```
# Gemini API（ETL の Embedding 用）
GEMINI_API_KEY=

# Firebase Admin SDK（ETL の Firestore 書き込み用）
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json

# Firebase Web SDK（Astro / React で使用・Sprint 2 以降）
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**`scripts/etl/config/taxonomy.yaml`**
```yaml
# 7 星座（海域）の定義
# Antigravity の ETL スクリプトがここを読み、記事を自動分類する
# 分類後はオーナーが review-list.md と照合して最終確認する

constellations:
  genai-foundations:
    label: GenAI 基礎
    label_ja: GenAI 基礎座
    color: "#3B82F6"
    keywords: [RAG, Embedding, ChromaDB, Gemini, ベクトル, 類似度]

  ai-agents:
    label: AI Agents
    label_ja: AI Agents 座
    color: "#8B5CF6"
    keywords: [ADK, MCP, Antigravity, エージェント, Agent, Agentic]

  firebase-cloud:
    label: Firebase & Cloud
    label_ja: Firebase 座
    color: "#F59E0B"
    keywords: [Firebase, Firestore, Cloud Run, App Check, AI Logic, GCP]

  claude:
    label: Claude
    label_ja: Claude 座
    color: "#E07B54"
    keywords: [Claude, Anthropic, claude.ai]

  deep-learning:
    label: Deep Learning
    label_ja: Deep Learning 座
    color: "#2DD4BF"
    keywords: [深層学習, Deep Learning, LLM, ニューラルネットワーク, PyTorch]

  logical-thinking:
    label: Logical Thinking
    label_ja: Logical Thinking 座
    color: "#F2B8CC"
    keywords: [フェルミ推定, ケース面接, ロジカルシンキング, コンサル, 経営]

  design-tools:
    label: Design & Tools
    label_ja: Design 座
    color: "#7DD3C0"
    keywords: [Stitch, デザインスプリント, PowerPoint, Design, UI, UX]
```

**`docs/decisions.md`**（最初の意思決定をここに記録する）
```markdown
# 意思決定ログ（Architecture Decision Records）

## ADR-001: draft 記事 25 本の扱い
- 日付: 2026-07-19
- 決定: **案 A（全件投入・status 出し分け）を採用**
  - 理由: 「まだ光っていない暗い星」として星海図に存在させることで、
    オーナー自身の執筆モチベーションをゲーミフィケーションに組み込める。
    publish のみ一般公開・draft はログイン時のオーナーにのみ表示。
- 代替案: 案 B（publish 3 本のみ投入）→ 不採用（星海図が寂しすぎる）

## ADR-002: 画像 56 点の再ホスト時期
- 日付: 2026-07-19
- 決定: **バックログ（移行後の別タスク）**
  - 理由: 現行の geodyssai.com/wp-content/uploads/... 参照でも表示は維持できる。
    DNS 切替後に Firebase Storage へ移設する。

## ADR-003: Star Neighbors の計算空間
- 日付: 2026-07-19
- 決定: **UMAP 前の高次元ベクトル空間で cosine 類似を計算し neighbors を確定**
  - 理由: UMAP 後の 3D 座標は可視化のために歪んでおり、
    意味的近傍の根拠にならない（→ AGENT.md §4.4 参照）。
```

**`README.md`**（最小限。詳細は各 .md へ委譲）
```markdown
# geodyssAI

> *- Your Compass to navigate the AI-natives, One Voyage at a Time -*

AI エンジニア Yuta のポートフォリオ兼技術ブログ。
全記事を意味空間に浮かぶ **星** として 3D 可視化した「星海図」で航海するように学べる。

## ドキュメント
- [DESIGN.md](./DESIGN.md) — UI/UX 仕様（Stitch 用）
- [AGENT.md](./AGENT.md) — 実装仕様（Antigravity 用）
- [KICKOFF.md](./KICKOFF.md) — 着手ガイド（本ファイルを除く）
- [docs/decisions.md](./docs/decisions.md) — 意思決定ログ

## スタック
Astro / React Three Fiber / Firebase (Firestore, Auth, AI Logic) / Python 3.11

## サイト
https://www.geodyssai.com
```

### 1-3. Git 初期コミット

```bash
cd geodyssai
git init
git add .
git commit -m "chore: 仕様コミット — AGENT.md / DESIGN.md / KICKOFF.md / 骨格フォルダ"
```

> 📝 **学習ポイント**: コードより先に仕様が Git の歴史に刻まれる — これが SDD の号砲。
> 「最初のコミットに何が入っているか」でプロジェクトの設計思想が伝わる。

---

## Phase 2: 2 レーン並行着手

Sprint 1（ETL・データ）と Stitch デザインは **依存関係がゼロ**。同時に走らせる。

### レーン A: あなた × Stitch（デザインの弾込め）

```
Step A-1  DESIGN.md §1〜3 を Stitch の最初のプロンプトに貼る（世界観固定）
Step A-2  S1「星海図トップ」プロンプト（DESIGN.md §4-S1）を投入
Step A-3  「一度に一つの変更」で磨く（色・星座線・グラスヘッダーを順番に）
Step A-4  S2「記事ページ」プロンプトへ進む
Step A-5  Sprint 2 の開始時に Antigravity が MCP で取得できる状態にしておく
```

> 💡 **Stitch の操作コツ（Google I/O Extended ワークショップより）**
> - UI に名前が分からなかったら Gemini に「〜なヤツ」と聞いて用語化してから指示する
> - いまいちな結果には「水平思考でさらに 3 案」と追加指示する
> - デザインシステム（パレットアイコン → DESIGN.md）に §2.1 のトークンを登録しておくと
>   複数画面で色がブレない

### レーン B: あなた → Antigravity（Sprint 1 ETL）

**最初に投げる起動プロンプト（コピペ用）**

```
このワークスペースの AGENT.md と DESIGN.md を読み込んで。

まず以下の 2 点を返して。コードはまだ書かないこと（§1 ゴールデンワークフロー厳守）:
(1) 理解したアーキテクチャと Sprint 1 の作業計画をサマリーにして。
(2) AGENT.md §4.7 の未決事項ほか、着手前に確認すべき点を質問して。
```

**計画合意後の指示（1 ファイルずつ）**

```
01_parse.py から作って。
§8 教育規約（逐行コメント + 末尾に【意図】【学習ポイント】【WEB リンク】）を必ず守ること。
```

→ レビュー → `python3 scripts/etl/01_parse.py` で実行確認 → 「次は 02_embed.py」…と繰り返す。

**Sprint 1 の完了判定（AGENT.md §4.6 DoD）**

```
[ ] 全 28 投稿が Firestore に存在（status フィールド付き）
[ ] pos（x, y, z）と neighbors の欠損ゼロ
[ ] 再実行しても重複ゼロ（冪等性）
[ ] 変換不能ブロックがレビューリストに出力されている
[ ] 近傍検証: 任意 3 記事で「意味が近い = neighbors が妥当」を目視確認しメモ
```

---

## Phase 3: Sprint 2〜4 の連携ループ

### Sprint ごとの標準手順

```
① Stitch でその Sprint の画面を仕上げる（DESIGN.md §4 の該当プロンプト）

② Antigravity に投入（コピペ）:
   「Stitch MCP を使用して geodyssAI プロジェクトを取得して。
    カラーパレットと書体を抽出し、DESIGN.md を差分更新して。
    実装はまだ書かないこと。」

③ DESIGN.md の差分をオーナーが確認 → 承認

④ Antigravity に投入:
   「承認した。Sprint N の実装に進んで。
    1 ファイルずつ確認するので、まず [最初のファイル名] から。
    §8 教育規約必須。」

⑤ レビュー → DoD チェック → ブランチをマージ → 次の Sprint へ
```

### ブランチ戦略

```
main（保護: 直 push 禁止）
  └─ sprint/1-data-voyage    ← ETL スクリプト一式
  └─ sprint/2-visual-voyage  ← Astro 雛形 + 星海図 + 記事ページ
  └─ sprint/3-user-voyage    ← Firebase Auth + 航海日誌 + 勲章
  └─ sprint/4-ai-voyage      ← 生成マンチカン RAG + App Check
```

### Sprint 2 の注意点（唯一 Astro 雛形生成が入る）

Sprint 2 の最初だけ、Antigravity に以下を追加指示する:

```
Sprint 2 の着手前に、Astro プロジェクトの雛形を生成して。
条件:
- pnpm create astro@latest（strict モード / TypeScript）
- DESIGN.md §2 のトークンを tailwind.config.ts と CSS 変数に反映
- src/lib/firebase.ts に Firebase 初期化コード（App Check は後で追加するプレースホルダーを入れておく）
雛形生成後、package.json と astro.config.mjs の内容を説明して。次のステップを待つ。
```

### Sprint 4 の前にやること（App Check 設定）

Sprint 4 の着手前に、Phase 0 で保留にした **App Check を設定する**:

```
Firebase Console → App Check → Web アプリを選択
→ reCAPTCHA Enterprise の証明書プロバイダを登録
→ 発行されたサイトキーを .env に追加（RECAPTCHA_SITE_KEY=）
```

---

## Phase 4: 本番切替（最後の人間判断）

1. `firebase deploy --only hosting` でステージング URL を確認
2. 全画面・全デバイスで QA（星海図・認証・チャット・勲章）
3. 問題なければ DNS を ConoHa から Firebase Hosting に切替
4. **ConoHa は切替後 1 ヶ月は維持**（予期せぬ問題への保険）
5. `docs/decisions.md` に「ADR-004: DNS 切替完了」を記録

---

## チェックリスト（Phase 0〜1 完了の確認）

```
Phase 0
[ ] Firebase プロジェクト作成（Firestore / Auth / AI Logic 有効化）
[ ] SDK config を .env に記入済み
[ ] Gemini API キー取得 → .env に記入済み
[ ] サービスアカウント鍵 JSON ダウンロード → .env に GOOGLE_APPLICATION_CREDENTIALS 設定
[ ] .env を .gitignore で除外されていることを確認（git status で .env が出ないこと）
[ ] Python 仮想環境作成 + パッケージインストール済み
[ ] Stitch でプロジェクト作成 + DESIGN.md §2 のトークン登録済み
[ ] Antigravity に Stitch MCP を接続済み

Phase 1
[ ] geodyssai/ フォルダに上記構成を作成済み
[ ] .env.example から .env を作成し値を埋めた
[ ] docs/decisions.md に ADR-001〜003 を記録済み
[ ] taxonomy.yaml に 7 星座を記入済み
[ ] git init → 仕様コミット済み（コミットログに .env が含まれていないこと）
[ ] Antigravity でワークスペースを開き AGENT.md / DESIGN.md を読み込み確認済み
```

---

## よくある詰まりポイントと対処

| 詰まり | 対処 |
|---|---|
| Firestore への書き込みが `PERMISSION_DENIED` | サービスアカウントに「Cloud Datastore ユーザー」ロールが付与されているか確認 |
| Embedding API が `429 Resource Exhausted` | `02_embed.py` の指数バックオフリトライが効いているか確認。無料枠超えなら課金設定 |
| Stitch が指示と違う色を使う | DESIGN.md 機能（パレットアイコン）にトークンが登録されているか確認。未登録ならプロンプトに hex を直書き |
| Antigravity が一気に大量生成しようとする | 「コードはまだ書かないこと」を先頭に明記し、§1 ゴールデンワークフローを再提示 |
| `.env` を誤ってコミットした | `git rm --cached .env` → `git commit` → GitHub の場合はシークレットを即ローテート |

---

## 【意図】— この KICKOFF.md 自体の

**【意図】** 仕様駆動開発は「仕様が先、コードが後」という逆転の発想が肝。人間が用意する器（Phase 0〜1）を最小化することで、エージェントが迷わずに実装に集中できる環境を作る。Phase 2 の 2 レーン並行は「Stitch がデザインを磨いている間に ETL データを整える」という依存関係のない並列化で、待ち時間をゼロにする工夫。

**【学習ポイント】** SDD（仕様駆動開発）は AI が高性能になったからこそ有効になった手法。人間の役割が「仕様の決定者・承認者」にシフトし、「コードを書く実装者」から離れていく — これが PPTX で紹介された「AI-Native Development（曖昧さの責任を AI モデルに移す）」の実践形。

**【ステップアップ WEB リンク】**
- Firebase プロジェクト設定: https://firebase.google.com/docs/web/setup
- git の基本（初回コミットまで）: https://git-scm.com/book/ja/v2/使い始める-Gitリポジトリの取得
- MCP（Model Context Protocol）公式: https://modelcontextprotocol.io/introduction
- Antigravity ドキュメント: https://antigravity.dev/docs（最新 URL は Antigravity 起動時に確認）
