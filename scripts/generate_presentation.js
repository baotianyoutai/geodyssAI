import pptxgen from "pptxgenjs";
import path from "path";

// Initialize Presentation
const pres = new pptxgen();

// Layout configuration
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.title = "geodyssAI - 知の星海を、一度にひとつの航海で";
pres.subject = "geodyssAI 企画書 & 技術実績 プレゼンテーション";
pres.author = "Yuta (AI Engineer / Data Scientist)";

// Color Palette Definition (Seikai Design System - NO # in hex strings)
const COLOR = {
  BG_DARK: "0B1026",        // Void/Deep indigo background
  CARD_BG: "141E36",        // Dark glass card background
  CARD_BG_ALT: "1A2542",    // Highlight card background
  CARD_BORDER: "2A3656",    // Glass border
  TEXT_MAIN: "EDF2FB",      // Starlight main text
  TEXT_SUB: "93A1BE",       // Mist subtitle text
  CYAN: "22D3EE",           // Stellar cyan accent
  PURPLE: "8B5CF6",         // Nebula violet accent
  BLUE: "3B82F6",           // Current ocean blue
  GOLD: "F59E0B",           // Accent gold / Highlight
  GREEN: "2DD4BF",          // Mint / Success
  ROSE: "F2B8CC",           // Munchkin pink
  WHITE: "FFFFFF"
};

// Common slide background
const applyBackground = (slide) => {
  slide.background = { color: COLOR.BG_DARK };
};

// Common Header Helper
const addHeader = (slide, category, title, reference) => {
  // Category Tag
  slide.addText(category.toUpperCase(), {
    x: 0.6,
    y: 0.4,
    w: 8.8,
    h: 0.3,
    fontSize: 10,
    fontFace: "Space Grotesk",
    color: COLOR.CYAN,
    bold: true,
    margin: 0
  });

  // Slide Title
  slide.addText(title, {
    x: 0.6,
    y: 0.7,
    w: 8.8,
    h: 0.5,
    fontSize: 20,
    fontFace: "Space Grotesk",
    color: COLOR.TEXT_MAIN,
    bold: true,
    margin: 0
  });

  // Reference Footer/Tag
  if (reference) {
    slide.addText(`参照: ${reference}`, {
      x: 0.6,
      y: 5.25,
      w: 8.8,
      h: 0.25,
      fontSize: 9,
      fontFace: "Inter",
      color: COLOR.TEXT_SUB,
      margin: 0
    });
  }
};

// Card Component Helper using string shape name "roundRect" or "rect"
const addCard = (slide, options) => {
  const { x, y, w, h, bg = COLOR.CARD_BG, border = COLOR.CARD_BORDER, radius = 0.08 } = options;
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: bg },
    line: { color: border, width: 1 },
    rectRadius: radius
  });
};

// Frame Helper for Visual Mockups
const addVisualFrame = (slide, x, y, w, h, label, description) => {
  addCard(slide, { x, y, w, h, bg: "0E152D", border: COLOR.CYAN, radius: 0.1 });
  slide.addText(`📷 [画面枠: ${label}]`, {
    x: x + 0.2,
    y: y + (h / 2) - 0.3,
    w: w - 0.4,
    h: 0.3,
    fontSize: 12,
    fontFace: "Space Grotesk",
    color: COLOR.CYAN,
    bold: true,
    align: "center",
    margin: 0
  });
  slide.addText(description, {
    x: x + 0.2,
    y: y + (h / 2) + 0.05,
    w: w - 0.4,
    h: 0.4,
    fontSize: 10,
    fontFace: "Inter",
    color: COLOR.TEXT_SUB,
    align: "center",
    margin: 0
  });
};

// ==========================================
// SLIDE 1: Title Cover
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);

  // Subtitle / Tagline Top
  slide.addText("PROJECT PROPOSAL & TECHNICAL REPORT", {
    x: 0.8, y: 1.0, w: 8.4, h: 0.3,
    fontSize: 11, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, letterSpacing: 2, margin: 0
  });

  // Main Title
  slide.addText("geodyssAI (ジオディサイ)", {
    x: 0.8, y: 1.35, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Space Grotesk", color: COLOR.TEXT_MAIN, bold: true, margin: 0
  });

  // Concept Tagline
  slide.addText("知の星海を、一度にひとつの航海で。\n- Your Compass to navigate the AI-natives, One Voyage at a Time -", {
    x: 0.8, y: 2.2, w: 8.4, h: 0.7,
    fontSize: 15, fontFace: "Inter", color: COLOR.CYAN, italic: true, margin: 0
  });

  // Main Banner Card
  addCard(slide, { x: 0.8, y: 3.1, w: 8.4, h: 1.8, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
  
  slide.addText([
    { text: "本企画・報告書の核心:\n", options: { bold: true, color: COLOR.CYAN, fontSize: 13 } },
    { text: "・知識の意味空間を3D可視化し、「学びの定着」と「技術者のブランド価値」を同時に解決する没入型メディア\n", options: { color: COLOR.TEXT_MAIN, fontSize: 11 } },
    { text: "・WordPress×ConoHaの限界を破り、Astro × Firebase × R3F × Gemini AI で高速・高体験を実現\n", options: { color: COLOR.TEXT_MAIN, fontSize: 11 } },
    { text: "・Stitch × Antigravity × MCP による「エージェント時代のブランド開発様式」の実証リファレンス", options: { color: COLOR.TEXT_SUB, fontSize: 11 } }
  ], { x: 1.1, y: 3.25, w: 7.8, h: 1.5, margin: 0 });

  // Metadata Footer
  slide.addText("Owner: Yuta (AI Engineer / Data Scientist)  |  https://www.geodyssai.com  |  Ref: geodyssAI_企画書-2.md, README.md", {
    x: 0.8, y: 5.1, w: 8.4, h: 0.3,
    fontSize: 10, fontFace: "Inter", color: COLOR.TEXT_SUB, margin: 0
  });

  slide.addNotes("【発表者ノート】\nみなさんこんにちは。本日は『geodyssAI（ジオディサイ）』のプロジェクト企画および実装成果報告を行います。\ngeodyssAIは、AI・データサイエンス領域の膨大な技術知識を3Dの『星海』としてマッピングし、読者が自ら航路を切り拓く新しい技術メディアです。\n本プレゼンでは単なる機能紹介にとどまらず、従来のWordPressメディアが抱える顧客体験の課題、学びの定着率の限界、そしてAIエージェントを活用した開発様式まで、全方位から言語化し実証結果をお伝えします。");
}

// ==========================================
// SLIDE 2: 社会的背景 — IT人材不足と自習の限界
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "1. 社会的背景 & 課題提起", "IT人材の深刻な不足と、自習型学習が抱える構造的限界", "経産省IT人材調査〔1〕, IPA DX動向2024〔2〕, Warwick/OpenPraxis MOOC調査〔3,4,5〕");

  // 3 Cards Layout
  const cards = [
    {
      title: "2030年 IT人材 79万人不足",
      number: "79万人 / 12.4万人",
      desc: "経済産業省試算により、2030年に最大79万人のIT人材が不足。うちAI・データ等の先端人材は12.4万人不足。採用だけでは埋まらず、独学・リスキリングが不可欠。",
      accent: COLOR.GOLD
    },
    {
      title: "企業DX推進における致命的不足",
      number: "6割超の企業が不足",
      desc: "IPA『DX動向2024』によると、101人以上企業の過半数がDX人材（特にデータサイエンティスト）を『大幅に不足』と回答。人材供給のボトルネックが深刻化。",
      accent: COLOR.CYAN
    },
    {
      title: "自習完走率は 5〜13% の低水準",
      number: "完走率 5 % 〜 13 %",
      desc: "供給の要となるオンライン学習・技術ブログ・MOOCの完了率は大半で13%未満、典型値は約5%。『読まれるが定着しない』構造的敗北が起きている。",
      accent: COLOR.PURPLE
    }
  ];

  cards.forEach((c, idx) => {
    const x = 0.6 + idx * 2.95;
    addCard(slide, { x, y: 1.4, w: 2.8, h: 3.6, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });

    slide.addText(c.title, {
      x: x + 0.2, y: 1.6, w: 2.4, h: 0.4,
      fontSize: 12, fontFace: "Space Grotesk", color: c.accent, bold: true, margin: 0
    });

    slide.addText(c.number, {
      x: x + 0.2, y: 2.05, w: 2.4, h: 0.5,
      fontSize: 16, fontFace: "Space Grotesk", color: COLOR.TEXT_MAIN, bold: true, margin: 0
    });

    slide.addText(c.desc, {
      x: x + 0.2, y: 2.65, w: 2.4, h: 2.1,
      fontSize: 10, fontFace: "Inter", color: COLOR.TEXT_SUB, margin: 0
    });
  });

  slide.addNotes("【発表者ノート】\n日本のDX推進において、2030年に最大79万人ものIT人材が不足すると予測されています。この穴を埋めるには独学や自習型のリスキリングが必須です。\nしかし現実は、MOOCや技術学習教材の完走率はわずか5〜13%にとどまっています。学びの供給源である自習型コンテンツが定着しないことこそ、社会的な大問題です。");
}

// ==========================================
// SLIDE 3: 課題A — 学習コンテンツにおける「学びの定着」の断絶
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "2. 課題A: 学びの定着の断絶", "20年間変化のない「検索とタグ」が探索的学習を妨げている", "Marchionini (2006)〔6,7〕, geodyssAI_企画書-2.md §1-1");

  // Left Card: Theory
  addCard(slide, { x: 0.6, y: 1.4, w: 4.2, h: 3.6, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
  slide.addText("探索的検索 (Exploratory Search) の理論", {
    x: 0.8, y: 1.6, w: 3.8, h: 0.3,
    fontSize: 13, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0
  });

  slide.addText([
    { text: "・Marchioniniの情報探索理論では、検索を『lookup（既知検索）』と『learn/investigate（探索的検索）』に大別。\n", options: { color: COLOR.TEXT_MAIN, fontSize: 10 } },
    { text: "・AI分野の学習者は『何を知らないか分からない』状態で探索するため、単語検索やタグ一覧では機能しない。\n", options: { color: COLOR.TEXT_MAIN, fontSize: 10 } },
    { text: "・既存ブログのUIは20年間『lookup』専用。結果として学習者が途中で迷子になり離脱する。", options: { color: COLOR.TEXT_SUB, fontSize: 10 } }
  ], { x: 0.8, y: 2.0, w: 3.8, h: 2.8, margin: 0 });

  // Right Grid: 3 Disconnects
  const disconnects = [
    { title: "断絶 1: 現在地の喪失", detail: "読者は自分が何を理解し、次に何を学ぶべきか地図を持てない。" },
    { title: "断絶 2: 単発の消費", detail: "1記事を読んで直帰し、体系的な知識の接続が行われない。" },
    { title: "断絶 3: 難易度のミスマッチ", detail: "入門者がいきなり専門記事に飛び込み、挫折して離脱する。" }
  ];

  disconnects.forEach((d, idx) => {
    const y = 1.4 + idx * 1.25;
    addCard(slide, { x: 5.0, y, w: 4.4, h: 1.1, bg: COLOR.CARD_BG_ALT, border: COLOR.PURPLE });
    slide.addText(d.title, {
      x: 5.2, y: y + 0.15, w: 4.0, h: 0.25,
      fontSize: 12, fontFace: "Space Grotesk", color: COLOR.GOLD, bold: true, margin: 0
    });
    slide.addText(d.detail, {
      x: 5.2, y: y + 0.45, w: 4.0, h: 0.55,
      fontSize: 10, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0
    });
  });

  slide.addNotes("【発表者ノート】\nなぜ技術学習コンテンツが定着しないのか？その本質は情報構造にあります。\n従来技術ブログは『検索フォーム』と『カテゴリタグ』だけで作られていますが、これは検索キーワードをあらかじめ知っている『lookup読者』向けです。AIのような先端分野では『何から学べばいいか分からない』読者が大半であり、現在地の喪失・単発消費・難易度ミスマッチという3つの断絶が生じています。");
}

// ==========================================
// SLIDE 4: 課題B — 没個性の海とブランド価値の毀損
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "3. 課題B: 体験とブランドの毀損", "表示遅延と標準テンプレートが技術者の価値を覆い隠す", "Accenture Song 調査〔8,9〕, Think with Google〔10〕");

  // Comparison Table Card
  addCard(slide, { x: 0.6, y: 1.4, w: 8.8, h: 3.6, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });

  slide.addText("WordPress + ConoHa 従来環境 箇条書き比較 と 事業影響データ", {
    x: 0.9, y: 1.6, w: 8.2, h: 0.3,
    fontSize: 13, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0
  });

  // Left & Right Comparison Box
  addCard(slide, { x: 0.9, y: 2.0, w: 4.0, h: 2.7, bg: "1B162B", border: COLOR.ROSE });
  slide.addText("✖ 従来型 WordPress × ConoHa", {
    x: 1.1, y: 2.15, w: 3.6, h: 0.3, fontSize: 12, fontFace: "Space Grotesk", color: COLOR.ROSE, bold: true, margin: 0
  });
  slide.addText([
    { text: "・テンプレート依存で差別化できず『没個性の海』に埋没\n", options: { color: COLOR.TEXT_MAIN, fontSize: 10 } },
    { text: "・表示速度1s→3sで離脱率+32%上昇(Google調査)\n", options: { color: COLOR.TEXT_MAIN, fontSize: 10 } },
    { text: "・年間サーバー代約1.5万円の固定コスト発生", options: { color: COLOR.TEXT_SUB, fontSize: 10 } }
  ], { x: 1.1, y: 2.5, w: 3.6, h: 2.0, margin: 0 });

  addCard(slide, { x: 5.1, y: 2.0, w: 4.0, h: 2.7, bg: "0F2738", border: COLOR.CYAN });
  slide.addText("◯ geodyssAI (Headless × 3D)", {
    x: 5.3, y: 2.15, w: 3.6, h: 0.3, fontSize: 12, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0
  });
  slide.addText([
    { text: "・独自のブランドアイデンティティ(Seikai)で存在感を確立\n", options: { color: COLOR.TEXT_MAIN, fontSize: 10 } },
    { text: "・Astro SSGによりLCP<2.5sの高速プレビューを実現\n", options: { color: COLOR.TEXT_MAIN, fontSize: 10 } },
    { text: "・Firebase Hosting活用で年間運用コスト約85%削減", options: { color: COLOR.GREEN, fontSize: 10 } }
  ], { x: 5.3, y: 2.5, w: 3.6, h: 2.0, margin: 0 });

  slide.addNotes("【発表者ノート】\n課題の2つ目は『体験とブランドの毀損』です。Accenture Songの調査によれば、経営層の73%が生成AI時代において『自社ブランドが没個性の海に埋没する』ことを懸念しています。\n技術者の発信も同様で、標準的なWordPressブログの上では技術力の差が伝わりません。さらにページ表示が1秒から3秒に遅れるだけで離脱率は32%跳ね上がります。体験向上はコストではなく、利益を決定づけるドライバです。");
}

// ==========================================
// SLIDE 5: 本プロジェクトが立てる問い (HMW)
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "4. 問いの設定", "深さ型課題の言語化：顧客体験とブランド価値を解くコア問い", "geodyssAI_企画書-2.md §1-3, §9");

  // HMW Big Card
  addCard(slide, { x: 0.6, y: 1.4, w: 8.8, h: 1.5, bg: COLOR.CARD_BG_ALT, border: COLOR.CYAN });
  slide.addText("How Might We (問いの定義):", {
    x: 0.9, y: 1.55, w: 8.2, h: 0.25, fontSize: 11, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0
  });
  slide.addText("「知識どうしの意味的な距離を可視化することで、読者が『地図を持って航海するように』学べる技術メディアを実現できるか？」", {
    x: 0.9, y: 1.85, w: 8.2, h: 0.8, fontSize: 15, fontFace: "Space Grotesk", color: COLOR.TEXT_MAIN, bold: true, margin: 0
  });

  // Logic Card (Deep problem vs Broad problem)
  addCard(slide, { x: 0.6, y: 3.1, w: 8.8, h: 1.9, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
  slide.addText("【課題のロジック：広さ型 vs 深さ型】", {
    x: 0.9, y: 3.25, w: 8.2, h: 0.3, fontSize: 12, fontFace: "Space Grotesk", color: COLOR.GOLD, bold: true, margin: 0
  });

  slide.addText([
    { text: "・広さ型（社会課題直撃）だけでなく、深さ型（特定領域の体験を圧倒的な質で解く）も正当な土俵。\n", options: { color: COLOR.TEXT_MAIN, fontSize: 10 } },
    { text: "・Accenture Songの例が示す通り『顧客体験とブランドは利益ドライバー』であり、個人の趣味レベルへ矮小化させない。\n", options: { color: COLOR.TEXT_MAIN, fontSize: 10 } },
    { text: "・『誰の（学習者・技術者）・どんな（定着率・没個性化）・どれだけの（5%完走率・73%懸念）』課題かを明確に言語化・定量証明する。", options: { color: COLOR.TEXT_SUB, fontSize: 10 } }
  ], { x: 0.9, y: 3.6, w: 8.2, h: 1.2, margin: 0 });

  slide.addNotes("【発表者ノート】\n本プロジェクトが立てる問い（HMW）は、『知識の意味的な距離を直感的な地図に変え、学びの定着と技術者のブランド価値を同時に解けるか』です。\n『個人のブログ改善に過ぎないのでは？』という問答に対しては、課題の証明責任を『広さ型』と『深さ型』の観点から明確にし、定量的指標をセットで示すことで課題設定の正当性を証明します。");
}

// ==========================================
// SLIDE 6: ソリューション概要 — 3D意味空間「星海」
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "5. ソリューション概観", "全記事を Embedding 意味空間へ配置する 3D メディア「星海 (Seikai)」", "geodyssAI_企画書-2.md §3-1, DESIGN.md");

  // Left 4 Feature Cards
  const features = [
    { title: "🌌 3D Stellar Chart (星海図)", text: "全記事を分散表現(Embedding)で3D空間配置。読破で星が灯る。" },
    { title: "✦ 光の糸 (MST & 近傍星)", text: "高次元コサイン類似度上位3件を光の線で接続。次に読むべき星を提示。" },
    { title: "⚓ 深度 (Z軸アビス)", text: "記事の難易度を空間の深さにマッピング。表層(入門)から深層へ。" },
    { title: "🐾 生成マンチカン AI RAG", text: "読者の航海履歴と記事文脈を理解する専属ナビゲーター。" }
  ];

  features.forEach((f, idx) => {
    const y = 1.4 + idx * 0.9;
    addCard(slide, { x: 0.6, y, w: 4.2, h: 0.8, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
    slide.addText(f.title, {
      x: 0.8, y: y + 0.1, w: 3.8, h: 0.25, fontSize: 11, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0
    });
    slide.addText(f.text, {
      x: 0.8, y: y + 0.35, w: 3.8, h: 0.4, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0
    });
  });

  // Right Visual Frame Mockup
  addVisualFrame(slide, 5.0, 1.4, 4.4, 3.5, "3D Stellar Chart 画面", "Three.js / React Three Fiber によるフル画面 3D 空間。ノイズ星雲とネオン発光する星々");

  slide.addNotes("【発表者ノート】\ngeodyssAIのソリューション『星海（せいかい）』です。\nタグや単なる検索一覧を破棄し、全記事をVector Embeddingによって3D空間へマッピングしました。高次元空間でのコサイン類似度による『光の糸』で次に読むべき記事を示し、難易度をZ軸の深さ（アビス）で表現します。右側にはその実際の3D空間画面のイメージが配置されます。");
}

// ==========================================
// SLIDE 7: 課題 ⇄ 機能 完全対応マッピング
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "6. 課題 ⇄ 機能 マッピング", "読者の学習の断絶ひとつひとつに、空間構造と演出で回答する", "geodyssAI_企画書-2.md §3-2");

  // Table Structure
  const rows = [
    { issue: "現在地の喪失", solution: "3D 星海図 & 航跡の可視化", outcome: "全記事の意味的距離を把握し、自らの現在地を可視化" },
    { issue: "単発の消費", solution: "光の糸 (高次元近傍3件接続)", outcome: "1記事読了後、構造的に「次に読むべき星」へ遷移" },
    { issue: "難易度ミスマッチ", solution: "Z軸アビス (難易度空間マッピング)", outcome: "自分のレベルに合った深度の星から順に探索" },
    { issue: "体系的学習欠如", solution: "7つの星座線 & 星海碑 (Monolith)", outcome: "全読破で星座が点灯し、AI生成の古文書要約が解放" },
    { issue: "没個性の海埋没", solution: "Seikai独自ブランドトークン", outcome: "唯一無二のUX自体が発信者のブランド価値を証明" }
  ];

  addCard(slide, { x: 0.6, y: 1.4, w: 8.8, h: 3.6, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });

  rows.forEach((r, idx) => {
    const y = 1.6 + idx * 0.65;
    const isAlt = idx % 2 === 1;
    if (isAlt) {
      addCard(slide, { x: 0.8, y: y - 0.05, w: 8.4, h: 0.55, bg: COLOR.CARD_BG_ALT, border: COLOR.CARD_BORDER, radius: 0.04 });
    }
    slide.addText(r.issue, { x: 1.0, y, w: 2.0, h: 0.4, fontSize: 10, fontFace: "Space Grotesk", color: COLOR.GOLD, bold: true, margin: 0 });
    slide.addText(`➔  ${r.solution}`, { x: 3.1, y, w: 2.8, h: 0.4, fontSize: 10, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0 });
    slide.addText(r.outcome, { x: 6.0, y, w: 3.0, h: 0.4, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0 });
  });

  slide.addNotes("【発表者ノート】\n課題と機能の1対1対応表です。\n現在地の喪失には『星海図と航跡』、単発消費には『光の糸』、難易度ミスマッチには『Z軸アビス』、体系的学習の欠如には『星座と星海碑』、そして没個性化には『Seikaiブランドシステム』が対応します。すべてのデザインと技術機能が、明確な課題解決に直結しています。");
}

// ==========================================
// SLIDE 8: GitHub MCP 実績 — フルスタック開発・改善の軌跡
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "7. GitHub MCP 開発実績", "Issue #1 〜 #25：Phase 1 基盤から v1.2.1 モバイル最適化までの全記録", "GitHub MCP API (baotianyoutai/geodyssAI), CHANGELOG.md");

  // 4 Horizontal Phase Cards
  const phases = [
    {
      num: "Phase 1 - Sprint 1",
      title: "ETL & 3D座標計算",
      issues: "Issue #1, #2",
      desc: "Python uv環境構築。WXR XMLパース、Vertex AI 768次元Embedding算出、UMAP 3D圧縮、Firestoreアップロード構築。"
    },
    {
      num: "Sprint 2 - 3",
      title: "Astro R3F & AI RAG",
      issues: "Issue #4, #7",
      desc: "Astro × R3F 3D UI構築。ノイズ星雲・パララックス星屑・Bloomエフェクト。マンチカンAI RAGチャット & Google Auth実装。"
    },
    {
      num: "Sprint 4 - 6",
      title: "星海酒場 & 展望台",
      issues: "Issue #8, #10, #12",
      desc: "記事内AI指導カード、星海碑Monolith、展望台(/observatory)、Z軸潜航3Dアニメーション、星海酒場(/tavern)リアルタイム掲示板。"
    },
    {
      num: "Phase 4 - v1.2.1",
      title: "Production & App Check",
      issues: "Issue #16, #18, #19, #23, #25",
      desc: "Firebase Hosting本番公開(geodyssai.com)。reCAPTCHA Enterprise App Check統合。@google/genai SDK移行 & モバイルレスポンシブ最適化。"
    }
  ];

  phases.forEach((p, idx) => {
    const x = 0.6 + idx * 2.22;
    addCard(slide, { x, y: 1.4, w: 2.1, h: 3.6, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
    
    slide.addText(p.num, { x: x + 0.15, y: 1.6, w: 1.8, h: 0.25, fontSize: 9, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0 });
    slide.addText(p.title, { x: x + 0.15, y: 1.85, w: 1.8, h: 0.4, fontSize: 11, fontFace: "Space Grotesk", color: COLOR.TEXT_MAIN, bold: true, margin: 0 });
    slide.addText(p.issues, { x: x + 0.15, y: 2.3, w: 1.8, h: 0.2, fontSize: 8, fontFace: "JetBrains Mono", color: COLOR.GOLD, margin: 0 });
    slide.addText(p.desc, { x: x + 0.15, y: 2.6, w: 1.8, h: 2.2, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_SUB, margin: 0 });
  });

  slide.addNotes("【発表者ノート】\nGitHub MCP経由で吸い上げた実際の開発履歴です。\nIssue #1の環境構築から、#2のPython ETL、#4の3D R3F空間、#7のGemini RAGチャット、#18の本番DNS切り替え、そして最新のIssue #23/#25（reCAPTCHA Enterprise保護、公式@google/genai SDK、モバイル専用ボトムシート）まで、全変更が1コミット1Issueで可視化・検証されています。");
}

// ==========================================
// SLIDE 9: 技術アーキテクチャ — Astro Islands × Firebase × R3F
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "8. システムアーキテクチャ", "重厚な 3D 表現と LCP < 2.5s の超高速性を構造的に両立", "README.md, AGENT.md, 企画書 §4");

  // 3 Layer Diagram Cards
  const layers = [
    {
      title: "1. Data Pipeline Layer (Python ETL)",
      tech: "Python (uv) / Gemini Embedding / UMAP / Firebase Admin SDK",
      detail: "・WordPress WXR XMLデータの自動パースとクレンジング\n・Vertex AI / Gemini による 768 次元意味ベクトルの生成\n・高次元空間でのコサイン類似度算出 ➔ UMAP による 3D 次元削減"
    },
    {
      title: "2. Frontend & Render Layer (Astro × React Three Fiber)",
      tech: "Astro SSG / React Three Fiber / Tailwind CSS v4 / Marked",
      detail: "・Astro SSG により記事ページは JS ほぼゼロで秒速プレビュー\n・3D 星海図は Astro Islands として分離し独立レンダリング\n・Bloom ポストエフェクト & WebGL GLSL カスタムシェーダー"
    },
    {
      title: "3. AI & Security Layer (Firebase & Gemini)",
      tech: "Official @google/genai / Firestore / App Check (reCAPTCHA)",
      detail: "・gemini-3.5-flash + Google Search Grounding によるリアルタイムRAG\n・reCAPTCHA Enterprise (App Check) で不正APIコールを遮断\n・Firestore リアルタイム同期による掲示板・既読・ブックマーク保存"
    }
  ];

  layers.forEach((l, idx) => {
    const y = 1.4 + idx * 1.25;
    addCard(slide, { x: 0.6, y, w: 8.8, h: 1.15, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
    
    slide.addText(l.title, { x: 0.8, y: y + 0.1, w: 4.5, h: 0.25, fontSize: 11, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0 });
    slide.addText(l.tech, { x: 5.4, y: y + 0.1, w: 3.8, h: 0.25, fontSize: 9, fontFace: "JetBrains Mono", color: COLOR.GOLD, align: "right", margin: 0 });
    slide.addText(l.detail, { x: 0.8, y: y + 0.38, w: 8.4, h: 0.7, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0 });
  });

  slide.addNotes("【発表者ノート】\nシステムアーキテクチャの全貌です。\nAstroのIslands Architectureを採用することで『記事ページはJavaScriptほぼゼロの静的SSG』として爆速化し、3D星海図のみをReact Three FiberのIslandとして動かす構造にしています。これにより、3Dの重厚さと表示速度の圧倒的高速性を完全に両立させました。");
}

// ==========================================
// SLIDE 10: Agentic Era 開発様式 — もう一つの成果物
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "9. Agentic Era の開発様式", "DESIGN.md を差し替えるだけで、誰のブランドでも体験開発を民主化する", "geodyssAI_企画書-2.md §5");

  // Top Text Banner
  addCard(slide, { x: 0.6, y: 1.4, w: 8.8, h: 0.9, bg: COLOR.CARD_BG_ALT, border: COLOR.PURPLE });
  slide.addText("【本プロジェクトのもう一つの成果物：エージェント開発のリファレンス実装】", {
    x: 0.8, y: 1.5, w: 8.4, h: 0.25, fontSize: 11, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0
  });
  slide.addText("これまでAccenture Songのような専門組織の領分だった『ブランド一貫の体験開発』を、Stitch × Antigravity × MCP の agentic スタックにより個人規模に開放。", {
    x: 0.8, y: 1.75, w: 8.4, h: 0.45, fontSize: 10, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0
  });

  // Pipeline Process
  const steps = [
    { title: "1. DESIGN.md (SSOT)", desc: "凍結されたデザイントークン・カラー・世界観" },
    { title: "2. Stitch MCP", desc: "トークン準拠の全画面UIデザイン自動生成" },
    { title: "3. Antigravity (SDD)", desc: "AGENT.md規約に基づく自律コーディング" },
    { title: "4. GitHub MCP", desc: "1変更=1コミットで透明性の高い履歴管理" }
  ];

  steps.forEach((s, idx) => {
    const x = 0.6 + idx * 2.22;
    addCard(slide, { x, y: 2.5, w: 2.1, h: 2.5, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
    slide.addText(s.title, { x: x + 0.15, y: 2.7, w: 1.8, h: 0.4, fontSize: 11, fontFace: "Space Grotesk", color: COLOR.GOLD, bold: true, margin: 0 });
    slide.addText(s.desc, { x: x + 0.15, y: 3.2, w: 1.8, h: 1.6, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_SUB, margin: 0 });
  });

  slide.addNotes("【発表者ノート】\ngeodyssAIはWebサービスであると同時に、『AIエージェント時代の新しい開発様式』の実証事例でもあります。\nDESIGN.mdというデザイン仕様書を記述し、StitchとAntigravityが連携することで、専門部隊でしか作れなかったリッチなブランド体験を個人が高速構築できます。DESIGN.mdを差し替えるだけでどんな企業ブランドにも転用可能なため、本プロジェクトの知見は『広さ型』の価値を持ちます。");
}

// ==========================================
// SLIDE 11: 成果測定 KPI (Success Metrics)
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "10. 成果測定 KPI (Success Metrics)", "「体感」ではなく移行前後の実測数値で効果を証明する", "geodyssAI_企画書-2.md §2, Issue #18");

  // 3 Metric Block Cards
  const kpis = [
    {
      category: "体験の質 (主指標)",
      metrics: [
        { name: "1セッション閲覧数 (回遊率)", target: "+ 50 % 向上", detail: "GA4計測" },
        { name: "記事間遷移率", target: "+ 40 % 向上", detail: "GA4 イベント" },
        { name: "直帰率", target: "− 20 pt 削減", detail: "GA4" }
      ],
      color: COLOR.CYAN
    },
    {
      category: "技術的品質 (Core Web Vitals)",
      metrics: [
        { name: "LCP (最大視覚コンテンツ表示)", target: "< 2.5 秒", detail: "PageSpeed Insights" },
        { name: "INP (インタラクション応答)", target: "< 200 ms", detail: "Core Web Vitals" },
        { name: "JS 転送量", target: "90 % 削減", detail: "DevTools" }
      ],
      color: COLOR.PURPLE
    },
    {
      category: "学習定着 & コスト (事業影響)",
      metrics: [
        { name: "1星座完成率 (MOOC5%比)", target: "30 % (6倍)", detail: "Firestore" },
        { name: "年間サーバー運用コスト", target: "85 % 削減", detail: "WordPress1.5万→2,000円" },
        { name: "復帰率 (星屑の栞)", target: "40 %", detail: "Firestore" }
      ],
      color: COLOR.GREEN
    }
  ];

  kpis.forEach((k, idx) => {
    const x = 0.6 + idx * 2.95;
    addCard(slide, { x, y: 1.4, w: 2.8, h: 3.6, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });

    slide.addText(k.category, { x: x + 0.2, y: 1.6, w: 2.4, h: 0.3, fontSize: 11, fontFace: "Space Grotesk", color: k.color, bold: true, margin: 0 });

    k.metrics.forEach((m, mIdx) => {
      const my = 2.0 + mIdx * 0.95;
      slide.addText(m.name, { x: x + 0.2, y: my, w: 2.4, h: 0.2, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_SUB, margin: 0 });
      slide.addText(m.target, { x: x + 0.2, y: my + 0.2, w: 2.4, h: 0.3, fontSize: 13, fontFace: "Space Grotesk", color: COLOR.TEXT_MAIN, bold: true, margin: 0 });
      slide.addText(`(${m.detail})`, { x: x + 0.2, y: my + 0.5, w: 2.4, h: 0.2, fontSize: 8, fontFace: "Inter", color: COLOR.GOLD, margin: 0 });
    });
  });

  slide.addNotes("【発表者ノート】\ngeodyssAIは『体感的に良くなった』で終わらせません。移行前のWordPress環境をベースラインとして記録し、実測数値で効果を評価します。\n回遊率+50%向上、LCP 2.5秒未満、JavaScript転送量90%削減、そして固定サーバーコストの85%削減（年間1.5万円から2,000円前後へ縮小）を達成目標に定めています。");
}

// ==========================================
// SLIDE 12: 画面構成 & マルチデバイス体験
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "11. 画面構成 & マルチデバイス体験", "マルチデバイス対応。画面ごとに徹底計算された UI/UX デザイン", "Issue #19, #25, DESIGN.md");

  // 4 Mockup Frames Grid
  const mockups = [
    { label: "1. 3D Stellar Chart (トップ)", desc: "3D星海図。星のホバーで光の糸発光、Z軸アビス表現" },
    { label: "2. Lighthouse & AI Guidance", desc: "記事詳細ページ。マンチカンAIステップ指導＆既読同期" },
    { label: "3. Stellar Tavern (星海酒場)", desc: "7カテゴリ別リアルタイム議論スレッド＆Stardust Cheer" },
    { label: "4. スマホ版 Mobile Sheet", desc: "要素重なり0%のボトムシート＆密着left-0ドロワー" }
  ];

  mockups.forEach((m, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const x = 0.6 + col * 4.5;
    const y = 1.4 + row * 1.85;

    addVisualFrame(slide, x, y, 4.3, 1.7, m.label, m.desc);
  });

  slide.addNotes("【発表者ノート】\n実際の画面構成です。トップの3D星海図、記事詳細のマンチカン指導ナビ、星海酒場の掲示板スレッド、そしてスマホ閲覧時に要素重なりを0%にしたモバイル専用ボトムシートと、あらゆる端末で最高のグラフィックスと操作性を提供します。");
}

// ==========================================
// SLIDE 13: 実行計画 & DoD フェーズゲート
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "12. 実行計画 & DoD フェーズゲート", "DoD（Definition of Done）に基づく厳格なフェーズゲート管理", "geodyssAI_企画書-2.md §6, KICKOFF.md");

  // 4 Horizontal Process Boxes
  const steps = [
    { phase: "Phase 1: Foundation", text: "・リポジトリ骨格作成\n・WXR XMLデータインポート\n・Python uv環境構築\n・GitHub履歴追跡開始" },
    { phase: "Phase 2: Core Voyage", text: "・ETLパイプライン完成\n・Astro R3F 3D星海図\n・Google Auth 認証\n・Gemini RAGチャット" },
    { phase: "Phase 3: Extended", text: "・展望台(/observatory)\n・Z軸潜航3Dアニメーション\n・星海酒場(/tavern)\n・勲章/星海碑Monolith" },
    { phase: "Phase 4: Cutover & v1.2", text: "・Firebase Hosting公開\n・DNS切り替え(A/TXT)\n・reCAPTCHA App Check\n・モバイルレスポンシブ" }
  ];

  steps.forEach((s, idx) => {
    const x = 0.6 + idx * 2.22;
    addCard(slide, { x, y: 1.4, w: 2.1, h: 3.6, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
    slide.addText(s.phase, { x: x + 0.15, y: 1.6, w: 1.8, h: 0.4, fontSize: 10, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0 });
    slide.addText(s.text, { x: x + 0.15, y: 2.1, w: 1.8, h: 2.7, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0 });
  });

  slide.addNotes("【発表者ノート】\n実行計画とフェーズ管理についてです。\n開発はPhase 1の基盤フェーズからPhase 4の本番公開まで、すべて明確なDoD（Definition of Done: 定義された完了条件）とレビューゲートを経て進行しました。現在は本番運用中のv1.2.1段階に位置しています。");
}

// ==========================================
// SLIDE 14: 評価軸 7 項目完全マッピング
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "13. 評価軸 7 項目完全マッピング", "審査のあらゆる問いに答える、全方位の論理補強", "geodyssAI_企画書-2.md §8");

  const evalRows = [
    { axis: "1. 社会性", answer: "IT人材最大79万人不足 × 自習完走率5〜13%の壁を突破。agentic開発の民主化により一般化" },
    { axis: "2. 新規性", answer: "意味空間(Embedding)を実メディアの情報構造そのものに据える着眼。20年来のUI前提の問い直し" },
    { axis: "3. 技術難易度", answer: "高次元近傍とUMAP投影の分離設計 / Astro Islands × R3F性能両立 / App Check防御" },
    { axis: "4. 完成度", answer: "フェーズゲート×DoD管理。KPIは移行前後実測。A/B検証設計を内包" },
    { axis: "5. 実現可能性", answer: "既存記事28本移行完了、Firebase/Gemini無料〜格安枠活用、DNS段階的切替低リスク" },
    { axis: "6. デモ映え", answer: "3D星海図航海 ➔ 星点灯 ➔ 星座線発光 ➔ 星海碑Monolith解放 ➔ マンチカンRAG対話" },
    { axis: "7. テーマ適合", answer: "「学習定着（AI×教育）」と「agentic開発（AI×開発様式）」の二枚看板で接続可能" }
  ];

  addCard(slide, { x: 0.6, y: 1.4, w: 8.8, h: 3.6, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });

  evalRows.forEach((r, idx) => {
    const y = 1.55 + idx * 0.47;
    slide.addText(r.axis, { x: 0.8, y, w: 1.8, h: 0.35, fontSize: 10, fontFace: "Space Grotesk", color: COLOR.GOLD, bold: true, margin: 0 });
    slide.addText(`➔  ${r.answer}`, { x: 2.6, y, w: 6.6, h: 0.35, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0 });
  });

  slide.addNotes("【発表者ノート】\nコンテストや審査で問われる一般的な7つの評価軸（社会性・新規性・技術難易度・完成度・実現性・デモ映え・テーマ適合）に対する回答のマッピングです。どの角度から質問を受けても、明確な根拠と実績で論証できる構成としています。");
}

// ==========================================
// SLIDE 15: 審査員想定問答 (Q&A) — 課題設定の正当性
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "14. 審査員想定問答 (Q&A)", "「深さ型課題」の正当性と、Accenture Song 流の事業価値証明", "geodyssAI_企画書-2.md §9");

  // Q1 Card
  addCard(slide, { x: 0.6, y: 1.4, w: 8.8, h: 1.7, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
  slide.addText("Q1.「これは個人ブログの改善に過ぎないのでは？」", {
    x: 0.8, y: 1.55, w: 8.4, h: 0.25, fontSize: 11, fontFace: "Space Grotesk", color: COLOR.ROSE, bold: true, margin: 0
  });
  slide.addText("A. 課題には広さ型(社会課題)と深さ型(特定領域の体験・ブランド)があり、深さ型も正当な土俵です。弱点になるのは定量データを示さない時ですが、本企画は『79万人不足×完走率5%×体験主導企業6倍成長』という数値で証明責任を果たしています。さらに本手法はあらゆる中小企業や発信者に一般化可能です。", {
    x: 0.8, y: 1.85, w: 8.4, h: 1.1, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0
  });

  // Q2 Card
  addCard(slide, { x: 0.6, y: 3.3, w: 8.8, h: 1.7, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
  slide.addText("Q2.「顧客体験やブランド価値は重要な課題なのか？」", {
    x: 0.8, y: 3.45, w: 8.4, h: 0.25, fontSize: 11, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, margin: 0
  });
  slide.addText("A. Accenture Songの存在が証明した通り、体験とブランドはコストではなく『利益ドライバー』です。生成AIでコンテンツが大量生産され73%が没個性化を懸念する時代において、ブランド体験の一貫性こそが最大の差別化となります。", {
    x: 0.8, y: 3.75, w: 8.4, h: 1.1, fontSize: 9, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0
  });

  slide.addNotes("【発表者ノート】\n審査で最も突かれやすい想定質問への回答です。\n『個人の趣味ブログ改善ではないか？』という問いに対しては、広さ型・深さ型の概念と各種定量データをもって反論します。体験向上とブランド価値構築こそが、AI時代の利益ドライバーであることを論理的に提示します。");
}

// ==========================================
// SLIDE 16: まとめ & ボナ・ヴォヤージュ
// ==========================================
{
  const slide = pres.addSlide();
  applyBackground(slide);
  addHeader(slide, "15. まとめ", "geodyssAI が開く技術メディアと体験開発の未来", "README.md, geodyssAI_企画書-2.md §11");

  // 3 Summary Core Value Cards
  const coreValues = [
    {
      title: "1. 学びの定着の解決",
      desc: "20年間変化のなかった検索とタグを脱し、意味空間3D可視化(星海)によって読者の自習完走率を劇的に引き上げる。",
      color: COLOR.CYAN
    },
    {
      title: "2. ブランド価値の創出",
      desc: "Astro SSGによる超高速表示と独自UI/UX(Seikai)により、没個性の海から抜け出し技術者の価値を最大化する。",
      color: COLOR.PURPLE
    },
    {
      title: "3. Agentic 開発の実証",
      desc: "Stitch × Antigravity × MCP の開発様式を全透明に公開し、ブランド体験開発の民主化を体現する。",
      color: COLOR.GREEN
    }
  ];

  coreValues.forEach((v, idx) => {
    const x = 0.6 + idx * 2.95;
    addCard(slide, { x, y: 1.4, w: 2.8, h: 2.7, bg: COLOR.CARD_BG, border: COLOR.CARD_BORDER });
    slide.addText(v.title, { x: x + 0.2, y: 1.65, w: 2.4, h: 0.35, fontSize: 12, fontFace: "Space Grotesk", color: v.color, bold: true, margin: 0 });
    slide.addText(v.desc, { x: x + 0.2, y: 2.1, w: 2.4, h: 1.8, fontSize: 10, fontFace: "Inter", color: COLOR.TEXT_MAIN, margin: 0 });
  });

  // Closing Message Card
  addCard(slide, { x: 0.6, y: 4.3, w: 8.8, h: 0.8, bg: COLOR.CARD_BG_ALT, border: COLOR.CYAN });
  slide.addText("「ボナ・ヴォヤージュ！ 知の星海で、あなただけの航路を刻もう。」", {
    x: 0.8, y: 4.5, w: 8.4, h: 0.4, fontSize: 14, fontFace: "Space Grotesk", color: COLOR.CYAN, bold: true, align: "center", margin: 0
  });

  slide.addNotes("【発表者ノート】\nまとめです。\ngeodyssAIは、単にブログを3Dにしたものではありません。学びの定着、ブランド価値の創出、そしてエージェント開発の実証という3つの価値を同時に提供します。\n以上でプレゼンテーションを終わります。ご清聴ありがとうございました！");
}

// Output File Save
const outputPath = path.resolve(process.cwd(), "geodyssAI_Presentation_v2.pptx");
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`Successfully generated presentation: ${outputPath}`);
  })
  .catch((err) => {
    console.error("Error generating presentation:", err);
    process.exit(1);
  });
