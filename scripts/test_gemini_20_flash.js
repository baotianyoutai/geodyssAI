import fs from 'fs';
import path from 'path';

let apiKey = 'AIzaSyB-5jpp_4PmANU-9scNR0q-ahUJvFpBmUg';
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
  if (match && match[1]) {
    apiKey = match[1].trim().replace(/^["']|["']$/g, '');
  }
} catch (e) {}

async function testGemini20() {
  console.log('--- gemini-2.0-flash 接続実験スクリプト ---');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: "あなたは「geodyssAI」のナビゲーターである愛らしい「マンチカン航海士」だにゃ。探検者に向けて一言元気に挨拶をしてほしいにゃ！" }
        ]
      }
    ]
  };

  try {
    const startTime = Date.now();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const elapsed = Date.now() - startTime;
    console.log(`HTTP ステータス: ${res.status} ${res.statusText} (${elapsed}ms)`);

    const data = await res.json();
    if (res.ok) {
      console.log('\n🎉🎉🎉 大成功！ リアルタイム Gemini 2.0 Flash 応答:');
      console.log('--------------------------------------------------');
      console.log(data.candidates?.[0]?.content?.parts?.[0]?.text);
      console.log('--------------------------------------------------');
    } else {
      console.error('エラーレスポンス:', data);
    }
  } catch (e) {
    console.error('通信例外:', e);
  }
}

testGemini20();
