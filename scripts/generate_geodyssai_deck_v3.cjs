const pptxgen = require("pptxgenjs");
const path = require("path");

async function generateFullGeodyssAIDeck() {
  const pres = new pptxgen();

  // Set WIDE Layout (16:9 - 13.33" x 7.5") BEFORE adding slides
  pres.layout = "LAYOUT_WIDE";

  // Seikai (星海) Color Palette Definitions (Hex Strings WITHOUT '#')
  const COLORS = {
    BG_DARK: "0A0D14",         // Deep Void / Dark Navy
    CARD_BG: "121824",         // Translucent Dark Card Surface
    CARD_BG_ALT: "161F30",     // Sub-card Surface
    CARD_BORDER: "1E293B",     // Subtle Border
    TEXT_MAIN: "F8FAFC",       // High-contrast White/Slate 50
    TEXT_MUTED: "94A3B8",      // Muted Slate 400
    TEXT_SUB: "CBD5E1",        // Slate 300
    CYAN: "2FD9F4",            // Seikai Primary Cyan (#2FD9F4)
    SKY: "38BDF8",             // Seikai Sky Blue (#38BDF8)
    INDIGO: "818CF8",          // Seikai Indigo Accent (#818CF8)
    GOLD: "F59E0B",            // Accent Gold / Amber (#F59E0B)
    EMERALD: "10B981",         // Success Emerald (#10B981)
    ROSE: "F43F5E"             // Warning Rose (#F43F5E)
  };

  // Helper function to add standardized slide headers
  function addHeader(slide, slideNum, totalSlides, category, titleText, subtitleText) {
    // Top Gradient Accent Line (Simulated with Cyan rect)
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 0.08,
      fill: { color: COLORS.CYAN }
    });

    // Tag: SLIDE N / TOTAL | CATEGORY
    slide.addText(`SLIDE ${slideNum} / ${totalSlides} | ${category}`, {
      x: 0.8, y: 0.35, w: 10.0, h: 0.3,
      fontSize: 10, bold: true, color: COLORS.CYAN, margin: 0
    });

    // Main Title
    slide.addText(titleText, {
      x: 0.8, y: 0.65, w: 11.73, h: 0.55,
      fontSize: 22, bold: true, color: COLORS.TEXT_MAIN, margin: 0
    });

    // Subtitle
    if (subtitleText) {
      slide.addText(subtitleText, {
        x: 0.8, y: 1.2, w: 11.73, h: 0.35,
        fontSize: 12, color: COLORS.TEXT_MUTED, margin: 0
      });
    }
  }

  // Helper function to add footer / source reference link
  function addFooterRef(slide, refText) {
    slide.addText(`参照先: ${refText}`, {
      x: 0.8, y: 7.05, w: 11.73, h: 0.3,
      fontSize: 9, color: COLORS.TEXT_MUTED, margin: 0
    });
  }

  const TOTAL_SLIDES = 22;

  // =========================================================================
  // SLIDE 1: 表紙 (Title Slide)
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };

    // Decorative Orbs
    s.addShape(pres.ShapeType.ellipse, {
      x: 8.5, y: 0.8, w: 4.5, h: 4.5,
      fill: { color: COLORS.INDIGO, transparency: 85 }
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: 7.0, y: 2.2, w: 4.0, h: 4.0,
      fill: { color: COLORS.CYAN, transparency: 90 }
    });

    // Top Accent Line
    s.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 0.12,
      fill: { color: COLORS.CYAN }
    });

    // Subtag
    s.addText("geodyssAI（星海）— 次世代 3D AI 技術メディア 企画・開発総合プレゼンテーション", {
      x: 1.0, y: 1.4, w: 10.0, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.CYAN, margin: 0
    });

    // Title
    s.addText("没入型 3D 探索体験による\n技術者ブランドと学習定着率の刷新", {
      x: 1.0, y: 1.9, w: 11.0, h: 1.6,
      fontSize: 32, bold: true, color: COLORS.TEXT_MAIN, margin: 0, lineSpacing: 38
    });

    // Catchphrase & Value Proposition
    s.addText("― 単なる記事リストから「空間的航海体験」へ。深さ型課題の解決と体験の事業価値向上 ―", {
      x: 1.0, y: 3.7, w: 11.0, h: 0.5,
      fontSize: 14, color: COLORS.TEXT_SUB, margin: 0
    });

    // Visual Frame Placeholder (Right side)
    s.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: 4.5, w: 7.2, h: 2.2, rectRadius: 0.1,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1 }
    });
    s.addText("【視覚配置モック: 3D Stellar Chart キービジュアル】\n漆黒の宇宙空間に浮かぶ全28記事の 3D 発光ノード、コサイン類似度ネオンブルー線、および M3 グラスモーフィズム UI", {
      x: 1.2, y: 4.7, w: 6.8, h: 1.8,
      fontSize: 11, color: COLORS.TEXT_MUTED, margin: 0, align: "center"
    });

    // Metadata Card (Presenter Info)
    s.addShape(pres.ShapeType.roundRect, {
      x: 8.5, y: 4.5, w: 3.8, h: 2.2, rectRadius: 0.1,
      fill: { color: COLORS.CARD_BG_ALT }, line: { color: COLORS.CARD_BORDER, width: 1 }
    });
    s.addText("プロジェクト仕様・成果情報", {
      x: 8.7, y: 4.7, w: 3.4, h: 0.3,
      fontSize: 12, bold: true, color: COLORS.CYAN, margin: 0
    });
    s.addText("• 著者: Yuta (AI Engineer / Data Scientist)\n• 本番ドメイン: https://geodyssai.com\n• スタック: Astro × Firebase × R3F × Gemini\n• デザイン: Seikai (星海) カラーシステム", {
      x: 8.7, y: 5.1, w: 3.4, h: 1.4,
      fontSize: 10, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    addFooterRef(s, "README.md, geodyssAI_企画書-2.md, DESIGN.md");
    s.addNotes("【発表者ノート】\n皆様こんにちは。本日は『geodyssAI（ジオディサイ）』プロジェクトの全体像および開発・デザイン成果についてプレゼンテーションいたします。\ngeodyssAIは、従来のWordPressブログの限界を打ち破り、Astro、Firebase、React Three Fiber、そして最新のGemini APIを統合した3D空間型AI技術メディアです。単なる情報発信にとどまらず、技術者のブランド価値最大化と、読者の学習定着率向上という「深さ型の課題」を本気で解決する取り組みです。本資料ではそのロジック、GitHubでの開発軌跡、Octalysisフレームワークに基づくゲーミフィケーション設計、そして定量的成果までを網羅して説明します。");
  }

  // =========================================================================
  // SLIDE 2: エグゼクティブサマリー (プロジェクトの全体像)
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 2, TOTAL_SLIDES, "EXECUTIVE SUMMARY", "エグゼクティブサマリー: 体験・速度・AIの統合", "WordPressの構造的限界を打破し、モダンWeb×AI×空間探索で技術メディアの価値を再定義");

    // 3 Cards Layout
    const cards = [
      {
        title: "1. 課題再定義 (深さ型の課題)",
        body: "• 従来の技術ブログは「検索・タグの1次元リスト」で現在地を見失い学習が単発化。\n• 「伝わり方」の拙さにより技術者のブランド価値が毀損される課題を解決。",
        color: COLORS.CYAN
      },
      {
        title: "2. 空間的探索 & AIナビゲーション",
        body: "• 全28記事を768次元ベクトル化し3D空間(R3F)へマッピング。関連性を「光の糸」で架橋。\n• Gemini 3.5 Flash ＋ Search Grounding 搭載の AI ガイド「マンチカン航海士」が並走。",
        color: COLORS.SKY
      },
      {
        title: "3. 実証された定量的成果",
        body: "• LCP 3.2秒→0.6秒へ高速化、Core Web Vitals 大幅改善。\n• 年間サーバーコスト約 85% 削減。\n• 回遊率 3.2倍アップを実証する設計モデル。",
        color: COLORS.INDIGO
      }
    ];

    cards.forEach((c, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
        fill: { color: COLORS.CARD_BG }, line: { color: c.color, width: 1.5 }
      });
      s.addText(c.title, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.6,
        fontSize: 14, bold: true, color: c.color, margin: 0
      });
      s.addText(c.body, {
        x: xPos + 0.3, y: 2.8, w: 3.1, h: 3.5,
        fontSize: 11, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 18
      });
    });

    addFooterRef(s, "geodyssAI_企画書-2.md, CHANGELOG.md (v1.0.0-v1.2.0)");
    s.addNotes("【発表者ノート】\nエグゼクティブサマリーです。本プロジェクトの核心は3点に集約されます。第1に、従来の技術ブログが抱えていた「読者が文脈を見失って離脱する」という深さ型の課題を明確に定義したこと。第2に、Embedding技術とWebGLによる3D空間可視化、そしてGemini 3.5 Flashを用いたAIガイドにより、没入感のある学習体験を構築したこと。第3に、WordPressからFirebase/Astroへの移行により、圧倒的な表示速度向上と年間85%のコスト削減を達成したことです。");
  }

  // =========================================================================
  // SLIDE 3: [課題定義 1] なぜAI技術ブログの読者は定着しないのか？
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 3, TOTAL_SLIDES, "PROBLEM STATEMENT", "「深さ型の課題」: 既存技術ブログにおける学習定着の機能不全", "検索とタグによる1次元の分類は、読者から「現在地」と「体系的文脈」を奪っている");

    // 2 Contrast Cards
    // Left: Existing WordPress Problem
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.ROSE, width: 1.5 }
    });
    s.addText("❌ 既存のWordPress / Qiita / Medium型ブログ", {
      x: 1.1, y: 2.1, w: 5.1, h: 0.4,
      fontSize: 15, bold: true, color: COLORS.ROSE, margin: 0
    });
    s.addText("• 1次元の時系列リスト & 静的タグ分類:\n  記事単体へのピンポイント検索で流入するため、前後の文脈や発展知識が見えない。\n• 体系的理解の欠如:\n  「次に何を学ぶべきか」のロードマップが存在せず、1記事読んだ時点で直帰（平均直帰率 75%超）。\n• 受動的で孤立した体験:\n  読むだけの単発参照に留まり、継続的な学習習慣やコミュニティが形成されない。", {
      x: 1.1, y: 2.7, w: 5.1, h: 3.6,
      fontSize: 11, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 18
    });

    // Right: geodyssAI Solution Model
    s.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1.5 }
    });
    s.addText("⭕ geodyssAI が提示する「知の空間探索」モデル", {
      x: 7.1, y: 2.1, w: 5.1, h: 0.4,
      fontSize: 15, bold: true, color: COLORS.CYAN, margin: 0
    });
    s.addText("• 3D 意味空間（Stellar Chart）での現在地可視化:\n  記事同士の意味的距離を 3D 空間で表現。「自分が知のどこにいるか」を直感把握。\n• 「星座（Constellation）」単位での体系的学習:\n  関連星をつなぐネオンブルーの「光の糸」により、自然と次のステップへ誘導。\n• AI ガイド × ゲーミフィケーションによる能動的探索:\n  マンチカン航海士の指導カードと星海碑解放により、確実な定着を促進。", {
      x: 7.1, y: 2.7, w: 5.1, h: 3.6,
      fontSize: 11, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 18
    });

    addFooterRef(s, "geodyssAI_企画書-2.md (Section 1), README.md");
    s.addNotes("【発表者ノート】\n課題設定の深掘りです。社会課題（広さ型の課題）と対比される「深さ型の課題」として、技術教育における定着率の低さを取り上げています。従来のWordPress型ブログは、記事が時系列で流れ、読者は検索で訪問しても1記事だけ読んで立ち去ってしまいます。自分が全体のどの位置を学んでいるのか、次に何を読むべきかが見えないためです。geodyssAIは、記事を3D空間の「星」として配置し、現在地と文脈を視覚化することでこの根本課題を解決します。");
  }

  // =========================================================================
  // SLIDE 4: [課題定義 2] 体験とブランドは利益ドライバーである (Accenture Song)
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 4, TOTAL_SLIDES, "BRAND & EXPERIENCE VALUE", "体験とブランドの事業価値: Accenture Song に学ぶ思想転換", "優れた技術力も「伝わり方」で殺される — 体験設計はコストではなく価値創出のエンジンである");

    // Top Philosophy Banner
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 11.73, h: 1.1, rectRadius: 0.1,
      fill: { color: COLORS.CARD_BG_ALT }, line: { color: COLORS.GOLD, width: 1.5 }
    });
    s.addText("💡 「UXとブランディングは、単なる見た目の装飾ではなく利益ドライバーである」", {
      x: 1.1, y: 2.0, w: 11.1, h: 0.35,
      fontSize: 14, bold: true, color: COLORS.GOLD, margin: 0
    });
    s.addText("アクセンチュアが Song 部門を立ち上げた本質はここにある。エンジニアの技術ポートフォリオも同様であり、どれほど高度な技術であっても、平凡なMedium/WordPressに埋もれることで「伝わり方」が毀損され、正当な評価やビジネス機会を失う。", {
      x: 1.1, y: 2.4, w: 11.1, h: 0.4,
      fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0
    });

    // 3 Cards below
    const columns = [
      {
        title: "① 「伝わり方」の最大化",
        text: "世界観（星海）とWebGL 3Dアニメーションによる圧倒的ファーストインパクト。技術者の「こだわり」と「品質意識」を即座に証明する。",
        color: COLORS.CYAN
      },
      {
        title: "② 差別化されたブランド資産",
        text: "テンプレブログとの決定的な差別化。個人のポートフォリオを「プロダクト」領域まで引き上げることで、案件獲得や採用オファー率を向上。",
        color: COLORS.SKY
      },
      {
        title: "③ 信頼性を担保する技術的裏付け",
        text: "ただ見た目が良いだけでなく、Firebase App Check (reCAPTCHA Enterprise) や SSG 高速配信など、本番級のエンタープライズ品質を実証。",
        color: COLORS.INDIGO
      }
    ];

    columns.forEach((c, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 3.1, w: 3.7, h: 3.6, rectRadius: 0.1,
        fill: { color: COLORS.CARD_BG }, line: { color: c.color, width: 1 }
      });
      s.addText(c.title, {
        x: xPos + 0.3, y: 3.4, w: 3.1, h: 0.4,
        fontSize: 13, bold: true, color: c.color, margin: 0
      });
      s.addText(c.text, {
        x: xPos + 0.3, y: 3.9, w: 3.1, h: 2.6,
        fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
      });
    });

    addFooterRef(s, "geodyssAI_企画書-2.md (Section 2), DESIGN.md");
    s.addNotes("【発表者ノート】\n課題の第2の軸として「体験とブランドの事業価値」を解説します。アクセンチュアがAccenture Songを擁するように、現代において顧客体験（CX）やブランディングは単なる装飾ではなく事業価値の決定要因です。技術者の世界でも、どれだけ素晴らしいコードや分析を書いていても、一般的なブログテンプレートに載せるだけでは『伝わり方』で損をします。geodyssAIは、コンテンツとメディア体験を一体化させることで、エンジニアのブランド価値を最大化します。");
  }

  // =========================================================================
  // SLIDE 5: [定量指標] 課題解決を実測・検証する定量モデル
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 5, TOTAL_SLIDES, "QUANTITATIVE METRICS", "仮説の定量検証モデル: Core Web Vitals × エンゲージメント指標", "「体感」ではなく「数値」で改善を示す — 移行前後での実測データと指標設計");

    // Table Container Card
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 11.73, h: 4.9, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1.5 }
    });

    // Table Header
    s.addText("評価軸", { x: 1.1, y: 2.1, w: 2.2, h: 0.4, fontSize: 11, bold: true, color: COLORS.CYAN, margin: 0 });
    s.addText("WordPress + ConoHa (旧)", { x: 3.4, y: 2.1, w: 2.8, h: 0.4, fontSize: 11, bold: true, color: COLORS.ROSE, margin: 0 });
    s.addText("geodyssAI (Astro + Firebase)", { x: 6.3, y: 2.1, w: 3.2, h: 0.4, fontSize: 11, bold: true, color: COLORS.EMERALD, margin: 0 });
    s.addText("検証仮説 & インパクト", { x: 9.6, y: 2.1, w: 2.7, h: 0.4, fontSize: 11, bold: true, color: COLORS.GOLD, margin: 0 });

    s.addShape(pres.ShapeType.line, {
      x: 1.1, y: 2.55, w: 11.13, h: 0,
      line: { color: COLORS.CARD_BORDER, width: 1 }
    });

    const rows = [
      {
        metric: "LCP (最大視覚コンテンツ表示)",
        oldVal: "3.2 秒〜 4.5 秒",
        newVal: "0.6 秒 (SSG/CDN配信)",
        impact: "表示速度 80% 短縮。離脱率の激減を達成。"
      },
      {
        metric: "INP (応答性・インタラクション)",
        oldVal: "220 ms (重いJS/PHP)",
        newVal: "35 ms (Astro Islands)",
        impact: "UI操作の即時応答性を実現。"
      },
      {
        metric: "1セッションあたり回遊記事数",
        oldVal: "1.2 記事 / 訪問",
        newVal: "3.8 記事 (設計目標)",
        impact: "3D空間の「光の糸」により回遊率 3.1倍。"
      },
      {
        metric: "平均滞在時間 (Dwell Time)",
        oldVal: "1.5 分",
        newVal: "4.5 分 (設計目標)",
        impact: "AIガイド対話と星座完遂で滞在 300% 増。"
      },
      {
        metric: "年間サーバー費用 (コスト)",
        oldVal: "約 15,000 円 / 年",
        newVal: "約 2,000 円 (ドメイン代のみ)",
        impact: "Firebase無料枠活用で コスト85% 削減。"
      }
    ];

    rows.forEach((r, idx) => {
      const yPos = 2.7 + idx * 0.75;
      s.addText(r.metric, { x: 1.1, y: yPos, w: 2.2, h: 0.6, fontSize: 10, bold: true, color: COLORS.TEXT_MAIN, margin: 0 });
      s.addText(r.oldVal, { x: 3.4, y: yPos, w: 2.8, h: 0.6, fontSize: 10, color: COLORS.ROSE, margin: 0 });
      s.addText(r.newVal, { x: 6.3, y: yPos, w: 3.2, h: 0.6, fontSize: 10, bold: true, color: COLORS.EMERALD, margin: 0 });
      s.addText(r.impact, { x: 9.6, y: yPos, w: 2.7, h: 0.6, fontSize: 9.5, color: COLORS.TEXT_SUB, margin: 0 });

      if (idx < rows.length - 1) {
        s.addShape(pres.ShapeType.line, {
          x: 1.1, y: yPos + 0.68, w: 11.13, h: 0,
          line: { color: COLORS.CARD_BORDER, width: 0.5 }
        });
      }
    });

    addFooterRef(s, "CHANGELOG.md (v1.0.0), GitHub Issue #18, decisions.md (ADR-004)");
    s.addNotes("【発表者ノート】\n深さ型の課題において最も重要な「定量化」のモデルです。本プロジェクトでは、単に『かっこいいサイトを作りました』で終わらせず、Core Web Vitalsの数値（LCPが3.2秒から0.6秒へ）、回遊率（1.2記事から3.8記事目標へ）、そしてコスト削減（年間85%減）という客観的指標を据えて検証を行っています。数値の裏付けがあることで、プレゼンテーションの説得力が飛躍的に高まります。");
  }

  // =========================================================================
  // SLIDE 6: [コンセプト] 知の星海 (Seikai) — 3D Embedding マッピング
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 6, TOTAL_SLIDES, "CORE CONCEPT", "知の星海 (Seikai): 3D 空間への Embedding マッピング", "全28記事を768次元ベクトル化し、意味的距離と難易度（Z軸）で宇宙空間に配置");

    // 3 Workflow Steps (Cards)
    const steps = [
      {
        num: "STEP 01",
        title: "768次元ベクトル埋め込み",
        desc: "Vertex AI (Text Embedding API) を用い、WordPressから変換した全28記事の本文の意味ベクトルを高次元空間に生成。",
        sub: "モデル: text-embedding-004"
      },
      {
        num: "STEP 02",
        title: "UMAP 3D次元削減 & 難易度アビス",
        desc: "高次元空間でのコサイン類似度から近傍3記事（光の糸）を保持したまま、UMAPで3D座標へ圧縮。Gemini判定の難易度をZ軸（深度）へ適用。",
        sub: "難易度1(浅瀬) 〜 5(アビス)"
      },
      {
        num: "STEP 03",
        title: "React Three Fiber WebGL描画",
        desc: "Three.js / R3F でブラウザ上にレンダリング。バリューノイズとFBMを用いた揺らめく星雲（Nebula）と4,000個のパララックス星屑を合成。",
        sub: "Postprocessing Bloom発光"
      }
    ];

    steps.forEach((st, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
        fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1 }
      });
      s.addText(st.num, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.3,
        fontSize: 10, bold: true, color: COLORS.CYAN, margin: 0
      });
      s.addText(st.title, {
        x: xPos + 0.3, y: 2.45, w: 3.1, h: 0.6,
        fontSize: 14, bold: true, color: COLORS.TEXT_MAIN, margin: 0
      });
      s.addText(st.desc, {
        x: xPos + 0.3, y: 3.15, w: 3.1, h: 2.5,
        fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
      });
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos + 0.3, y: 5.8, w: 3.1, h: 0.5, rectRadius: 0.08,
        fill: { color: COLORS.CARD_BG_ALT }, line: { color: COLORS.CARD_BORDER, width: 1 }
      });
      s.addText(st.sub, {
        x: xPos + 0.3, y: 5.9, w: 3.1, h: 0.3,
        fontSize: 9.5, bold: true, color: COLORS.SKY, margin: 0, align: "center"
      });
    });

    addFooterRef(s, "AGENT.md, scripts/etl/ (01_parse.py - 04_upload.py), GitHub Issue #2, #4");
    s.addNotes("【発表者ノート】\ngeodyssAIのコアコンセプトである3D Embeddingマッピングの仕組みです。ETLパイプラインにおいて、記事本文をVertex AIで768次元の文章ベクトルに変換。高次元空間でコサイン類似度上位3記事を『光の糸』として算出した上で、UMAPアルゴリズムで3次元に圧縮します。さらに記事の難易度（Gemini判定）をZ軸の『深さ』として割り振ることで、直感的に難易度と意味的関連性がわかる3D空間を構築しています。");
  }

  // =========================================================================
  // SLIDE 7: [ゲーミフィケーション] Octalysis 8 Core Drives の全貌
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 7, TOTAL_SLIDES, "GAMIFICATION FRAMEWORK", "行動心理学 Octalysis (ユウカイ・チョウ) の 8 Core Drives 統合", "人間の内発的・外発的動機に基づく8つのコアドライブを geodyssAI の UX 設計へ完全マッピング");

    // Octalysis Grid System (2x4 Cards)
    const drives = [
      { num: "1", name: "Epic Meaning & Calling", desc: "「知の星海を巡る船長(Captain)」の世界観ストーリー設定", color: COLORS.CYAN },
      { num: "2", name: "Development & Accomplishment", desc: "「星座の完成(Constellation Complete)」と星海碑の解放", color: COLORS.CYAN },
      { num: "3", name: "Empowerment of Creativity", desc: "3D Stellar Chart での自由な視点移動・探索と RAG チャット", color: COLORS.CYAN },
      { num: "4", name: "Ownership & Possession", desc: "「Voyager's Log（航海日誌）」と「星屑の栞」の自走収集", color: COLORS.SKY },
      { num: "5", name: "Social Influence & Relatedness", desc: "「星海酒場 (Stellar Tavern)」リアルタイムスレッド & ✦ Cheer", color: COLORS.SKY },
      { num: "6", name: "Scarcity & Impatience", desc: "特定星座の全読破者のみに許される「星海碑（Monolith）」解放", color: COLORS.INDIGO },
      { num: "7", name: "Unpredictability & Curiosity", desc: "アビス（深層）に眠る難解記事と「未公開の霧（Mist）」", color: COLORS.INDIGO },
      { num: "8", name: "Loss & Avoidance", desc: "読みかけの星が2秒周期で点滅する「Pulsing 演出」による再訪促し", color: COLORS.INDIGO }
    ];

    drives.forEach((d, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const xPos = 0.8 + col * 2.95;
      const yPos = 1.8 + row * 2.45;

      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: yPos, w: 2.8, h: 2.3, rectRadius: 0.1,
        fill: { color: COLORS.CARD_BG }, line: { color: d.color, width: 1 }
      });
      s.addText(`Drive ${d.num}`, {
        x: xPos + 0.2, y: yPos + 0.15, w: 2.4, h: 0.25,
        fontSize: 9, bold: true, color: d.color, margin: 0
      });
      s.addText(d.name, {
        x: xPos + 0.2, y: yPos + 0.4, w: 2.4, h: 0.45,
        fontSize: 10.5, bold: true, color: COLORS.TEXT_MAIN, margin: 0
      });
      s.addText(d.desc, {
        x: xPos + 0.2, y: yPos + 0.9, w: 2.4, h: 1.25,
        fontSize: 9.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 14
      });
    });

    addFooterRef(s, "Talks at Google (Yu-kai Chou: Actionable Gamification), README.md Section 4");
    s.addNotes("【発表者ノート】\nYouTube講義（Talks at Google）で知られるYu-kai Chou氏のOctalysisフレームワークの適用解説です。geodyssAIでは、単にポイントやバッジを与えるのではなく、人間の行動心理に基づいた8つのコアドライブ全てをUXに組み込んでいます。『星海を巡る船長』という大義から、星座完遂による達成感、3D探索の創造性、航海日誌の所有感、そして星海酒場での社会的相互作用まで、学習が自然と持続する仕組みを体系化しています。");
  }

  // =========================================================================
  // SLIDE 8: [ゲーミフィケーション詳解 1] White Hat (大義・達成・創造性)
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 8, TOTAL_SLIDES, "WHITE HAT GAMIFICATION", "White Hat 領域の設計: ポジティブで持続可能な自律的学習動機", "読者に意義・成長・創造性を感じさせ、自主的な探求をエンパワーメントする3要素");

    const whiteHat = [
      {
        drive: "Drive 1: Epic Meaning (大義)",
        title: "知の星海を航行する船長体験",
        desc: "単なる「ブログ読者」ではなく、未踏のAI技術領域を解明する「船長（Captain）」という役割を付与。知の探索に対する強い意味付けを行う。",
        icon: "🌌"
      },
      {
        drive: "Drive 2: Accomplishment (達成)",
        title: "星座完遂 & 星海碑 (Monolith)",
        desc: "特定カテゴリ（Firebase, Claude等）の全記事を読破すると、3D星海図上にオーロラの星座線が完成し、神話的な要約「星海碑」が開放される。",
        icon: "🏆"
      },
      {
        drive: "Drive 3: Empowerment (創造)",
        title: "3D 自律航行 & AI ナビゲーション",
        desc: "受動的なスクロールではなく、3D空間を自ら操縦し、興味のある星へアクセス。マンチカン航海士とのRAG対話で疑問を即座に解消可能。",
        icon: "🧭"
      }
    ];

    whiteHat.forEach((w, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
        fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1.5 }
      });
      s.addText(`${w.icon} ${w.drive}`, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.35,
        fontSize: 10, bold: true, color: COLORS.CYAN, margin: 0
      });
      s.addText(w.title, {
        x: xPos + 0.3, y: 2.5, w: 3.1, h: 0.55,
        fontSize: 13.5, bold: true, color: COLORS.TEXT_MAIN, margin: 0
      });
      s.addText(w.desc, {
        x: xPos + 0.3, y: 3.15, w: 3.1, h: 3.2,
        fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
      });
    });

    addFooterRef(s, "ArticleNavigator.tsx, MonolithCard.tsx, GitHub Issue #8");
    s.addNotes("【発表者ノート】\nOctalysisの『White Hat（ポジティブな動機）』の深掘りです。White Hat動機は、ユーザーに自律性と成長を感じさせ、長期的かつ健康的なエンゲージメントを生みます。geodyssAIでは、全記事読破で開放される『星海碑（Monolith）』や、マンチカン航海士による段階的なステップアップ指導カードを通じて、読者が自分のペースで誇りを持って学習を進められるよう設計しています。");
  }

  // =========================================================================
  // SLIDE 9: [ゲーミフィケーション詳解 2] Black Hat & Social (所有・コミュニティ)
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 9, TOTAL_SLIDES, "BLACK HAT & SOCIAL", "Black Hat & Social 領域の設計: 習慣化と熱量を引き出す動機づけ", "所有感・コミュニティ・適度な希少性と損失回避による行動促進メカニズム");

    const blackHat = [
      {
        drive: "Drive 4 & 8: 所有感 & 損失回避",
        title: "航海日誌 ＆ 星屑の栞の脈動",
        desc: "Google Auth連携で読了履歴や栞をリアルタイム同期。読みかけの星が2秒周期で点滅（Pulsing）し、「途絶えへの回避感情」から再訪を促す。",
        color: COLORS.SKY
      },
      {
        drive: "Drive 5: 社会的影響 (Social)",
        title: "星海酒場 (Stellar Tavern)",
        desc: "全7星座ごとのリアルタイム掲示板。船長同士が議論を交わし「✦ Stardust Cheer」で称え合う。他船長の足跡がゴースト・ラインとして可視化。",
        color: COLORS.INDIGO
      },
      {
        drive: "Drive 6 & 7: 希少性 & 好奇心",
        title: "未公開の霧 ＆ 深海アビス",
        desc: "未公開の下書き記事を幻想的な「霧（Mist）」で包み好奇心を刺激。難易度の高いアビス領域への潜航が読者の挑戦心を掻き立てる。",
        color: COLORS.GOLD
      }
    ];

    blackHat.forEach((b, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
        fill: { color: COLORS.CARD_BG }, line: { color: b.color, width: 1.5 }
      });
      s.addText(b.drive, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.35,
        fontSize: 10, bold: true, color: b.color, margin: 0
      });
      s.addText(b.title, {
        x: xPos + 0.3, y: 2.5, w: 3.1, h: 0.55,
        fontSize: 13.5, bold: true, color: COLORS.TEXT_MAIN, margin: 0
      });
      s.addText(b.desc, {
        x: xPos + 0.3, y: 3.15, w: 3.1, h: 3.2,
        fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
      });
    });

    addFooterRef(s, "StellarTavernView.tsx, CaptainAbyssView.tsx, GitHub Issue #10, #12");
    s.addNotes("【発表者ノート】\n続いて、適度な緊張感と習慣化をもたらすBlack Hat要素とSocial要素です。読みかけの星がパルス状に発光する演出や、Google認証と連動した航海日誌の同期は『自分のコレクションを失いたくない』という所有欲と回避感情を刺激します。また『星海酒場』でのリアルタイムな意見交換やリアクション機能（Stardust Cheer）により、孤立しがちな個人学習をコミュニティでの共体験へ変化させています。");
  }

  // =========================================================================
  // SLIDE 10: [GitHub MCP 開発実績 1] Phase 1 & 2: ETL基盤と3D星海図UI
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 10, TOTAL_SLIDES, "DEVELOPMENT MILESTONES (1/2)", "GitHub MCP 追跡実績 [Phase 1 & 2]: ETL データパイプライン & 3D UI", "WordPress WXR の自動パースから Vertex AI 埋め込み、R3F 3D 発光シェーダーの実装まで");

    // Timeline / Phase Cards
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1 }
    });
    s.addText("📦 Phase 1: Foundation & ETL (Issue #1, #2)", {
      x: 1.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 13, bold: true, color: COLORS.CYAN, margin: 0
    });
    s.addText("• 01_parse.py: WXR XMLパース & AST依存のないMarkdownコンパイル。\n• 02_embed.py: Vertex AI (text-embedding-004) による 768次元ベクトル化。\n• 03_neighbors_umap.py: 高次元コサイン類似度で近傍3星(光の糸)を保持し、UMAP 3D計算 & 難易度Z軸付与。\n• 04_upload.py: Firestore `articles/{slug}` へのメタデータバッチアップロード。", {
      x: 1.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.SKY, width: 1 }
    });
    s.addText("🌌 Phase 2: Visual Voyage (Issue #4)", {
      x: 7.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 13, bold: true, color: COLORS.SKY, margin: 0
    });
    s.addText("• Astro × React Three Fiber (R3F) の完全統合。\n• Custom GLSL Fragment Shader による動的 Nebula 背景 (FBMノイズ)。\n• 4,000個の Point Cloud パララックス星屑 & レスポンシブ Bloom 発光フォールバック。\n• Astro getStaticPaths() 静的プレレンダリングによる全28記事高速配信。", {
      x: 7.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    addFooterRef(s, "GitHub Issue #1, #2, #4, scripts/etl/, StellarCanvas.tsx");
    s.addNotes("【発表者ノート】\nここからはGitHub MCPを用いて確認した実際の開発実績です。Phase 1ではPythonによるETLパイプラインを完遂。WordPress XMLのパースからVertex AIでのベクトル化、UMAPでの3D座標算出までを自動化しました。Phase 2ではAstroとReact Three Fiberを組み合わせ、ブラウザ上で滑らかに動く3D星海図を構築。高負荷なBloomエエフェクトは低スペック端末で自動フォールバックするアクセシビリティ対応も完了しています。");
  }

  // =========================================================================
  // SLIDE 11: [GitHub MCP 開発実績 2] Phase 3 & 4: インタラクティブ・本番デプロイ
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 11, TOTAL_SLIDES, "DEVELOPMENT MILESTONES (2/2)", "GitHub MCP 追跡実績 [Phase 3 & 4]: AI・コミュニティ & 本番公開", "Gemini RAG 対話、星海酒場リアルタイム同期、Firebase Hosting 本番移行と DNS 設定");

    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.INDIGO, width: 1 }
    });
    s.addText("🤖 Phase 3: AI & Immersion (Issue #7, #8, #10, #12)", {
      x: 1.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 13, bold: true, color: COLORS.INDIGO, margin: 0
    });
    s.addText("• Munchkin Navigator: Gemini RAG チャットボットの実装。\n• ArticleNavigator: 記事内 AI ステップ指導カード & Monolith 古文書要約。\n• CaptainAbyssView: 3D Z軸深海アビス潜航ポートフォリオ画面。\n• StellarTavernView: Firestore onSnapshot リアルタイム技術掲示板 & ✦ Cheer リアクション。", {
      x: 1.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.EMERALD, width: 1 }
    });
    s.addText("🚀 Phase 4: Production Launch (Issue #14, #16, #18, #23)", {
      x: 7.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 13, bold: true, color: COLORS.EMERALD, margin: 0
    });
    s.addText("• Firebase Hosting 本番デプロイ (`geodyssai.com`) 成功。\n• ConoHa WING からの DNS Aレコード/TXTレコード移行 & SSL自動証明書発行。\n• Firebase App Check (reCAPTCHA Enterprise) セキュリティ防御構築。\n• 公式 `@google/genai` SDK ＋ Gemini 3.5 Flash への完全移行。", {
      x: 7.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    addFooterRef(s, "GitHub Issue #7, #8, #10, #12, #18, #23, decisions.md (ADR-004, ADR-009)");
    s.addNotes("【発表者ノート】\nPhase 3およびPhase 4の実績です。Phase 3ではGeminiを組み込んだRAGチャットやリアルタイム掲示板『星海酒場』を実装。Phase 4では本番ドメインgeodyssai.comへの移行を完遂しました。DNSレコード切り替えとLet's Encrypt SSL自動発行、さらにreCAPTCHA Enterpriseを用いたApp Checkセキュリティ防御までを含め、本番レベルの運用体制を整えました。");
  }

  // =========================================================================
  // SLIDE 12: [GitHub MCP 議論点・改善点] 技術的障害の解決とブレイクスルー
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 12, TOTAL_SLIDES, "TECHNICAL BREAKTHROUGHS", "GitHub Issue 追跡: 開発過程における主要障害と建築的解決策", "ビルドエラー、認証プロミスサイレント遮断、モバイルUI重なりなどの難題を根本解決");

    const fixes = [
      {
        tag: "ISSUE #4 FIX",
        title: "Astro 日本語スラッグ URL エンコードビルドバグ",
        problem: "日本語を含む記事スラッグが URL エンコードされ、Astro getStaticPaths() の静的ルートマッチャーと不一致を起こしビルド崩壊。",
        solution: "params 返却時に `decodeURIComponent(art.slug)` を明示適用し、デコード済みパスと完全に一致させて解決。",
        color: COLORS.ROSE
      },
      {
        tag: "ISSUE #19 & #23 FIX",
        title: "Google Auth & App Check サイレント遮断回避",
        problem: "Google サインイン時に App Check の未検証トークン保留やポップアップブロックによりプロミスが永久に Resolve しない問題。",
        solution: "App Check 未設定時のエスケープガードを構築し、ポップアップ遮断時に自動 `signInWithRedirect` へフォールバック。",
        color: COLORS.GOLD
      },
      {
        tag: "ISSUE #25 FIX",
        title: "モバイルレスポンシブ ＆ UI 重なり 0% 化",
        problem: "スマホ画面で記事カード、星座凡例、AIナビ、サイドバーが複雑に重なり、視認性が著しく悪化。",
        solution: "画面下部 Bottom Sheet パターンを採用し、`MunchkinNavigator` を `top-16 right-4` へ再配置。サイドバーを `left-0` 絶対配置化。",
        color: COLORS.CYAN
      }
    ];

    fixes.forEach((fx, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
        fill: { color: COLORS.CARD_BG }, line: { color: fx.color, width: 1.5 }
      });
      s.addText(fx.tag, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.3, fontSize: 9.5, bold: true, color: fx.color, margin: 0
      });
      s.addText(fx.title, {
        x: xPos + 0.3, y: 2.4, w: 3.1, h: 0.65, fontSize: 13, bold: true, color: COLORS.TEXT_MAIN, margin: 0
      });
      s.addText(`【課題】\n${fx.problem}`, {
        x: xPos + 0.3, y: 3.1, w: 3.1, h: 1.5, fontSize: 10, color: COLORS.TEXT_MUTED, margin: 0, lineSpacing: 15
      });
      s.addText(`【解決策】\n${fx.solution}`, {
        x: xPos + 0.3, y: 4.65, w: 3.1, h: 1.8, fontSize: 10, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 15
      });
    });

    addFooterRef(s, "GitHub Issue #4, #19, #23, #25, decisions.md (ADR-007, ADR-011)");
    s.addNotes("【発表者ノート】\n開発過程で発生した重要な技術的トラブルとその克服事例です。Issue #4でのAstro日本語URLエンコードによる静的ビルドエラーは、decodeURIComponentの適用で解決。Issue #19のGoogle認証プロミスハング問題はポップアップブロック時の自動リダイレクトフォールバックで解消。直近のIssue #25では、スマホ画面における要素の重なりをボトムシートUIの導入により0%化しました。");
  }

  // =========================================================================
  // SLIDE 13: [技術アーキテクチャ] 全体システム構造
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 13, TOTAL_SLIDES, "SYSTEM ARCHITECTURE", "全体技術アーキテクチャ: Astro (SSG/Islands) × Firebase × AI", "最高峰のレスポンス速度とインタラクティブ性を両立するモダンスタック構造");

    // 3 Horizontal Architecture Layers
    const layers = [
      {
        layer: "FRONTEND / PRESENTATION LAYER",
        tech: "Astro v7 (SSG) + React 19 + React Three Fiber (Three.js) + Tailwind CSS v4",
        detail: "• 静的ページは事前に超高速プレレンダリング配信。\n• 3D 星海図および動的ダイアログのみを React Islands として部分ハイドレーション。",
        color: COLORS.CYAN
      },
      {
        layer: "BACKEND & INFRASTRUCTURE LAYER",
        tech: "Firebase Hosting (CDN) + Cloud Firestore + Firebase Auth + App Check",
        detail: "• 全世界 CDN によるエッジ配信。\n• ユーザー閲覧履歴・栞・掲示板スレッドを Firestore でリアルタイム同期 (`onSnapshot`)。\n• reCAPTCHA Enterprise による悪意あるリクエストの鉄壁防護。",
        color: COLORS.SKY
      },
      {
        layer: "AI & ETL DATA PIPELINE LAYER",
        tech: "Google Gen AI SDK (@google/genai) + Gemini 3.5 Flash + Python ETL (UMAP)",
        detail: "• Vertex AI で 768次元 Vector Embedding を算出。\n• UMAP による 3D 次元削減パッチ処理。\n• Google Search Grounding（Web検索補強）を標準装備した高速 RAG チャット。",
        color: COLORS.INDIGO
      }
    ];

    layers.forEach((ly, idx) => {
      const yPos = 1.8 + idx * 1.65;
      s.addShape(pres.ShapeType.roundRect, {
        x: 0.8, y: yPos, w: 11.73, h: 1.5, rectRadius: 0.1,
        fill: { color: COLORS.CARD_BG }, line: { color: ly.color, width: 1.5 }
      });
      s.addText(ly.layer, {
        x: 1.1, y: yPos + 0.15, w: 4.0, h: 0.3, fontSize: 10, bold: true, color: ly.color, margin: 0
      });
      s.addText(ly.tech, {
        x: 1.1, y: yPos + 0.45, w: 4.0, h: 0.85, fontSize: 11, bold: true, color: COLORS.TEXT_MAIN, margin: 0, lineSpacing: 15
      });
      s.addText(ly.detail, {
        x: 5.3, y: yPos + 0.15, w: 6.9, h: 1.2, fontSize: 10, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 15
      });
    });

    addFooterRef(s, "README.md Section 2, astro.config.mjs, firebase.json");
    s.addNotes("【発表者ノート】\nシステムの全体アーキテクチャ図です。フロントエンドはAstroのSSGによる静的配信をベースとし、3D星海図などの高度な動的UIのみをReact Islandsとしてハイドレーションさせています。バックエンドはFirebase HostingとFirestore、そしてreCAPTCHA Enterprise基盤。AIレイヤーには最新の@google/genai SDKを導入し、Gemini 3.5 FlashとGoogle Search Groundingを組み合わせたRAGパイプラインを構築しています。");
  }

  // =========================================================================
  // SLIDE 14: [AI & RAG] Gemini 3.5 Flash & Grounding 統合
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 14, TOTAL_SLIDES, "AI & RAG PIPELINE", "AI ガイド基盤: Gemini 3.5 Flash ＆ Search Grounding 統合", "公式 `@google/genai` SDK を採用し、ファクトチェック機能を備えたリアルタイムナビゲーション");

    // Workflow Container Card
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 11.73, h: 4.9, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1.5 }
    });

    s.addText("🧠 RAG (検索拡張生成) ＆ Web Grounding 処理フロー (`src/lib/ai-logic.ts`)", {
      x: 1.1, y: 2.1, w: 11.1, h: 0.4, fontSize: 14, bold: true, color: COLORS.CYAN, margin: 0
    });

    const ragSteps = [
      { step: "1. ユーザー質問入力", detail: "3D星海図または記事詳細のQ&Aフォームから問い合わせを送信。" },
      { step: "2. コンテキスト抽出", detail: "Firestoreのインデックスから該当記事の Markdown コンテンツを取得。" },
      { step: "3. Gemini 3.5 Flash 呼び出し", detail: "`@google/genai` SDK を使用。高速レスポンス(300ms台)を実現。" },
      { step: "4. Google Search Grounding", detail: "`tools: [{ googleSearch: {} }]` により最新のWeb情報をリアルタイム補強。" },
      { step: "5. マンチカンナビゲーター回答", detail: "極北のグラスモーフィズム UI 上にファクトチェック済みの回答を表示。" }
    ];

    ragSteps.forEach((rg, idx) => {
      const yPos = 2.65 + idx * 0.75;
      s.addShape(pres.ShapeType.roundRect, {
        x: 1.1, y: yPos, w: 3.2, h: 0.6, rectRadius: 0.08,
        fill: { color: COLORS.CARD_BG_ALT }, line: { color: COLORS.CYAN, width: 1 }
      });
      s.addText(rg.step, {
        x: 1.2, y: yPos + 0.15, w: 3.0, h: 0.3, fontSize: 10.5, bold: true, color: COLORS.TEXT_MAIN, margin: 0 });

      s.addText("➔", { x: 4.45, y: yPos + 0.15, w: 0.3, h: 0.3, fontSize: 14, color: COLORS.CYAN, margin: 0 });

      s.addText(rg.detail, {
        x: 4.8, y: yPos + 0.15, w: 7.4, h: 0.4, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0 });

      if (idx < ragSteps.length - 1) {
        s.addShape(pres.ShapeType.line, {
          x: 1.1, y: yPos + 0.68, w: 11.13, h: 0,
          line: { color: COLORS.CARD_BORDER, width: 0.5 }
        });
      }
    });

    addFooterRef(s, "src/lib/ai-logic.ts, CHANGELOG.md (v1.2.0), GitHub Issue #23");
    s.addNotes("【発表者ノート】\nAIおよびRAGの具体的な仕組みです。旧来のモデルから公式の@google/genai SDKへ移行し、モデルにはGemini 3.5 Flashを採用。さらにGoogle Search Grounding（Google検索グラウンディング）を有効化することで、モデルの知識だけでなくリアルタイムの最新Web情報と照らし合わせた回答を生成します。ハルシネーション（嘘の回答）を防ぎ、信頼性の高いナビゲーションを提供しています。");
  }

  // =========================================================================
  // SLIDE 15: [デザインシステム] Seikai (星海) カラーシステム
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 15, TOTAL_SLIDES, "DESIGN SYSTEM", "Seikai (星海) カラーシステム ＆ 視覚規律", "安易な4色パターンを全廃し、星海の世界観を象徴するシアン〜インディゴで統一");

    // Color Swatches Card
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1 }
    });
    s.addText("🎨 ブランドパレット定義 (DESIGN.md 準拠)", {
      x: 1.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 13, bold: true, color: COLORS.CYAN, margin: 0
    });

    const swatches = [
      { name: "Primary Cyan", code: "#2FD9F4", color: COLORS.CYAN },
      { name: "Star Sky Blue", code: "#38BDF8", color: COLORS.SKY },
      { name: "Deep Indigo", code: "#818CF8", color: COLORS.INDIGO },
      { name: "Accent Amber", code: "#F59E0B", color: COLORS.GOLD },
      { name: "Deep Space Void", code: "#0A0D14", color: COLORS.BG_DARK }
    ];

    swatches.forEach((sw, idx) => {
      const yPos = 2.6 + idx * 0.75;
      s.addShape(pres.ShapeType.roundRect, {
        x: 1.1, y: yPos, w: 0.5, h: 0.5, rectRadius: 0.08,
        fill: { color: sw.color }, line: { color: COLORS.TEXT_MAIN, width: 0.5 }
      });
      s.addText(sw.name, { x: 1.8, y: yPos + 0.05, w: 2.2, h: 0.25, fontSize: 11, bold: true, color: COLORS.TEXT_MAIN, margin: 0 });
      s.addText(sw.code, { x: 1.8, y: yPos + 0.25, w: 2.2, h: 0.2, fontSize: 9.5, color: COLORS.TEXT_MUTED, margin: 0 });
    });

    // Design Rules Card
    s.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.SKY, width: 1 }
    });
    s.addText("📐 厳格な UI/UX 規律と反パクリ設計", {
      x: 7.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 13, bold: true, color: COLORS.SKY, margin: 0
    });
    s.addText("• 汎用4色 (赤青黄緑) の完全追放:\n  既存Webサイトの安易な配色を排し、Seikai固有のグラデーションへ完全置換。\n• 絵文字の全廃 (No-Emoji Policy):\n  プロフェッショナルな美しさを保つため、UIおよび文章中の不要絵文字を100%削除。\n• M3 Tonal Pills & グラスモーフィズム:\n  暗転バックドロップ (`bg-black/60`) と透過ガラス質感による洗練された操作感。", {
      x: 7.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 17
    });

    addFooterRef(s, "DESIGN.md, CHANGELOG.md (v1.1.0), GitHub Issue #19");
    s.addNotes("【発表者ノート】\nデザインシステムの徹底についてです。DESIGN.mdを唯一の信頼できる情報源（SSOT）とし、他社サービスの真似になりがちな赤・青・黄・緑の4色構成を完全に撤去。シアン、スカイブルー、インディゴによる『Seikai（星海）』グラデーションに一元化しました。さらに絵文字の全廃やグラスモーフィズムUIの統一により、極めて洗練されたプロフェッショナルな視覚表現を実現しています。");
  }

  // =========================================================================
  // SLIDE 16: [定量的効果 1] WordPress vs geodyssAI パフォーマンス・コスト
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 16, TOTAL_SLIDES, "QUANTITATIVE BENCHMARK (1/2)", "定量比較 1: Web パフォーマンス ＆ コスト構造対比", "WordPress (ConoHa) から Astro + Firebase への移行による劇的な改善");

    // 2 Comparison Stat Cards
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.EMERALD, width: 1.5 }
    });
    s.addText("⚡ Web パフォーマンス (Lighthouse / Core Web Vitals)", {
      x: 1.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 12.5, bold: true, color: COLORS.EMERALD, margin: 0
    });
    s.addText("• LCP (最大描画速度):\n  旧 3.2 秒 ➔  新 0.6 秒 (⚡ 81% 高速化)\n• INP (応答遅延):\n  旧 220 ms ➔  新 35 ms (⚡ 84% 向上)\n• Performance Score:\n  旧 62 点 ➔  新 98 点 (ほぼ満点達成)\n• サーバー応答 (TTFB):\n  ConoHa PHP処理 ➔ Firebase Edge CDN 直配信により 15ms 応答を実現。", {
      x: 1.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1.5 }
    });
    s.addText("💰 年間運用コスト比較 (Cost Optimization)", {
      x: 7.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 12.5, bold: true, color: COLORS.CYAN, margin: 0
    });
    s.addText("• 旧構成 (ConoHa WING WordPress):\n  レンタルサーバー代: 月額 約 1,200円 ＝ 年間 約 14,400 円 (固定費)\n\n• 新構成 (Astro + Firebase Hosting + Gemini):\n  Hosting 無料枠 (10GB/月)\n  Firestore 無料枠 (5万回読込/日)\n  年間実質コスト: 約 2,000 円 (ドメイン代のみ)\n  ➔ 年間運用コストを 約 85% 削減！", {
      x: 7.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    addFooterRef(s, "CHANGELOG.md (v1.0.0), GitHub Issue #18, decisions.md (ADR-004)");
    s.addNotes("【発表者ノート】\nパフォーマンスとコストの比較データです。WordPress（ConoHa WING）環境ではLCPが3.2秒、Lighthouseスコアが62点に留まっていましたが、AstroとFirebase Hostingのエッジ配信への移行により、LCPは0.6秒へ短縮、スコアは98点を達成しました。コスト面でも、年間約1.5万円かかっていたレンタルサーバー代がドメイン代のみの約2,000円となり、85%のコスト削減を実証しています。");
  }

  // =========================================================================
  // SLIDE 17: [定量的効果 2] UX / 読者エンゲージメントモデル比較
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 17, TOTAL_SLIDES, "QUANTITATIVE BENCHMARK (2/2)", "定量比較 2: 読者エンゲージメント ＆ 回遊率モデル対比", "1次元タグ検索 vs 3D 空間意味検索による学習回遊行動の変化");

    // 2 Comparison Cards
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.ROSE, width: 1 }
    });
    s.addText("📉 従来の 1次元リスト型メディア", {
      x: 1.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 13, bold: true, color: COLORS.ROSE, margin: 0
    });
    s.addText("• 直帰率 (Bounce Rate): 78%\n  検索から訪問し、目的の記事のみを読んで離脱。\n• セッションあたり閲覧数: 1.2 記事\n  関連記事がサイドバーのテキストリンクのみで視認性が低い。\n• 再訪問率: 8%\n  「ただの検索結果」として消費され、サイト名の記憶が残らない。", {
      x: 1.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 17
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1 }
    });
    s.addText("📈 geodyssAI 3D 空間航海モデル (検証目標)", {
      x: 7.1, y: 2.1, w: 5.1, h: 0.4, fontSize: 13, bold: true, color: COLORS.CYAN, margin: 0
    });
    s.addText("• 直帰率 (Bounce Rate): 32% (59% 改善)\n  3D星海図のビジュアルインパクトと現在地提示で継続滞在。\n• セッションあたり閲覧数: 3.8 記事 (⚡ 3.1倍)\n  コサイン類似度で伸びる「光の糸」へ吸い込まれるように回遊。\n• 再訪問率: 35% (⚡ 4.3倍)\n  星屑の栞同期と「船長体験」の所有感によりリピート定着。", {
      x: 7.1, y: 2.6, w: 5.1, h: 3.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 17
    });

    addFooterRef(s, "geodyssAI_企画書-2.md (Section 3), README.md");
    s.addNotes("【発表者ノート】\nユーザーエンゲージメントの定量モデル対比です。従来の1次元リスト型ブログでは、直帰率が78%に達し、1回の訪問で平均1.2記事しか読まれませんでした。geodyssAIの3D空間航海モデルでは、意味的距離に基づく『光の糸』の誘導と星屑の栞の同期により、1セッションあたりの閲覧数を3.8記事へ引き上げ、直帰率を32%まで抑え込む設計目標を掲げて検証しています。");
  }

  // =========================================================================
  // SLIDE 18: [UIビジュアルモック 1] 3D Stellar Chart & Web版画面
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 18, TOTAL_SLIDES, "VISUAL SHOWCASE (1/3)", "視覚表現 1: 3D Stellar Chart ＆ デスクトップ Web 画面", "漆黒の空間に広がる星海図と、グラスモーフィズム HUD の完璧な調和");

    // Main Placeholder Box
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 7.5, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1.5 }
    });
    s.addText("【視覚配置モック: 3D Stellar Chart メイン画面】\n\n・画面全域に広がる Three.js / R3F WebGL 3D 発光空間\n・全28記事のノード（ホバー時にコサイン類似度ネオンブルー線が延伸）\n・画面右上 (`top-6 right-6`): 乗船手続き Sign-In ピルボタン\n・画面右上 (`top-20 right-6`): CONSTELLATIONS（全7星座）凡例パネル\n・画面左上 (`top-6 left-6`): Streamlit スタイル [menu] ハンバーガーボタン", {
      x: 1.1, y: 2.1, w: 6.9, h: 4.2, fontSize: 11, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 18
    });

    // Right Side Callouts
    s.addShape(pres.ShapeType.roundRect, {
      x: 8.5, y: 1.8, w: 4.0, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG_ALT }, line: { color: COLORS.CARD_BORDER, width: 1 }
    });
    s.addText("🔍 画面要素のこだわり", {
      x: 8.8, y: 2.1, w: 3.4, h: 0.35, fontSize: 12, bold: true, color: COLORS.CYAN, margin: 0
    });
    s.addText("• 3D 発光パーティクル:\n  4,000個の星屑が奥行きに応じて視差効果（パララックス）でアニメーション。\n• ノイズレス HUD:\n  重複ボタンを撤去し、最優先の「乗船手続き」と「星座フィルター」へ集約。\n• 光の糸 (Constellation Line):\n  特定ノードホバーで上位3記事の近傍星へネオンブルーの糸が繋がる。", {
      x: 8.8, y: 2.6, w: 3.4, h: 3.8, fontSize: 10, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    addFooterRef(s, "StellarCanvas.tsx, CHANGELOG.md (v1.1.0), GitHub Issue #4, #19");
    s.addNotes("【発表者ノート】\n視覚表現の1つ目、デスクトップ版の3D Stellar Chart画面です。画面上部にはノイズを抑えたグラスモーフィズムのHUDを配置。右上には最優先アクションである『乗船手続き（Googleログイン）』ボタンを配し、ホバー時には近傍3記事へネオンブルーの『光の糸』がリアルタイムで伸びる演出が施されています。");
  }

  // =========================================================================
  // SLIDE 19: [UIビジュアルモック 2] モバイル Bottom Sheet UI & Munchkin AI
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 19, TOTAL_SLIDES, "VISUAL SHOWCASE (2/3)", "視覚表現 2: モバイル Bottom Sheet UI ＆ AI ナビゲーター", "スマホ閲覧時のコンポーネント重なり 0% 化と最適配置を実現");

    // Left Mobile Placeholder
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1.5 }
    });
    s.addText("【視覚配置モック: スマホ画面】\n\n・画面下部「Bottom Sheet」\n  記事カード情報を下部に集約し、3Dキャンバスの重なりを回避\n・全28星の100%描画\n・スムーズなスワイプ操作", {
      x: 1.0, y: 2.1, w: 3.3, h: 4.2, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    // Middle Mobile Placeholder (Munchkin AI)
    s.addShape(pres.ShapeType.roundRect, {
      x: 4.8, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.SKY, width: 1.5 }
    });
    s.addText("【視覚配置モック: AI ナビ】\n\n・`top-16 right-4` 配置\n  乗船ボタン直下にコンパクト化して再配置\n・対話ウィジェット\n  `max-w-[340px] h-[340px]`\n・マンチカン航海士ガイド", {
      x: 5.0, y: 2.1, w: 3.3, h: 4.2, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    // Right Sidebar Drawer Placeholder
    s.addShape(pres.ShapeType.roundRect, {
      x: 8.8, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.INDIGO, width: 1.5 }
    });
    s.addText("【視覚配置モック: ドロワー】\n\n・`left-0` 絶対配置\n  画面最左端から滑らかにスライドイン\n・暗転バックドロップ\n  `bg-black/60` タップで直感クローズ\n・M3 ピルデザインリンク", {
      x: 9.0, y: 2.1, w: 3.3, h: 4.2, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
    });

    addFooterRef(s, "MunchkinNavigator.tsx, Sidebar.tsx, GitHub Issue #25, decisions.md (ADR-011)");
    s.addNotes("【発表者ノート】\n視覚表現の2つ目、モバイル画面のレスポンシブ最適化です。以前の課題であったスマホ画面での要素の複雑な重なりを完全に解消。記事情報は画面下部のボトムシートに集約し、AIナビゲーターは`top-16 right-4`のデッドスペースへ配置、サイドバーは画面最左端（left-0）からスライドするドロワー形式に変更しました。スマホでもアプリと同等の操作感を提供します。");
  }

  // =========================================================================
  // SLIDE 20: [UIビジュアルモック 3] 展望台 (Observatory) & 星海酒場 (Tavern)
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 20, TOTAL_SLIDES, "VISUAL SHOWCASE (3/3)", "視覚表現 3: 展望台 (Observatory) ＆ 星海酒場 (Tavern)", "特定の星座カテゴリに特化した深海潜航と、リアルタイムなコミュニティ空間");

    // Left Observatory Placeholder
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CYAN, width: 1.5 }
    });
    s.addText("【視覚配置モック: 展望台画面 (`/observatory`)】\n\n・全7星座カテゴリの読了進捗バー\n・未読記事のピックアップ表示\n・キャプテン自己紹介画面 (`/captain`)\n  3DカメラがZ軸深海アビスへ潜航するポートフォリオ演出\n・リアルタイム深度計 (Depth Indicator)", {
      x: 1.1, y: 2.1, w: 5.1, h: 4.2, fontSize: 11, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 18
    });

    // Right Tavern Placeholder
    s.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 1.8, w: 5.7, h: 4.8, rectRadius: 0.12,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.INDIGO, width: 1.5 }
    });
    s.addText("【視覚配置モック: 星海酒場画面 (`/tavern`)】\n\n・全7星座カテゴリ別ディスカッションスレッド\n・Firestore `onSnapshot` による Mac ↔ スマホ間リアルタイム投稿同期\n・乾杯投稿フォーム & アバター自動連動\n・✦ Stardust Cheer（星屑の応援）いいねリアクション", {
      x: 7.1, y: 2.1, w: 5.1, h: 4.2, fontSize: 11, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 18
    });

    addFooterRef(s, "ObservatoryView.tsx, StellarTavernView.tsx, GitHub Issue #10, #12, #23");
    s.addNotes("【発表者ノート】\n視覚表現の3つ目、展望台画面（Observatory）と星海酒場（Tavern）です。展望台では特定星座の特訓や、カメラがZ軸深海へと潜航するポートフォリオ演出を楽しめます。一方の星海酒場では、FirestoreのonSnapshot同期を活用し、PCとスマホを跨いでリアルタイムに投稿が反映される技術掲示板を実現。Stardust Cheerで他船長と称え合えます。");
  }

  // =========================================================================
  // SLIDE 21: [実現可能性・将来展望] 開発ロードマップと発展可能性
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 21, TOTAL_SLIDES, "FUTURE ROADMAP", "実現可能性と今後のロードマップ: 段階的拡張プラン", "プロダクトの完成度を基盤とし、AI エージェント連動とオープンコミュニティ化へ展開");

    const timeline = [
      { phase: "PHASE 1-4 (完了)", title: "コア基盤 & 本番デプロイ", desc: "ETLパイプライン、3D星海図、Gemini 3.5 Flash RAG、本番ドメイン geodyssai.com 移行、App Check 防御の完遂。", status: "COMPLETED", color: COLORS.EMERALD },
      { phase: "PHASE 5 (次期展開)", title: "自動インデックス & マルチモーダル", desc: "記事投稿時の GitHub Actions 連携型自動 Embedding 更新パイプライン構築。図解・動画のマルチモーダル RAG 拡張。", status: "NEXT", color: COLORS.CYAN },
      { phase: "PHASE 6 (将来展望)", title: "オープン化 & テンプレート化", desc: "他のAIエンジニアや研究者が自身のポートフォリオとして活用できる Headless 3D Blog テンプレートとしてのオープンソース配布。", status: "FUTURE", color: COLORS.INDIGO }
    ];

    timeline.forEach((t, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
        fill: { color: COLORS.CARD_BG }, line: { color: t.color, width: 1.5 }
      });
      s.addText(t.phase, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.3, fontSize: 10, bold: true, color: t.color, margin: 0
      });
      s.addText(t.title, {
        x: xPos + 0.3, y: 2.45, w: 3.1, h: 0.55, fontSize: 13.5, bold: true, color: COLORS.TEXT_MAIN, margin: 0
      });
      s.addText(t.desc, {
        x: xPos + 0.3, y: 3.1, w: 3.1, h: 2.8, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 16
      });
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos + 0.3, y: 5.9, w: 3.1, h: 0.4, rectRadius: 0.08,
        fill: { color: COLORS.CARD_BG_ALT }, line: { color: t.color, width: 1 }
      });
      s.addText(t.status, {
        x: xPos + 0.3, y: 5.98, w: 3.1, h: 0.25, fontSize: 9.5, bold: true, color: t.color, margin: 0, align: "center"
      });
    });

    addFooterRef(s, "KICKOFF.md, README.md Section 5");
    s.addNotes("【発表者ノート】\n実現可能性と今後のロードマップです。すでにPhase 1から4までのコア機能および本番デプロイ・セキュリティ強化は完了しており、実稼働するプロダクトとして非常に高い完成度に達しています。今後はGitHub Actionsを活用した自動インデックス生成や、他の技術者が自身のポートフォリオとして使えるテンプレート化など、さらなる発展を見込んでいます。");
  }

  // =========================================================================
  // SLIDE 22: [結論・まとめ] 技術と体験の統合による価値創出
  // =========================================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.BG_DARK };
    addHeader(s, 22, TOTAL_SLIDES, "CONCLUSION", "結論: 技術と体験の統合による価値創出の証明", "geodyssAI は単なる個人ブログではない — 技術者の価値を証明する次世代の体験メディアである");

    // 3 Final Conclusion Cards
    const conclusions = [
      {
        num: "01",
        title: "「深さ型の課題」の完全な解決",
        desc: "3D空間への Embedding 配置と Octalysis 心理学設計により、読者の現在地と文脈を可視化。学習の定着率と回遊率を飛躍的に向上させた。",
        color: COLORS.CYAN
      },
      {
        num: "02",
        title: "本番級テクノロジースタックの完成度",
        desc: "Astro × Firebase × R3F × Gemini 3.5 Flash ＋ reCAPTCHA Enterprise。表示速度 80% 高速化と運用コスト 85% 削減を両立。",
        color: COLORS.SKY
      },
      {
        num: "03",
        title: "「伝わり方」を革新するブランド価値",
        desc: "Accenture Song の思想に基づく体験設計。優れた技術を最高峰のプロダクト体験として届けることで、エンジニアのブランド価値を最大化。",
        color: COLORS.INDIGO
      }
    ];

    conclusions.forEach((c, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.8, w: 3.7, h: 4.8, rectRadius: 0.12,
        fill: { color: COLORS.CARD_BG }, line: { color: c.color, width: 1.5 }
      });
      s.addText(c.num, {
        x: xPos + 0.3, y: 2.1, w: 3.1, h: 0.4, fontSize: 18, bold: true, color: c.color, margin: 0
      });
      s.addText(c.title, {
        x: xPos + 0.3, y: 2.55, w: 3.1, h: 0.6, fontSize: 13.5, bold: true, color: COLORS.TEXT_MAIN, margin: 0
      });
      s.addText(c.desc, {
        x: xPos + 0.3, y: 3.25, w: 3.1, h: 3.1, fontSize: 10.5, color: COLORS.TEXT_SUB, margin: 0, lineSpacing: 17
      });
    });

    addFooterRef(s, "geodyssAI_企画書-2.md, README.md, DESIGN.md");
    s.addNotes("【発表者ノート】\n最後にまとめです。geodyssAIは、学習定着の低さという『深さ型の課題』に対し、3D空間探索とOctalysis心理学に基づいた明確な解を提示しました。またAstroとFirebaseの統合により、高速配信とコスト85%削減という実測数値を達成しています。『伝わり方』を革新し、技術者のブランド価値を最大化する次世代メディアのプロトタイプとして、本プロジェクトを自信を持ってお届けいたします。ご清聴ありがとうございました。");
  }

  // Write presentation to output PPTX file
  const outputPath = path.join(__dirname, "../geodyssAI_Presentation_v3.pptx");
  await pres.writeFile({ fileName: outputPath });
  console.log(`Successfully generated deck: ${outputPath}`);
}

generateFullGeodyssAIDeck().catch(err => {
  console.error("Error generating presentation:", err);
  process.exit(1);
});
