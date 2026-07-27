export const prerender = false;

import type { APIRoute } from 'astro';
import { generateArticleStepUpGuide, askArticleAI } from '../../lib/ai-logic';

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
      title = "この記事",
      excerpt = "",
      contentMd = "",
      category = "dl",
      question = ""
    } = body;

    // 1. ユーザーから記事特化質問が送信された場合
    if (question && String(question).trim()) {
      const qAnswer = await askArticleAI(title, contentMd || excerpt, String(question).trim());
      return new Response(JSON.stringify({ answer: qAnswer }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. 初期ロード時：ステップアップ指導 ＆ 要約
    const guideResult = await generateArticleStepUpGuide(title, excerpt, contentMd, category);

    return new Response(JSON.stringify(guideResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Article guide API error:', error);
    return new Response(JSON.stringify({
      summary: "ニャー！知の星海の導きを受信したにゃ 🐾 本文の解説を踏まえて学習を深めてほしいにゃ！",
      nextSteps: [
        "ステップ1 (ハンズオン): コードや設定を手元で実行・テストするにゃ",
        "ステップ2 (公式ドキュメント): 開発リファレンスを参照するにゃ",
        "ステップ3 (応用発展): 自身のプロジェクトに応用してみるにゃ"
      ],
      webLinks: [
        { title: "Firebase Console", url: "https://console.firebase.google.com", description: "公式管理コンソール" },
        { title: "Google AI Studio", url: "https://aistudio.google.com", description: "Gemini API 公式環境" }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
