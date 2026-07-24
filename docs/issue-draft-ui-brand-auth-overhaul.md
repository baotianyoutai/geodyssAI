# GitHub Issue & Pull Request Draft — UI, Brand Identity & Auth Overhaul

## 📌 Issue Title
`[FEAT/UI] Comprehensive UI Overhaul, Brand Identity Alignment (DESIGN.md), and Real-Time Google Auth / Firestore Synchronization`

---

## 📝 Issue / PR Description

### 1. Context & User Requirements (背景とユーザー要求)
ユーザーとのディスカッションを通じて、以下の UI/UX 改善、ブランドアイデンティティの統一、および認証トラブルの根本解決を実施いたしました。

1. **デザイン・ブランディングの独自化 (パクリ防止)**:
   - 外部サービスの 4 色カラー指定（Google 固有カラーパターン等）を全廃。
   - `DESIGN.md` で定義された `Seikai` (星海) カラーシステム（シアン `#2fd9f4` 〜 スカイ `#38BDF8` 〜 インディゴ `#818CF8` グラデーション）に完全統一。
2. **Streamlit スタイルナビゲーションサイドバー (`Sidebar.tsx`) の追加**:
   - 画面左上に `[menu]` (≡) アイコンで開閉するサイドバーを導入。
   - 3D 星海図左上 HUD 内の重複ボタン（展望台、酒場等）を撤去し、ノイズレスな UI へ整理。
3. **Google 認証＆ポップアップブロック＆App Check 宙に浮き現象の解決**:
   - Google サインイン選択後にプロミスが resolve されず画面が変化しない原因（App Check の未検証トークン保留およびポップアップブロック）を特定・解決。
   - ポップアップブロック時の自動 `signInWithRedirect` フォールバックおよびエラー診断メッセージを強化。
4. **リアルタイム学習記録＆ブックマークの完全同期**:
   - 初回ユーザーのダミー履歴を完全撤去。
   - 記事閲覧時の `readHistory` 自動記録および「星屑の栞 (Stardust Bookmarks)」のリアルタイム Firestore 同期機能を実装。

---

## 🛠️ Key Technical Changes (変更点サマリー)

### 🎨 1. Brand & UI Overhaul
- **`src/components/Sidebar.tsx`**:
  - 開閉トグル式サイドバーコンポーネントを新規作成。
  - ヘッダーロゴを `DESIGN.md` 準拠の `Seikai` グラデーション `geodyssAI` へ統一。
  - フッター表記を `© 2026 geodyssAI` へ更新。
- **`src/components/StellarCanvas.tsx`**:
  - 右上 (`top-6 right-6`) に最優先アクションの「乗船手続き / Sign in」ピルボタンを配置。
  - `CONSTELLATIONS` タブを真下 (`top-20 right-6`) へスライド配置。
  - 左上 HUD から「展望台」「酒場」ボタンを削除。
- **Emoji Removal**:
  - コンポーネントおよび全ページからすべての絵文字を撤去。

### 🔐 2. Auth & App Check Resilience
- **`src/lib/firebase-client.ts`**:
  - `recaptchaSiteKey` が未設定時の `initializeAppCheck` による Auth プロミスサイレント遮断を回避するガードを追加。
  - `markArticleAsRead` および `toggleStardustBookmark` リアルタイム同期関数を追加。
- **`src/components/BoardingModal.tsx`**:
  - 認証完了時に `setUser` およびフォールバックプロファイルへの即時更新を適用。
  - `auth/popup-blocked` 発生時にリダイレクトへ自動遷移するフォールバックを組み込み。

### 📖 3. Real-Time User Progress Sync
- **`src/pages/articles/[slug].astro`**:
  - クライアントサイドでログイン中のユーザーが記事を閲覧した際に `markArticleAsRead` を自動実行。
- **`src/components/ArticleNavigator.tsx`**:
  - 記事末尾の指導ナビゲーターに「星屑の栞に保存」ボタンを追加し、`toggleStardustBookmark` でリアルタイム同期。

---

## 🧪 Verification & Deployment (検証およびデプロイ結果)

- [x] **Local Build Test**: `npm run build` がエラーなく完了。
- [x] **Firebase Deploy**: `npx -p firebase-tools firebase deploy --only hosting` により本番公開済み。
- [x] **Production Domain Check**: `https://geodyssai.com/` にて Google アカウント（鴇田優太様）での本物認証、サイドバー開閉、リアルタイム読了＆ブックマーク数同期を実機検証・確認済み。

---

## 📜 Documentation Updates
- Updated `CHANGELOG.md` with release notes for **v1.1.0**.
- Added **ADR-005**, **ADR-006**, and **ADR-007** to `docs/decisions.md`.
- Added **Section 10** operational & learning log to `docs/learning-notes.md`.
