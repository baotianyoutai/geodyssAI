export const prerender = false;

import type { APIRoute } from 'astro';
import { getArticles, logSearchQuery } from '../../lib/firebase-server';
import { generateStellarChatAI } from '../../lib/ai-logic';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'active', agent: 'Munchkin Navigator AI Logic' }), {
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

  // 3. AI Logic による回答生成
  const botResponse = await generateStellarChatAI(lastUserMessage, targetArticles);

  return new Response(JSON.stringify({ response: botResponse }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
