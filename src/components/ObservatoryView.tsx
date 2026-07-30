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
  heroImage?: string;
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
            heroImage: data.heroImage || '',
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
        <div className="lg:col-span-1 p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-6 shadow-2xl backdrop-blur-md h-fit sticky top-24">
          
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

        {/* 右側：リッチカード形式 記事リスト */}
        <div className="lg:col-span-2 p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-6 shadow-2xl backdrop-blur-md">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider">
              Constellation Stars List ({displayArticles.length})
            </h3>

            {/* フィルターボタン */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  filterMode === 'all' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All Stars
              </button>
              <button
                onClick={() => setFilterMode('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  filterMode === 'unread' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Unread Only
              </button>
            </div>
          </div>

          {displayArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayArticles.map(art => (
                <a
                  key={art.id || art.slug}
                  href={`/articles/${encodeURIComponent(art.slug)}`}
                  className="group block bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-sky-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(56,189,248,0.25)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3 p-4">
                    {/* カバー画像プレビュー */}
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
                      {art.heroImage ? (
                        <img
                          src={art.heroImage}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center p-3 text-center">
                          <span className="text-xs font-mono text-sky-400/80 font-bold">✨ geodyssAI Knowledge Star</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                      
                      {/* カテゴリ ＆ DRAFT/READ バッジ */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono rounded-md font-bold backdrop-blur-md truncate max-w-[70%]">
                          {art.category || 'GenAI'}
                        </span>
                        {art.status === 'draft' ? (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono rounded-md font-bold backdrop-blur-md">
                            ✦ DRAFT
                          </span>
                        ) : art.status === 'read' ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono rounded-md font-bold backdrop-blur-md">
                            ✓ READ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-800/80 text-slate-300 border border-slate-700 text-[9px] font-mono rounded-md font-bold backdrop-blur-md">
                            Lv.{art.difficulty}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 記事タイトル */}
                    <h4 className="text-sm font-bold font-display text-white group-hover:text-sky-300 transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h4>

                    {/* 記事概要 (Excerpt) */}
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 italic line-clamp-3">
                      {art.excerpt || '（記事の概要情報が入ります...）'}
                    </p>
                  </div>

                  {/* カードフッター */}
                  <div className="px-4 py-2.5 border-t border-slate-800/60 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono text-slate-400 group-hover:text-sky-300 transition-colors">
                    <span>記事を読む 📖</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
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
