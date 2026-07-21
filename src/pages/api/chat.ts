import type { APIRoute } from 'astro';
import { getArticles } from '../../lib/firebase-server';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'active', agent: 'Munchkin Navigator' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

const MOCK_ARTICLES = [
  {
    title: "Gemini API (Python SDK) と ChromaDB を使用して RAG System を開発するハンズオン",
    excerpt: "Gemini API の Embedding Endpoint と ChromaDB を組み合わせてベクトル検索を行う RAG システムの構築ガイド。",
    slug: "gemini-api-python-sdkとchromadbを使用してrag-systemを開発する【ハンズオン",
    category: "dl",
    difficulty: 4
  },
  {
    title: "AI Agent Hackathon 2026 参加レポート",
    excerpt: "Antigravity や ADK、MCP を駆使してAIエージェントを開発したハッカソンの全記録。",
    slug: "devops-x-ai-agent-hackathon-2026-に参加します。",
    category: "claude",
    difficulty: 3
  },
  {
    title: "Firebase Firestore と Astro で作る 3D 星海図ブログ",
    excerpt: "WordPress 記事をベクトル化して 3D 空間座標にマッピングする地誌学風ブログシステムの設計思想。",
    slug: "ai-dojo-day1",
    category: "firebase",
    difficulty: 2
  }
];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages = [] } = body;
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'Message content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. 全記事からキーワード・コンテキスト検索（RAG 検索）
    let allArticles = [];
    try {
      allArticles = await getArticles();
    } catch (e) {
      console.warn('Failed to load articles from Firestore in chat API:', e);
    }

    if (!allArticles || allArticles.length === 0) {
      allArticles = MOCK_ARTICLES;
    }

    const queryLower = lastUserMessage.toLowerCase();

    // クエリに関連する記事を安全にフィルタリング
    const matchedArticles = allArticles.filter(art => {
      if (!art) return false;
      const titleMatch = (art.title || '').toLowerCase().includes(queryLower);
      const excerptMatch = (art.excerpt || '').toLowerCase().includes(queryLower);
      const tagMatch = Array.isArray(art.tags) && art.tags.some((t: string) => typeof t === 'string' && t.toLowerCase().includes(queryLower));
      const catMatch = (art.category || '').toLowerCase().includes(queryLower);
      return titleMatch || excerptMatch || tagMatch || catMatch;
    }).slice(0, 4);

    // 関連記事コンテキストの構築
    let contextText = "";
    if (matchedArticles.length > 0) {
      contextText = matchedArticles.map((art, idx) => 
        `【参考記事${idx + 1}】タイトル: "${art.title}" (難易度: ✦${art.difficulty}, カテゴリ: ${art.category})\n概要: ${art.excerpt}\nURLパス: /articles/${encodeURIComponent(art.slug)}`
      ).join("\n\n");
    } else {
      contextText = allArticles.slice(0, 3).map((art, idx) => 
        `【代表記事${idx + 1}】タイトル: "${art.title}"\n概要: ${art.excerpt}\nURLパス: /articles/${encodeURIComponent(art.slug)}`
      ).join("\n\n");
    }

    // 2. Gemini API 呼び出し
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let botResponse = "";

    if (apiKey) {
      const prompt = `あなたは「geodyssAI (星海図)」のナビゲーターである、賢く愛らしい猫の「マンチカン航海士 (Munchkin Navigator)」です。
旅行者（ユーザー）からの質問に対して、語尾に「〜にゃ」「〜だにゃ」を交えつつ、親切・丁寧に答えてください。
回答時には、必ず以下の【参照記事コンテキスト】を活用し、関連する記事があれば Markdown リンク（例: [記事タイトル](/articles/slug)）を含めて案内してください。

【参照記事コンテキスト】
${contextText}

【ユーザーからの質問】
${lastUserMessage}`;

      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (e) {
        console.error('Gemini API fetch error:', e);
      }
    }

    // Gemini APIキー未設定時、またはフォールバック時の応答
    if (!botResponse) {
      if (matchedArticles.length > 0) {
        const topArt = matchedArticles[0];
        botResponse = `星海の知識を探索したにゃ！ご質問「${lastUserMessage}」に関連する星を発見したにゃ。\n\nおすすめの星はこちらだにゃ：\n👉 [${topArt.title}](/articles/${encodeURIComponent(topArt.slug)})\n*${topArt.excerpt}*`;
      } else {
        const firstArt = allArticles[0];
        botResponse = `星海の奥深くまで探したにゃ！広大な知の星海から、こちらの星を提案するにゃ：\n\n👉 [${firstArt?.title || 'Hello World'}](/articles/${encodeURIComponent(firstArt?.slug || 'hello-world')})\n*${firstArt?.excerpt || '星海図の矢印ボタン（Move Next Star）を使って探検してみてにゃ！'}*`;
      }
    }

    return new Response(JSON.stringify({ response: botResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat API Internal Error:', error);
    return new Response(JSON.stringify({ 
      response: `ニャー！ご質問ありがとうございますにゃ 🐾 おすすめの記事はこちらだにゃ：\n👉 [Gemini API & RAG System 開発ハンズオン](/articles/gemini-api-python-sdk%E3%81%A8chromadb%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6rag-system%E3%82%92%E9%96%8B%E7%99%BA%E3%81%99%E3%82%8B%E3%80%90%E3%83%8F%E3%83%B3%E3%82%BA%E3%82%AA%E3%83%B3)` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
