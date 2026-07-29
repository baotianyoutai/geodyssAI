import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase-client';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth';
import allArticlesData from '../data/all-articles-data.json';

interface ArticleItem {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  status: 'publish' | 'published' | 'draft';
  contentMd?: string;
}

export const AdminCMS: React.FC = () => {
  // Firebase Auth 状態管理
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [articles, setArticles] = useState<ArticleItem[]>(allArticlesData as any[]);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!emailInput || !passwordInput) return;

    try {
      const userCred = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      const loggedUser = userCred.user;
      const userEmail = loggedUser.email || emailInput.trim();

      // 日本語のログイン通知 API を非同期実行
      fetch('/api/admin/login-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          userAgent: navigator.userAgent,
          timestamp: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
        })
      }).catch(nErr => console.warn('Login notification API trigger warning:', nErr));

    } catch (err: any) {
      console.error('SignIn failed:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError('メールアドレスまたはパスワードが正しくありません。');
      } else {
        setAuthError(err.message || 'ログイン認証に失敗しました。');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 編集用フォーム状態
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('GenAI');
  const [formStatus, setFormStatus] = useState<'publish' | 'draft'>('draft');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContentMd, setFormContentMd] = useState('');

  const filteredArticles = articles.filter(a => {
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q);
  });

  const handleStartNew = () => {
    setSelectedArticle(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('GenAI');
    setFormStatus('draft');
    setFormExcerpt('');
    setFormContentMd('');
    setIsEditing(true);
  };

  const handleSelectArticle = (art: ArticleItem) => {
    setSelectedArticle(art);
    setFormTitle(art.title);
    setFormSlug(art.slug);
    setFormCategory(art.category || 'GenAI');
    setFormStatus(art.status === 'publish' || art.status === 'published' ? 'publish' : 'draft');
    setFormExcerpt(art.excerpt || '');
    setFormContentMd(art.contentMd || '');
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSlug.trim()) {
      alert('タイトルとスラッグは必須です！');
      return;
    }

    const newArt: ArticleItem = {
      slug: formSlug.trim(),
      title: formTitle.trim(),
      category: formCategory,
      status: formStatus,
      excerpt: formExcerpt,
      contentMd: formContentMd
    };

    setArticles(prev => {
      const idx = prev.findIndex(a => a.slug === newArt.slug);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newArt;
        return updated;
      } else {
        return [newArt, ...prev];
      }
    });

    alert(`記事「${formTitle}」を保存・ステータス更新 (${formStatus.toUpperCase()}) しました！`);
    setIsEditing(false);
  };

  const toggleStatus = (slug: string) => {
    setArticles(prev => prev.map(a => {
      if (a.slug === slug) {
        const nextStatus = (a.status === 'publish' || a.status === 'published') ? 'draft' : 'publish';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
        認証状態の確認中... 🔐
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-3xl mx-auto mb-3">
              🛡️
            </div>
            <h2 className="text-xl font-bold font-display text-white">geodyssAI Admin Auth</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">Firebase Authentication 管理者ログイン</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-mono">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">管理者 Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">パスワード</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
            >
              ログイン / 認証実行 🔐
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
            <a href="/" className="text-xs text-slate-400 hover:text-slate-200">← メインサイトに戻る</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-body p-4 sm:p-8">
      {/* ヘッダー */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <span>🚀 geodyssAI Admin CMS</span>
            <span className="text-xs px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full font-mono">SSOT Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">ログイン中: <span className="text-sky-300 font-mono">{user.email}</span></p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors">
            ← メインサイトへ
          </a>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs rounded-lg transition-colors cursor-pointer"
          >
            ログアウト 🔓
          </button>
          <button
            onClick={handleStartNew}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
          >
            ＋ 新規記事を作成
          </button>
        </div>
      </header>

      {/* メインレイアウト */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左側: 記事一覧サイドバー (4列) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col h-[750px]">
          <div className="mb-4">
            <input
              type="text"
              placeholder="記事タイトル・スラッグで検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="text-xs font-mono text-slate-400 mb-2 flex justify-between px-1">
            <span>全 {filteredArticles.length} 件の記事</span>
            <span>PUBLISHED / DRAFT</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {filteredArticles.map(art => {
              const isPub = art.status === 'publish' || art.status === 'published';
              const isSelected = selectedArticle?.slug === art.slug;
              return (
                <div
                  key={art.slug}
                  onClick={() => handleSelectArticle(art)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500/80 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{art.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(art.slug);
                      }}
                      className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                        isPub
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                      }`}
                    >
                      {isPub ? 'PUBLISHED' : '✦ DRAFT'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono line-clamp-1">/{art.slug}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側: 編集エディタ ＆ プレビュー (7列) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-[750px] flex flex-col">
          {isEditing ? (
            <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-sky-400 font-display">
                  {selectedArticle ? '📝 記事の編集' : '✨ 新規記事の作成'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  キャンセル
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">記事タイトル *</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      required
                      placeholder="例: Gemini API の活用ガイド"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">スラッグ (URL用) *</label>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={e => setFormSlug(e.target.value)}
                      required
                      placeholder="例: gemini-api-guide"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">カテゴリ</label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">ステータス</label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-sky-500"
                    >
                      <option value="draft">✦ DRAFT (下書き準備中)</option>
                      <option value="publish">PUBLISHED (公開)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">記事概要 (Excerpt)</label>
                  <textarea
                    rows={2}
                    value={formExcerpt}
                    onChange={e => setFormExcerpt(e.target.value)}
                    placeholder="この記事の要約・アピールポイント..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Markdown 本文</label>
                  <textarea
                    rows={10}
                    value={formContentMd}
                    onChange={e => setFormContentMd(e.target.value)}
                    placeholder="Markdown 形式で記事本文を記述..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono leading-relaxed focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
                >
                  保存 ＆ ベクトル同期 (SSOT)
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl mb-4">
                🚀
              </div>
              <h3 className="text-sm font-bold text-slate-300 mb-1">記事を選択または新規作成してください</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                左側のリストから記事を選択して編集・ステータス変更を行うか、上部の「＋ 新規記事を作成」ボタンから新しい記事を追加できます。
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
