import type { APIRoute } from 'astro';
import { getArticles } from '../../lib/firebase-server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'active', agent: 'Munchkin Navigator' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

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
    const allArticles = await getArticles();
    const queryLower = lastUserMessage.toLowerCase();

    // クエリに関連する記事をフィルタリング
    const matchedArticles = allArticles.filter(art => {
      const titleMatch = art.title.toLowerCase().includes(queryLower);
      const excerptMatch = art.excerpt.toLowerCase().includes(queryLower);
      const tagMatch = art.tags?.some((t: string) => t.toLowerCase().includes(queryLower));
      const catMatch = art.category.toLowerCase().includes(queryLower);
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
        botResponse = `星海の奥深くまで探したにゃ！広大な知の星海から、こちらの星を提案するにゃ：\n\n👉 [${firstArt?.title || 'Hello World'}](/articles/${encodeURIComponent(firstArt?.slug || 'hello-world')})\n星海図の矢印ボタン（Move Next Star）を使って探検してみてにゃ！`;
      }
    }

    return new Response(JSON.stringify({ response: botResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
