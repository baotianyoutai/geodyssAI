import { GoogleGenAI } from '@google/genai';

const apiKey = "AIzaSyB-5jpp_4PmANU-9scNR0q-ahUJvFpBmUg";

console.log('--- 公式 Google Gen AI SDK (@google/genai) gemini-3.5-flash 接続検証 ---');

async function testSDK() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'こんにちは！マンチカン航海士の口調（〜だにゃ）で元気に自己紹介してください！',
    });

    const elapsed = Date.now() - startTime;
    console.log(`🎉🎉🎉 公式 SDK (@google/genai) 接続大成功！ (応答時間: ${elapsed}ms)`);
    console.log('--------------------------------------------------');
    console.log(response.text);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('❌ SDK 接続エラー:', error?.message || error);
  }
}

testSDK();
