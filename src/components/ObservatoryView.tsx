import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase-client';
import { onSnapshot, collection } from 'firebase/firestore';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: number;
  excerpt: string;
  status?: string;
}

const CONSTELLATIONS = [
  { id: 'all', label: '全アセット (All)', color: '#38BDF8', categoryKey: 'all' },
  { id: 'genai-foundations', label: 'GenAI 基礎座', color: '#3B82F6', categoryKey: 'genai' },
  { id: 'ai-agents', label: 'AI Agents 座', color: '#8B5CF6', categoryKey: 'agent' },
  { id: 'firebase-cloud', label: 'Firebase & Cloud 座', color: '#F59E0B', categoryKey: 'cloud' },
  { id: 'claude', label: 'Claude 座', color: '#E07B54', categoryKey: 'claude' },
  { id: 'deep-learning', label: 'Deep Learning 座', color: '#2DD4BF', categoryKey: 'dl' },
  { id: 'logical-thinking', label: 'Logical Thinking 座', color: '#F2B8CC', categoryKey: 'logical' },
  { id: 'ml-python', label: 'Machine Learning / Python 座', color: '#10B981', categoryKey: 'machine' }
];

export function ObservatoryView({ articles: initialArticles = [] }: { articles: ArticleItem[] }) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [selectedConstellation, setSelectedConstellation] = useState(CONSTELLATIONS[0].id);
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');

  // Firestore db.collection('articles') リアルタイム同期 (SSOT)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'articles'), (snapshot) => {
      if (!snapshot.empty) {
        const list: ArticleItem[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as ArticleItem;
          return {
            id: docSnap.id,
            slug: data.slug || docSnap.id,
            title: data.title || docSnap.id,
            category: data.category || 'GenAI',
            difficulty: data.difficulty || 3,
            excerpt: data.excerpt || '',
            status: data.status || 'draft'
          };
        });
        setArticles(list);
      }
    }, (err) => {
      console.warn('Observatory Firestore live sync fallback info:', err);
    });

    return () => unsub();
  }, []);

  const activeConstellation = CONSTELLATIONS.find(c => c.id === selectedConstellation) || CONSTELLATIONS[0];

  // カテゴリ該当記事の抽出 (全アセット(all) または動的カテゴリ柔軟マッチング)
  const filteredArticles = articles.filter(art => {
    if (activeConstellation.id === 'all') return true;
    const cat = (art.category || '').toLowerCase();
    const key = activeConstellation.categoryKey.toLowerCase();
    return cat.includes(key) || key.includes(cat);
  });

  const displayArticles = filterMode === 'unread' 
    ? filteredArticles.filter(art => art.status !== 'read')
    : filteredArticles;

  const totalArticles = filteredArticles.length;
  const completedCount = filteredArticles.filter(art => art.status === 'read').length;
  const progressPercent = totalArticles > 0 ? Math.round((completedCount / totalArticles) * 100) : 0;
  const estimatedReadTime = totalArticles * 6; // 1本あたり平均6分

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans text-slate-100">
      
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono tracking-widest text-sky-400 uppercase bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
          STATION OBSERVATORY
        </span>
        <h1 className="text-2xl md:text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
          知の星海 展望台 — Observatory
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          全7星座の観測データ、星々の点灯率（読了進捗）、未巡破の星リストをリアルタイム監視できます。
        </p>
      </div>

      {/* 星座セレクタ Tab */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
        {CONSTELLATIONS.map(c => {
          const isSelected = c.id === selectedConstellation;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedConstellation(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all shrink-0 cursor-pointer border flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* メイングリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 左側：進捗 ＆ 観測ステータス */}
        <div className="lg:col-span-1 p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-6 shadow-2xl backdrop-blur-md">
          
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span
              className="w-4 h-4 rounded-full shadow-[0_0_12px_currentColor]"
              style={{ backgroundColor: activeConstellation.color, color: activeConstellation.color }}
            />
            <div>
              <h2 className="text-lg font-bold font-display" style={{ color: activeConstellation.color }}>
                {activeConstellation.label}
              </h2>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                ID: {activeConstellation.id}
              </span>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="space-y-2 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">CONSTELLATION LIGHT</span>
              <span className="font-bold text-sky-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full transition-all duration-700 rounded-full"
                style={{
                  width: `${Math.max(progressPercent, 5)}%`,
                  backgroundColor: activeConstellation.color
                }}
              />
            </div>
          </div>

          {/* メトリクス */}
          <div className="grid grid-cols-2 gap-3 text-center font-mono">
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <span className="block text-[10px] text-slate-500 uppercase">Observed Stars</span>
              <span className="text-lg font-bold text-slate-200">
                {totalArticles} <span className="text-xs text-slate-500">個</span>
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <span className="block text-[10px] text-slate-500 uppercase">Est. Voyage Time</span>
              <span className="text-lg font-bold text-indigo-400">
                {estimatedReadTime} <span className="text-xs text-slate-500">分</span>
              </span>
            </div>
          </div>

          <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 leading-relaxed font-body">
            💡 星座内のすべての星（記事）を巡破すると、古代の知恵が刻まれた「知の星海碑 (Monolith)」が解放されます。
          </div>

        </div>

        {/* 右側：記事リスト */}
        <div className="lg:col-span-2 p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-6 shadow-2xl backdrop-blur-md">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider">
              Constellation Stars List ({displayArticles.length})
            </h3>

            {/* フィルターボタン */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  filterMode === 'all' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All Stars
              </button>
              <button
                onClick={() => setFilterMode('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  filterMode === 'unread' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Unread Only
              </button>
            </div>
          </div>

          {displayArticles.length > 0 ? (
            <div className="space-y-3">
              {displayArticles.map(art => (
                <a
                  key={art.id || art.slug}
                  href={`/articles/${encodeURIComponent(art.slug)}`}
                  className="block p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-sky-500/40 rounded-xl transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Level {art.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {art.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-sky-300 transition-colors">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-sky-400 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-slate-500">
              No matching stars found in this constellation.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
