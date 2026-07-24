import fs from 'fs';
import path from 'path';

// .env から直接 GEMINI_API_KEY を抽出
let apiKey = 'AIzaSyB-5jpp_4PmANU-9scNR0q-ahUJvFpBmUg';
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
  if (match && match[1]) {
    apiKey = match[1].trim().replace(/^["']|["']$/g, '');
  }
} catch (e) {}

console.log('--- Firebase AI Logic (Gemini API) 接続実験スクリプト ---');
console.log('使用する API キー:', apiKey.slice(0, 15) + '...');

async function testModel(modelName) {
  console.log(`\n[実験] モデル "${modelName}" への接続を検証中...`);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: "こんにちは！マンチカン航海士の口調（〜だにゃ）で自己紹介をしてください。" }
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
    console.log(`HTTP ステータス: ${res.status} ${res.statusText} (応答時間: ${elapsed}ms)`);

    const textRes = await res.text();

    if (res.ok) {
      const data = JSON.parse(textRes);
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✅ 接続成功！ Gemini レスポンス:');
      console.log('--------------------------------------------------');
      console.log(outputText);
      console.log('--------------------------------------------------');
      return true;
    } else {
      console.error('❌ 接続失敗！ エラーレスポンス詳細:');
      console.error(textRes);
      return false;
    }
  } catch (error) {
    console.error('❌ リクエスト送信例外エラー:', error);
    return false;
  }
}

async function runTests() {
  // 1. gemini-2.5-flash で実験
  const success25 = await testModel('gemini-2.5-flash');

  // 2. gemini-1.5-flash で実験
  const success15 = await testModel('gemini-1.5-flash');

  // 3. gemini-1.5-flash-latest で実験
  const success15latest = await testModel('gemini-1.5-flash-latest');

  console.log('\n--- 実験完了サマリー ---');
  console.log(`gemini-2.5-flash: ${success25 ? '成功 (SUCCESS)' : '失敗 (FAILED)'}`);
  console.log(`gemini-1.5-flash: ${success15 ? '成功 (SUCCESS)' : '失敗 (FAILED)'}`);
  console.log(`gemini-1.5-flash-latest: ${success15latest ? '成功 (SUCCESS)' : '失敗 (FAILED)'}`);
}

runTests();
