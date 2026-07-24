import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Firebase Admin SDK の初期化
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccount.json';
const resolvedPath = path.isAbsolute(credPath) 
  ? credPath 
  : path.resolve(process.cwd(), credPath);

let app;

if (getApps().length === 0) {
  try {
    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      app = initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Successfully initialized Firebase Admin SDK from key file.');
    } else {
      // ローカルキーが見つからない場合は Application Default Credentials にフォールバック
      app = initializeApp();
      console.log('Firebase Admin SDK initialized using Application Default Credentials.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  app = getApp();
}

export const db = getFirestore(app);

// 全記事データを Firestore から取得する関数 (ビルド時実行用)
export async function getArticles() {
  try {
    const snapshot = await db.collection('articles').get();
    const articles = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || '',
        status: data.status || '',
        excerpt: data.excerpt || '',
        category: data.category || '',
        tags: data.tags || [],
        publishedAt: data.publishedAt || '',
        updatedAt: data.updatedAt || '',
        readingTime: data.readingTime || 1,
        difficulty: data.difficulty || 3,
        pos: data.pos || { x: 0, y: 0, z: 0 },
        neighbors: data.neighbors || [],
        contentMd: data.contentMd || data.content || ''
      };
    });
    return articles;
  } catch (error) {
    console.error('Failed to fetch articles from Firestore:', error);
    return [];
  }
}
