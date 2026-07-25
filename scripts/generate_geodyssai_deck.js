const pptxgen = require("pptxgenjs");
const path = require("path");

async function generateGeodyssAIDeck() {
  const pres = new pptxgen();

  // 1. Set WIDE Layout (16:9 - 13.33" x 7.5") BEFORE adding slides
  pres.layout = "LAYOUT_WIDE";

  // Color Palette Definitions (Hex Strings WITHOUT '#')
  const COLORS = {
    BG_DARK: "0F172A",       // Deep Slate 900 (Seikai Dark Navy)
    CARD_BG: "1E293B",       // Slate 800
    CARD_BORDER: "334155",   // Slate 700
    TEXT_MAIN: "F8FAFC",     // Slate 50
    TEXT_MUTED: "94A3B8",    // Slate 400
    TEXT_DARK: "0F172A",     // Dark Text for light elements
    ACCENT_AQUA: "38BDF8",   // Sky 400 (Star Sea Light)
    PRIMARY_BLUE: "2563EB",  // Blue 600
    SUCCESS_EMERALD: "10B981",// Emerald 500
    WARN_GOLD: "F59E0B",     // Amber/Gold 500
    DANGER_ROSE: "F43F5E"    // Rose 500
  };

  // Common Header Helper
  function addHeader(slide, slideNum, titleText, subtitleText) {
    // Top Accent Bar
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.08,
      fill: { color: COLORS.ACCENT_AQUA }
    });

    // Category / Slide Number tag
    slide.addText(`SLIDE ${slideNum} / 16 | geodyssAI 企画書`, {
      x: 0.8,
      y: 0.35,
      w: 10,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: COLORS.ACCENT_AQUA,
      margin: 0
    });

    // Title
    slide.addText(titleText, {
      x: 0.8,
      y: 0.65,
      w: 11.73,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: COLORS.TEXT_MAIN,
      margin: 0
    });

    if (subtitleText) {
      slide.addText(subtitleText, {
        x: 0.8,
        y: 1.25,
        w: 11.73,
        h: 0.35,
        fontSize: 13,
        color: COLORS.TEXT_MUTED,
        margin: 0
      });
    }
  }

  // =========================================================================
  // SLIDE 1: 表紙 (Title Slide)
  // =========================================================================
  const s1 = pres.addSlide();
  s1.background = { color: COLORS.BG_DARK };

  // Decorative Background Shapes (Glowing Core Orbs)
  s1.addShape(pres.ShapeType.ellipse, {
    x: 9.0, y: 1.0, w: 4.0, h: 4.0,
    fill: { color: COLORS.PRIMARY_BLUE, transparency: 80 }
  });
  s1.addShape(pres.ShapeType.ellipse, {
    x: 7.5, y: 2.5, w: 3.5, h: 3.5,
    fill: { color: COLORS.ACCENT_AQUA, transparency: 85 }
  });

  // Top Accent Line
  s1.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.15,
    fill: { color: COLORS.ACCENT_AQUA }
  });

  // Project Logo / Brand Tag
  s1.addText("geodyssAI 企画書", {
    x: 1.0, y: 1.5, w: 8.0, h: 0.5,
    fontSize: 18, bold: true, color: COLORS.ACCENT_AQUA, margin: 0
  });

  // Main Title
  s1.addText(
    [
      { text: "知識の意味空間を可視化し、\n", options: { fontSize: 36, bold: true, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "「学びの定着」と「技術者のブランド価値」を解く", options: { fontSize: 26, bold: true, color: COLORS.ACCENT_AQUA } }
    ],
    { x: 1.0, y: 2.2, w: 10.5, h: 2.5, margin: 0, valign: "top" }
  );

  // Key Message Badge
  s1.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 4.8, w: 9.0, h: 0.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.ACCENT_AQUA, width: 1 }
  });
  s1.addText("キーメッセージ： 知識の星海を、一度にひとつの航海で", {
    x: 1.2, y: 4.95, w: 8.6, h: 0.5,
    fontSize: 15, bold: true, color: COLORS.TEXT_MAIN, margin: 0
  });

  // Owner & Footer
  s1.addText("Owner: Yuta (AI Engineer / Data Scientist)  |  https://www.geodyssai.com", {
    x: 1.0, y: 6.3, w: 11.0, h: 0.4,
    fontSize: 12, color: COLORS.TEXT_MUTED, margin: 0
  });

  s1.addNotes("【発表者ノート】geodyssAI企画書のプレゼンテーションを開始します。本プロジェクトは、AI時代の技術学習における完走率低下の解決と、技術者の個性の可視化を「意味空間の3Dマップ化（星海図）」によって同時に解くイノベーション提案です。");

  // =========================================================================
  // SLIDE 2: 社会的背景 (Social Background)
  // =========================================================================
  const s2 = pres.addSlide();
  s2.background = { color: COLORS.BG_DARK };
  addHeader(s2, 2, "社会的背景：日本は「AI人材を育てきれない」構造課題を抱えている", "2030年に最大79万人のIT人材不足。解決のカギは自習型リスキリング");

  // Left Stat Card 1
  s2.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 3.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 },
    shadow: { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.2 }
  });
  s2.addText(
    [
      { text: "79万人不足\n", options: { fontSize: 36, bold: true, color: COLORS.WARN_GOLD, breakLine: true } },
      { text: "2030年 IT人材不足予測\n\n", options: { fontSize: 16, bold: true, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "経済産業省の試算では2030年にIT人材が最大約79万人不足。うち先端IT人材（AI/データ）は12.4万人が不足〔出典1〕。", options: { fontSize: 13, color: COLORS.TEXT_MUTED } }
    ],
    { x: 1.0, y: 2.1, w: 3.2, h: 4.2, margin: 0, valign: "top" }
  );

  // Center Stat Card 2
  s2.addShape(pres.ShapeType.roundRect, {
    x: 4.86, y: 1.8, w: 3.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 },
    shadow: { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.2 }
  });
  s2.addText(
    [
      { text: "6割超が「大幅不足」\n", options: { fontSize: 32, bold: true, color: COLORS.DANGER_ROSE, breakLine: true } },
      { text: "DX推進人材の供給限界\n\n", options: { fontSize: 16, bold: true, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "IPA「DX動向2024」にて企業の6割超がDX人材不足と回答。データサイエンティストが最も不足〔出典2〕。", options: { fontSize: 13, color: COLORS.TEXT_MUTED } }
    ],
    { x: 5.06, y: 2.1, w: 3.2, h: 4.2, margin: 0, valign: "top" }
  );

  // Right Stat Card 3 (Solution bottleneck)
  s2.addShape(pres.ShapeType.roundRect, {
    x: 8.93, y: 1.8, w: 3.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.PRIMARY_BLUE, width: 1.5 },
    shadow: { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.2 }
  });
  s2.addText(
    [
      { text: "自習型コンテンツ\n", options: { fontSize: 24, bold: true, color: COLORS.ACCENT_AQUA, breakLine: true } },
      { text: "採用だけでは埋まらない\n\n", options: { fontSize: 16, bold: true, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "人材供給には独学・リスキリングが不可欠。しかしその自習型学習こそが最も「完走・定着」していない構造課題が存在する。", options: { fontSize: 13, color: COLORS.TEXT_MUTED } }
    ],
    { x: 9.13, y: 2.1, w: 3.2, h: 4.2, margin: 0, valign: "top" }
  );

  s2.addNotes("【発表者ノート】社会的背景として、2030年に最大79万人のIT人材が不足し、特にデータサイエンティストなどAI人材の不足がDXのボトルネックになっています。このギャップは採用だけでは埋まらず、独学・リスキリングが必須ですが、自習コンテンツの定着率の低さが最大の課題です。");

  // =========================================================================
  // SLIDE 3: 課題A (Problem A: Learning Completion Rate)
  // =========================================================================
  const s3 = pres.addSlide();
  s3.background = { color: COLORS.BG_DARK };
  addHeader(s3, 3, "課題A：技術学習コンテンツは「読まれる」が「定着しない」", "オンライン自習の完走率は僅か 5〜13%。原因は20年間変わらない「lookup前提UI」");

  // Left side: Stats & Native Chart
  s3.addText("オンライン学習・MOOCの典型的な完走率〔出典3,4,5〕", {
    x: 0.8, y: 1.8, w: 5.5, h: 0.4, fontSize: 14, bold: true, color: COLORS.TEXT_MAIN, margin: 0
  });

  const chartDataS3 = [
    { name: "完走率", labels: ["典型的MOOC", "プログラミング", "最良ケース"], values: [5, 13, 36] }
  ];
  s3.addChart(pres.ChartType.bar, chartDataS3, {
    x: 0.8, y: 2.3, w: 5.5, h: 4.3,
    showTitle: false,
    chartColors: [COLORS.DANGER_ROSE],
    showValue: true,
    dataLabelPosition: "outEnd",
    catAxisLabelColor: COLORS.TEXT_MUTED,
    valAxisLabelColor: COLORS.TEXT_MUTED,
    valGridLine: { color: COLORS.CARD_BORDER, size: 1 }
  });

  // Right side: 3 Disconnects Card
  s3.addShape(pres.ShapeType.roundRect, {
    x: 6.7, y: 1.8, w: 5.8, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
  });
  s3.addText(
    [
      { text: "探索的検索（Exploratory Search）における3つの断絶\n\n", options: { fontSize: 16, bold: true, color: COLORS.ACCENT_AQUA, breakLine: true } },
      { text: "1. 現在地の喪失：", options: { fontSize: 14, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "読者が何を理解し、次に何を学ぶべきか不明\n\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "2. 単発の消費：", options: { fontSize: 14, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "1記事読んで直帰し、体系的学習に接続されない\n\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "3. 難易度のミスマッチ：", options: { fontSize: 14, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "入門者が専門記事に飛び込み挫折・離脱\n\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "※既存のタグ/検索フォームは「探すものが既に分かっている読者(lookup)」にしか機能しない。", options: { fontSize: 12, italic: true, color: COLORS.WARN_GOLD } }
    ],
    { x: 7.0, y: 2.0, w: 5.2, h: 4.4, margin: 0, valign: "top" }
  );

  s3.addNotes("【発表者ノート】課題Aは学習の定着問題です。MOOC等の完了率は僅か5〜13%にとどまります。原因は、探索的検索を行っている「何を知らないか分からない」読者に対し、20年間変わらない検索窓とタグUI（lookup最適化）しか提供してこなかった情報設計の不備にあります。");

  // =========================================================================
  // SLIDE 4: 課題B (Problem B: Engineer Brand Value)
  // =========================================================================
  const s4 = pres.addSlide();
  s4.background = { color: COLORS.BG_DARK };
  addHeader(s4, 4, "課題B：技術者の価値は「技術力」ではなく「伝わり方」で毀損される", "AI量産時代における没個性化の海（Sea of Sameness）と表示速度の離脱リスク");

  // Card 1: Experience & Growth
  s4.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 3.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
  });
  s4.addText(
    [
      { text: "体験軸の企業は\n6倍成長\n", options: { fontSize: 26, bold: true, color: COLORS.SUCCESS_EMERALD, breakLine: true } },
      { text: "Accenture Business of Experience〔出典8〕\n\n", options: { fontSize: 12, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "体験提供を軸に再構築した企業は同業の6倍の率で年次利益成長を実現。体験は事業価値そのもの。", options: { fontSize: 13, color: COLORS.TEXT_MAIN } }
    ],
    { x: 1.0, y: 2.1, w: 3.2, h: 4.2, margin: 0, valign: "top" }
  );

  // Card 2: Sea of Sameness
  s4.addShape(pres.ShapeType.roundRect, {
    x: 4.86, y: 1.8, w: 3.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
  });
  s4.addText(
    [
      { text: "経営層の 73% が\n埋没を懸念\n", options: { fontSize: 26, bold: true, color: COLORS.WARN_GOLD, breakLine: true } },
      { text: "Accenture Song 調査〔出典9〕\n\n", options: { fontSize: 12, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "生成AIによるコンテンツ量産の結果「自社ブランドが没個性の海に埋没する」リスクを73%が懸念。技術ブログでも同じことが発生。", options: { fontSize: 13, color: COLORS.TEXT_MAIN } }
    ],
    { x: 5.06, y: 2.1, w: 3.2, h: 4.2, margin: 0, valign: "top" }
  );

  // Card 3: Speed Penalty
  s4.addShape(pres.ShapeType.roundRect, {
    x: 8.93, y: 1.8, w: 3.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.DANGER_ROSE, width: 1.5 }
  });
  s4.addText(
    [
      { text: "3秒遅延で\n離脱率 +32%\n", options: { fontSize: 26, bold: true, color: COLORS.DANGER_ROSE, breakLine: true } },
      { text: "Google モバイル分析〔出典10〕\n\n", options: { fontSize: 12, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "表示速度が1s→3sで離脱確率32%増、10sで123%増。重いレガシーCMSは構造的ハンデを抱える。", options: { fontSize: 13, color: COLORS.TEXT_MAIN } }
    ],
    { x: 9.13, y: 2.1, w: 3.2, h: 4.2, margin: 0, valign: "top" }
  );

  s4.addNotes("【発表者ノート】課題Bは伝わり方とブランド価値の毀損です。生成AIで記事が量産される現代、テンプレート的なブログでは技術者の個性が埋没します。また、遅いWeb表示は読者の離脱に直結し、技術力そのものが正しく伝わらないリスクを抱えています。");

  // =========================================================================
  // SLIDE 5: 問い (HMW - Core Question)
  // =========================================================================
  const s5 = pres.addSlide();
  s5.background = { color: COLORS.BG_DARK };
  addHeader(s5, 5, "本プロジェクトが立てる問い（How Might We）", "知識の可視化による全く新しい技術メディア体験の探求");

  // Glowing Highlight Container Box
  s5.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 2.0, w: 11.33, h: 3.5, rectRadius: 0.15,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.ACCENT_AQUA, width: 2 },
    shadow: { type: "outer", color: "38BDF8", blur: 10, offset: 0, angle: 0, opacity: 0.3 }
  });

  s5.addText("How Might We (HMW)", {
    x: 1.5, y: 2.3, w: 10.33, h: 0.5,
    fontSize: 16, bold: true, color: COLORS.ACCENT_AQUA, margin: 0
  });

  s5.addText(
    "知識どうしの意味的な距離を可視化することで、\n読者が「地図を持って航海するように」学べる\n技術メディアを実現できるか？",
    {
      x: 1.5, y: 3.0, w: 10.33, h: 2.0,
      fontSize: 28, bold: true, color: COLORS.TEXT_MAIN, margin: 0, align: "center"
    }
  );

  // Bottom Sub-caption
  s5.addText("単なるデザイン刷新ではなく、「知識構造の可視化」と「agentic開発による体験の差別化」を実証する。", {
    x: 1.0, y: 5.9, w: 11.33, h: 0.5,
    fontSize: 14, color: COLORS.TEXT_MUTED, align: "center", margin: 0
  });

  s5.addNotes("【発表者ノート】本プロジェクトの問いは「知識どうしの意味的な距離を可視化し、地図を持って航海するように学べる技術メディアを作れるか」です。この問いに対し、技術とデザインの両面から答えていきます。");

  // =========================================================================
  // SLIDE 6: ソリューション概観 (Solution Overview - Seikai)
  // =========================================================================
  const s6 = pres.addSlide();
  s6.background = { color: COLORS.BG_DARK };
  addHeader(s6, 6, "ソリューション概観：コンセプト「星海（Seikai）」", "全記事をEmbeddingで意味空間へマッピングし、3D星海図として可視化");

  // 3 Feature Columns
  const s6Cols = [
    { title: "1. 意味空間マッピング", desc: "タグやカテゴリではなく、Gemini Embedding により記事内容の意味的距離を直接数値化して配置。" },
    { title: "2. 3D 星海図ナビゲーション", desc: "読者は「船長」として星海を航海。読了した星が灯り、自らの学習の航跡がインタラクティブに可視化される。" },
    { title: "3. 探索的学習の支援", desc: "「何を知らないか分からない」状態から、近くの関連領域や難易度の深さ（Z軸）を俯瞰して直感的に探求できる。" }
  ];

  s6Cols.forEach((col, idx) => {
    const xPos = 0.8 + idx * 4.06;
    s6.addShape(pres.ShapeType.roundRect, {
      x: xPos, y: 1.8, w: 3.6, h: 4.8, rectRadius: 0.1,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
    });

    s6.addText(col.title, {
      x: xPos + 0.2, y: 2.1, w: 3.2, h: 0.6,
      fontSize: 18, bold: true, color: COLORS.ACCENT_AQUA, margin: 0
    });

    s6.addText(col.desc, {
      x: xPos + 0.2, y: 2.9, w: 3.2, h: 3.4,
      fontSize: 14, color: COLORS.TEXT_MAIN, margin: 0
    });
  });

  s6.addNotes("【発表者ノート】ソリューションコンセプト「星海（Seikai）」です。すべての記事をVector Embeddingによって意味空間に配置し、3Dの星海図としてビジュアル化します。読者は探索的検索理論に基づき、知識の全体像と現在地を把握しながら学びを進めることができます。");

  // =========================================================================
  // SLIDE 7: 課題→機能 対応表 (Problem to Feature Matrix)
  // =========================================================================
  const s7 = pres.addSlide();
  s7.background = { color: COLORS.BG_DARK };
  addHeader(s7, 7, "課題→機能 対応表：断絶のひとつずつに、機能で答える", "学習者の離脱要因を解決するプロダクト機能マッピング");

  // Table Matrix Data
  const matrixRows = [
    ["課題", "実装による解決機能", "具体的体験・効果"],
    ["現在地の喪失", "星海図（3D Mapping）", "全記事を意味空間に配置。読了で星が灯り航跡が可視化"],
    ["単発の消費", "光の糸（Semantic Links）", "高次元空間の意味的近傍3件を接続し、次読むべき星を提示"],
    ["難易度のミスマッチ", "深度（Z軸マッピング）", "難易度を空間の深さに割り当て（入門＝表層 / 専門＝アビス）"],
    ["体系的学習の欠如", "星座（カテゴリ完成度）", "関連記事群を星座線で接続。全読破で星座が完成"],
    ["学習の孤独", "生成マンチカン（RAG Chat）", "読者の現在地・文脈を理解するアシスタント機能"],
    ["没個性の海への埋没", "独自情報構造そのもの", "Web技術×3D×AIを融合した唯一無二のブランド体験"]
  ];

  // Render Table
  s7.addTable(
    matrixRows.map((row, rIdx) => 
      row.map(cell => ({
        text: cell,
        options: {
          fontSize: rIdx === 0 ? 13 : 12,
          bold: rIdx === 0,
          color: rIdx === 0 ? COLORS.ACCENT_AQUA : COLORS.TEXT_MAIN,
          fill: rIdx === 0 ? { color: COLORS.CARD_BG } : (rIdx % 2 === 1 ? { color: "131D31" } : { color: COLORS.BG_DARK }),
          margin: 6
        }
      }))
    ),
    { x: 0.8, y: 1.8, w: 11.73, h: 4.8, colW: [2.5, 3.8, 5.43] }
  );

  s7.addNotes("【発表者ノート】課題と機能の対応表です。「現在地の喪失」には星海図、「単発消費」には高次元近傍を繋ぐ「光の糸」、「難易度ミスマッチ」にはZ軸の深度配置といったように、各断絶に対して明確なプロダクト機能で回答しています。");

  // =========================================================================
  // SLIDE 8: 技術の肝 (Technical Core: Separation of Spaces)
  // =========================================================================
  const s8 = pres.addSlide();
  s8.background = { color: COLORS.BG_DARK };
  addHeader(s8, 8, "技術の肝：「見せる空間」と「意味を判断する空間」の分離", "3D座標の距離歪みに惑わされない高精度セマンティック計算のアーキテクチャ");

  // Left Card: High-dim Space
  s8.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.ACCENT_AQUA, width: 1.5 }
  });
  s8.addText(
    [
      { text: "意味を判断する空間\n", options: { fontSize: 20, bold: true, color: COLORS.ACCENT_AQUA, breakLine: true } },
      { text: "UMAP適用前の高次元ベクトル空間\n\n", options: { fontSize: 13, bold: true, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "• 目的：", options: { fontSize: 14, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "「光の糸（関連記事接続）」の算出\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "• 手法：", options: { fontSize: 14, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "Gemini Embedding（768次元など）での Cosine 類似度計算\n\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "3D投影による歪みの影響を受けず、本来の「意味的近傍」を正確に判定する。", options: { fontSize: 13, color: COLORS.SUCCESS_EMERALD } }
    ],
    { x: 1.1, y: 2.1, w: 5.0, h: 4.2, margin: 0, valign: "top" }
  );

  // Right Card: 3D Visualization Space
  s8.addShape(pres.ShapeType.roundRect, {
    x: 6.9, y: 1.8, w: 5.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.PRIMARY_BLUE, width: 1.5 }
  });
  s8.addText(
    [
      { text: "見せるための空間\n", options: { fontSize: 20, bold: true, color: COLORS.PRIMARY_BLUE, breakLine: true } },
      { text: "UMAPによる 3D次元削減空間\n\n", options: { fontSize: 13, bold: true, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "• 目的：", options: { fontSize: 14, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "3D星海図としての直感的な可視化\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "• 手法：", options: { fontSize: 14, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "UMAPで3次元(X, Y, Z)へ投影。Z軸には記事の難易度（深度）をマッピング\n\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "可視化のための投影座標であり、意味的距離の決定根拠には直接使わない。", options: { fontSize: 13, color: COLORS.WARN_GOLD } }
    ],
    { x: 7.2, y: 2.1, w: 5.0, h: 4.2, margin: 0, valign: "top" }
  );

  s8.addNotes("【発表者ノート】技術的な肝は「次元削減の前後で情報を分離する」設計です。3D空間上の距離は可視化のため歪みが生じるため、関連記事の判定（光の糸）はUMAP前の高次元ベクトル空間で計算し、表示だけを3Dで行うことで意味の正確性を担保します。");

  // =========================================================================
  // SLIDE 9: アーキテクチャ (Tech Architecture)
  // =========================================================================
  const s9 = pres.addSlide();
  s9.background = { color: COLORS.BG_DARK };
  addHeader(s9, 9, "アーキテクチャ：Astro Islands × R3F × Firebase", "圧倒的な表示速度とリッチな3D体験を両立するモダンスタック");

  // Tech Grid Cards (4 Layers)
  const archLayers = [
    { layer: "フロント基盤", tech: "Astro (SSG)", reason: "Islands Architectureにより記事ページはJSほぼゼロ。超高速表示(<2.5s)を実現〔出典10,11〕" },
    { layer: "3D 表現", tech: "React Three Fiber", reason: "Reactの宣言的状態でThree.js 3D星海図/Bloom/Shaderを統合" },
    { layer: "データ / CMS", tech: "Firebase Firestore", reason: "Headless CMSとして機能し、ユーザー航海履歴と記事メタデータを統一管理" },
    { layer: "AI / Security", tech: "Gemini + App Check", reason: "Embedding生成・RAG対話をサーバーレスで実現。App Checkで不正利用・コスト保護" }
  ];

  archLayers.forEach((item, idx) => {
    const yPos = 1.8 + idx * 1.2;
    s9.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: yPos, w: 11.73, h: 1.05, rectRadius: 0.08,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
    });

    // Layer Badge
    s9.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: yPos + 0.2, w: 2.0, h: 0.65, rectRadius: 0.05,
      fill: { color: COLORS.PRIMARY_BLUE }
    });
    s9.addText(item.layer, {
      x: 1.0, y: yPos + 0.35, w: 2.0, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.TEXT_MAIN, align: "center", margin: 0
    });

    // Tech & Reason
    s9.addText(item.tech, {
      x: 3.2, y: yPos + 0.2, w: 2.8, h: 0.65,
      fontSize: 15, bold: true, color: COLORS.ACCENT_AQUA, margin: 0
    });

    s9.addText(item.reason, {
      x: 6.0, y: yPos + 0.2, w: 6.3, h: 0.65,
      fontSize: 13, color: COLORS.TEXT_MAIN, margin: 0
    });
  });

  s9.addNotes("【発表者ノート】技術構成です。AstroのIslands Architectureを採用することで、記事本文はJSゼロの超高速SSGで配信し、3D星海図のみをIslandsとして部分ハイドレーションします。これにより速度とリッチ体験を完璧に両立させています。");

  // =========================================================================
  // SLIDE 10: Agentic Era (Agentic Era Development)
  // =========================================================================
  const s10 = pres.addSlide();
  s10.background = { color: COLORS.BG_DARK };
  addHeader(s10, 10, "Agentic Era の開発様式 — 本プロジェクトの「もう一つの成果物」", "Stitch × Antigravity × MCP によるブランド開発の民主化リファレンス");

  // Pipeline Box
  s10.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 11.73, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.ACCENT_AQUA, width: 1 }
  });

  s10.addText(
    [
      { text: "ブランド主導開発パイプライン（Stitch × Antigravity × MCP）\n\n", options: { fontSize: 18, bold: true, color: COLORS.ACCENT_AQUA, breakLine: true } },
      { text: "1. DESIGN.md（凍結デザイントークン）", options: { fontSize: 15, bold: true, color: COLORS.TEXT_MAIN } },
      { text: " → 世界観・カラー・書体を定義\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "2. Stitch（UI生成）", options: { fontSize: 15, bold: true, color: COLORS.TEXT_MAIN } },
      { text: " → トークン準拠で画面デザインを一括生成\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "3. Antigravity（自律実装）", options: { fontSize: 15, bold: true, color: COLORS.TEXT_MAIN } },
      { text: " → MCP連携により、仕様・規約(AGENT.md)に忠実にコード実装\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "4. GitHub MCP 連携", options: { fontSize: 15, bold: true, color: COLORS.TEXT_MAIN } },
      { text: " → 全変更をコミット単位で追跡・再現可能な開発プロセスを確立\n\n", options: { fontSize: 13, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "★ イノベーション：DESIGN.md を差し替えるだけで、どんな企業のブランド体験へも一般化・転用可能！", options: { fontSize: 14, bold: true, color: COLORS.SUCCESS_EMERALD } }
    ],
    { x: 1.1, y: 2.1, w: 11.13, h: 4.2, margin: 0, valign: "top" }
  );

  s10.addNotes("【発表者ノート】本プロジェクトは単なるWebメディアにとどまらず、Agentic時代の開発様式の実証実験です。Stitchでデザイン生成、Antigravityで実装し、DESIGN.mdを差し替えるだけで他企業のブランド開発にも一般化できるパイプラインを確立しました。");

  // =========================================================================
  // SLIDE 11: KPI (Success Metrics & Measurements)
  // =========================================================================
  const s11 = pres.addSlide();
  s11.background = { color: COLORS.BG_DARK };
  addHeader(s11, 11, "測る指標（Success Metrics）：移行前後の実測で証明する", "体感ではなくGA4・PageSpeed Insights・定着指標による定量的検証");

  // 4 Metric Card Columns
  const kpiCards = [
    { title: "回遊率 (GA4)", val: "+50%", detail: "1セッションあたり閲覧記事数", color: COLORS.ACCENT_AQUA },
    { title: "直帰率 (GA4)", val: "−20pt", detail: "単発閲覧での離脱割合の削減", color: COLORS.SUCCESS_EMERALD },
    { title: "LCP / 性能", val: "< 2.5s", detail: "Lighthouse 90+ / Google基準クリア", color: COLORS.WARN_GOLD },
    { title: "学習完成率", val: "30%", detail: "1星座完成率（MOOC完走率5~13%を凌駕）", color: COLORS.PRIMARY_BLUE }
  ];

  kpiCards.forEach((kpi, idx) => {
    const xPos = 0.8 + idx * 3.05;
    s11.addShape(pres.ShapeType.roundRect, {
      x: xPos, y: 1.8, w: 2.7, h: 4.8, rectRadius: 0.1,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
    });

    s11.addText(kpi.title, {
      x: xPos + 0.15, y: 2.1, w: 2.4, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.TEXT_MUTED, align: "center", margin: 0
    });

    s11.addText(kpi.val, {
      x: xPos + 0.15, y: 2.7, w: 2.4, h: 1.0,
      fontSize: 32, bold: true, color: kpi.color, align: "center", margin: 0
    });

    s11.addText(kpi.detail, {
      x: xPos + 0.15, y: 3.9, w: 2.4, h: 2.4,
      fontSize: 13, color: COLORS.TEXT_MAIN, align: "center", margin: 0
    });
  });

  s11.addNotes("【発表者ノート】KPI測定計画です。定性的な印象ではなく、移行前の現行WordPress実測値をベースラインとしてGA4やLighthouse CIで定量比較します。特に「1星座完成率30%」を設定し、MOOCの完走率（5~13%）を大きく超える学習定着を証明します。");

  // =========================================================================
  // SLIDE 12: 実行計画 (Execution Plan - Phase & DoD)
  // =========================================================================
  const s12 = pres.addSlide();
  s12.background = { color: COLORS.BG_DARK };
  addHeader(s12, 12, "実行計画：フェーズゲート × Definition of Done (DoD)", "4段階のフェーズ分けと確実な品質管理によるプロジェクト推進");

  const phases = [
    { num: "Phase 1", name: "Foundation", period: "基盤確立", desc: "リポジトリ骨格整備、前提物検査、GitHub変更履歴の追跡可能化" },
    { num: "Phase 2", name: "Core Voyage", period: "コア機能", desc: "ETL・3D星海図・Firebase認証・ゲーミフィケーション・RAG対話の実装" },
    { num: "Phase 3", name: "Extended", period: "体験拡張", desc: "展望台モード・潜航演出・議論場・公開航路など没入感の拡張" },
    { num: "Phase 4", name: "Cutover", period: "本番公開", desc: "QA完了・DNS切替・効果測定（移行前後比較レポート作成）" }
  ];

  phases.forEach((p, idx) => {
    const yPos = 1.8 + idx * 1.2;
    s12.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: yPos, w: 11.73, h: 1.05, rectRadius: 0.08,
      fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
    });

    s12.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: yPos + 0.15, w: 1.8, h: 0.75, rectRadius: 0.05,
      fill: { color: COLORS.PRIMARY_BLUE }
    });
    s12.addText(p.num, {
      x: 1.0, y: yPos + 0.35, w: 1.8, h: 0.35,
      fontSize: 14, bold: true, color: COLORS.TEXT_MAIN, align: "center", margin: 0
    });

    s12.addText(p.name, {
      x: 3.0, y: yPos + 0.2, w: 2.5, h: 0.35,
      fontSize: 16, bold: true, color: COLORS.ACCENT_AQUA, margin: 0
    });
    s12.addText(p.period, {
      x: 3.0, y: yPos + 0.55, w: 2.5, h: 0.3,
      fontSize: 12, color: COLORS.TEXT_MUTED, margin: 0
    });

    s12.addText(p.desc, {
      x: 5.7, y: yPos + 0.25, w: 6.6, h: 0.65,
      fontSize: 13, color: COLORS.TEXT_MAIN, margin: 0
    });
  });

  s12.addNotes("【発表者ノート】実行計画です。Phase 1の基盤作成からPhase 4の本番切替まで、各フェーズに明確なDoD（Definition of Done）を設定し、承認を経て次フェーズに進むフェーズゲート制で確実に進行します。");

  // =========================================================================
  // SLIDE 13: 評価軸マッピング (Evaluation Criteria Mapping)
  // =========================================================================
  const s13 = pres.addSlide();
  s13.background = { color: COLORS.BG_DARK };
  addHeader(s13, 13, "評価軸マッピング：7つの評価軸すべてに明確な回答を持つ", "審査想定軸に対するロジックと根拠箇所のマッピング");

  const evalRows = [
    ["評価軸", "本プロジェクトの回答・強み"],
    ["社会性", "IT人材79万人不足×自習完走率5~13%への挑戦。Agentic開発の民主化による一般化"],
    ["新規性", "意味空間を実運用メディア情報構造に採用。lookupUI脱却。Stitch×Antigravity実証"],
    ["技術難易度", "高次元近傍と3D可視化の分離／R3F+Islandsによる速度両立／クライアントRAG+AppCheck"],
    ["完成度", "フェーズゲート×DoD管理。KPIは実測比較。A/B検証設計を内包"],
    ["実現可能性", "記事28本・画像56点の移植準備完了。Serverless+Flashモデルでコスト管理"],
    ["デモの映え", "星海図航海 → 星を灯す → 星座線点灯 → 星海碑解放 → RAG対話の3分デモ導線"],
    ["テーマ適合", "「学習定着（AI×教育）」と「Agentic開発（AI×開発様式）」の二枚看板で対応"]
  ];

  s13.addTable(
    evalRows.map((row, rIdx) => 
      row.map(cell => ({
        text: cell,
        options: {
          fontSize: rIdx === 0 ? 12 : 11,
          bold: rIdx === 0,
          color: rIdx === 0 ? COLORS.ACCENT_AQUA : COLORS.TEXT_MAIN,
          fill: rIdx === 0 ? { color: COLORS.CARD_BG } : (rIdx % 2 === 1 ? { color: "131D31" } : { color: COLORS.BG_DARK }),
          margin: 5
        }
      }))
    ),
    { x: 0.8, y: 1.8, w: 11.73, h: 4.8, colW: [2.5, 9.23] }
  );

  s13.addNotes("【発表者ノート】評価軸マッピングです。社会性、新規性、技術難易度、完成度、実現可能性、デモ映え、テーマ適合の7軸全方位において隙のない根拠を整えています。");

  // =========================================================================
  // SLIDE 14: 想定問答 (Q&A Anticipation: Depth vs Breadth)
  // =========================================================================
  const s14 = pres.addSlide();
  s14.background = { color: COLORS.BG_DARK };
  addHeader(s14, 14, "想定問答：深さ型は広さ型に劣らない — 証明責任の完遂", "「個人の体験向上ではないか？」という審査の刺しどころに先回りして回答");

  // Q1 Card
  s14.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
  });
  s14.addText(
    [
      { text: "Q. 個人のブログ改善に留まるのでは？\n\n", options: { fontSize: 16, bold: true, color: COLORS.WARN_GOLD, breakLine: true } },
      { text: "A. 「深さ型」の課題解決である\n", options: { fontSize: 16, bold: true, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "• 課題には社会直撃の「広さ型」と、体験を尖らせる「深さ型」が存在。\n", options: { fontSize: 13, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "• 本書はIT人材79万人不足・完走率5%など定量的根拠で証明責任を果たしている。\n", options: { fontSize: 13, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "• さらにAgentic開発の手法はあらゆる企業へ一般化（広さ型）する。", options: { fontSize: 13, color: COLORS.ACCENT_AQUA } }
    ],
    { x: 1.1, y: 2.1, w: 5.0, h: 4.2, margin: 0, valign: "top" }
  );

  // Q2 Card
  s14.addShape(pres.ShapeType.roundRect, {
    x: 6.9, y: 1.8, w: 5.6, h: 4.8, rectRadius: 0.1,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.CARD_BORDER, width: 1 }
  });
  s14.addText(
    [
      { text: "Q. ブランド・体験は事業成果になるか？\n\n", options: { fontSize: 16, bold: true, color: COLORS.WARN_GOLD, breakLine: true } },
      { text: "A. 体験は利益ドライバーである\n", options: { fontSize: 16, bold: true, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "• 体験主導組織の「6倍成長」〔出典8〕が証明。\n", options: { fontSize: 13, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "• 経営層の73%が没個性の海を懸念〔出典9〕。\n", options: { fontSize: 13, color: COLORS.TEXT_MAIN, breakLine: true } },
      { text: "• 生成AI時代の均質化に対する強力な抗体となる。", options: { fontSize: 13, color: COLORS.SUCCESS_EMERALD } }
    ],
    { x: 7.2, y: 2.1, w: 5.0, h: 4.2, margin: 0, valign: "top" }
  );

  s14.addNotes("【発表者ノート】想定問答です。「個人ブログの改善に過ぎないのでは」という懸念に対し、課題の定量証明とAgentic開発の汎用性という両面から、深さ型アプローチの正当性を回答します。");

  // =========================================================================
  // SLIDE 15: リスクと対策 (Risk Management)
  // =========================================================================
  const s15 = pres.addSlide();
  s15.background = { color: COLORS.BG_DARK };
  addHeader(s15, 15, "リスクと対策：刺されどころは先に塞いである", "技術・体験・運用上のリスクに対する予防的設計");

  const riskRows = [
    ["想定リスク", "具体策・フォールバック"],
    ["3D表現による性能低下", "記事本文は静的HTML(JSゼロ)。3DはIslands分離。モバイルはBloom無効化"],
    ["空間探索が刺さらない", "A/Bテストで検証。棄却時も知見を公開し従来UIとの併存へ切替可能"],
    ["記事数が少なく地図が疎", "下書き25本を「未公開の霧に包まれた星」として配置し期待感を演出"],
    ["AI機能のコスト増大", "App Checkによる防護 + Flashモデル採用 + 差分再計算(contentHash)"],
    ["アクセシビリティ毀損", "コントラストAA準拠、prefers-reduced-motion対応、3D非依存の代替導線"]
  ];

  s15.addTable(
    riskRows.map((row, rIdx) => 
      row.map(cell => ({
        text: cell,
        options: {
          fontSize: rIdx === 0 ? 12 : 11,
          bold: rIdx === 0,
          color: rIdx === 0 ? COLORS.ACCENT_AQUA : COLORS.TEXT_MAIN,
          fill: rIdx === 0 ? { color: COLORS.CARD_BG } : (rIdx % 2 === 1 ? { color: "131D31" } : { color: COLORS.BG_DARK }),
          margin: 6
        }
      }))
    ),
    { x: 0.8, y: 1.8, w: 11.73, h: 4.8, colW: [3.2, 8.53] }
  );

  s15.addNotes("【発表者ノート】リスクと対策です。3Dの重さ問題、空間検索の受容性リスク、コスト増大リスク等、あらかじめ予期されるボトルネック全てに対して具体的な解決策とフォールバックを用意しています。");

  // =========================================================================
  // SLIDE 16: まとめ (Summary & Conclusion)
  // =========================================================================
  const s16 = pres.addSlide();
  s16.background = { color: COLORS.BG_DARK };
  addHeader(s16, 16, "まとめ：学習定着 × ブランド価値 × Agentic 実証", "geodyssAI が提示する技術メディアと開発様式の未来");

  // Large Summary Card
  s16.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 11.73, h: 4.8, rectRadius: 0.15,
    fill: { color: COLORS.CARD_BG }, line: { color: COLORS.ACCENT_AQUA, width: 2 },
    shadow: { type: "outer", color: "38BDF8", blur: 8, offset: 0, angle: 0, opacity: 0.25 }
  });

  s16.addText(
    [
      { text: "geodyssAI は単なる「3Dブログ」ではない\n\n", options: { fontSize: 24, bold: true, color: COLORS.ACCENT_AQUA, breakLine: true } },
      { text: "1. 探索的学習への回答：", options: { fontSize: 16, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "意味空間の復元により、完走率5〜13%の限界を破り「学習の定着」を実現する〔出典3,4,6〕\n\n", options: { fontSize: 14, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "2. 没個性の海への対抗：", options: { fontSize: 16, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "体験主導（6倍成長）による「技術者のブランド価値」の確立〔出典8,9〕\n\n", options: { fontSize: 14, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "3. Agentic Era の実証：", options: { fontSize: 16, bold: true, color: COLORS.TEXT_MAIN } },
      { text: "個人が1人で最高品質のブランド開発を完遂できることのオープンリファレンス実装\n\n", options: { fontSize: 14, color: COLORS.TEXT_MUTED, breakLine: true } },
      { text: "— Your Compass to navigate the AI-natives, One Voyage at a Time —", options: { fontSize: 15, bold: true, italic: true, color: COLORS.SUCCESS_EMERALD } }
    ],
    { x: 1.2, y: 2.1, w: 10.93, h: 4.2, margin: 0, valign: "top" }
  );

  s16.addNotes("【発表者ノート】以上でプレゼンテーションを終了します。geodyssAIは単なる3Dブログではなく、学習定着、ブランド価値確立、そしてAgentic開発のオープンリファレンスとして未来を拓く挑戦です。ご清聴ありがとうございました。");

  // Save Output Presentation
  const outputPath = path.join(__dirname, "geodyssAI_企画書_presentation.pptx");
  await pres.writeFile({ fileName: outputPath });
  console.log(`Successfully generated full 16-slide presentation at: ${outputPath}`);
}

generateGeodyssAIDeck().catch((err) => {
  console.error("Error generating presentation:", err);
  process.exit(1);
});
