# Architecture Decision Records (ADR) — geodyssAI

## ADR-001: Headless Astro × Firebase アーキテクチャの採用
- **日付**: 2026-07-19
- **ステータス**: 承認済 (Accepted)
- **文脈**: WordPress (ConoHa WING) のモノリシック構成から、高速かつ現代的な探索体験を提供する Headless 構成へ移行。
- **決定**: Astro (SSG / Islands Architecture) + Firebase (Firestore / Auth / Hosting / App Check) を採用。

## ADR-002: UMAP + Gemini Embedding による 3D 星海図の配置
- **日付**: 2026-07-21
- **ステータス**: 承認済 (Accepted)
- **文脈**: 全記事を意味的近傍に基づいて 3D 空間に可視化する必要がある。
- **決定**: `text-embedding-005` でベクトル化し、UMAP (`n_components=3, metric='cosine'`) で 3D 座標縮約。難易度評価を Z 軸オフセットへ適用。

## ADR-003: Firebase App Check (reCAPTCHA Enterprise) の導入
- **日付**: 2026-07-24
- **ステータス**: 承認済 (Accepted)
- **文脈**: AI Logic (Gemini API) および Firestore の不正利用・費用高騰を防ぐ。
- **決定**: reCAPTCHA Enterprise による App Check の統合および開発用 debug token のセルフヒーリング導入。

## ADR-004: Firebase Hosting へのデプロイおよび ConoHa WING からの DNS 切替完了
- **日付**: 2026-07-25
- **ステータス**: 完了 (Completed)
- **文脈**: 新サイト (`geodyssai.com`) の本番公開と旧 ConoHa WING サーバーからの切り替え。
- **決定**:
  - `geodyssai.com` および `www.geodyssai.com` の A レコードを Firebase Hosting (`199.36.158.100`) へ切り替え完了。
  - Firebase による SSL (HTTPS) 証明書の自動発行および有効化を確認。
  - **保全措置**: 切り戻し保険として ConoHa サーバー契約は 1 ヶ月間維持。

## ADR-005: 独自ブランドアイデンティティと DESIGN.md (Seikai) カラーシステムの徹底適用
- **日付**: 2026-07-25
- **ステータス**: 承認済 (Accepted)
- **文脈**: 他社プロダクト（Google 等）の 4 色カラー指定の模倣・パクリを防止し、`geodyssAI` 独自のビジュアルアイデンティティを統一・確立する。
- **決定**:
  - `DESIGN.md` で定義された `Seikai` (星海) カラーパレット（シアン `#2fd9f4` 〜 スカイ `#38BDF8` 〜 インディゴ `#818CF8`）にブランドロゴ・UI を全面統一。
  - 外部サービスの固有デザインの模倣を全廃し、プログレッシブかつ一貫したダークグラスモーフィズムデザインを適用。

## ADR-006: Streamlit スタイルナビゲーションサイドバー (`Sidebar.tsx`) の採用と UI 単一責任化
- **日付**: 2026-07-25
- **ステータス**: 承認済 (Accepted)
- **文脈**: 画面各所に分散していたナビゲーションボタン（展望台、酒場、乗船手続き）のノイズを整理し、操作性を向上させる。
- **決定**:
  - 画面左上に `[menu]` (≡) アイコンでトグルする開閉式サイドバー (`Sidebar.tsx`) を設置。
  - 3D 星海図右上には一次アクションの「乗船手続き（Sign in / ユーザー名）」ピルボタンを単一配置し、直感的な UI を実現。

## ADR-007: Firebase Auth / App Check プロミス宙に浮き防止ガードおよびポップアップ遮断フォールバック設計
- **日付**: 2026-07-25
- **ステータス**: 承認済 (Accepted)
- **文脈**: `signInWithPopup` 実行時、App Check の設定不整合またはブラウザのポップアップブロックにより、認証結果のプロミスが resolve されず画面がフリーズして見える不具合が発生。
- **決定**:
  - App Check の初期化において recaptcha キー未設定時は安全にバイパスするガードを追加。
  - `auth/popup-blocked` エラー発生時は自動的に `signInWithRedirect` へリダイレクト切り替えするフォールバックを組み込み、確実なユーザー乗船を保障。

## ADR-008: サーバーサイドデータ取得時における本文フィールド (contentMd) 抽出の保証
- **日付**: 2026-07-25
- **ステータス**: 承認済 (Accepted)
- **文脈**: `firebase-server.ts` の `getArticles()` においてメタデータのみが返され、記事本文（Markdown）がビルド対象から欠落し画面上で消えるバグが発生。
- **決定**:
  - `getArticles()` 内の返り値オブジェクトに `contentMd: data.contentMd || data.content || ''` を常時含めるよう型および変換処理を修正。
  - 静的プレレンダリング（SSG）プロセスにおいて全記事の本文 HTML が正しく展開・生成されることを保証。

## ADR-009: 公式 Google Gen AI SDK (@google/genai) への移行と Gemini 3.5 Flash / Grounding の採用
- **日付**: 2026-07-25
- **ステータス**: 承認済 (Accepted)
- **文脈**: 非推奨・廃止された旧モデル (`gemini-1.5-flash`, `gemini-2.5-flash`) の通信エラーを回避し、高速かつリアルタイムな AI 応答を実現する。
- **決定**:
  - 公式 `@google/genai` SDK を導入し、現行最新モデル `gemini-3.5-flash` を採用。
  - Google 検索 Grounding (`tools: [{ googleSearch: {} }]`) を有効化し、最新の Web 情報に準拠した回答を生成。
  - `src/lib/ai-logic.ts` モジュールへカプセル化し、安定した AI 指導・要約・RAG 応答を提供。

## ADR-010: reCAPTCHA Enterprise App Check 適用とスレッド全端末同期
- **日付**: 2026-07-25
- **ステータス**: 承認済 (Accepted)
- **文脈**: 本物の reCAPTCHA Enterprise サイトキー適用および他端末・スマホでの掲示板スレッド同期。
- **決定**:
  - `src/lib/firebase-client.ts` にサイトキー `6LfdWbQsAAAAAGht9Q4Os6xikVRfFBhL8I3GZaBn` および `window.useEnterprise = true` を適用。
  - Firestore Security Rules で `threads` の読取・書込を許可し、未ログインを含む全端末・全ユーザー間でスレッド投稿をリアルタイム共有。

## ADR-011: モバイル表示最適化（ボトムシート、Munchkin Navigator 位置調整、left-0 スライドドロワー）の採用
- **日付**: 2026-07-25
- **ステータス**: 承認済 (Accepted)
- **文脈**: スマートフォン閲覧時における UI コンポーネント重なり（記事カード、星座凡例、AIナビ）およびサイドバー横ずれ表示の解消。
- **決定**:
  - `StellarCanvas.tsx`: モバイル閲覧時は画面下部「ボトムシート」に記事情報を集約し、画面要素重なりを 0% 化。
  - `MunchkinNavigator.tsx`: モバイル表示位置を右上「乗船手続き」ボタンのすぐ真下 (`top-16 right-4`) に再配置し、対話窓を `340px` 幅に最適化。
  - `Sidebar.tsx`: サイドバーを画面最左端 (`left-0`) 固定のフルハイトドロワーにし、暗転バックドロップタップで閉じるモダン UX を確立。
