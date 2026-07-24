import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ status: 'active', agent: 'Monolith Recorder' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

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
  } catch (e) {
    // ignore
  }
  return '';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawText = await request.text();
    let body: any = {};
    if (rawText) {
      body = JSON.parse(rawText);
    }

    const {
      constellationId = 'firebase-cloud',
      constellationLabel = 'Firebase & Cloud 座',
      articles = []
    } = body;

    const apiKey = getApiKey();
    let tomeStory = "";

    const articleSummaryText = articles.map((a: any, i: number) => `・ ${a.title || a.slug}`).join('\n');

    if (apiKey) {
      const prompt = `あなたは知の星海を司る「大航海士マンチカン」です。
旅行者が星座「${constellationLabel}」に含まれるすべての知の星を巡破し全灯させた偉業を称え、古文書（Monolith）に刻む神秘的な要約物語を編纂してください。

【対象の知の星々】
${articleSummaryText}

要件:
・文脈は重厚かつ幻想的な古文書スタイル
・文章の語尾は「〜と知の星海碑に刻まれているニャ。」で締めくくってください
・長さは 150文字〜250文字程度`;

      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          tomeStory = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (e) {
        console.error('Gemini API monolith error:', e);
      }
    }

    if (!tomeStory) {
      tomeStory = `「太古の星海において、航海士は『${constellationLabel}』に属するすべての知の星を繋ぎ合わせ、偉大なる智慧の光を呼び覚ました。この碑には、未知なる領域を開拓した voyager の不滅の功績が永久に記録されているニャ。」`;
    }

    const monolithData = {
      id: `monolith-${constellationId}`,
      constellationId,
      constellationLabel,
      unlockedAt: new Date().toISOString(),
      tomeStory,
      badge: `Complete: ${constellationLabel}`
    };

    return new Response(JSON.stringify({ monolith: monolithData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Monolith API error:', error);
    return new Response(JSON.stringify({
      monolith: {
        id: 'monolith-demo',
        constellationId: 'genai-foundations',
        constellationLabel: 'GenAI 基礎座',
        unlockedAt: new Date().toISOString(),
        tomeStory: '「知の星々を全て巡破せし航海士の功績が、永遠にこの星海碑に刻まれているニャ。」',
        badge: 'Complete: GenAI 基礎座'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
