import React, { useState, useEffect } from 'react';
import { db, auth, onAuthStateChanged } from '../lib/firebase-client';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface PostItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  cheersCount: number;
}

const CONSTELLATIONS = [
  { id: 'genai-foundations', label: 'GenAI 基礎座', color: '#3B82F6', desc: 'RAG, Embedding, ChromaDB, ベクトル空間についての議論スレッド' },
  { id: 'ai-agents', label: 'AI Agents 座', color: '#8B5CF6', desc: 'Antigravity, ADK, MCP, 自律型エージェント開発スレッド' },
  { id: 'firebase-cloud', label: 'Firebase & Cloud 座', color: '#F59E0B', desc: 'Firestore, Auth, Cloud Run, Vertex AI 構築スレッド' },
  { id: 'claude', label: 'Claude 座', color: '#E07B54', desc: 'Claude 3.5 Sonnet, Anthropic SDK, Vibe Coding スレッド' },
  { id: 'deep-learning', label: 'Deep Learning 座', color: '#2DD4BF', desc: 'LLM, ニューラルネットワーク, PyTorch 実装スレッド' },
  { id: 'logical-thinking', label: 'Logical Thinking 座', color: '#F2B8CC', desc: 'フェルミ推定, 構造化思考, 事例研究スレッド' },
  { id: 'design-tools', label: 'Design & Tools 座', color: '#7DD3C0', desc: 'Stitch, UI/UX デザインスプリント, WebGL スレッド' }
];

const INITIAL_MOCK_POSTS: Record<string, PostItem[]> = {
  'genai-foundations': [
    {
      id: 'mock-1',
      authorName: 'マンチカン航海士 (Navigator)',
      authorAvatar: '/assets/cat.jpg',
      content: 'ニャー！GenAI 基礎座へようこそだにゃ 🐾 RAG や Embedding の実装で気になることがあれば何でも質問してほしいにゃ！',
      createdAt: new Date().toISOString(),
      cheersCount: 12
    },
    {
      id: 'mock-2',
      authorName: 'Yuta (Captain)',
      authorAvatar: '/assets/cat.jpg',
      content: 'ChromaDB と Gemini Embedding API を組み合わせるハンズオン記事を公開しています。次元数の正規化がポイントです！',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      cheersCount: 8
    }
  ],
  'ai-agents': [
    {
      id: 'mock-3',
      authorName: 'マンチカン航海士 (Navigator)',
      authorAvatar: '/assets/cat.jpg',
      content: 'AI エージェント座だにゃ ADK や MCP サーバーの自作についてのアイデアを語り合うにゃ！',
      createdAt: new Date().toISOString(),
      cheersCount: 15
    }
  ]
};

export function StellarTavernView() {
  const [selectedConstellation, setSelectedConstellation] = useState(CONSTELLATIONS[0].id);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);

  const activeConstellation = CONSTELLATIONS.find(c => c.id === selectedConstellation) || CONSTELLATIONS[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // LocalStorage からユーザーの投稿履歴を読み込む関数
  const getStoredPosts = (constellationId: string): PostItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`geodyssai_thread_posts_${constellationId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  };

  // スレッド投稿の初期化と取得（勝手に消去するタイマーを排除）
  useEffect(() => {
    let unsubscribe = () => {};
    const localPosts = getStoredPosts(selectedConstellation);
    const mockPosts = INITIAL_MOCK_POSTS[selectedConstellation] || INITIAL_MOCK_POSTS['genai-foundations'];

    // 初期ロード：ローカル投稿 ＋ モック投稿を確実に表示
    const initialMap = new Map<string, PostItem>();
    [...localPosts, ...mockPosts].forEach(item => {
      initialMap.set(item.id, item);
    });
    setPosts(Array.from(initialMap.values()));

    try {
      const postsRef = collection(db, 'threads', selectedConstellation, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loadedPosts: PostItem[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              authorName: data.authorName || '航海士 Voyager',
              authorAvatar: data.authorAvatar || '/assets/cat.jpg',
              content: data.content || '',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              cheersCount: data.cheersCount || 0
            };
          });

          // リモート投稿 ＋ ローカル投稿 ＋ モック投稿をマージ（絶対消えない）
          const newMap = new Map<string, PostItem>();
          [...localPosts, ...loadedPosts, ...mockPosts].forEach(item => {
            newMap.set(item.id, item);
          });
          setPosts(Array.from(newMap.values()));
        }
      }, (err) => {
        console.warn('Firestore snapshot info:', err);
      });
    } catch (e) {
      console.warn('Firestore subscription info:', e);
    }

    return () => unsubscribe();
  }, [selectedConstellation]);

  // メッセージ投稿（押した瞬間に即座に保存・画面から絶対消えない）
  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || posting) return;

    const textContent = message.trim();
    setMessage('');
    setPosting(true);

    const newPostItem: PostItem = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorName: user?.displayName || '星海 航海士 (Voyager)',
      authorAvatar: user?.photoURL || '/assets/cat.jpg',
      content: textContent,
      createdAt: new Date().toISOString(),
      cheersCount: 0
    };

    // 1. LocalStorage へ即座に無期限保存（消去を100%防ぐ）
    try {
      const existing = getStoredPosts(selectedConstellation);
      const updated = [newPostItem, ...existing];
      localStorage.setItem(`geodyssai_thread_posts_${selectedConstellation}`, JSON.stringify(updated));
    } catch (e) {}

    // 2. 画面 State へ即座に追加
    setPosts(prev => {
      const exists = prev.some(p => p.id === newPostItem.id);
      return exists ? prev : [newPostItem, ...prev];
    });

    // 3. Firestore へ送信
    try {
      const postsRef = collection(db, 'threads', selectedConstellation, 'posts');
      await addDoc(postsRef, {
        authorName: newPostItem.authorName,
        authorAvatar: newPostItem.authorAvatar,
        content: newPostItem.content,
        createdAt: serverTimestamp(),
        cheersCount: 0
      });
    } catch (e) {
      console.warn('Firestore write info:', e);
    } finally {
      setPosting(false);
    }
  };

  // ✦ Stardust Cheer（いいね）
  const handleCheer = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, cheersCount: p.cheersCount + 1 } : p));

    try {
      if (!postId.startsWith('local-') && !postId.startsWith('mock-')) {
        const postDocRef = doc(db, 'threads', selectedConstellation, 'posts', postId);
        await updateDoc(postDocRef, {
          cheersCount: increment(1)
        });
      }
    } catch (e) {
      console.warn('Cheer increment warning:', e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8 font-sans text-slate-100">
      
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          STELLAR TAVERN — リアルタイム技術議論場
        </span>
        <h1 className="text-2xl md:text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-300 to-indigo-400">
          星海酒場 — Stellar Tavern
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          全7星座の技術スレッドで、コードの疑問、実装のアイデア、探検の感想を語り合うリアルタイム酒場。
        </p>
      </div>

      {/* 星座セレクタ Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
        {CONSTELLATIONS.map(c => {
          const isSelected = c.id === selectedConstellation;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedConstellation(c.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all shrink-0 cursor-pointer border flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* スレッドヘッダー */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between backdrop-blur-md">
        <div>
          <h2 className="text-sm md:text-base font-bold font-display flex items-center gap-2" style={{ color: activeConstellation.color }}>
            {activeConstellation.label} ディスカッションスレッド
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeConstellation.desc}
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
          {posts.length} 投稿
        </span>
      </div>

      {/* 投稿作成フォーム */}
      <form onSubmit={handlePostMessage} className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src={user?.photoURL || '/assets/cat.jpg'}
            alt="Author Avatar"
            className="w-10 h-10 rounded-full object-cover border border-amber-400/60"
          />
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={`${activeConstellation.label} について酒場でつぶやく...`}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={posting || !message.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer font-mono shadow-[0_0_12px_rgba(245,158,11,0.3)] shrink-0"
          >
            {posting ? '投函中...' : '投稿する'}
          </button>
        </div>
      </form>

      {/* タイムライン (投稿リスト) */}
      <div className="space-y-4">
        {posts.map(post => (
          <div
            key={post.id}
            className="p-5 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl space-y-3 transition-all shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-9 h-9 rounded-full object-cover border border-sky-400/50"
                  onError={e => { (e.target as HTMLElement).setAttribute('src', '/assets/cat.jpg'); }}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-200 font-display">
                    {post.authorName}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(post.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* ✦ Stardust Cheer ボタン */}
              <button
                onClick={() => handleCheer(post.id)}
                className="px-3 py-1 bg-slate-900 hover:bg-amber-950 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Stardust Cheer</span>
                <span className="font-bold text-amber-400">{post.cheersCount}</span>
              </button>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-body whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
