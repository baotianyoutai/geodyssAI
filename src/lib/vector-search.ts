import { app } from './firebase-client';
import { getAI, getGenerativeModel } from 'firebase/ai';

export interface ArticleData {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  status: 'publish' | 'published' | 'draft';
  contentMd?: string;
  embedding?: number[];
  pos?: { x: number; y: number; z: number };
}

// 1. コサイン類似度の計算
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 2. クライアント側 text-embedding-004 または Vertex AI でベクトル生成
export async function getQueryEmbedding(text: string): Promise<number[] | null> {
  try {
    const ai = getAI(app);
    // text-embedding-004 モデルの呼出
    const model = getGenerativeModel(ai, { model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    if (result && result.embedding && Array.isArray(result.embedding.values)) {
      return result.embedding.values;
    }
  } catch (e) {
    console.warn('text-embedding-004 client embedding skipped/failed:', e);
  }
  return null;
}

// 3. ハイブリッド (ベクトル類似度 + キーワード) ランク付け関数
export async function rankArticlesByRelevance(
  query: string,
  catalog: ArticleData[],
  topK: number = 5
): Promise<Array<ArticleData & { matchScore?: string }>> {
  if (!catalog || catalog.length === 0) return [];
  const qLower = query.toLowerCase().trim();

  // クエリのベクトル化を試行
  const queryVec = await getQueryEmbedding(query);

  const scored = catalog.map(art => {
    let rawScore = 0;
    let cosSim = 0;
    const titleLower = (art.title || '').toLowerCase();
    const excerptLower = (art.excerpt || '').toLowerCase();
    const catLower = (art.category || '').toLowerCase();
    const slugLower = (art.slug || '').toLowerCase();

    // A. ベクトル類似度スコア
    if (queryVec && art.embedding && Array.isArray(art.embedding) && art.embedding.length > 0) {
      cosSim = cosineSimilarity(queryVec, art.embedding);
      rawScore += cosSim * 2.0;
    }

    // B. テキスト完全/部分一致ボーナス
    if (titleLower.includes(qLower)) rawScore += 1.5;
    if (slugLower.includes(qLower)) rawScore += 1.0;
    if (excerptLower.includes(qLower)) rawScore += 0.8;
    if (catLower.includes(qLower)) rawScore += 0.5;

    // 単語ごとのマッチング
    const words = qLower.split(/\s+/).filter(w => w.length > 1);
    words.forEach(w => {
      if (titleLower.includes(w)) rawScore += 0.4;
      if (excerptLower.includes(w)) rawScore += 0.2;
    });

    // スコアのパーセンテージ正規化 (最大 99.8% ~ 70.0%)
    let pct = 70;
    if (cosSim > 0) {
      pct = Math.min(99.9, Math.max(72.0, cosSim * 100));
    } else if (rawScore > 0) {
      pct = Math.min(98.5, 75.0 + rawScore * 8.0);
    } else {
      pct = Math.floor(65.0 + Math.random() * 10.0);
    }

    return {
      article: {
        ...art,
        matchScore: `${pct.toFixed(1)}%`
      },
      score: rawScore + cosSim
    };
  });

  // スコア順に降順ソート
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(item => item.article);
}
