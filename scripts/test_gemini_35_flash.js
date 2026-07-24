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

async function testModels() {
  const models = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];

  for (const modelName of models) {
    console.log(`\n--- ${modelName} 接続実験 ---`);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: "こんにちは！マンチカン航海士の口調（〜だにゃ）で元気にあいさつしてください。" }
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
        console.log('🎉🎉🎉 大成功！ リアルタイム Gemini 応答:');
        console.log('--------------------------------------------------');
        console.log(data.candidates?.[0]?.content?.parts?.[0]?.text);
        console.log('--------------------------------------------------');
        return modelName;
      } else {
        console.error('エラーメッセージ:', data.error?.message || data);
      }
    } catch (e) {
      console.error('通信例外:', e);
    }
  }
}

testModels();
