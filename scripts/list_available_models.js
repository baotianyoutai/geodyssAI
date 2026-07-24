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

async function listModels() {
  console.log('--- 利用可能な Gemini API モデル一覧の取得 ---');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const res = await fetch(endpoint);
    console.log(`HTTP ステータス: ${res.status}`);
    const data = await res.json();
    if (data.models) {
      console.log('\n✅ 利用可能なモデル一覧:');
      data.models.forEach(m => {
        if (m.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`- ${m.name.replace('models/', '')} (displayName: ${m.displayName})`);
        }
      });
    } else {
      console.log('モデル一覧レスポンス:', data);
    }
  } catch (e) {
    console.error('モデル取得エラー:', e);
  }
}

listModels();
