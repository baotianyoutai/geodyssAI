import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'active', agent: 'Munchkin Article Guide' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

interface WebLink {
  title: string;
  url: string;
  description: string;
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
  ],
  "logical-thinking": [
    { title: "McKinsey Insights", url: "https://www.mckinsey.com/featured-insights", description: "構造化思考・フェルミ推定・コンサルティングケーススタディ" }
  ],
  "design-tools": [
    { title: "Stitch with Google", url: "https://stitch.withgoogle.com", description: "Google の仕様駆動デザイン生成ツール" }
  ]
};

function getApiKey(): string {
  if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (import.meta.env.PUBLIC_FIREBASE_API_KEY) return import.meta.env.PUBLIC_FIREBASE_API_KEY;
  if (process.env.PUBLIC_FIREBASE_API_KEY) return process.env.PUBLIC_FIREBASE_API_KEY;
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;

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

  return 'AIzaSyD7zwkwv4juqt3v7ueDRXoK1M6Xpcv9NpI';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawText = await request.text();
    let body: any = {};
    if (rawText) {
      body = JSON.parse(rawText);
    }

    const {
      title = "この記事",
      excerpt = "",
      contentMd = "",
      category = "dl",
      question = ""
    } = body;

    const catKey = (category || 'dl').toLowerCase();
    const webLinks = OFFICIAL_WEB_LINKS[catKey] || OFFICIAL_WEB_LINKS['dl'];

    const apiKey = getApiKey();

    // 1. ユーザーがこの記事に関して直接質問した場合
    if (question.trim()) {
      let qAnswer = "";
      if (apiKey) {
        const truncatedContent = (contentMd || excerpt).slice(0, 4000);
        const prompt = `あなたは「geodyssAI」のナビゲーターである賢く愛らしい猫の「マンチカン航海士」だにゃ。
以下の【この記事の本文】を一番の根拠にして、旅行者（ユーザー）からの質問に対して、語尾に「〜にゃ」「〜だにゃ」を付け、わかりやすく丁寧に回答してください。

【記事タイトル】: ${title}
【記事本文】: ${truncatedContent}

【質問】: ${question}`;

        try {
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            qAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          }
        } catch (e) {
          console.error('Gemini API question error:', e);
        }
      }

      if (!qAnswer) {
        qAnswer = `ニャー！ご質問「${question}」ありがとうございますにゃ 🐾\nこの記事「${title}」の解説を踏まえて、コードの挙動や設定方法について深く探求してみてにゃ！下記ステップアップリンクも参考にしてほしいにゃ！`;
      }

      return new Response(JSON.stringify({ answer: qAnswer, webLinks }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. 初期ロード時：ステップアップ指導 ＆ 要約
    let summary = "";
    let nextSteps: string[] = [];

    if (apiKey) {
      const truncatedContent = (contentMd || excerpt).slice(0, 4000);
      const prompt = `あなたは「geodyssAI」のナビゲーターである愛らしい「マンチカン航海士」だにゃ。
以下の記事を読み終えた旅行者に向けて、要約とステップアップ学習のアドバイスを提示してください。

【記事タイトル】: ${title}
【記事本文】: ${truncatedContent}

以下の JSON フォーマットのみで返答してください（余計な装飾文字列は不要）:
{
  "summary": "この記事の核心を2文で表現した要約（語尾は〜だにゃ）",
  "nextSteps": [
    "ステップ1: 次に試すべき具体的なコードや実験",
    "ステップ2: 次に学ぶべき周辺知識や公式ドキュメント",
    "ステップ3: 応用・実践のための発展課題"
  ]
}`;

      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const textRes = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleanedText = textRes.replace(/```json|```/g, '').trim();
          const jsonRes = JSON.parse(cleanedText);
          summary = jsonRes.summary || "";
          nextSteps = jsonRes.nextSteps || [];
        }
      } catch (e) {
        console.error('Gemini API guide summary error:', e);
      }
    }

    // フォールバック
    if (!summary) {
      summary = `ニャー！「${title}」の読了おめでとうだにゃ 🐾 ${excerpt || '知の星海がまた一つ明るく照らされたにゃ！'}`;
    }

    if (!nextSteps || nextSteps.length === 0) {
      nextSteps = [
        `ステップ1: 記事内のコード例を自分のローカル環境で動かしてみるにゃ！`,
        `ステップ2: 下記の公式 Web ドキュメントを参照して周辺仕様を確認するにゃ！`,
        `ステップ3: 星海図の近傍の星（関連記事）へジャンプして知見を深めるにゃ！`
      ];
    }

    return new Response(JSON.stringify({
      summary,
      nextSteps,
      webLinks
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Article Guide API error:', error);
    return new Response(JSON.stringify({
      summary: "ニャー！この記事のステップアップガイドだにゃ 🐾",
      nextSteps: [
        "ステップ1: コードを手元で実行して動かすにゃ！",
        "ステップ2: 公式ドキュメントで最新仕様を確認するにゃ！",
        "ステップ3: 関連する星を探検するにゃ！"
      ],
      webLinks: OFFICIAL_WEB_LINKS['dl']
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
