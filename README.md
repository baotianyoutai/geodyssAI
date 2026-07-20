# geodyssAI — 星海 (Seikai) プロジェクト README (v1.1 最終完全版)

 知の星海を、一度にひとつの航海で。
*- Your Compass to navigate the AI-natives, One Voyage at a Time -*

---

## 🌌 1. プロジェクト概要

**geodyssAI (ジオディサイ)** は、AI・データサイエンス・モダンフロントエンドの知識を「星海（せいかい）」として可視化し、読者が自らの「航路」を切り拓く没入型 AI 技術ブログプロジェクトです。

既存の WordPress サイトを **Astro × Firebase × React Three Fiber (R3F)** の構成へと Headless 移行し、単なる情報の羅列を「空間的な探索体験」へと昇華させます。

### 🌠 コンセプト
全記事を Embedding（分散表現）を用いて 3D 空間上に配置。意味が近い記事は近くに、難易度が高い記事は深い場所（アビス）に浮かびます。読者は「船長（Captain）」として、星を灯し、星座を完成させ、自らの航海日誌（Voyager's Log）を綴ります。

---

## 🚀 2. 技術スタック

本プロジェクトは、最新の Web 技術と AI を融合させたアーキテクチャを採用しています。

### 🏗️ フロントエンド
- **Astro**: SSG (Static Site Generation) による圧倒的な高速化と、Islands Architecture による動的要素の共存。
- **Tailwind CSS**: デザイントークンに基づいた、一貫性のあるスタイリング。
- **React**: インタラクティブな UI 島（Islands）の実装。

### 🌌 3D & 没入感
- **Three.js / React Three Fiber**: ブラウザ上に広がる 3D 星海図のレンダリング。
- **Post-processing (Bloom)**: 漆黒の宇宙に浮かぶ、幻想的な星々の輝きを表現。
- **WebGL Shaders**: 霧（下書き）やオーロラ（称号）などの動的な視覚効果。

### 🧠 AI & Backend (Firebase)
- **Gemini AI (Google)**: 記事の要約、意味解析、RAG（検索拡張生成）チャット。
- **Firebase Authentication**: Google アカウントによるシームレスな乗船体験。
- **Cloud Firestore**: 記事データ、ユーザーの航海履歴、勲章の保存。
- **App Check**: AI 機能の不正利用を防ぐセキュリティ基盤。

### 🧪 データサイエンス (ETL)
- **Python (UMAP / Scikit-learn)**: 記事を 3D 空間に配置するための次元削減と、近傍星の計算。

---

## 🚢 3. 主要な「航路」（画面構成）

| 画面名 | 役割 | デザインの特徴 |
|---|---|---|
| **Stellar Chart** | 星海図トップ | フル画面の 3D 空間。スクロールとマウスに連動する幻想的な WebGL/Three.js 空間。 |
| **Lighthouse** | 記事ページ | Medium 風の洗練された可読性と、読了に合わせた「星屑」収集演出。 |
| **Voyager's Log** | 航海日誌 | 船長の統計、獲得した勲章、Google Auth 連動のプロフィール管理。 |
| **Observatory** | 展望台 | 特定の星座（カテゴリ）に集中して潜航する特訓空間。 |
| **Munchkin Navigator** | AI チャット | 案内役マンチカンとの RAG 対話。極北のグラスモーフィズム UI。 |
| **Stellar Tavern** | 船長たちの議論場 | 星座別のディスカッションスレッド。緩やかな船長同士の繋がり。 |
| **Comms Relay** | 通信室 | 問い合わせフォームと FAQ。管制塔をイメージした機能的 UI。 |
| **Boarding** | 乗船モーダル | Google Auth によるログイン導線。 |
| **星海碑 (Monolith)** | 星座完遂の記憶 | 星座完遂時に現れる神話的な「古文書」要約体験。 |

---

## 🎮 4. ゲーミフィケーションと演出

本プロジェクトは、読者が「知識を蓄積する」ことを「航海を進める」こととして体験できるよう設計されています。

- **星座の完成 (Constellation Complete)**: 特定カテゴリの記事を全読破すると、星海図上で星座線がオーロラ色に輝き、**星海碑（Monolith）**が解放されます。
- **動的な称号（オーロラ）**: 読んでいる記事の傾向に応じて、プロフィールカードのオーロラの色がリアルタイムに変化します。
- **星屑の栞 (Stardust Bookmark)**: 読みかけの星が 2 秒周期で脈動（Pulsing）し、再訪を促します。
- **共有された航路 (Public Log)**: 他の船長の足跡が「ゴースト・ライン」として星海図に重なり、緩やかな繋がりを感じさせます。
- **未公開霧 (Mist)**: まだ公開されていない「下書き」記事を幻想的な霧で包み込み、探索の期待感を高めます。

---

## 🛠️ 5. 開発者・船長へのガイド

本プロジェクトは、AI エージェント **Antigravity** との共創（SDD: Specification Driven Development）を前提としています。

### 📁 ディレクトリ構成案
- `/src/pages`: Astro ページ（静的コンテンツ）
- `/src/components`: React Three Fiber の星海図、チャットウィジェット、UI Islands
- `/src/lib`: Firebase、Gemini API、App Check の初期化
- `/scripts/etl`: WordPress から Firestore への移行スクリプト（01_parse.py 〜 04_upload.py）

### 🧭 実装の理
実装にあたっては、ルートディレクトリにある **`AGENT.md`**（技術仕様）と **`DESIGN.md`**（デザイン仕様）を必ず「信頼できる唯一の情報源（SSOT）」として参照してください。

### ⚓ 着手手順
初回セットアップ（Firebase / 鍵 / フォルダ骨格）と Sprint ごとの進行手順・起点プロンプト集は **`KICKOFF.md`** に集約しています。作業開始前に必ず一読してください。

---

## 🐾 6. 航海士マンチカンより

「船長、この星海はまだ無限に広がっているニャ。知識という名の星を灯し、あなただけの航路を刻んでほしいニャ。Antigravity、このデザインに命を吹き込む準備はいいかニャ？ボナ・ヴォヤージュニャ！🚢✨🌌🐾」

---

## 📋 7. ライセンス / 謝辞
- **Owner**: Yuta (AI Engineer / Data Scientist)
- **Tools**: Google Stitch, Google Antigravity, Astro, Firebase, Three.js
- **Special Thanks**: Google I/O Extended Tokyo 2026 Workshop Participants
