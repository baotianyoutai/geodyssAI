# [Phase 4] Production Deployment & DNS Switch (ConoHa WING -> Firebase Hosting)

## 📌 Issue 概要
本 Issue では、`geodyssAI` プロジェクトの **Phase 4: 本番公開および DNS 切り替え** において実施したビルド検証、デプロイ、ConoHa WING から Firebase Hosting への DNS 移行 (`geodyssai.com`)、SSL/HTTPS 化、コスト構造検証、および切り戻し（Rollback）戦略に関するすべての作業と議論・学習ポイントを網羅的に記録します。

---

## 🛠️ 1. 実施した作業と検証結果

### 1.1 `npm run build` による SSG / SSR ビルド検証
- **コマンド**: `npm run build`
- **成果**: 全 28 記事の個別ページ (`/articles/*`)、星海図トップ (`/index.html`)、`captain`、`observatory`、`tavern` などの各静的 HTML ページを `dist/client` へ事前生成。
- **アーキテクチャ学習**:
  - `dist/client`: ブラウザへ直配信される静的 HTML, React 3D UI JavaScript (`_astro/`), CSS, 画像アセット。Firebase Hosting の CDN 経由で超高速配布される。
  - `dist/server`: Node.js サーバー環境で動く SSR / API バックエンドプログラム (`entry.mjs`, `/api/chat` 等の RAG 用コード)。

### 1.2 `firebase deploy` による本番アップロード
- **コマンド**: `npx -p firebase-tools firebase deploy --only hosting`
- **成果**: `my-geodyssai-pro-1744456051163` プロジェクトへ 48 個のアセットを完全配信。

### 1.3 ConoHa WING から Firebase Hosting への DNS 切り替え
- **対象ドメイン**: `geodyssai.com` / `www.geodyssai.com`
- **設定内容**:
  - **A レコード**: `@` および `www` のレコードの値を旧サーバー (`118.27.122.217`) から Firebase の IP (`199.36.158.100`) へ変更。
  - **TXT レコード**: 所有権証明用の合言葉メモ (`hosting-site=my-geodyssai-pro-1744456051163`) を `@` に追加。

---

## 💡 2. ディスカッションと技術的学習ポイント

### Q1. DNS レコードの構成要素の意味
- **`A レコード`**: ブラウザが実際に通信する行き先の IP アドレスを指定する設定。Webサイトの表示先を決定する本質。
- **`TXT レコード`**: ドメインに添付する単なるテキストメモ。アクセス先を転送する力はなく、Firebase 側が「ドメイン所有者の本人確認」をするための証明書として利用される。
- **`@` (名称)**: サブドメインのつかないドメイン本体 (`geodyssai.com`) を意味する。
- **`3600` (TTL)**: キャッシュ保持時間 (Time To Live)。世界中の DNS サーバーがこの設定を 3600秒（1時間）保持するという指示。

### Q2. ACME チャレンジと SSL (HTTPS) 自動発行の仕組み
- A レコードが Firebase の IP を向くと、Firebase 側が自動で Let's Encrypt / Google Trust Services と HTTP 通信を行い、手動操作なしで自動的に SSL 証明書を発行・適用する。
- 移行直後の「接続はプライベートではありません」警告画面は、Aレコード到達〜SSL証明書適用完了までの数分〜30分間の正常な過渡期現象であることを解明。

### Q3. アーキテクチャ変更によるコスト削減効果
- **旧構成 (ConoHa WING WordPress)**: 月額サーバー代 約 1,000〜1,400 円（年間約 1.5 万円の固定費）。
- **新構成 (Astro + Firebase + Gemini)**: Firebase Hosting 無料枠（10GBストレージ / 360MB/日転送）、Firestore 無料枠（5万回読込/日）、Gemini API（従量数十円）により、**年間約 2,000〜3,000 円（ドメイン代のみ）へ約 85% コスト削減**。

### Q4. 安全運用・切り戻し（Rollback）戦略
- **1ヶ月間の ConoHa サーバー契約保全**:
  切り替え後 1 ヶ月間は旧 WordPress サーバーを解約せず維持する。
- **ワンタッチ復元**: 万が一新サイトで不具合が発生した場合、ConoHa DNS の A レコードを旧 IP (`118.27.122.217`) に戻すだけで、数分で旧 WordPress へ完全復元可能。1ヶ月間問題がなければ安心してサーバー契約のみ解約する。

---

## 📚 3. ステップアップ参考ドキュメント (3点セット)
1. [Firebase Hosting カスタムドメイン接続公式ガイド](https://firebase.google.com/docs/hosting/custom-domain)
2. [DNS AレコードとTXTレコードの役割解説 (Cloudflare Docs)](https://www.cloudflare.com/ja-jp/learning/dns/dns-records/)
3. [Astro Output Modes & Server-Side Rendering Guide](https://docs.astro.build/en/guides/on-demand-rendering/)
