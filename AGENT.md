# AGENT.md — geodyssAI「星海」実装仕様書（Antigravity 用）v3.2

> **配置**: プロジェクトリポジトリのルート。Antigravity は本書と **DESIGN.md** を SSOT として従うこと。
> **Owner**: Yuta（AI Engineer / Data Scientist） / **Site**: https://www.geodyssai.com
> **Tagline**: *- Your Compass to navigate the AI-natives, One Voyage at a Time -*
> **最終更新**: 2026-07-21（v3.0: 分散指示書 5 本を完全統合 ／ v3.1: **GitHub MCP による変更履歴管理プロトコル（§1.2）とフェーズゲート制（§5）を導入**。Phase 1 = 骨格・前提検査・履歴確立 ／ v3.2: **GitHub Issue & PR 駆動フローの詳細化、および Phase 1 開発ログの追加（付録C）**）
> **DESIGN.md の扱い**: Stitch 出力の frontmatter を含む現行版を**凍結（変更禁止）**。取り込み規則は §2.4。
> **最重要**: すべての成果物は §6「教育規約」に従う。動くだけのコードは不合格。**読めるコード**で、リアリスティックで幻想的、かつ動的な体験を実装すること。

---

## 0. ミッションとロール

- WordPress（ConoHa / Cocoon テーマ）を、**Astro × Firebase × React Three Fiber** の Headless 構成へ完全移行する。
- 全記事を Embedding → 3D 座標化した「**星海図（Stellar Chart）**」で空間探索させ、認証つきゲーミフィケーション（航海日誌・勲章・**星座の完成**・**星海碑**）と、記事文脈を理解する RAG チャット「**生成マンチカン**」を実装する。
- 成果物はオーナーのポートフォリオ兼**教材**。オーナーが 1 行ずつ理解できることが受け入れ条件に含まれる。

---

## 1. ゴールデンワークフロー（Stitch × Antigravity 連携）★最重要

Google I/O Extended Tokyo 2026 ワークショップで実証された手順に従う。**一気に自動生成させないこと。**

1. **取得**: Stitch MCP でデザインプロジェクトを取得する。
2. **解析（コードより先）**: いきなり実装せず、まず Stitch の内容を解析してカラーパレット・書体・コンポーネント構造を抽出し、DESIGN.md との整合確認する（DESIGN.md 本体は凍結。差分があれば **本書 §2.4 の取り込み規則側**を更新提案する）。
3. **承認**: 差分・計画をオーナーが承認してから実装に着手する。
4. **実装**: フェーズ / スプリントごとのブランチで作業し、**すべての変更を §1.2 のプロトコルで GitHub に記録**しながら、各ステップでオーナー確認を挟む。

### 1.1 Stitch 資産（`{{DATA:...}}` ID）の解決規則 ⚠重要

歴代ドキュメントの `{{DATA:SCREEN:SCREEN_xx}}` ID は**出典間で衝突している**（対照表: 付録A。例: Stellar Chart が SCREEN_55 / SCREEN_65 の 2 説）。よって:

- **静的 ID を信用しない。** 実装時は Stitch MCP で実プロジェクトを取得し、**画面名（Stellar Chart / Lighthouse 等）で照合**して対応デザインを特定する。
- 照合結果は最初の実装コミットのコメントに「画面名 → 実 ID」の確定表として記録し、以後はそれを正とする。

### 1.2 変更履歴管理プロトコル（GitHub MCP）★

**すべての変更履歴は GitHub 上で追跡可能でなければならない。** Antigravity は Git 操作を **GitHub MCP サーバー**および Git CLI を経由して行う。認証は Fine-grained PAT 等を用い、セキュアに管理する。

#### ■ GitHub 運用プロセス（Issue ＆ PR 駆動開発）
本プロジェクトでは、コードの変更を行う前に必ず以下のステップを踏む：
1. **GitHub Issue の作成**:
   - 各開発フェーズやスプリントのタスクに着手する前に、`github-mcp-server` を用いて GitHub 上に **Issue** を作成する。
   - タイトルは `[Phase 1] Initialize Foundation skeleton` などの規則性を持たせる。
2. **作業ブランチの作成とコミット**:
   - `phase/` または `sprint/` から始まる対応ブランチを作成する。
   - 各ファイルの追加や軽微な修正ごとに、Conventional Commits に従った細かいコミット（1 変更 = 1 コミット）を作成する。
   - コミットメッセージの本文 1 行目には必ず【意図】を記述する。
3. **Pull Request (PR) の作成と Issue 紐付け**:
   - 作業完了後、または作業の明確な区切りで GitHub 上に **Pull Request (PR)** を作成する。
   - PRの本文（説明欄）には以下の内容を含める：
     - この PR が解決する Issue へのリンク（例: `Closes #1` や `Ref #1`）
     - §6 教育規約に基づく「3点セット」（【意図】/【学習ポイント】/【ステップアップ WEB リンク】）
   - **マージ権限はオーナー（Yuta）のみ**とし、エージェントはマージを行わない。オーナーのコードレビュー後にマージされる。
4. **CHANGELOG.md への追記**:
   - PR がマージされた後、Keep a Changelog 形式で `CHANGELOG.md` に変更内容を追記する。

| 項目 | 規則 |
|---|---|
| コミット粒度 | **1 変更 = 1 コミット**（1 ファイル生成・1 修正・1 設定変更ごと）。まとめコミット禁止 |
| メッセージ規約 | Conventional Commits: `feat / fix / docs / chore / refactor(scope): 要約`。scope は `phase1` / `sprint2` 等。本文 1 行目に【意図】を書く |
| ブランチ | `main`（保護・直 push 禁止）／ `phase/1-foundation` ／ `sprint/1-data-voyage` 〜 `sprint/6-social-voyage` |
| マージ | PR 経由のみ。PR 説明に §6 の 3 点セットを記載。**マージ実行はオーナー**（Antigravity は PR 作成まで） |
| CHANGELOG.md | Keep a Changelog 形式。PR マージごとに Antigravity が追記コミットを行う |
| 禁止事項 | force-push ／ main への直 push ／ `.env`・鍵・サービスアカウント JSON のコミット ／ 履歴改変（interactive rebase 等） |

毎変更の基本ループ:
```
Issue作成 ──▶ ブランチ作成 ──▶ コード変更 ──▶ 1変更1コミット ──▶ プッシュ ──▶ PR作成(Issue紐付け) ──▶ オーナーレビュー&マージ ──▶ CHANGELOG追記
```

---

## 2. 技術スタック / アーキテクチャ

| レイヤ | 採用技術 |
|---|---|
| フロント基盤 | **Astro**（SSG + Islands Architecture）+ Tailwind CSS（トークンは §2.4 の規則で反映） |
| インタラクティブ島 | **React** islands（`client:only="react"` / `client:load`） |
| 3D / 演出 | **React Three Fiber** + `@react-three/drei` + `@react-three/postprocessing`（Bloom）+ **WebGL Shaders**（星雲・霧・オーロラ） |
| BaaS | **Firebase**: Firestore（Headless CMS）/ Authentication（Google）/ **AI Logic**（Web SDK, Gemini）/ **App Check**（reCAPTCHA Enterprise） |
| ETL | **Python 3.11**（`lxml` or `xml.etree`, `markdownify`, `google-genai`, `umap-learn`, `scikit-learn`, `firebase-admin`） |
| ホスティング | Firebase Hosting（移行完了まで ConoHa 併存） |

### 2.1 データフロー

```
WXR(XML) ──[ETL: Sprint1]──▶ Firestore(articles)  ※pos + neighbors + difficulty を事前計算
Firestore ──[build / CSR]──▶ Astro ページ & 星海図(StellarChart island)
ブラウザ ──[AI Logic + App Check]──▶ Gemini（RAG チャット / 星海碑の要約生成）
```

### 2.2 ディレクトリ構成（description v1.2 統合版）

```
/                          # Astro ルート
├─ AGENT.md / DESIGN.md / KICKOFF.md / README.md / CHANGELOG.md
├─ src/
│  ├─ pages/
│  │   ├─ index.astro            # S1 Stellar Chart
│  │   ├─ articles/[slug].astro  # S3 Lighthouse
│  │   ├─ log.astro              # S4 Voyager's Log
│  │   ├─ captain.astro          # S5 Captain's Profile（Sprint 5）
│  │   ├─ observatory.astro      # S2 Observatory（Sprint 5）
│  │   ├─ tavern.astro           # S6 Stellar Tavern（Sprint 6）
│  │   └─ comms.astro            # S7 Comms Relay（Sprint 6）
│  ├─ components/
│  │   ├─ StellarChart.tsx / StellarCanvas.tsx / NebulaShader.ts
│  │   ├─ MunchkinNavigator.tsx / MunchkinSpeech.astro / InfoBox.astro / CodeBlock.astro
│  │   ├─ MonolithCard.tsx / BoardingModal.tsx / StardustOrigin.tsx
│  │   ├─ BookmarkPulsing.ts / PublicLogLine.ts
│  │   └─ DepthIndicator.tsx / DescendButton.tsx / ShareVoyageButton.tsx
│  └─ lib/firebase.ts            # 初期化（App Check 含む）
├─ scripts/
│  ├─ preflight_check.py         # Phase 1: 前提物インベントリ検査 → docs/preflight-report.md
│  └─ etl/                       # 01_parse.py 02_embed.py 03_neighbors_umap.py 04_upload.py
│     └─ config/ taxonomy.yaml / difficulty_overrides.yaml
├─ docs/                         # decisions.md / review-list.md / preflight-report.md
├─ public/assets/                # cat.jpg（アバターフォールバック）ほか視覚資産
├─ data/geodyssai_WordPress_2026-07-19.xml
└─ .env                          # 秘匿情報（コミット禁止）
```

### 2.3 旧ドキュメントの役割吸収

- `description.md`（v1.2）→ 本書 §2.2 / §3 / 付録A に吸収。**単体ファイルは作らない。**
- `HANDOFF.md`（未作成のまま参照されていた）→ **KICKOFF.md** の Phase 2〜3 起点プロンプト集が同役割。作らない。
- `DESIGN v2.7` の演出仕様 → DESIGN.md は凍結のため、実装レベルの演出定義は本書 §5（各 Sprint）に吸収。

### 2.4 DESIGN.md トークン取り込み規則（frontmatter × 本文 §2.1 のブリッジ）★

DESIGN.md は「Stitch 出力の **frontmatter YAML（Seikai / Material 3 ロール）**」と「本文 §2.1 の **意味変数（--stellar 等）**」の二層構造。凍結のまま次の規則で実装へ反映する:

1. Sprint 2 冒頭で frontmatter YAML をパースし `src/styles/tokens.css` と `tailwind.config` を**自動生成**する（手写し禁止）。
2. **UI コンポーネント**（ボタン・面・テキスト・状態色）→ frontmatter の M3 ロールを使用（`primary #8aebff` / `primary-container #22d3ee` / `secondary #d0bcff` …）。
3. **星海演出**（星の色・星座線・光の糸・オーロラ・霧）→ 本文 §2.1 の意味変数を使用。
4. **frontmatter に欠けているトークンは本文 §2.1 から補完**して tokens.css に含める: `--aurora` / `--current #3B82F6` / `--surface-glass` / `--const-genai` / `--const-agents` / `--const-logic` / `--const-design`（frontmatter には firebase / claude / dl の 3 星座しか無い）。
5. 対応の目安: `--stellar` ≒ `primary-container(#22d3ee)`、`--nebula(#8B5CF6)` は `secondary` 系と近縁だが**星の演出色としては --nebula を正**とする。

---

## 3. 画面インベントリ — 12 航路（Chapter 1 統合）

| # | 画面名 | 役割 | Sprint | 実装先 |
|---|---|---|---|---|
| S1 | **Stellar Chart**（星海図トップ） | スクロール・マウス連動の 3D 星海。全体のハブ | 2 | `index.astro` + `StellarChart.tsx` |
| S2 | **Observatory**（展望台） | 星座別フォーカス空間。統計と進捗の深掘り | 5 | `observatory.astro` |
| S3 | **Lighthouse**（記事ページ） | Medium 風読書体験 + 読了時の星屑収集演出 | 2（演出は 3） | `articles/[slug].astro` |
| S4 | **Voyager's Log**（航海日誌） | 統計・勲章・称号オーロラ・星海碑一覧 | 3 | `log.astro` |
| S5 | **Captain's Profile**（筆者紹介） | スクロール連動 3D 潜航の自己紹介 | 5 | `captain.astro` |
| S6 | **Stellar Tavern**（議論場） | 星座別スレッド。船長同士の緩い繋がり | 6 | `tavern.astro` |
| S7 | **Comms Relay**（通信室） | 問い合わせフォーム + FAQ（管制塔 UI） | 6 | `comms.astro` |
| S8 | **Munchkin Navigator**（チャット） | RAG 対話ウィジェット | 4 | `MunchkinNavigator.tsx` |
| S9 | **Boarding**（乗船モーダル） | Google Auth ログイン導線 | 3 | `BoardingModal.tsx` |
| S10 | **星海碑（Monolith）** | 星座完遂時の Gemini 生成「古文書」要約 | 4 | `MonolithCard.tsx` |
| S11 | **星屑の栞（Bookmark）** | ブックマーク星の 2 秒周期 Pulsing | 3 | `BookmarkPulsing.ts` |
| S12 | **共有された航路（Public Log）** | 他船長の足跡＝ゴースト・ライン重畳 | 6 | `PublicLogLine.ts` |

> ⚠ 用語統一（v2.6 との矛盾解消）: **Comms Relay = 問い合わせ + FAQ**。RAG チャットは **Munchkin Navigator（S8）**。v2.6 の「Relay = RAG アクセス」定義は破棄。

---

## 4. データモデル（Firestore）v3

### `articles/{slug}`
```
title, slug, status('publish'|'draft'), contentMd, excerpt(120字),
category(星座ID: §5.1), tags[], publishedAt, updatedAt, heroImage,
readingTime(分), sourceUrl,
difficulty: number(1-5),   // 1=表層(入門) … 5=深層(専門)。Z 軸オフセットの源泉
pos: {x, y, z},            // UMAP 3D 座標（z は difficulty オフセット済み）
neighbors: string[],       // 高次元空間での cosine 近傍 上位 3 slug（光の糸）
contentHash, embeddingModel
```
> `isPublished`（v2.6）は独立フィールドにしない。**`status === 'publish'` から導出**（霧エフェクトは `status !== 'publish'` に適用）。

### `users/{uid}`
```
displayName, photoURL, createdAt,
readHistory: string[],           // arrayUnion で重複防止
stardustBookmarks: string[],     // 栞（Pulsing 対象の slug）
badges: string[],
stats: { totalRead, byConstellation:{...}, title: string, auraColor: string }
```
> `photoURL` は Google Auth から保存。**読み込み失敗時のフォールバックは必ず `/assets/cat.jpg`**。
> `title`（称号）と `auraColor` は読了統計の最多星座から動的算出（例: Firebase 最多 → オレンジ系オーロラ）。

### `users/{uid}/monoliths/{constellationId}`
```
constellationId, summary(Gemini 生成の星座全記事要約), earnedAt
```
> 星座コンプリート時に 1 回だけ生成・保存（再生成しない = コスト固定）。

### `publicLogs/{uid}`
```
voyagePaths: string[](slug 順列), updatedAt, isPublic: boolean
```
> **オプトイン制（デフォルト非公開）**。公開時のみ `users` から匿名化コピー。ゴースト・ラインはこのコレクションだけを読む（`users` を他人が読む設計にしない）。

### `threads/{threadId}` + `threads/{threadId}/posts/{postId}`（Tavern）
```
threads: { constellation, title, authorUid, createdAt, lastPostAt }
posts:   { authorUid, body(≤2000字), createdAt }
```

### `inquiries/{id}`（Comms Relay）
```
name, email, body(≤4000字), createdAt      // read はオーナーのみ（Console/Admin）
```

### `badges/{id}`
```
name, desc, icon,
condition  // 例 {type:'constellation_count', constellation:'ai-agents', n:5}
           //    {type:'constellation_complete', constellation:'genai-foundations'}
```

### セキュリティルール v3（Sprint 3 以降、エミュレータテスト必須）
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /articles/{slug}  { allow read: if true;  allow write: if false; }   // Admin SDK のみ
    match /badges/{id}      { allow read: if true;  allow write: if false; }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /monoliths/{cid} { allow read, write: if request.auth.uid == uid; }
    }
    match /publicLogs/{uid} {
      allow read: if true;                                   // 匿名ゴースト表示用
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /threads/{tid} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorUid;
      match /posts/{pid} {
        allow read: if true;
        allow create: if request.auth != null
                      && request.resource.data.body.size() <= 2000;
        allow update, delete: if request.auth.uid == resource.data.authorUid;
      }
    }
    match /inquiries/{id} {
      allow create: if request.resource.data.body.size() <= 4000;  // App Check 前提
      allow read, update, delete: if false;
    }
  }
}
```

---

## 5. フェーズ & スプリント計画 v3.1（MECE 再編成）

WordPress × ConoHa からの移管は大規模プロジェクトであるため、**4 つのフェーズに分割し、フェーズ単位で「完了」させる**。各フェーズの終わりには**フェーズゲート**（DoD 全達成 + オーナー承認）があり、通過するまで次フェーズに着手しない。

```
Phase 1: Foundation    基盤 — フォルダ骨格・前提物検査・変更履歴の確立
Phase 2: Core Voyage   コア移行 — Sprint 1 → 2 → 3 → 4
Phase 3: Extended      体験拡張 — Sprint 5, 6（任意順）
Phase 4: Cutover       本番切替 — QA → DNS 切替 → ConoHa 退役

※ 星海碑は Sprint 3(コンプリート検知) + 4(AI Logic) に依存
※ Public Log は Sprint 3(readHistory) に依存
```

### PHASE 1: Foundation（基盤フェーズ）★最初にやる

**目的**: コードを書き始める前に「器」と「履歴」を確立する。`src/` の実装コードはこのフェーズでは一切書かない。

1. **フォルダ骨格の作成**: §2.2 の構成どおりにリポジトリ骨格を生成・整合確認する。
2. **前提物インベントリ検査（preflight）**: `scripts/preflight_check.py` を作成・実行し、結果を `docs/preflight-report.md` に出力する。検査項目:
   - 必須ファイルの存在: `data/*.xml`（WXR）／ `public/assets/cat.jpg` ／ `AGENT.md` / `DESIGN.md` / `KICKOFF.md` ／ `scripts/etl/config/taxonomy.yaml`
   - `.env` の必須キー充足と実効性（Gemini API 疎通 1 回・Firestore 読み取り 1 回の軽い実測）
   - ツール接続: **Stitch MCP / GitHub MCP の応答確認**、Python 依存パッケージの import確認
   - 不足があれば**不足リストをオーナーへ報告して停止**する（勝手に代替・省略しない）
3. **変更履歴の確立**: GitHub リポジトリ（private）に接続し、§1.2 プロトコルで `phase/1-foundation` ブランチへ初回コミット群を push。`CHANGELOG.md` を生成し `[0.1.0] Phase 1: Foundation` エントリを記載。PR を作成してオーナーレビューへ。

**DoD（フェーズゲート）**
- [ ] 骨格が §2.2 準拠で存在し、preflight レポートが全項目 ✅（または不足報告済み・解消済み）
- [ ] GitHub 上でコミット履歴が閲覧でき、以後の**全変更が 1 変更 = 1 コミットで追跡可能**な状態
- [ ] CHANGELOG.md 初版が存在 ／ main ブランチ保護が有効 ／ `.env`・鍵が履歴に含まれない
- [ ] オーナーが PR をマージしてフェーズゲートを承認

### PHASE 2: Core Voyage（Sprint 1〜4）

**KICKOFF.md のブランチ戦略・手順がそのまま有効。** Chapter 1 で追加された体験は Phase 3 に隔離し、コア航路の完走を最優先する。各 Sprint 内でも §1.2 の「毎変更 = 1 コミット」を守る。

### SPRINT 1: Data Voyage（ETL: WXR → Firestore）

**入力と実測値（2026-07-19 エクスポート・解析済み）**
- `data/geodyssai_WordPress_2026-07-19.xml`（約 0.9 MB, WXR 1.2）
- 投稿 **28 本（publish 3 / draft 25）**、固定ページ 4、添付画像 56
- ブロック実測: `paragraph 617 / list-item 704 / list 290 / heading 212 / image 96 / loos-hcb/code-block 34 / blank-box-1 26 / info-box 22 / code 19 / table 12 / balloon-ex-box-1 12 / html 11 / separator 6 / quote 5 / tab-box-1 3 / icon-box 3 / sticky-box 1 / shortcode 1`
- カテゴリ実態: `GenAI(3)` / `Uncategorized(25)` → 星座タクソノミ再割当が必須

**変換規則**

| WordPress ブロック | 変換先 | 備考 |
|---|---|---|
| `balloon-ex-box-1` | `<MunchkinSpeech name icon>` | ブロックコメントの **JSON 属性を第一ソース**にパース（div 正規表現より堅牢。「ダンサー」等の他話者あり） |
| `loos-hcb/code-block`, `wp:code` | ```` ```lang ```` フェンス | class から言語推定、不明 is `text` |
| `info-box / blank-box / icon-box / sticky-box` | `<InfoBox kind>` | |
| `tab-box-1` | 見出し分割で平坦化（3 箇所のみ） | |
| `wp:image` | `![alt](url)`、alt 欠落は Gemini で生成 | 再ホストはバックログ（ADR-002） |
| `wp:html / shortcode` | 原文保全 + `docs/review-list.md` へ | 各 12 箇所 |

**Embedding・近傍・座標・難易度**
1. Embedding: Gemini Embedding API（最新モデル名は Docs 確認、`embeddingModel` に記録）。1 記事 = 1 ベクトル。バッチ + 指数リトライ + 費用ログ。
2. **neighbors は UMAP 前の高次元空間**で cosine 上位 3 件（3D 距離は歪むため厳守）。
3. UMAP `n_components=3, metric='cosine', random_state=42` → 半径 R=12 の球に正規化。
4. **difficulty 算出**: Gemini に冒頭 + 見出しを渡し 1〜5 分類（基準 = 前提知識量）→ `config/difficulty_overrides.yaml` でオーナー上書き可。
5. **深度オフセット**: `pos.z ← pos.z − (difficulty − 3) × 1.5` を正規化後に適用し再クランプ（深層ほど Z 負方向 = アビス）。
6. 冪等性: doc ID = slug、`contentHash` 一致なら Embedding 再計算スキップ。

**DoD**
- [ ] 全 28 投稿が Firestore に存在（status / difficulty / pos / neighbors 欠損 0）
- [ ] 再実行で重複 0 ／ 変換不能ブロック 0（review-list 化を除く）
- [ ] 近傍 3 記事の意味的妥当性を目視検証しメモ ／ difficulty の分布を確認しオーナー承認

### SPRINT 2: Visual Voyage（星海図 + 記事ページ）

- Sprint 冒頭で **Astro 雛形生成 + §2.4 のトークン自動生成**。
- `StellarChart.tsx`（`client:only="react"`）: 星 = 発光球（星座色）。±4px/6s 浮遊 + ランダム位相の瞬き。背景星屑 `Points` 約 4,000 点 × 3 層パララックス。星雲ヘイズ（`--nebula`/`--m-pink` 加算スプライト 6〜10%）。
- **星座線**: 同一星座内を 3D 座標の MST で常時薄く接続（n ≤ 28 なのでクライアント計算で可）。
- **光の糸**: hover 星から `neighbors` 3 星へ細い光線（星座横断可）。
- **未公開霧（Mist）**: `status !== 'publish'` の星の周囲にパーティクル系の半透明ノイズを低速回転で漂わせる。ホバー時のタイトルは CSS フィルタで**かすれ表示**（未知の演出）。
- **Bloom**: `@react-three/postprocessing`、`luminanceThreshold ≈ 0.6`。**モバイル/低性能では無効化**し emissive + グロースプライトで代替。**深層（difficulty 高）ほどシャープな光跡・背景彩度を紺碧→漆黒へ**（深度環境変化の第一段。カメラ潜航は Sprint 5）。
- Lighthouse: `contentMd` レンダリング + `MunchkinSpeech` / `InfoBox` / `CodeBlock`。Medium 風の余白・行間 1.7・最大幅 720px。
- パフォーマンス予算: 星 > 100 で `InstancedMesh`、`dpr ≤ 2`、記事ページは JS ほぼゼロ、Lighthouse Perf 90+ / LCP < 2.5s。

**DoD**
- [ ] 星海図 → 星クリック → 記事 → 近くの星の E2E ／ 星座線・光の糸・霧が表示
- [ ] Bloom 無効環境でも破綻なし ／ draft は一般非表示（霧はオーナービューで確認）／ モバイル操作可 ／ 予算内

### SPRINT 3: User Voyage（乗船・航海日誌・勲章・栞）

- Google Auth。未ログインでも閲覧可、記録のみ乗船必須。`photoURL` 保存 + **失敗時 `/assets/cat.jpg` フォールバック必須**。
- 記事表示で `readHistory` に `arrayUnion(slug)`（多重加算防止 + ルール検証）。読了時に **星屑収集演出**（`StardustOrigin`: 星屑がプロフィールへ吸い込まれる）。
- **星屑の栞**: Lighthouse にブックマークトグル → `stardustBookmarks`。星海図該当星に **Pulsing**: `Math.sin` 2 秒周期で scale 1.0〜1.3、emissive 100%〜150%。
- **勲章 + 称号**: クライアント算出 + ルール防御（Functions 不使用のコスト 0 方針）。星座統計から `stats.title` / `stats.auraColor` を更新し、Voyager's Log のプロフィールカード背景オーロラを称号色に連動。
- 星座全灯で星座線が `--aurora` 点灯（1.2s）→ 勲章 Toast（星海碑の生成自体は Sprint 4）。
- S4 Voyager's Log（勲章グリッド + 星海碑一覧の枠）と S9 Boarding を実装。

**DoD**
- [ ] 2 アカウントで履歴・栞・称号が分離 ／ ルールをエミュレータで単体テスト
- [ ] ログアウトでも閲覧が壊れない ／ Pulsing・星屑収集・オーロラ連動が動作 ／ アバターフォールバック確認

### SPRINT 4: AI Voyage（生成マンチカン RAG + 星海碑）

- **Firebase AI Logic Web SDK**（`gemini-2.5-flash-lite`。最新名は Docs 確認）。**App Check（reCAPTCHA Enterprise, isTokenAutoRefreshEnabled: true）必須** + キーのリファラ制限 + 連打ガード（送信中 disable & 5 秒）。
- systemInstruction:
  ```
  あなたは geodyssAI の航海士「生成マンチカン」だニャ。語尾に「ニャ」をつけ、
  初心者にも分かる例えで話すニャ。回答は【現在の星（下記の記事本文）】を
  最優先の根拠にするニャ。知らないことは正直に「分からないニャ」と言うニャ.
  危険・不適切な依頼は断るニャ。
  【現在の星】: {articleText（約 6,000 tokens に切詰め）}
  ```
- ユーザープロンプトに `readHistory` のタイトル列を添えてパーソナライズ。`generateContentStream` + 中断ボタン。任意で `tools:[{googleSearch:{}}]`。
- **星海碑（Monolith）**: 星座コンプリートイベントで、その星座の全記事タイトル + 抜粋を Gemini に渡し「古文書調の要約物語」を生成 → `users/{uid}/monoliths/{constellationId}` に保存（**1 回のみ**）。`MonolithCard`（古文書質感グラス + 星座紋章）で表示し、Voyager's Log の一覧へ。

**DoD**
- [ ] App Check 未検証クライアント拒否 ／ ペルソナ・根拠引用が正しい ／ ストリーミングと中断
- [ ] 星海碑が 1 星座で E2E 生成・保存・表示され、再訪時に再生成されない

### SPRINT 5: Immersion Voyage（展望台・潜航・深層演出）

- **Observatory（S2）**: `/observatory`。星座セレクタ → 該当星座へカメラフォーカス、進捗率・総読了時間・未読リストを表示。
- **Captain's Profile（S5）**: `/captain`。スクロールに応じてカメラが Z 軸へ**潜航（Descend）**する 3D 自己紹介。`DepthIndicator`（現在深度）+ `DescendButton`。
- **深層演出の完成**: 深度で背景彩度が紺碧→漆黒へ連続変化、深層星に微細な「深海粒子」。`NebulaShader` による揺らめく星雲の高度化。
- reduced-motion では潜航を通常スクロールへフォールバック。

**DoD**: 潜航がホイール/タッチ両対応 ／ 深度 1↔5 の環境変化が視認できる ／ Perf 予算維持。

### SPRINT 6: Social Voyage（議論場・公開航路・通信室）

- **Stellar Tavern（S6）**: 星座別スレッド + 投稿（§4 の threads/posts + ルール）。`onSnapshot` でリアルタイム反映。**モデレーション方針は付録B の決定後に着手**。
- **Public Log（S12）**: `ShareVoyageButton` でオプトイン → `publicLogs` へ匿名コピー。星海図に他船長の**ゴースト・ライン**（淡い軌跡、個人特定情報なし）を重畳描画。
- **Comms Relay（S7）**: `/comms`。FAQ（静的）+ 問い合わせフォーム（`inquiries` create-only、App Check 前提、送信後は管制塔風の受理演出）。

**DoD**: 未ログインは Tavern 読み取りのみ ／ publicLogs 以外から他人の履歴が読めないことをルールテストで証明 ／ inquiries が Console で閲覧可。

---

## 6. 教育規約（Education Protocol）★最優先

1. 生成する全コードに**日本語コメント**（原則 1 行 1 コメント、自明箇所はブロック単位可）。**なぜその技術・アプローチを選んだのか**の理由コメントを必ず含める。
2. 各成果物の末尾に **3 点セット**: 【意図】アーキテクチャ上の役割 ／【学習ポイント】新出概念の平易な解説 ／【ステップアップ WEB リンク】公式 Doc 中心 1〜3 本。
3. **過度な抽象化（細かすぎるコンポーネント分割等）を避け**、初学者が処理の流れを追える「読めるコード」を維持する。
4. UI 実装は静的画面で終わらせず、WebGL / CSS アニメーションで**「リアリスティックで幻想的、かつ動的な体験」**を追求し、その実装方法を解説する。
5. **一気に大量生成しない。** 1 ステップ = 1 確認。TS は型 + JSDoc、Python は型ヒント + docstring 必須。

---

## 7. セキュリティ / コスト・ガードレール

- シークレットは `.env`（gitignore 済）。サービスアカウント鍵はローカルのみ。
- 予算アラート設定。Embedding は `contentHash` 差分のみ。AI Logic は flash 系のみ。**星海碑は 1 星座 × 1 ユーザーにつき 1 回生成**。
- Firestore ルールはエミュレータテスト後にデプロイ。App Check のデバッグトークンは開発時のみ。
- **プライバシー**: 他者の `users/` を読む設計を作らない。公開データは `publicLogs` に限定し匿名。Tavern は §付録B の方針決定まで書き込み機能を出さない。
- 移行中は ConoHa 停止禁止。DNS 切替は全コア Sprint 完了後（KICKOFF.md Phase 4）。

---

## 8. 参照リンク

**公式**: Firebase AI Logic https://firebase.google.com/docs/ai-logic ／ App Check https://firebase.google.com/docs/app-check ／ Firestore https://firebase.google.com/docs/firestore/manage-data/add-data ／ ルール https://firebase.google.com/docs/firestore/security/get-started ／ Auth https://firebase.google.com/docs/auth ／ Astro Islands https://docs.astro.build/ja/concepts/islands/ ／ R3F https://r3f.docs.pmnd.rs/ ／ drei https://github.com/pmndrs/drei ／ postprocessing https://github.com/pmndrs/react-postprocessing ／ UMAP https://umap-learn.readthedocs.io/ ／ Gemini Embeddings https://ai.google.dev/gemini-api/docs/embeddings ／ Stitch https://stitch.withgoogle.com/

**オーナー提供動画（視聴メモ欄・タイトルは視聴時記入）**

| # | URL | メモ |
|---|---|---|
| 1 | https://www.youtube.com/watch?v=lqKdtk_G6JU | |
| 2 | https://www.youtube.com/watch?v=PKfZ1gnVJ44 | |
| 3 | https://www.youtube.com/watch?v=Du2lkZ_cux8 | |
| 4 | https://www.youtube.com/watch?v=bhietcNpXw8 | |
| 5 | https://www.youtube.com/watch?v=6uwrRGARVlg | |
| 6 | https://www.youtube.com/watch?v=VNDq1Q_W1Bs | |
| 7 | https://www.youtube.com/watch?v=7OiJtpeiUNw | |
| 8 | https://www.youtube.com/watch?v=GT-K0CrrgfU | |
| 9 | https://www.youtube.com/watch?v=2TlIg3VokY8 | |
| 10 | https://www.youtube.com/watch?v=nPxMF2YV77I | |
| 11 | https://www.youtube.com/watch?v=8m1jXvfrjqg | |

**内部ナレッジ（自ブログ = 一次資料 & 移行対象）**: 下書き「Antigravity で仕様駆動開発を始める（約 94,000 字）」「Getting Started with Google Antigravity」「Firebase でアプリにエージェント型 AI 機能を構築する」／ 公開済 RAG・Embedding ハンズオン 2 本。

---

## 付録A: Stitch DataStore ID 対照表（衝突記録）

| 画面 | Chapter1 (sup1) | description v1.2 | v2.6 (sup2) |
|---|---|---|---|
| Stellar Chart | SCREEN_55 | SCREEN_65 | — |
| Observatory | SCREEN_23 | SCREEN_21 | SCREEN_8 |
| Lighthouse | SCREEN_17 | SCREEN_38 | — |
| Voyager's Log | SCREEN_35 | SCREEN_28 | — |
| Captain's Profile | SCREEN_10 | — | — |
| Stellar Tavern | SCREEN_59 | SCREEN_16 | SCREEN_9 |
| Comms Relay | SCREEN_48 | SCREEN_14 | SCREEN_10 |
| Munchkin Navigator | SCREEN_46 | SCREEN_36 | — |
| Boarding | SCREEN_58 | SCREEN_40 | — |
| 星海碑 | SCREEN_50 | SCREEN_19 | SCREEN_5 |
| 星屑の栞 | SCREEN_28 | SCREEN_17 | SCREEN_3 |
| Public Log | SCREEN_2 | SCREEN_20 | SCREEN_6 |

> 3 出典で ID がほぼ全画面食い違うため、**§1.1 の規則（MCP で画面名照合）のみを正**とする。本表は照合時のヒント兼、衝突の証跡。

## 付録B: オーナー確認が必要な未決事項

1. **Tavern モデレーション方針**（Sprint 6 着手条件）: 通報機能の要否 / NG ワード / オーナー削除権限 / 匿名投稿可否。
2. **Public Log の公開粒度**: デフォルト OFF は確定。公開時に「軌跡のみ（現案）」か「表示名も出す」か。
3. **difficulty 判定**: Gemini 自動分類 + `difficulty_overrides.yaml` 上書き方式の承認、および初回分類結果のレビュー。
4. **inquiries の通知**: Firestore 保存のみ（現案・Console で確認）か、将来メール通知（Functions 導入 = コスト方針の変更）か。
5. Sprint 5 と 6 の着手順（どちらを先にするか）。

---

## 付録C: 開発ログ ＆ ラーニングノート (Phase 1)

### 1. 実行したコマンドと変更内容の流れ

#### ① ディレクトリ構造の構築
仕様に準拠した基本フォルダ群を新規作成しました。
```bash
mkdir -p data docs logs scripts/etl/config public/assets
```

#### ② 既存アセットの移動
ルートディレクトリに配置されていたインプット用の XML 形式 WXR データファイルおよびマンチカン原画を、所定のアセットフォルダに移動しました。
```bash
mv geodyssai.WordPress.2026-07-19.xml data/geodyssai.WordPress.2026-07-19.xml
mv cat.jpg public/assets/cat.jpg
```

#### ③ Python 仮想環境の作成とライブラリインストール
Python 用の超高速なパッケージマネージャー `uv` を使用して、仮想環境の作成および依存ライブラリのインストールを高速で実行しました。
```bash
uv venv
uv pip install google-generativeai google-genai firebase-admin umap-learn scikit-learn lxml markdownify python-dotenv pyyaml
```

#### ④ 接続テスト用設定の追加 (.env / .gitignore / taxonomy.yaml)
* [taxonomy.yaml](file:///Users/tokitayuta/geodyssAI/scripts/etl/config/taxonomy.yaml) に星座と分類用キーワードを定義しました。
* [.env.example](file:///Users/tokitayuta/geodyssAI/.env.example) を作成した上で、個人の環境値（プロジェクトID等）を書き込むための [**.env**](file:///Users/tokitayuta/geodyssAI/.env) を作成しました。
* セキュリティ上の観点から、秘密情報（`.env` やサービスアカウントキー `serviceAccount.json`）を Git の追跡から永久に排除するため、以下の除外パターンを持つ [**.gitignore**](file:///Users/tokitayuta/geodyssAI/.gitignore) を作成しました：
  ```
  .env
  *serviceAccount*.json
  *service_account*.json
  .venv/
  __pycache__/
  ```

#### ⑤ Google Cloud API および IAM 権限の有効化
初期の接続チェック時、サービスアカウントに Vertex AI の利用権限が不足していたため、`gcloud` CLI を使用して以下の管理者権限とAPIの有効化を実施しました。
```bash
# Vertex AI 向けエージェントプラットフォーム API を有効化
gcloud services enable aiplatform.googleapis.com --project=my-geodyssai-pro-1744456051163

# サービスアカウントに対して Vertex AI 管理者 (roles/aiplatform.admin) ロールを付与
gcloud projects add-iam-policy-binding my-geodyssai-pro-1744456051163 \
  --member="serviceAccount:firebase-adminsdk-fbsvc@my-geodyssai-pro-1744456051163.iam.gserviceaccount.com" \
  --role="roles/aiplatform.admin"
```

#### ⑥ GitHub 側の初期リポジトリ構築
GitHub MCP サーバー経由で、ユーザーのアカウント配下に非公開（Private）リポジトリを作成し、ローカルのGit origin に追加しました。
```bash
git remote add origin https://github.com/baotianyoutai/geodyssAI.git
```

---

### 2. トラブルシューティング ＆ 学びのポイント

#### 💡 学び1: 仮想環境アクティベート（`activate`）の正しい実行
* **問題**: ユーザーが `.venv/bin/activate` を直接実行した際、`Permission denied` が発生。
* **解決策**: macOS や Linux などの Unix 系シェルでは、`activate` は実行可能ファイルではなく、現在のシェルセッションに変数をエクスポートするスクリプトです。このため、必ず `source` コマンドを使用して読み込む必要があります。
  ```bash
  source .venv/bin/activate
  ```
  アクティベート後は、ターミナルで `python` と打つだけで `.venv` 内の Python インタプリタが優先実行されるようになります。スクリプトを指定せずに `python` だけを実行すると対話型シェル（REPL）に入ってしまうため、スクリプト実行時は必ず `python <スクリプトのパス>` のように引数を与えます。

#### 💡 学び2: GCP IAM 権限伝播の遅延
* **問題**: `gcloud projects add-iam-policy-binding` で権限を付与した直後にテストを実行した際、引き続き接続制限（`403 PERMISSION_DENIED`）のエラーが返された。
* **解決策**: Google Cloud IAM の権限付与は即時ではなく、システム全体へポリシーが伝播（反映）するまでに **1分〜2分程度の遅延** が生じる場合があります。権限付与後に数分待ってからスクリプトを再実行することで正常に接続できるようになります。

#### 💡 学び3: Vertex AI でのモデル名の指定とリージョン
* **問題**: テスト用の軽量モデルとして `gemini-1.5-flash` を呼び出した際、`404 NOT_FOUND`（またはアクセス権がない）エラーが発生した。
* **解決策**: Vertex AI でサポートされているモデル一覧をスクリプト（[test_models.py](file:///Users/tokitayuta/.gemini/antigravity-ide/brain/ae3b0ac4-1eac-493f-ba32-c9d25ead19bc/scratch/test_models.py)）で調査したところ、現在のリージョン・環境では旧バージョンの `gemini-1.5-flash` ではなく、新しい `gemini-2.5-flash` がサポート対象モデルとして提供されていました。モデル名を `gemini-2.5-flash` に修正し、日本国内（`asia-northeast1`）のロケーションを設定することで低レイテンシかつ正常に疎通することを確認しました。

---

### 3. ステップアップのための参考資料 ＆ 公式ドキュメントリンク

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

---

## 【意図】— この AGENT.md v3.2 自体の

**【意図】** ユーザーの学習および再現性を担保するため、これまでに実施したすべてのフォルダ構築、Python 仮想環境の構築、GCP 権限付与等の実行手順やコマンド、および発生した主要エラーと解決アプローチを詳細に付録C（ラーニングノート）としてドキュメント化し、後から自力で1から再現できる構成にアップデートしました。

**【学習ポイント】** ① 仮想環境の `source` 読み込みや IAM 反映遅延といった実務上の「ハマりどころ」を言語化して残すことで、開発効率と再現性を高めることができます。② 使用可能モデルはクラウドのプロジェクト状態により日々変化するため、SDK 経由で動的に `client.models.list()` を調査するスクリプトを書くアプローチがトラブル時に極めて有効です。

**【ステップアップ WEB リンク】**
- Google GenAI SDKモデル一覧の調査: https://github.com/google/generative-ai-python/blob/main/docs/api/google/generativeai/list_models.md
- Firebase Admin SDK認証方法: https://firebase.google.com/docs/admin/setup?hl=ja#initialize-sdk
