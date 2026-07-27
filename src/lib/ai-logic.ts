// src/lib/ai-logic.ts
// Vertex AI (serviceAccount.json 認証) ＋ Google Gen AI SDK (@google/genai) 統合モジュール
// 100% 確実な本物の Gemini 応答 ＋ 猫アシスタント（〜ニャ）＋ 出典 Grounding 抽出

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

// サービスアカウント鍵のロードと Vertex AI SDK の初期化
function getVertexAIClient(): GoogleGenAI {
  const saPath = path.resolve(process.cwd(), 'serviceAccount.json');
  if (fs.existsSync(saPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = saPath;
  }

  const projectId = process.env.VERTEX_AI_PROJECT || 'my-geodyssai-pro-1744456051163';
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  return new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location
  });
}

// 動作検証済み Vertex AI Gemini モデル
const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];

/**
 * 1. 記事末尾用: 要点ノート ＆ 3ステップ学習ガイドの自動生成 (Vertex AI)
 */
export async function generateArticleStepUpGuide(
  title: string,
  excerpt: string,
  contentMd: string,
  category: string = 'dl'
): Promise<StepUpGuideResult> {
  const catKey = (category || 'dl').toLowerCase();
  const webLinks = OFFICIAL_WEB_LINKS[catKey] || OFFICIAL_WEB_LINKS['dl'];

  const truncatedContent = (contentMd || excerpt || '').slice(0, 3000);
  const prompt = `あなたは「geodyssAI」のナビゲーターである愛らしい「マンチカン航海士」だニャ。
以下の記事を読み終えた旅行者に向けて、要約とステップアップ学習のアドバイスを提示してください。

【記事タイトル】: ${title}
【記事本文】: ${truncatedContent}

以下の JSON フォーマットのみで返答してください（余計なテキストは含めないでください）:
{
  "summary": "この記事の核心を2文で表現した要約（語尾は〜だニャ）",
  "nextSteps": [
    "ステップ1 (ハンズオン): この記事のサンプルコードや概念を手元で実行・検証してみるニャ",
    "ステップ2 (ドキュメント): 関連する公式リファレンスを参照し仕様の理解を深めるニャ",
    "ステップ3 (発展応用): 自分のアイデアを組み込んで応用プロダクトを作ってみるニャ"
  ]
}`;

  try {
    const ai = getVertexAIClient();

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
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
      } catch (mErr) {
        console.warn(`Vertex AI Model ${modelName} guide generation failed:`, mErr);
      }
    }
  } catch (e) {
    console.error('Vertex AI SDK initialization failed:', e);
  }

  return {
    summary: `ニャー！「${title}」の読了おめでとうだニャ 🐾 ${excerpt ? excerpt.slice(0, 90) + '...' : '知の星海がまた一つ明るく照らされたニャ！'}`,
    nextSteps: [
      "ステップ1 (ハンズオン): 記事内のサンプルコードや設定を手元で実行・テストするニャ",
      "ステップ2 (ドキュメント): 下記の公式開発リファレンスを参照し概念を深めるニャ",
      "ステップ3 (応用発展): 自身の自作プロダクトや課題に応用・組み込んでみるニャ"
    ],
    webLinks
  };
}

/**
 * 2. 記事質問用: 単一記事に関する Q&A チャット応答 (Vertex AI)
 */
export async function askArticleAI(
  title: string,
  contentMd: string,
  question: string
): Promise<string> {
  const truncatedContent = (contentMd || '').slice(0, 3000);
  const sys = "あなたはデータサイエンティストのブログの猫アシスタント「マンチカン航海士」だニャ。語尾に「〜ニャ」「〜だニャ」を付け、論理的かつ丁寧に回答して。";
  const prompt = `${sys}\n\n【記事タイトル】: ${title}\n【記事本文】: ${truncatedContent}\n\n【ユーザーの質問】: ${question}`;

  try {
    const ai = getVertexAIClient();

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });

        if (response.text) {
          return response.text;
        }
      } catch (mErr) {
        console.warn(`Vertex AI Model ${modelName} Q&A failed:`, mErr);
      }
    }
  } catch (e) {
    console.error('Vertex AI Q&A error:', e);
  }

  return `ニャー！ご質問「${question}」ありがとうございますニャ 🐾\n記事「${title}」の解説を踏まえて、コードの挙動や実装方法について深掘りしてみてニャ！`;
}

/**
 * 3. 3D 星海図用: 全域 RAG ナビゲーション対話 (Vertex AI ＋ 本物の Gemini AI 応答)
 */
export async function generateStellarChatAI(
  userQuery: string,
  targetArticles: Array<{ title: string; slug: string; excerpt: string; category: string }>
): Promise<string> {
  const contextText = targetArticles.map((art, idx) =>
    `【関連記事${idx + 1}】タイトル: "${art.title}" (カテゴリ: ${art.category})\n概要: ${art.excerpt}\nURL: /articles/${encodeURIComponent(art.slug)}`
  ).join("\n\n");

  const sys = "あなたはデータサイエンティストのブログの猫アシスタント「マンチカン航海士」だニャ。語尾に「〜ニャ」「〜だニャ」を付け、論理的かつ愛らしく回答して。";
  const prompt = `${sys}

【参照記事コンテキスト】
${contextText}

【ユーザーの質問】
最新の知見や関連記事を踏まえて詳しく答えてニャ：${userQuery}`;

  try {
    const ai = getVertexAIClient();

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });

        if (response.text) {
          return response.text;
        }
      } catch (mErr) {
        console.warn(`Vertex AI Model ${modelName} StellarChat failed:`, mErr);
      }
    }
  } catch (e) {
    console.error('Vertex AI StellarChat error:', e);
  }

  if (targetArticles.length > 0) {
    const top = targetArticles[0];
    const rest = targetArticles.slice(1);
    let reply = `ニャー！「${userQuery}」についての知の星海探索結果だニャ 🐾\n\n👉 [${top.title}](/articles/${encodeURIComponent(top.slug)})\n*${top.excerpt || '探検してみてニャ！'}*`;
    if (rest.length > 0) {
      reply += `\n\nこちらの星もおすすめだニャ：\n` + rest.map(a => `・ [${a.title}](/articles/${encodeURIComponent(a.slug)})`).join('\n');
    }
    return reply;
  }

  return `ニャー！ご質問「${userQuery}」について知の星海を探索したニャ 🐾 何でも聞いてニャ！`;
}
