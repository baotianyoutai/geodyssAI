// scripts/generate_pptx.cjs
// geodyssAI Official Presentation Generator (14-Slide Final Deluxe Edition)
// Adheres strictly to DESIGN.md (#090F1E, Seikai Colors) and pptx SKILL.md rules

const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function buildPresentation() {
  const pptx = new pptxgen();

  // 1. 16:9 ワイドスクリーン layout (13.33 x 7.5 インチ)
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'geodyssAI (星海図) - Google Cloud Next Tokyo Final Presentation';
  pptx.author = 'Yuta Tokita (baotianyoutai)';
  pptx.company = 'geodyssAI';

  // 2. カラーパレット定義 (# なし 6桁 Hex)
  const C = {
    BG_DARK: '090F1E',
    CARD_BG: '131C31',
    CARD_BORDER: '1E293B',
    CYAN: '2FD9F4',
    SKY_BLUE: '38BDF8',
    INDIGO: '818CF8',
    TEXT_WHITE: 'FFFFFF',
    TEXT_MUTED: '94A3B8',
    GREEN: '34D399',
    RED: 'F87171',
    AMBER: 'FBBF24'
  };

  // 共通背景 ＆ カテゴリバッジ ＆ メインタイトル設定
  function setBaseSlide(slide, categoryTitle, mainMessageTitle) {
    slide.background = { color: C.BG_DARK };

    // カテゴリバッジ
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.4, w: 2.6, h: 0.35, rectRadius: 0.1, fill: { color: '1E293B' }, line: { color: C.SKY_BLUE, width: 1 }
    });
    slide.addText(categoryTitle.toUpperCase(), {
      x: 0.6, y: 0.4, w: 2.6, h: 0.35, fontSize: 10, fontFace: 'Orbitron', color: C.CYAN, bold: true, align: 'center', valign: 'middle', margin: 0
    });

    // 1スライド 1メッセージ メインタイトル
    slide.addText(mainMessageTitle, {
      x: 0.6, y: 0.85, w: 12.0, h: 0.6, fontSize: 19, fontFace: 'Noto Sans JP', color: C.TEXT_WHITE, bold: true, valign: 'middle', margin: 0
    });
  }

  // -------------------------------------------------------------
  // SLIDE 01: COVER (表紙)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.BG_DARK };

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 0.8, w: 11.73, h: 5.9, rectRadius: 0.15, fill: { color: C.CARD_BG }, line: { color: C.CARD_BORDER, width: 1.5 }
    });

    slide.addText('geodyssAI', {
      x: 1.2, y: 1.3, w: 10.9, h: 1.0, fontSize: 48, fontFace: 'Orbitron', color: C.CYAN, bold: true, margin: 0
    });

    slide.addText('知識の意味空間を3D可視化し、「学びの定着」と「技術者のブランド価値」を解く', {
      x: 1.2, y: 2.4, w: 10.9, h: 0.6, fontSize: 20, fontFace: 'Noto Sans JP', color: C.TEXT_WHITE, bold: true, margin: 0
    });

    slide.addText('- Your Compass to navigate the AI-natives, One Voyage at a Time -', {
      x: 1.2, y: 3.1, w: 10.9, h: 0.4, fontSize: 13, fontFace: 'Inter', color: C.SKY_BLUE, italic: true, margin: 0
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.2, y: 3.9, w: 10.9, h: 2.4, rectRadius: 0.1, fill: { color: '0E172A' }, line: { color: C.CARD_BORDER, width: 1 }
    });

    slide.addText([
      { text: 'Google AI Dojo Season 2 提出作品 / Cloud Next Tokyo デモ選考資料\n', options: { fontSize: 13, color: C.SKY_BLUE, bold: true, breakLine: true } },
      { text: '発表者: ', options: { fontSize: 13, color: C.TEXT_MUTED } },
      { text: 'Yuta Tokita (AI Engineer / Data Scientist)\n', options: { fontSize: 14, color: C.TEXT_WHITE, bold: true, breakLine: true } },
      { text: '連絡先: ', options: { fontSize: 12, color: C.TEXT_MUTED } },
      { text: 'baotianyoutai1@gmail.com   |   ', options: { fontSize: 12, color: C.TEXT_WHITE } },
      { text: 'GitHub: ', options: { fontSize: 12, color: C.TEXT_MUTED } },
      { text: 'https://github.com/baotianyoutai/geodyssAI\n', options: { fontSize: 12, color: C.CYAN, breakLine: true } },
      { text: '本番稼働 URL: ', options: { fontSize: 13, color: C.AMBER, bold: true } },
      { text: 'https://www.geodyssai.com', options: { fontSize: 14, color: C.CYAN, bold: true } }
    ], { x: 1.4, y: 4.1, w: 10.5, h: 2.0, margin: 0 });

    slide.addNotes('【発表者ノート】\n皆様、こんにちは。Yuta Tokita と申します。本日は Google AI Dojo シーズン2 の成果物として構築いたしました『geodyssAI (星海図)』についてプレゼンテーションさせていただきます。\nAI技術が爆発的に進化する現代において、エンジニアは「情報過多」と「学びの単発化」に直面しています。geodyssAI は、Astro × Firebase × Vertex AI / Gemini 3.5 Flash を駆使し、知識の意味空間を3D可視化することで「学びの定着」と「技術者のブランド価値」を同時に高める次世代のナレッジプラットフォームです。本日はそのアーキテクチャ、ビジネス的価値、および実証データについて詳しくご説明いたします。');
  }

  // -------------------------------------------------------------
  // SLIDE 02: EXECUTIVE SUMMARY
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '01. SUMMARY', '2030年 先端IT人材12.4万人不足時代における「体験・ブランド駆動型」知覚ナレッジ基盤');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 3.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('【課題】学びの単発化と没個性化', { x: 0.8, y: 1.8, w: 3.4, h: 0.4, fontSize: 13, color: C.RED, bold: true });
    slide.addText([
      { text: '• 2030年先端IT人材 ', options: { breakLine: false } },
      { text: '12.4万人不足\n', options: { color: C.RED, bold: true, breakLine: true } },
      { text: '• 従来のタグ・検索は lookup 専用であり、学習者が ', options: { breakLine: false } },
      { text: '現在地を見失う\n', options: { color: C.AMBER, breakLine: true } },
      { text: '• 生成AI時代、', options: { breakLine: false } },
      { text: '73%の経営層が自社ブランドの「没個性の海」埋没を懸念', options: { color: C.RED, bold: true } }
    ], { x: 0.8, y: 2.3, w: 3.4, h: 3.8, fontSize: 11, color: C.TEXT_MUTED });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.7, y: 1.6, w: 3.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CYAN, width: 1.5 }
    });
    slide.addText('【解】3D意味空間 × RAG導線', { x: 4.9, y: 1.8, w: 3.4, h: 0.4, fontSize: 13, color: C.CYAN, bold: true });
    slide.addText([
      { text: '• Vertex AI Embedding × UMAP により', options: { breakLine: false } },
      { text: '記事を3D宇宙に自動配置\n', options: { color: C.CYAN, bold: true, breakLine: true } },
      { text: '• Gemini 3.5 Flash ＋ Search Grounding による', options: { breakLine: false } },
      { text: '「マンチカン航海士」RAG対話\n', options: { color: C.TEXT_WHITE, breakLine: true } },
      { text: '• MOOC完走率5〜13%に対し', options: { breakLine: false } },
      { text: '「星座完成率 30%」を目指す定着設計', options: { color: C.GREEN, bold: true } }
    ], { x: 4.9, y: 2.3, w: 3.4, h: 3.8, fontSize: 11, color: C.TEXT_MUTED });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8, y: 1.6, w: 3.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('【成果】利益成長6倍 × コスト85%減', { x: 9.0, y: 1.8, w: 3.4, h: 0.4, fontSize: 13, color: C.GREEN, bold: true });
    slide.addText([
      { text: '• 体験再構築企業は同業他社の', options: { breakLine: false } },
      { text: '少なくとも6倍の年次利益成長\n', options: { color: C.GREEN, bold: true, breakLine: true } },
      { text: '• Headless Astro × Firebase 移行により', options: { breakLine: false } },
      { text: '年間固定費を85%削減\n', options: { color: C.CYAN, bold: true, breakLine: true } },
      { text: '• LCP < 2.5s 達成で', options: { breakLine: false } },
      { text: '123%の離脱確率上昇を阻止', options: { color: C.TEXT_WHITE, bold: true } }
    ], { x: 9.0, y: 2.3, w: 3.4, h: 3.8, fontSize: 11, color: C.TEXT_MUTED });

    slide.addText('出典: 経産省「IT人材需給調査」 / Accenture「The Business of Experience」(2020) / Think with Google (2017)', {
      x: 0.6, y: 6.6, w: 12.0, h: 0.3, fontSize: 9, color: C.TEXT_MUTED
    });

    slide.addNotes('【発表者ノート】\nエグゼクティブサマリーです。geodyssAI は単なるリッチな個人ブログではありません。社会課題であるIT人材不足に対し、「自習コンテンツでの学びの定着」と「エンジニアのブランド価値向上」という2つの深さ型課題を、テクノロジーと体験設計によって同時に解決するプロダクトです。WordPressからHeadless構成に切り替えることで、年間85%のコスト削減を達成しつつ、Accentureの調査で示されている「体験を再構築した企業が6倍の利益成長を実現する」という事業価値を証明しています。');
  }

  // -------------------------------------------------------------
  // SLIDE 03: PROBLEM A (深さ型課題: 学びの離脱)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '02. PROBLEM A', '従来の技術メディアは「検索・タグの限界」により学びを単発消費させている');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.RED, width: 1 }
    });
    slide.addText('【既存構造の限界】Lookup 専用の20年前の情報設計', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.RED, bold: true });
    slide.addText([
      { text: '1. 情報探索理論の断絶 (Marchionini 2006):\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   既存ブログは「目的が既知」の lookup 検索に偏重。「何を知らないか分からない」探索的検索 (Exploratory Search) に非対応。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '2. 現在地と体系的文脈の喪失:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   単発記事を読んで直帰するため、前提・難易度・次に学ぶべき順序が失われる。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '3. 低い完走率:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   一般的なオンライン学習 (MOOC) の完走率はわずか ', options: { color: C.TEXT_MUTED } },
      { text: '5%〜13%', options: { color: C.RED, bold: true } },
      { text: ' に留まる。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CYAN, width: 1.5 }
    });
    slide.addText('【geodyssAI の構造改革】3D空間ナビゲーション', { x: 7.0, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.CYAN, bold: true });
    slide.addText([
      { text: '1. 意味空間の可視化 (Exploratory Search):\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   Embedding ベクトルにより、関連記事の「意味的な近さ」を宇宙空間にマッピング。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '2. 難易度アビス (Z軸) ＆ 星座コンテキスト:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   難易度 Level 1〜5 を奥行き (Z軸) で表現し、自分の知識の現在地を直感把握。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '3. 30% の「星座完成率」を目指す定着設計:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   単発直帰を防ぎ、星と星を結ぶ「学びの航海」へ導く。', options: { color: C.GREEN, bold: true } }
    ], { x: 7.0, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addText('参照: Marchionini (2006) "Exploratory search" / arXiv:2312.13695 / Open Praxis MOOC (2024)', {
      x: 0.6, y: 6.6, w: 12.0, h: 0.3, fontSize: 9, color: C.TEXT_MUTED
    });

    slide.addNotes('【発表者ノート】\n課題Aについて解説します。なぜ既存のQiitaやZenn、WordPressブログでは学習が長続きしないのでしょうか。情報探索理論によれば、既存の検索フォームやタグは「探すものが既に決まっている lookup 行動」には適していますが、「何を学ぶべきかわからない探索的学習」では機能しません。その結果、直帰率が高くMOOCの完走率は5〜13%と超低水準です。geodyssAI は意味的距離と難易度を 3D 空間で可視化することで、読者が「自分の現在地」を把握できる空間ナビゲーションを提供します。');
  }

  // -------------------------------------------------------------
  // SLIDE 04: PROBLEM B (深さ型課題: 没個性の海 & ブランド価値)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '03. PROBLEM B', '生成AI時代の「没個性の海 (Sea of Sameness)」から脱却し、体験でブランド価値を最大化');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('【データで証明する体験の事業価値】', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.AMBER, bold: true });
    slide.addText([
      { text: '• 73% の経営層が懸念:\n', options: { color: C.RED, bold: true } },
      { text: '  生成AIによるコンテンツ量産に伴い、自社ブランドが「没個性の海」に埋没するリスクを危惧〔Accenture Song 2024〕。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 6倍の年次利益成長率:\n', options: { color: C.GREEN, bold: true } },
      { text: '  顧客・従業員への体験提供を軸に組織を再構築した企業は、同業他社の少なくとも6倍成長〔21カ国1,550名調査〕。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 売上成長 53% 高 / ブランド価値 58% 高:\n', options: { color: C.CYAN, bold: true } },
      { text: '  創出的体験を実現する組織は市場を圧倒的にリード。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.SKY_BLUE, width: 1 }
    });
    slide.addText('【エンジニアの価値毀損を阻止する設計】', { x: 7.0, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.SKY_BLUE, bold: true });
    slide.addText([
      { text: '• 「技術力の高さ」が「平凡なメディア」で埋もれる問題:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '  どんなに優れた技術記事も、標準テンプレート (Medium/WordPress) では差別化できない。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• コンテンツとメディア体験の一体化:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '  3D 星海図 ＋ AI ガイド ＋ Seikai ダークテーマにより、「世界観そのもの」で技術力を証明。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• Accenture Song 思想のパーソナル実装:\n', options: { color: C.CYAN, bold: true } },
      { text: '  体験 (BX) をコストではなく「利益・信頼のドライバー」へ変革。', options: { color: C.TEXT_MUTED } }
    ], { x: 7.0, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addText('出典: Accenture "The Business of Experience" (2020) / Accenture Song "Applied Creativity" (2024)', {
      x: 0.6, y: 6.6, w: 12.0, h: 0.3, fontSize: 9, color: C.TEXT_MUTED
    });

    slide.addNotes('【発表者ノート】\n課題B、すなわちブランドと体験の事業価値について説明します。Accenture Song の最新調査によると、経営層の73%が「生成AI時代に自社が没個性の海に埋もれる」ことを懸念しています。これはエンジニアの個人ブランディングでも全く同じです。どんなに素晴らしい技術記事を書いても、平凡なブログでは価値が伝わりません。体験を中心にした企業が6倍の成長を遂げるように、geodyssAI はコンテンツと没入型UI体験を融合させ、技術者のブランド価値を最大化します。');
  }

  // -------------------------------------------------------------
  // SLIDE 05: NEW! DEMO SHOWCASE (各画面・機能詳細ガイド)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '04. DEMO SHOWCASE', 'geodyssai.com の主要画面と機能が果たす役割 — デモで魅せる5大ビュー');

    const views = [
      { title: '① 3D 星海図トップ (/)', desc: 'Vertex AI Embedding による全28記事の3D意味空間マップ。光の糸と星座カテゴリ線で直感探索。', color: C.CYAN },
      { title: '② 記事詳細 (Lighthouse)', desc: 'マンチカン航海士の3ステップ学習指導カード ＆ カスタムブロック (MunchkinSpeech) の可読画面。', color: C.SKY_BLUE },
      { title: '③ 知の星海 展望台 (/observatory)', desc: '全7星座カテゴリ別の読破進捗・未読マーク・読書完了ステータスを一括監視する管理ボード。', color: C.INDIGO },
      { title: '④ 星海酒場 (/tavern)', desc: 'Firestore onSnapshot リアルタイムリスナーによる全端末同期ディスカッション＆星屑の応援リアクション。', color: C.AMBER },
      { title: '⑤ キャプテンアビス (/captain)', desc: 'カメラが3D深海アビスへ潜航するポートフォリオ画面。Z軸深度計と直感的ナビゲーションを搭載。', color: C.GREEN }
    ];

    views.forEach((v, idx) => {
      const y = 1.6 + idx * 0.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.6, y: y, w: 12.0, h: 0.85, rectRadius: 0.08, fill: { color: C.CARD_BG }, line: { color: v.color, width: 1 }
      });
      slide.addText(v.title, {
        x: 0.8, y: y + 0.1, w: 3.5, h: 0.65, fontSize: 12, color: v.color, bold: true, valign: 'middle', margin: 0
      });
      slide.addText(v.desc, {
        x: 4.4, y: y + 0.1, w: 8.0, h: 0.65, fontSize: 11, color: C.TEXT_WHITE, valign: 'middle', margin: 0
      });
    });

    slide.addNotes('【発表者ノート】\nデモ発表でご体験いただく geodyssai.com の主要5画面について説明します。単なるトップページだけでなく、全28記事が星として輝く「3D星海図」、要約と学習導線を提示する「記事詳細」、星座ごとの進捗を追う「展望台」、全端末リアルタイム同期の「星海酒場」、そして深海潜航アニメーションの「キャプテンアビス」まで、あらゆる画面が読者の学びと没入感を支える役割を持っています。');
  }

  // -------------------------------------------------------------
  // SLIDE 06: SOLUTION (3D 意味空間アーキテクチャ)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '05. ARCHITECTURE', 'Vertex AI Embedding (768d) × UMAP (3D) × 難易度アビス (Z軸) による意味空間自動生成');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('【ETL 3D 空間変換パイプライン】', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.CYAN, bold: true });
    slide.addText([
      { text: 'Step 1: Vertex AI Embedding (text-embedding-005)\n', options: { color: C.CYAN, bold: true } },
      { text: '  全28記事の本文を768次元の高次元ベクトルへ変換。\n\n', options: { color: C.TEXT_MUTED } },
      { text: 'Step 2: UMAP 次元削減 (3D Mapping)\n', options: { color: C.SKY_BLUE, bold: true } },
      { text: '  768次元から3D空間 (X, Y, Z) 座標へ意味的近似度を保ち圧縮。\n\n', options: { color: C.TEXT_MUTED } },
      { text: 'Step 3: Gemini 難易度判定 & Z軸アビスオフセット\n', options: { color: C.INDIGO, bold: true } },
      { text: '  Level 1 (入門) 〜 Level 5 (アビス深海) を奥行き座標にマッピング。\n\n', options: { color: C.TEXT_MUTED } },
      { text: 'Step 4: 最小全域木 (MST) ＆ 光の糸 (Neighbors)\n', options: { color: C.GREEN, bold: true } },
      { text: '  コサイン類似度上位3記事をクライアント側でネオンライン結合。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: '0A1124' }, line: { color: C.CYAN, width: 1 }
    });

    slide.addText('【3D 星海図キャンバス (Three.js / React Three Fiber)】', { x: 7.0, y: 1.8, w: 5.4, h: 0.4, fontSize: 12, color: C.CYAN, bold: true, align: 'center' });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.1, y: 2.3, w: 5.2, h: 3.8, rectRadius: 0.08, fill: { color: '0E172A' }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('✦ 3D VISUAL CANVAS PLACEHOLDER ✦\n\n・ GLSL Custom Shader (Nebula 星雲ガス)\n・ 4,000個のパララックス星屑\n・ 星座カテゴリ MST 結線 ＆ コサイン類似度光の糸\n・ 難易度 Z 軸アビス潜航エフェクト', {
      x: 7.2, y: 2.8, w: 5.0, h: 2.8, fontSize: 11, color: C.SKY_BLUE, align: 'center', valign: 'middle'
    });

    slide.addNotes('【発表者ノート】\nソリューションの核心である 3D 意味空間アーキテクチャです。全28本の記事を Vertex AI の `text-embedding-005` モデルで768次元のベクトル空間に埋め込み、UMAP アルゴリズムによって意味的に類似した記事同士が自然に近くに集まる3D空間へ圧縮しています。さらに Gemini 2.5/3.5 Flash が記事の難易度を5段階で評価し、Z軸の「アビス（深海）深度」としてマッピングしています。これにより、単なる視覚効果ではなく「意味と難易度を直感理解できる空間地図」を実現しました。');
  }

  // -------------------------------------------------------------
  // SLIDE 07: AI NAVIGATOR (マンチカン航海士)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '06. AI RAG GUIDE', 'Gemini 3.5 Flash ＋ Google 検索 Grounding による対話型 RAG ナビゲーション');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('【マンチカン航海士 (Munchkin Navigator)】', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.CYAN, bold: true });
    slide.addText([
      { text: '• 公式 @google/genai SDK 統合:\n', options: { color: C.CYAN, bold: true } },
      { text: '  現行最新モデル gemini-3.5-flash を標準採用。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• Google 検索 Grounding (tools: [{ googleSearch: {} }]):\n', options: { color: C.SKY_BLUE, bold: true } },
      { text: '  リアルタイムの Web 検索結果と記事コンテキストを組み合わせ、最新かつ正確な技術指導を提供。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 3ステップ実践ロードマップの自動提示:\n', options: { color: C.GREEN, bold: true } },
      { text: '  「次に何を読むべきか」を動的に提示し、読者を体系的学習へ誘う。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: '0A1124' }, line: { color: C.CYAN, width: 1 }
    });
    slide.addText('【対話型 RAG ウィジェット (Munchkin Navigator)】', { x: 7.0, y: 1.8, w: 5.4, h: 0.4, fontSize: 12, color: C.CYAN, bold: true, align: 'center' });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.1, y: 2.3, w: 5.2, h: 3.8, rectRadius: 0.08, fill: { color: '0E172A' }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('🐾 マンチカン航海士 (AI Guide)\n\n「ニャー！知の星海へようこそだにゃ 🐾\nFirebaseやRAG、自律型エージェントについて何でも質問してほしいにゃ！」\n\n・おすすめ記事提案チップ\n・Markdownリンク自動埋め込み\n・マルチデバイス最適化チャット窓', {
      x: 7.2, y: 2.7, w: 5.0, h: 3.0, fontSize: 11, color: C.SKY_BLUE, align: 'center', valign: 'middle'
    });

    slide.addNotes('【発表者ノート】\nAI ナビゲーター「マンチカン航海士」についてです。公式の `@google/genai` SDK を通じて現行最新の `gemini-3.5-flash` モデルを統合し、さらに Google 検索 Grounding を有効化しています。これにより、単なる静的な記事提示にとどまらず、最新の技術動向を踏まえた動的な質問応答と「3ステップ学習ロードマップ」を可愛らしい語尾（〜にゃ）で提供し、ユーザーの学習意欲を持続させます。');
  }

  // -------------------------------------------------------------
  // SLIDE 08: NEW! AGENTIC 1-PICTURE PIPELINE (1枚絵開発フロー)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '07. AGENTIC PIPELINE', 'NotebookLM ➔ Google Stitch ➔ StitchMCP ➔ Antigravity による自律統合開発フロー');

    // 1枚絵中央フローカード (4 Stage Arrow Flow)
    const stages = [
      { num: '01', name: 'NotebookLM', desc: 'AGENTS.md / DESIGN.md\n骨子・要件・思想解析', color: C.CYAN },
      { num: '02', name: 'Google Stitch', desc: 'Seikai カラーパレット ＆\nUI/UX デザインシステム生成', color: C.SKY_BLUE },
      { num: '03', name: 'StitchMCP', desc: 'MCP Tool 経由で\nデザインデータ自動連携', color: C.INDIGO },
      { num: '04', name: 'Antigravity Agent', desc: 'Gemini 3.5ペアプロによる\n自動コード実装 ＆ 本番デプロイ', color: C.GREEN }
    ];

    stages.forEach((st, idx) => {
      const x = 0.6 + idx * 3.05;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x, y: 1.6, w: 2.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: st.color, width: 1.5 }
      });

      slide.addText(`STAGE ${st.num}`, {
        x: x + 0.2, y: 1.8, w: 2.4, h: 0.3, fontSize: 11, fontFace: 'Orbitron', color: st.color, bold: true
      });
      slide.addText(st.name, {
        x: x + 0.2, y: 2.2, w: 2.4, h: 0.6, fontSize: 14, fontFace: 'Noto Sans JP', color: C.TEXT_WHITE, bold: true
      });
      slide.addText(st.desc, {
        x: x + 0.2, y: 3.0, w: 2.4, h: 3.0, fontSize: 10, color: C.TEXT_MUTED
      });

      if (idx < 3) {
        slide.addText('➔', {
          x: x + 2.7, y: 3.6, w: 0.4, h: 0.4, fontSize: 16, color: C.CYAN, bold: true, align: 'center'
        });
      }
    });

    slide.addText('★ AI エージェント連携により、1人開発でありながら従来の数ヶ月の開発期間をわずか数時間へと圧縮。', {
      x: 0.6, y: 6.6, w: 12.0, h: 0.3, fontSize: 10, color: C.GREEN, bold: true, align: 'center'
    });

    slide.addNotes('【発表者ノート】\n1枚絵で表現する Agentic Era の自律統合開発パイプラインです。まず NotebookLM に論文や構想資料を読み込ませて AGENTS.md と DESIGN.md の骨子と要件を自動生成。次に Google Stitch で Seikai カラーパレットとUIコンポーネントを作成し、StitchMCP ツールでデザインデータをダイレクト連携。最後に Google DeepMind の Antigravity Agent (Gemini 3.5) がコード実装からデプロイまでを一気通貫で自動化しました。まさに一人開発の限界を突破する新しい開発パラダイムです。');
  }

  // -------------------------------------------------------------
  // SLIDE 09: TECHNICAL STACK & PERFORMANCE (速度 & コスト)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '08. PERFORMANCE', 'Headless Astro × Firebase 移行により表示遅延123%増を防止し年間コスト85%削減');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.RED, width: 1 }
    });
    slide.addText('【速度と離脱確率の定量根拠 (Google 1,100万件データ)】', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 12, color: C.RED, bold: true });
    slide.addText([
      { text: '• 1s ➔ 10s の遅延で離脱率 ', options: { color: C.TEXT_WHITE } },
      { text: '123% 上昇:\n', options: { color: C.RED, bold: true } },
      { text: '  モバイルページ表示時間が伸びるとユーザーは指数関数的に離脱〔Think with Google 2017〕。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 要素数 400 ➔ 6,000 でCV率 ', options: { color: C.TEXT_WHITE } },
      { text: '95% 低下:\n', options: { color: C.RED, bold: true } },
      { text: '  重厚なWordPressプラグインはCV確率を著しく破壊。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• Astro SSG による LCP < 2.5s 達成:\n', options: { color: C.GREEN, bold: true } },
      { text: '  全28記事を静的HTMLとして事前プレレンダリングし、瞬間表示を実現。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.GREEN, width: 1.5 }
    });
    slide.addText('【年間コスト 85% 削減のインフラ改革】', { x: 7.0, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.GREEN, bold: true });

    slide.addTable([
      [
        { text: '比較項目', options: { fill: '1E293B', color: C.CYAN, bold: true, fontSize: 10 } },
        { text: '旧 WordPress 構成', options: { fill: '1E293B', color: C.RED, bold: true, fontSize: 10 } },
        { text: '新 geodyssAI 構成', options: { fill: '1E293B', color: C.GREEN, bold: true, fontSize: 10 } }
      ],
      [
        { text: 'サーバー構成', options: { color: C.TEXT_WHITE, fontSize: 9 } },
        { text: 'ConoHa WING (PHP/MySQL)', options: { color: C.TEXT_MUTED, fontSize: 9 } },
        { text: 'Astro + Firebase Hosting', options: { color: C.CYAN, bold: true, fontSize: 9 } }
      ],
      [
        { text: '表示方式', options: { color: C.TEXT_WHITE, fontSize: 9 } },
        { text: '動的 SSR (遅い)', options: { color: C.TEXT_MUTED, fontSize: 9 } },
        { text: 'SSG 瞬間静的配信 (LCP < 2.5s)', options: { color: C.GREEN, bold: true, fontSize: 9 } }
      ],
      [
        { text: '月額固定費', options: { color: C.TEXT_WHITE, fontSize: 9 } },
        { text: '約 1,000 〜 1,400 円', options: { color: C.RED, bold: true, fontSize: 9 } },
        { text: '0 円 (無料枠内完了)', options: { color: C.GREEN, bold: true, fontSize: 9 } }
      ],
      [
        { text: '年間コスト', options: { color: C.TEXT_WHITE, fontSize: 9 } },
        { text: '約 15,000 円', options: { color: C.RED, bold: true, fontSize: 9 } },
        { text: '約 2,000円 (ドメイン代のみ)', options: { color: C.GREEN, bold: true, fontSize: 9 } }
      ]
    ], { x: 7.0, y: 2.4, w: 5.4, colW: [1.3, 2.0, 2.1], margin: 3 });

    slide.addText('出典: Think with Google "Mobile Page Speed Industry Benchmarks" (Google/SOASTA Research 2017)', {
      x: 0.6, y: 6.6, w: 12.0, h: 0.3, fontSize: 9, color: C.TEXT_MUTED
    });

    slide.addNotes('【発表者ノート】\nパフォーマンスとインフラコストの改革についてです。Google の1,100万件のモバイル分析によれば、ページ表示が1秒から10秒に伸びると離脱確率は123%上昇します。したがって「LCP < 2.5s」の追求は単なる自己満足ではなく、読者の離脱を防ぐ業界標準の必須条件です。WordPressからAstro SSG ＋ Firebase Hosting へ全面移行したことで、瞬間表示を実現すると同時に年間固定費を85%削減いたしました。');
  }

  // -------------------------------------------------------------
  // SLIDE 10: APP CHECK & STELLAR TAVERN (セキュリティ & リアルタイム)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '09. SECURITY & THREADS', 'reCAPTCHA Enterprise App Check 鉄壁保護 ＆ 全端末リアルタイム同期掲示板');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CYAN, width: 1 }
    });
    slide.addText('【Firebase App Check 鉄壁保護】', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.CYAN, bold: true });
    slide.addText([
      { text: '• 本物 reCAPTCHA Enterprise サイトキー適用:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '  window.useEnterprise = true を適用し、正規ドメイン以外からの悪意あるリクエストを遮断。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• BOT 攻撃 ＆ API 乱用防止:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '  Gemini API キーおよび Firestore リソースの無断使用を完全ブロック。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 自動匿名サインイン (signInAnonymously):\n', options: { color: C.GREEN, bold: true } },
      { text: '  未ログインユーザーでもセキュリティを保ちつつスムーズな体験を提供。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.SKY_BLUE, width: 1 }
    });
    slide.addText('【星海酒場 (Stellar Tavern) 全端末リアルタイム同期】', { x: 7.0, y: 1.8, w: 5.4, h: 0.4, fontSize: 12, color: C.SKY_BLUE, bold: true });
    slide.addText([
      { text: '• Firestore Security Rules ＆ Admin SDK 特権 API:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '  /api/threads エンドポイント経由で二重永続化。Mac ↔ スマホ問わず投稿が即座に同期。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 7つの星座カテゴリ別ディスカッション:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '  GenAI、AI Agents、Firebase、Claude、DL などのカテゴリごとのコミュニティ掲示板。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 星屑の応援 (Stardust Cheer):\n', options: { color: C.AMBER, bold: true } },
      { text: '  リアルタイムのリアクション機能で学習者同士の交流を促進。', options: { color: C.TEXT_MUTED } }
    ], { x: 7.0, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addNotes('【発表者ノート】\nセキュリティとリアルタイム同期基盤についてです。本物 reCAPTCHA Enterprise サイトキーを組み込んだ Firebase App Check を導入し、BOT攻撃や不当なAPIリクエストからリソースを鉄壁保護しています。さらに「星海酒場 (Stellar Tavern)」機能では、Firestore の onSnapshot リアルタイムリスナーと Admin SDK 特権APIを組み合わせ、Mac・スマホ・未ログインを問わず、全端末間でリアルタイムにディスカッションが同期される環境を構築いたしました。');
  }

  // -------------------------------------------------------------
  // SLIDE 11: MOBILE RESPONSIVE & BOTTOM SHEET
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '10. MOBILE RESPONSIVE', 'スマホ閲覧時のコンポーネント重なり0%化を実現する「ボトムシート」UI設計');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('【レスポンシブ 3D 星海図 ＆ UI 設計】', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.CYAN, bold: true });
    slide.addText([
      { text: '1. モバイル専用ボトムシート (Bottom Sheet):\n', options: { color: C.CYAN, bold: true } },
      { text: '   画面狭小なスマホ上では、記事カード・凡例・ボタンを画面下に分離集約。被さり重なりを 0% 化。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '2. 最左端 (left-0) 絶対配置スライドドロワー:\n', options: { color: C.SKY_BLUE, bold: true } },
      { text: '   Sidebar.tsx を改修し、左端吸着ドロワー ＋ 暗転バックドロップ (bg-black/60) でネイティブアプリ同等の操作感。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '3. 3D 星々のスマホ完全復元:\n', options: { color: C.GREEN, bold: true } },
      { text: '   initialArticles プロパティ受け渡し修復により、全28個の星々がスマホでも100%描画。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: '0A1124' }, line: { color: C.CYAN, width: 1 }
    });
    slide.addText('【スマホ版レスポンシブ画面 (v1.2.1 リリース)】', { x: 7.0, y: 1.8, w: 5.4, h: 0.4, fontSize: 12, color: C.CYAN, bold: true, align: 'center' });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.8, y: 2.3, w: 3.8, h: 3.8, rectRadius: 0.15, fill: { color: '0E172A' }, line: { color: C.SKY_BLUE, width: 1.5 }
    });
    slide.addText('📱 MOBILE VIEW\n\n・最上部: 乗船手続き (z-50)\n・中央: 3D 星海図 Canvas\n・右上真下: AI ガイド\n・最下部: ボトムシート\n(重なり 0% 完全解消)', {
      x: 7.9, y: 2.7, w: 3.6, h: 3.0, fontSize: 11, color: C.TEXT_WHITE, align: 'center', valign: 'middle'
    });

    slide.addNotes('【発表者ノート】\nモバイルレスポンシブ設計についてです。スマートフォンでの閲覧時、デスクトップ用の3Dカードや凡例、AIガイドが重なってしまう問題がありました。バージョン1.2.1において、画面下に収まる「ボトムシート」パターンを採用し、重なりを完全にゼロ化いたしました。また、サイドバーも最左端 `left-0` 吸着のドロワー構造へ修正し、画面の狭いスマートフォンでも快適に3D宇宙を探訪できるネイティブアプリと同等のUXを実現しています。');
  }

  // -------------------------------------------------------------
  // SLIDE 12: QUANTITATIVE KPI & VERIFICATION (完走率 30% KPI)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '11. KPI & VERIFICATION', '「MOOC完走率 5〜13%」の限界に対し「星座完成率 30%」を目指す定量検証モデル');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.GREEN, width: 1 }
    });
    slide.addText('【社会課題と接続されたプロダクト KPI】', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.GREEN, bold: true });
    slide.addText([
      { text: '1. 完走率の劇的改善:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   従来の MOOC/自習メディアの完走率 5%〜13% に対し、', options: { color: C.TEXT_MUTED } },
      { text: '「星座完成率 30%」', options: { color: C.GREEN, bold: true } },
      { text: ' を定着目標に設定。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '2. 回遊率 ＆ 平均滞在時間の向上:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   1セッションあたり閲覧記事数を従来の 1.2 ページから ', options: { color: C.TEXT_MUTED } },
      { text: '3.5 ページ以上', options: { color: C.CYAN, bold: true } },
      { text: ' へ引き上げる仮説検証。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '3. ブランド価値の計測:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '   ポートフォリオ経由での問い合わせ・登壇・採用オファーの発生率。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: '完走率 (%)',
          labels: ['一般的な MOOC', '従来の技術ブログ', 'geodyssAI (目標)'],
          values: [9, 12, 30]
        }
      ],
      {
        x: 6.8, y: 1.6, w: 5.8, h: 4.8,
        barDir: 'col',
        chartColors: [C.CYAN],
        showValue: true,
        valAxisMaxVal: 40,
        catAxisLabelColor: C.TEXT_WHITE,
        valAxisLabelColor: C.TEXT_MUTED,
        valGridLine: { color: C.CARD_BORDER, style: 'dash' }
      }
    );

    slide.addText('参照: Open Praxis Vol.16 (2024) / arXiv:1707.04291 / Accenture BX Report (2020)', {
      x: 0.6, y: 6.6, w: 12.0, h: 0.3, fontSize: 9, color: C.TEXT_MUTED
    });

    slide.addNotes('【発表者ノート】\n定量検証モデルとプロダクトKPIです。審査において「この課題は本当に測れるのか」という問いに対し、私たちは明確な数字を定めています。一般的なオンライン学習（MOOC）や技術ブログの完走率は5〜13%と非常に低いですが、geodyssAI では3D空間導線とAI指導により「星座完成率（カテゴリ内記事読破率）30%」を目指します。また回遊率を1.2から3.5ページへ向上させる検証モデルを設計しています。');
  }

  // -------------------------------------------------------------
  // SLIDE 13: GITHUB AGILITY & ADR PROCESS
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '12. GITHUB & ADR', '27 件の Issue ＆ 28 件の PR / 12 件の ADR 記録による確実な CI/CD トラッキング');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CARD_BORDER, width: 1 }
    });
    slide.addText('【GitHub 完全オープン開発トラッキング】', { x: 0.8, y: 1.8, w: 5.4, h: 0.4, fontSize: 13, color: C.CYAN, bold: true });
    slide.addText([
      { text: '• 27 件の GitHub Issue ＆ 28 件の Pull Request:\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '  すべての開発機能、バグ修正、UI改善を GitHub 上で完全透明にログ管理。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 12 件の ADR (Architecture Decision Records):\n', options: { color: C.TEXT_WHITE, bold: true } },
      { text: '  docs/decisions.md に設計根拠・意思決定プロセス (ADR-001〜ADR-012) を保存。\n\n', options: { color: C.TEXT_MUTED } },
      { text: '• 即時ロールバック ＆ 自動ビルド検証:\n', options: { color: C.GREEN, bold: true } },
      { text: '  npm run build 検証と Git コミットツリー管理により本番品質を鉄壁担保。', options: { color: C.TEXT_MUTED } }
    ], { x: 0.8, y: 2.3, w: 5.4, h: 3.9, fontSize: 10, margin: 0 });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.6, w: 5.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.GREEN, width: 1 }
    });
    slide.addText('【アーキテクチャ意思決定プロセス (ADR サマリー)】', { x: 7.0, y: 1.8, w: 5.4, h: 0.4, fontSize: 12, color: C.GREEN, bold: true });
    slide.addText([
      { text: '・ADR-001: ', options: { color: C.CYAN, bold: true } },
      { text: 'ETL パイプラインと UMAP 3D 空間マッピング採用\n', options: { color: C.TEXT_MUTED } },
      { text: '・ADR-005: ', options: { color: C.CYAN, bold: true } },
      { text: 'Seikai オリジナルブランドカラーバレット統一\n', options: { color: C.TEXT_MUTED } },
      { text: '・ADR-009: ', options: { color: C.CYAN, bold: true } },
      { text: 'Firebase AI Logic (@google/genai) 統合\n', options: { color: C.TEXT_MUTED } },
      { text: '・ADR-010: ', options: { color: C.CYAN, bold: true } },
      { text: 'reCAPTCHA Enterprise App Check 鉄壁保護\n', options: { color: C.TEXT_MUTED } },
      { text: '・ADR-011: ', options: { color: C.CYAN, bold: true } },
      { text: 'モバイル専用ボトムシート ＆ left-0 ドロワー\n', options: { color: C.TEXT_MUTED } },
      { text: '・ADR-012: ', options: { color: C.CYAN, bold: true } },
      { text: 'DRAFT ステータスタグバッジ ＆ PPTX 自動生成', options: { color: C.TEXT_MUTED } }
    ], { x: 7.0, y: 2.3, w: 5.4, h: 3.9, fontSize: 9.5, margin: 0 });

    slide.addNotes('【発表者ノート】\nGitHub 上でのアジリティと品質管理についてです。本プロジェクトはただ動くものを作っただけでなく、27のIssue、28のPR、そして12のADR（アーキテクチャ意思決定記録）を通じて、全てのコード変更と技術的決定の根拠を完全にドキュメント化し透明性を担保しています。万が一の不具合時にもワンコマンドで安全にロールバックできる高度な開発プロセスを確立しています。');
  }

  // -------------------------------------------------------------
  // SLIDE 14: FUTURE ROADMAP & NEXT TOKYO DEMO
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    setBaseSlide(slide, '13. FUTURE ROADMAP', '個人ポートフォリオから組織内知見ナレッジグラフへ — Cloud Next Tokyo デモ予告');

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 1.6, w: 3.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.CYAN, width: 1 }
    });
    slide.addText('Phase 1: 概念実証・公開 (現在)', { x: 0.8, y: 1.8, w: 3.4, h: 0.4, fontSize: 12, color: C.CYAN, bold: true });
    slide.addText('✓ 3D 星海図 (Vertex AI Embedding)\n✓ Gemini 3.5 Flash RAG 対話\n✓ Firebase App Check ＆ リアルタイム掲示板\n✓ 本番運用 (geodyssai.com)', {
      x: 0.8, y: 2.3, w: 3.4, h: 3.8, fontSize: 10, color: C.TEXT_MUTED
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.7, y: 1.6, w: 3.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.SKY_BLUE, width: 1 }
    });
    slide.addText('Phase 2: 企業・チーム拡張', { x: 4.9, y: 1.8, w: 3.4, h: 0.4, fontSize: 12, color: C.SKY_BLUE, bold: true });
    slide.addText('• 企業内 Confluence / Notion 自動連携\n• チームごとの「知の星系」マルチテナント化\n• 読書完了証明 (Stardust NFT/Badge)', {
      x: 4.9, y: 2.3, w: 3.4, h: 3.8, fontSize: 10, color: C.TEXT_MUTED
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8, y: 1.6, w: 3.8, h: 4.8, rectRadius: 0.1, fill: { color: C.CARD_BG }, line: { color: C.GREEN, width: 1.5 }
    });
    slide.addText('Phase 3: Next Tokyo デモ発表', { x: 9.0, y: 1.8, w: 3.4, h: 0.4, fontSize: 12, color: C.GREEN, bold: true });
    slide.addText('✦ Google Cloud Next Tokyo デモストレーション\n✦ 会場参加型のリアルタイム 3D 星海図操作\n✦ 没入型ナレッジ基盤の未来を提示', {
      x: 9.0, y: 2.3, w: 3.4, h: 3.8, fontSize: 10, color: C.GREEN, bold: true
    });

    slide.addText('https://www.geodyssai.com — ご清聴ありがとうございました。Cloud Next Tokyo でお会いしましょう！', {
      x: 0.6, y: 6.6, w: 12.0, h: 0.4, fontSize: 13, color: C.CYAN, bold: true, align: 'center'
    });

    slide.addNotes('【発表者ノート】\n最後に将来展望と Cloud Next Tokyo でのデモ発表についてです。geodyssAI は単なる個人のポートフォリオにとどまらず、将来的には企業内の Notion や Confluence などのドキュメント群を自動で3D ナレッジグラフ化するプラットフォームへと進化可能です。上位5名に選出していただけましたら、Google Cloud Next Tokyo のステージにて、会場の皆様が圧倒されるようなリアルタイム 3D 星海図と Gemini AI のインタラクティブなデモストレーションを披露することをお約束いたします。ご清聴ありがとうございました。');
  }

  // -------------------------------------------------------------
  // 保存処理 (geodyssAI_Final_Submission.pptx & geodyssAI_Presentation.pptx)
  // -------------------------------------------------------------
  const artifactPath = '/Users/tokitayuta/.gemini/antigravity-ide/brain/c1a777e4-faee-48a2-82ac-2cdad406c1e9/geodyssAI_Final_Submission.pptx';
  const rootPath1 = '/Users/tokitayuta/geodyssAI/geodyssAI_Final_Submission.pptx';
  const rootPath2 = '/Users/tokitayuta/geodyssAI/geodyssAI_Presentation.pptx';
  const rootPath3 = '/Users/tokitayuta/geodyssAI/geodyssAI_Google_Cloud_Next_Tokyo_Presentation.pptx';

  await pptx.writeFile({ fileName: artifactPath });
  console.log(`Successfully generated presentation artifact at: ${artifactPath}`);

  fs.copyFileSync(artifactPath, rootPath1);
  fs.copyFileSync(artifactPath, rootPath2);
  fs.copyFileSync(artifactPath, rootPath3);
  console.log(`Copied presentation files to root workspace.`);
}

buildPresentation().catch(err => {
  console.error('Failed to generate presentation:', err);
  process.exit(1);
});
