---
name: Seikai
colors:
  surface: '#0e1416'
  surface-dim: '#0e1416'
  surface-bright: '#343a3c'
  surface-container-lowest: '#090f11'
  surface-container-low: '#161d1e'
  surface-container: '#1a2122'
  surface-container-high: '#242b2d'
  surface-container-highest: '#2f3638'
  on-surface: '#dde4e5'
  on-surface-variant: '#bbc9cd'
  inverse-surface: '#dde4e5'
  inverse-on-surface: '#2b3233'
  outline: '#859397'
  outline-variant: '#3c494c'
  surface-tint: '#2fd9f4'
  primary: '#8aebff'
  on-primary: '#00363e'
  primary-container: '#22d3ee'
  on-primary-container: '#005763'
  inverse-primary: '#006877'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#d0ddff'
  on-tertiary: '#002e6a'
  tertiary-container: '#a5c1ff'
  on-tertiary-container: '#004ba5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a2eeff'
  primary-fixed-dim: '#2fd9f4'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#0e1416'
  on-background: '#dde4e5'
  surface-variant: '#2f3638'
  void: '#050B18'
  deep: '#0B1026'
  starlight: '#EDF2FB'
  mist: '#93A1BE'
  munchkin-pink: '#F2B8CC'
  munchkin-lavender: '#C7BDF0'
  munchkin-mint: '#BDE7DB'
  munchkin-cream: '#FFF3E4'
  constellation-firebase: '#F59E0B'
  constellation-claude: '#E07B54'
  constellation-dl: '#2DD4BF'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  nav-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-desktop: 2rem
  margin-mobile: 1rem
  gutter: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

# DESIGN.md — geodyssAI Design System & UI Specification（v2: 星海）

> **用途**: Google Stitch に投入するデザイン仕様の SSOT（Single Source of Truth）
> **Site**: https://www.geodyssai.com
> **Tagline**: *- Your Compass to navigate the AI-natives, One Voyage at a Time -*
> **最終更新**: 2026-07-19（v2: アートディレクションを「星海」へ更新）

---

## 1. ブランドコア

### 1.1 コンセプト — 星海（せいかい）
「知識の星海を、一度にひとつの航海で。」
全記事を Embedding の意味空間に浮かぶ星として 3D 可視化し、読者が船長として星の海を渡るブログ。

### 1.2 メタファー辞書
- 記事: 星
- カテゴリ: 星座
- AI アシスタント: 航海士（生成マンチカン）
- トップの 3D マップ: 星海図（Stellar Chart）

---

## 2. デザイントークン

### 2.1 カラー
```css
/* Brand — 星海: 宇宙の底とインディゴの海 */
--void:          #050B18;                 /* 星海図の最深部背景 */
--deep:          #0B1026;                 /* 基本背景（インディゴ寄りの闇） */
--surface-glass: rgba(13, 18, 43, 0.55); /* グラスパネルの面 */
--stellar:       #22D3EE;                 /* 恒星シアン: 灯した星・アクセント・フォーカス */
--nebula:        #8B5CF6;                 /* 星雲バイオレット: 第 2 アクセント・hover */
--current:       #3B82F6;                 /* 海流ブルー: 未読の星・リンク */
--starlight:     #EDF2FB;                 /* 本文テキスト */
--mist:          #93A1BE;                 /* 補助テキスト */
--line:          rgba(148, 163, 184, 0.16);

/* Signature Gradient — オーロラ */
--aurora: linear-gradient(120deg, #22D3EE 0%, #8B5CF6 55%, #F2B8CC 100%);

/* Munchkin Pastel — 吹き出し・チャット・勲章 */
--m-pink:     #F2B8CC;
--m-lavender: #C7BDF0;
--m-mint:     #BDE7DB;
--m-cream:    #FFF3E4;

/* Constellations — 星座色 */
--const-genai:    #3B82F6;
--const-agents:   #8B5CF6;
--const-firebase: #F59E0B;
--const-claude:   #E07B54;
--const-dl:       #2DD4BF;
--const-logic:    #F2B8CC;
--const-design:   #7DD3C0;
```

### 2.2 タイポグラフィ
- Display: Space Grotesk 700
- 本文: Inter + Noto Sans JP (400/500/700)
- マンチカン発話: M PLUS Rounded 1c
- コード: JetBrains Mono

### 2.3 形状・エフェクト
- 角丸: カード 16px / パネル 20px / ピル 999px
- グラスモーフィズム: blur(16px) + border 1px solid var(--line)
- フィルムグレイン: 不透明度 3% のノイズテクスチャ
- 深度（影）: 0 8px 32px rgba(3, 7, 24, 0.6)
