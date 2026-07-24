// src/lib/ai-logic.ts
// 公式 Google Gen AI / Firebase AI Logic SDK (@google/genai) 統合モジュール

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

interface WebLink {
  title: string;
  url: string;
  description: string;
}

export interface StepUpGuideResult {
  summary: string;
  nextSteps: string[];
  webLinks: WebLink[];
}

const OFFICIAL_WEB_LINKS: Record<string, WebLink[]> = {
  firebase: [
    { title: "Firebase Console", url: "https://console.firebase.google.com", description: "プロジェクト設定・Firestore・Authの公式管理コンソール" },
    { title: "Firestore ドキュメント", url: "https://firebase.google.com/docs/firestore", description: "NoSQL リアルタイムデータベースの公式ガイド" },
    { title: "Vertex AI in Firebase", url: "https://firebase.google.com/docs/vertex-ai", description: "Firebase SDK で Gemini AI Logic を呼び出す公式ドキュメント" }
  ],
  dl: [
    { title: "Google AI Studio", url: "https://aistudio.google.com", description: "Gemini API キーの発行・プロンプト試行公式環境" },
    { title: "Gemini API Developer Docs", url: "https://ai.google.dev/docs", description: "Embedding や REST / SDK 呼び出しの公式リファレンス" },
    { title: "ChromaDB Documentation", url: "https://docs.trychroma.com", description: "オープンソース ベクトルデータベースの活用ガイド" }
  ],
  claude: [
    { title: "Anthropic Claude Developer Docs", url: "https://docs.anthropic.com", description: "Claude 3.5 Sonnet / Haiku API の公式開発ドキュメント" },
    { title: "Google Antigravity Codelab", url: "https://codelabs.developers.google.com/getting-started-google-antigravity?hl=ja#0", description: "Antigravity エージェント開発ハンズオン公式ガイド" },
    { title: "Agent Development Kit (ADK)", url: "https://google.github.io/adk", description: "Google の自律型 AI エージェント開発キット" }
  ]
};

function getGeminiApiKey(): string {
  if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (import.meta.env.PUBLIC_FIREBASE_API_KEY) return import.meta.env.PUBLIC_FIREBASE_API_KEY;
  if (process.env.PUBLIC_FIREBASE_API_KEY) return process.env.PUBLIC_FIREBASE_API_KEY;

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^(?:GEMINI_API_KEY|PUBLIC_FIREBASE_API_KEY)\s*=\s*(.+)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (e) {}

  return 'AIzaSyB-5jpp_4PmANU-9scNR0q-ahUJvFpBmUg';
}

// 現行の公式推奨 Gemini 最新モデル
const CURRENT_MODEL = 'gemini-3.5-flash';

/**
 * 1. 記事末尾用: 要点ノート ＆ 3ステップ学習ガイドの自動生成 (公式 SDK)
 */
export async function generateArticleStepUpGuide(
  title: string,
  excerpt: string,
  contentMd: string,
  category: string = 'dl'
): Promise<StepUpGuideResult> {
  const catKey = (category || 'dl').toLowerCase();
  const webLinks = OFFICIAL_WEB_LINKS[catKey] || OFFICIAL_WEB_LINKS['dl'];
  const apiKey = getGeminiApiKey();

  const truncatedContent = (contentMd || excerpt || '').slice(0, 3000);
  const prompt = `あなたは「geodyssAI」のナビゲーターである愛らしい「マンチカン航海士」だにゃ。
以下の記事を読み終えた旅行者に向けて、要約とステップアップ学習のアドバイスを提示してください。

【記事タイトル】: ${title}
【記事本文】: ${truncatedContent}

以下の JSON フォーマットのみで返答してください（余計なテキストは含めないでください）:
{
  "summary": "この記事の核心を2文で表現した要約（語尾は〜だにゃ）",
  "nextSteps": [
    "ステップ1 (ハンズオン): この記事のサンプルコードや概念を手元で実行・検証してみるにゃ",
    "ステップ2 (ドキュメント): 関連する公式リファレンスを参照し仕様の理解を深めるにゃ",
    "ステップ3 (発展応用): 自分のアイデアを組み込んで応用プロダクトを作ってみるにゃ"
  ]
}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: CURRENT_MODEL,
      contents: prompt
    });

    const textRes = response.text || '';
    const cleaned = textRes.replace(/```json|```/g, '').trim();
    const json = JSON.parse(cleaned);

    if (json.summary && Array.isArray(json.nextSteps)) {
      return {
        summary: json.summary,
        nextSteps: json.nextSteps,
        webLinks
      };
    }
  } catch (e) {
    console.warn('GoogleGenAI SDK guide generation warning:', e);
  }

  return {
    summary: `ニャー！「${title}」の読了おめでとうだにゃ 🐾 ${excerpt ? excerpt.slice(0, 90) + '...' : '知の星海がまた一つ明るく照らされたにゃ！'}`,
    nextSteps: [
      "ステップ1 (ハンズオン): 記事内のサンプルコードや設定を手元で実行・テストするにゃ",
      "ステップ2 (ドキュメント): 下記の公式開発リファレンスを参照し概念を深めるにゃ",
      "ステップ3 (応用発展): 自身の自作プロダクトや課題に応用・組み込んでみるにゃ"
    ],
    webLinks
  };
}

/**
 * 2. 記事質問用: 単一記事に関する Q&A チャット応答 (公式 SDK)
 */
export async function askArticleAI(
  title: string,
  contentMd: string,
  question: string
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const truncatedContent = (contentMd || '').slice(0, 3000);
  const prompt = `あなたは「geodyssAI」のナビゲーターである賢く愛らしい猫の「マンチカン航海士」だにゃ。
以下の【この記事の本文】を一番の根拠にして、旅行者（ユーザー）からの質問に対して、語尾に「〜にゃ」「〜だにゃ」を付け、わかりやすく丁寧に回答してください。

【記事タイトル】: ${title}
【記事本文】: ${truncatedContent}

【質問】: ${question}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: CURRENT_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    if (response.text) return response.text;
  } catch (e) {
    console.warn('GoogleGenAI Q&A error with grounding:', e);
    // フォールバック: tools なしで通常生成
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: CURRENT_MODEL,
        contents: prompt
      });
      if (response.text) return response.text;
    } catch (err) {}
  }

  return `ニャー！ご質問「${question}」ありがとうございますにゃ 🐾\n記事「${title}」の解説を踏まえて、コードの挙動や実装方法について深く探求してみてにゃ！下記ステップアップリンクも参考にしてほしいにゃ！`;
}

/**
 * 3. 3D 星海図用: 全域 RAG ナビゲーション対話 (公式 SDK)
 */
export async function generateStellarChatAI(
  userQuery: string,
  targetArticles: Array<{ title: string; slug: string; excerpt: string; category: string }>
): Promise<string> {
  const apiKey = getGeminiApiKey();

  const contextText = targetArticles.map((art, idx) =>
    `【記事${idx + 1}】タイトル: "${art.title}" (カテゴリ: ${art.category})\n概要: ${art.excerpt}\nURL: /articles/${encodeURIComponent(art.slug)}`
  ).join("\n\n");

  const systemPrompt = `あなたは「geodyssAI (星海図)」のナビゲーターである、知的で可愛らしい猫の「マンチカン航海士 (Munchkin Navigator)」です。
ユーザーからの質問に対して、語尾に「〜にゃ」「〜だにゃ」を付けて回答してください。
以下の記事コンテキストを参照し、関連する記事があれば Markdown リンク [記事タイトル](/articles/slug) を含めて案内してください。

【参照記事コンテキスト】
${contextText}

【ユーザーの質問】
${userQuery}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: CURRENT_MODEL,
      contents: systemPrompt
    });

    if (response.text) return response.text;
  } catch (e) {
    console.warn('Stellar Chat GoogleGenAI error:', e);
  }

  if (targetArticles.length > 0) {
    const top = targetArticles[0];
    const rest = targetArticles.slice(1);
    let reply = `ニャー！ご質問「${userQuery}」に関連する星を発見したにゃ 🐾\n\n👉 [${top.title}](/articles/${encodeURIComponent(top.slug)})\n*${top.excerpt || '詳細はこちらの星を参照してにゃ！'}*`;
    if (rest.length > 0) {
      reply += `\n\nこちらの関連記事もおすすめだにゃ：\n` + rest.map(a => `・ [${a.title}](/articles/${encodeURIComponent(a.slug)})`).join('\n');
    }
    return reply;
  }

  return `ニャー！ご質問「${userQuery}」について知の星海を探索したにゃ 🐾\n星の海を自由に巡ってみてにゃ！`;
}
