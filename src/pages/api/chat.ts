import type { APIRoute } from 'astro';
import { getArticles, logSearchQuery } from '../../lib/firebase-server';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'active', agent: 'Munchkin Navigator' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

const MOCK_ARTICLES = [
  { title: "AI-Dojo", slug: "ai-dojo-day1", category: "genai-foundations", excerpt: "AIの基礎原則と知識体系のガイド" },
  { title: "DevOPS x AI Agent Hackathon 2026 に参加します。", slug: "devops-x-ai-agent-hackathon-2026-に参加します。", category: "genai-foundations", excerpt: "DevOpsとAIエージェントの融合プロジェクト" },
  { title: "Gemini API Python SDKとChromaDBを使用してRAG-Systemを開発する", slug: "gemini-api-python-sdkとchromadbを使用してrag-systemを開発する【ハンズオン", category: "dl", excerpt: "ChromaDBとGeminiによる本格RAGハンズオン" },
  { title: "Gemini APIs Embedding Endpointを利用して、類似度を探索する", slug: "gemini-apis-embedding-endpointを利用して、類似度を探索する【ハンズ", category: "dl", excerpt: "テキスト埋め込みベクトルとコサイン類似度探索" }
];

function getApiKey(): string {
  if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (e) {}

  return '';
}

export const POST: APIRoute = async ({ request }) => {
  let lastUserMessage = '';

  try {
    const rawText = await request.text();
    if (rawText) {
      const body = JSON.parse(rawText);
      const messages = Array.isArray(body?.messages) ? body.messages : [];
      
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg && typeof msg === 'object') {
          const text = msg.content || msg.text || msg.body;
          if (text && (msg.role === 'user' || msg.sender === 'user' || !msg.role)) {
            lastUserMessage = String(text).trim();
            if (lastUserMessage) break;
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse request body in /api/chat:', e);
  }

  if (!lastUserMessage) {
    return new Response(JSON.stringify({
      response: 'ニャー！質問メッセージが受け取れなかったにゃ。もう一度入力してみてにゃ 🐾'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. 全記事データを安全に取得（RAG 知識ベース）
  let rawArticles: any[] = [];
  try {
    rawArticles = await getArticles();
  } catch (e) {
    console.warn('Firestore load warning:', e);
  }

  const allArticles = (Array.isArray(rawArticles) && rawArticles.length > 0) ? rawArticles : MOCK_ARTICLES;
  const queryLower = lastUserMessage.toLowerCase();

  // 2. 質問の話題・キーワードに応じた動的 RAG 検索
  const matchedArticles = allArticles.filter(art => {
    try {
      if (!art || typeof art !== 'object') return false;
      const title = String(art.title || '').toLowerCase();
      const excerpt = String(art.excerpt || '').toLowerCase();
      const category = String(art.category || '').toLowerCase();
      const slug = String(art.slug || '').toLowerCase();
      
      let tagMatch = false;
      if (Array.isArray(art.tags)) {
        tagMatch = art.tags.some((t: any) => String(t || '').toLowerCase().includes(queryLower));
      }

      // エイリアスマッチング
      const isFirebaseQuery = queryLower.includes('firebase') || queryLower.includes('firestore');
      const isClaudeQuery = queryLower.includes('claude') || queryLower.includes('agent') || queryLower.includes('llm');
      const isDlQuery = queryLower.includes('dl') || queryLower.includes('deep') || queryLower.includes('rag') || queryLower.includes('learning') || queryLower.includes('flutter');

      if (isFirebaseQuery && (category === 'firebase' || title.includes('firebase') || excerpt.includes('firebase'))) return true;
      if (isClaudeQuery && (category === 'claude' || title.includes('claude') || title.includes('agent') || excerpt.includes('claude'))) return true;
      if (isDlQuery && (category === 'dl' || title.includes('rag') || title.includes('deep') || excerpt.includes('rag'))) return true;

      return title.includes(queryLower) || excerpt.includes(queryLower) || category.includes(queryLower) || slug.includes(queryLower) || tagMatch;
    } catch (e) {
      return false;
    }
  }).slice(0, 4);

  const targetArticles = matchedArticles.length > 0 ? matchedArticles : allArticles.slice(0, 4);

  // ユーザーの欲しかった記事・検索クエリを Firestore の searchQueries コレクションに非同期記録
  const matchedSlugs = targetArticles.map(a => a.slug);
  logSearchQuery({
    query: lastUserMessage,
    matchedSlugs
  }).catch(e => console.warn('Query logging skipped:', e));

  // 3. Gemini API 呼び出し
  const apiKey = getApiKey();
  let botResponse = "";

  if (apiKey) {
    const contextText = targetArticles.map((art, idx) => 
      `【記事${idx + 1}】タイトル: "${art.title}" (カテゴリ: ${art.category})\n概要: ${art.excerpt}\nURL: /articles/${encodeURIComponent(art.slug)}`
    ).join("\n\n");

    const systemPrompt = `あなたは「geodyssAI (星海図)」のナビゲーターである、知的で可愛らしい猫の「マンチカン航海士 (Munchkin Navigator)」です。
ユーザーからの質問に対して、語尾に「〜にゃ」「〜だにゃ」を付けて回答してください。
以下の記事コンテキストを参照し、関連する記事があれば Markdown リンク [記事タイトル](/articles/slug) を含めて案内してください。

【参照記事コンテキスト】
${contextText}

【ユーザーの質問】
${lastUserMessage}`;

    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch (e) {
      console.error('Gemini API call failed:', e);
    }
  }

  // 4. 動的 RAG フォールバック（Gemini APIキー未設定・エラー時でも100%確実にリンク付き回答を返答）
  if (!botResponse) {
    if (matchedArticles.length > 0) {
      const topArt = matchedArticles[0];
      const otherArts = matchedArticles.slice(1);
      
      let text = `ニャー！ご質問「${lastUserMessage}」に関連する星を発見したにゃ 🐾\n\n👉 [${topArt.title}](/articles/${encodeURIComponent(topArt.slug)})\n*${topArt.excerpt || '詳細はこちらの星を参照してにゃ！'}*`;
      if (otherArts.length > 0) {
        text += `\n\nこちらの関連記事もおすすめだにゃ：\n` + otherArts.map(a => `・ [${a.title}](/articles/${encodeURIComponent(a.slug)})`).join("\n");
      }
      botResponse = text;
    } else {
      const hash = lastUserMessage.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const pickArt = allArticles[hash % allArticles.length];
      
      botResponse = `ニャー！ご質問「${lastUserMessage}」について知の星海を探索したにゃ 🐾\n\nおすすめの星はこちらだにゃ：\n👉 [${pickArt.title}](/articles/${encodeURIComponent(pickArt.slug)})\n*${pickArt.excerpt || '星の海を深く探検してみてにゃ！'}*`;
    }
  }

  return new Response(JSON.stringify({ response: botResponse }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
