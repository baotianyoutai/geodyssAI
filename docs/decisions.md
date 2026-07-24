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
