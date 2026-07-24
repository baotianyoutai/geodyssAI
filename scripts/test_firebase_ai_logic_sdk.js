import { initializeApp } from 'firebase/app';
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import fs from 'fs';
import path from 'path';

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyB-5jpp_4PmANU-9scNR0q-ahUJvFpBmUg",
  authDomain: "my-geodyssai-pro-1744456051163.firebaseapp.com",
  projectId: "my-geodyssai-pro-1744456051163",
  storageBucket: "my-geodyssai-pro-1744456051163.firebasestorage.app",
  messagingSenderId: "860359053413",
  appId: "1:860359053413:web:aa543035a595812510b68c"
};

console.log('--- 公式 Firebase AI Logic SDK (firebase/vertexai) 接続検証スクリプト ---');

async function testFirebaseAILogicSDK(modelName) {
  console.log(`\n[SDK 検証] モデル名: "${modelName}" での接続を試行中...`);
  try {
    // 1. Firebase 初期化
    const app = initializeApp(firebaseConfig, `test-app-${Date.now()}`);

    // 2. Vertex AI in Firebase (Firebase AI Logic SDK) の取得
    const vertexAI = getVertexAI(app);

    // 3. Generative Model の指定
    const model = getGenerativeModel(vertexAI, { model: modelName });

    const startTime = Date.now();
    // 4. コンテンツ生成リクエスト
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'こんにちは！マンチカン航海士の口調（〜だにゃ）で自己紹介をしてください！' }] }]
    });

    const elapsed = Date.now() - startTime;
    const response = await result.response;
    const responseText = response.text();

    console.log(`✅ SDK 接続成功！ (応答時間: ${elapsed}ms)`);
    console.log('--------------------------------------------------');
    console.log(responseText);
    console.log('--------------------------------------------------');
    return true;
  } catch (error) {
    console.error(`❌ SDK 接続エラー (${modelName}):`, error?.message || error);
    return false;
  }
}

async function runSDKTests() {
  const modelsToTest = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const m of modelsToTest) {
    const ok = await testFirebaseAILogicSDK(m);
    if (ok) break;
  }
}

runSDKTests();
