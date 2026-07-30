import type { APIRoute } from 'astro';
import { generateArticleTldr, generateArticleStepUpResources, askArticleAI } from '../../lib/ai-logic';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'active', agent: 'Munchkin Article Guide AI Logic' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawText = await request.text();
    let body: any = {};
    if (rawText) {
      body = JSON.parse(rawText);
    }

    const {
      type = 'tldr',
      title = "この記事",
      contentMd = "",
      question = ""
    } = body;

    // 1. Q&A チャット
    if (type === 'qa' || (question && String(question).trim())) {
      const qAnswer = await askArticleAI(title, contentMd, String(question).trim());
      return new Response(JSON.stringify({ answer: qAnswer }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. 3ステップ深掘り学習リソース
    if (type === 'stepup') {
      const stepupResult = await generateArticleStepUpResources(title, contentMd);
      return new Response(JSON.stringify(stepupResult), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. 記事 TL;DR 要約
    const tldrResult = await generateArticleTldr(title, contentMd);
    return new Response(JSON.stringify(tldrResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Article guide API error:', error);
    return new Response(JSON.stringify({
      error: 'AI generation error',
      message: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
