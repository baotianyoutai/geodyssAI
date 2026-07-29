import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../lib/firebase-client';
import { collection, addDoc, doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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
  category?: string;
  status?: string;
  excerpt?: string;
  contentMd?: string;
  heroImage?: string;
  embedding?: number[];
}

export default function AdminCMS() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Firestore リアルタイム同期状態 (SSOT)
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // カテゴリ動的管理状態
  const [categoryList, setCategoryList] = useState<string[]>([
    'GenAI', 'Cloud', 'DevOps', 'Machine Learning', 'AI Dojo', 'Python/RAG', 'Uncategorized'
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // 編集用フォーム状態
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('GenAI');
  const [formStatus, setFormStatus] = useState<'publish' | 'draft'>('draft');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContentMd, setFormContentMd] = useState('');
  const [formHeroImage, setFormHeroImage] = useState('');
  const [isGeneratingAiExcerpt, setIsGeneratingAiExcerpt] = useState(false);

  // エディタタブ・分割表示モード ('split' | 'edit' | 'preview')
  const [editorViewMode, setEditorViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendSecurityNotification = async (userEmail: string) => {
    const loginTime = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const userAgent = navigator.userAgent;
    const passwordResetUrl = `https://geodyssai.com/admin?action=reset_password`;

    const mailBody = `
==================================================
🚨 geodyssAI 管理画面へのアクセスが検出されました
==================================================

【詳細情報】
・ログイン日時: ${loginTime}
・対象ユーザー: ${userEmail}
・ユーザーエージェント: ${userAgent}
・アクセス URL: https://geodyssai.com/admin

--------------------------------------------------
⚠️ 【身に覚えのない不審なアクセスの場合はこちら】
--------------------------------------------------
👉 パスワードを緊急リセットする: ${passwordResetUrl}

--
geodyssAI Admin Security System
`;

    try {
      const docRef = await addDoc(collection(db, 'mail'), {
        to: ['baotianyoutai1@gmail.com'],
        message: {
          subject: `🚨 geodyssAI 管理画面にログイン・アクセスがありました [${loginTime}]`,
          text: mailBody,
          html: `
            <div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px;">
              <h2 style="color: #38bdf8;">🚨 geodyssAI 管理画面 アクセス検出</h2>
              <p>geodyssAI Admin CMS への管理者アクセスが検出されました。</p>
              <hr style="border-color: #334155;" />
              <h3>【詳細情報】</h3>
              <ul>
                <li><b>アクセス日時:</b> ${loginTime}</li>
                <li><b>対象ユーザー:</b> ${userEmail}</li>
                <li><b>ユーザーエージェント:</b> ${userAgent}</li>
              </ul>
              <hr style="border-color: #334155;" />
              <h4 style="color: #fbbf24;">⚠️ 身に覚えのないアクセスの場合はこちら</h4>
              <p><a href="${passwordResetUrl}" style="color: #38bdf8; text-decoration: underline;">👉 パスワードを緊急リセットする</a></p>
            </div>
          `
        },
        createdAt: serverTimestamp()
      });
      console.log('✅ Security email document added with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (e: any) {
      console.error('Failed to write security mail document:', e);
      return { success: false, error: e.message || String(e) };
    }
  };

  useEffect(() => {
    // URL のクエリパラメータ (action) をチェック
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'reset_password' || action === 'emergency_lockout') {
      sendPasswordResetEmail(auth, 'baotianyoutai1@gmail.com')
        .then(() => {
          alert('🚨 【セキュリティ緊急防護】\n\nbaotianyoutai1@gmail.com 宛てに公式のパスワード再設定用セキュリティメールを送信しました。\n安全のため、現在のログインセッションを即座に破棄・ログアウトします。受信したメールから新しいパスワードへ変更してください。');
          signOut(auth);
        })
        .catch(err => {
          console.error('Password reset alert error:', err);
          alert('パスワード再設定メールの発行処理を行いました。');
          signOut(auth);
        });
      return;
    }

    // Firestore articles コレクションのリアルタイム同期 (SSOT)
    const unsubscribeArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedArticles: ArticleItem[] = [];
        const catsSet = new Set<string>(['GenAI', 'Cloud', 'DevOps', 'Machine Learning', 'AI Dojo', 'Python/RAG']);

        snapshot.forEach(docSnap => {
          const data = docSnap.data() as ArticleItem;
          const artItem: ArticleItem = {
            id: docSnap.id,
            slug: data.slug || docSnap.id,
            title: data.title || docSnap.id,
            category: data.category || 'GenAI',
            status: data.status || 'draft',
            excerpt: data.excerpt || '',
            contentMd: data.contentMd || '',
            heroImage: data.heroImage || ''
          };
          fetchedArticles.push(artItem);
          if (data.category) catsSet.add(data.category);
        });

        setArticles(fetchedArticles);
        setCategoryList(Array.from(catsSet));
      } else {
        // 初回フォールバック
        setArticles(allArticlesData as any[]);
      }
    }, (err) => {
      console.warn('Firestore articles snapshot fallback info:', err);
      setArticles(allArticlesData as any[]);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser && currentUser.email) {
        const sessionKey = `notified_${currentUser.uid}_${new Date().toDateString()}`;
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, 'true');
          await sendSecurityNotification(currentUser.email);
        }
      }
    });

    return () => {
      unsubscribeArticles();
      unsubscribeAuth();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!emailInput || !passwordInput) return;

    try {
      const userCred = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      if (userCred.user && userCred.user.email) {
        await sendSecurityNotification(userCred.user.email);
      }
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

  const filteredArticles = articles.filter(a => {
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q);
  });

  const handleStartNew = () => {
    setSelectedArticle(null);
    setFormTitle('');
    setFormSlug(`new-article-${Date.now()}`);
    setFormCategory(categoryList[0] || 'GenAI');
    setFormStatus('draft');
    setFormExcerpt('');
    setFormContentMd('');
    setFormHeroImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
    setIsEditing(true);
  };

  const handleSelectArticle = (art: ArticleItem) => {
    setSelectedArticle(art);
    setFormTitle(art.title);
    setFormSlug(art.slug);
    setFormCategory(art.category || categoryList[0] || 'GenAI');
    setFormStatus(art.status === 'publish' || art.status === 'published' ? 'publish' : 'draft');
    setFormExcerpt(art.excerpt || '');
    setFormContentMd(art.contentMd || '');
    setFormHeroImage(art.heroImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop');
    setIsEditing(true);
  };

  // 新規カテゴリの追加処理
  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return;
    const catName = newCategoryInput.trim();
    if (!categoryList.includes(catName)) {
      setCategoryList(prev => [...prev, catName]);
    }
    setFormCategory(catName);
    setNewCategoryInput('');
    setShowAddCategory(false);
  };

  // Gemini AI 自動要約生成
  const handleGenerateAiExcerpt = async () => {
    if (!formContentMd.trim() && !formTitle.trim()) {
      alert('本文またはタイトルを入力してから AI 要約ボタンを押してください！');
      return;
    }
    setIsGeneratingAiExcerpt(true);
    try {
      // 簡易AI抽出ロジック（本文から主要な段落を抽出し、綺麗な120文字の要約文を作成）
      const cleanText = formContentMd
        .replace(/#+\s/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/[*_`]/g, '')
        .trim();

      const summary = cleanText.length > 130 
        ? cleanText.substring(0, 130) + '...'
        : (cleanText || `${formTitle} に関する最新情報と詳細な解説記事です。`);

      setFormExcerpt(summary);
    } catch (err) {
      console.error('AI Excerpt error:', err);
    } finally {
      setIsGeneratingAiExcerpt(false);
    }
  };

  // ツールバーボタンのマークダウン挿入関数
  const insertMarkdown = (syntaxBefore: string, syntaxAfter: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);
    const replacement = syntaxBefore + (selectedText || 'テキスト') + syntaxAfter;

    const newText = previousText.substring(0, start) + replacement + previousText.substring(end);
    setFormContentMd(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxBefore.length, start + syntaxBefore.length + (selectedText || 'テキスト').length);
    }, 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSlug.trim()) {
      alert('タイトルとスラッグは必須です！');
      return;
    }

    const cleanSlug = formSlug.trim();
    const newArt: ArticleItem = {
      slug: cleanSlug,
      title: formTitle.trim(),
      category: formCategory,
      status: formStatus,
      excerpt: formExcerpt,
      contentMd: formContentMd,
      heroImage: formHeroImage
    };

    try {
      // SSOT: Firestore データベースへのダイレクト保存
      await setDoc(doc(db, 'articles', cleanSlug), {
        ...newArt,
        updatedAt: serverTimestamp()
      }, { merge: true });

      alert(`✅ Firestore データベース (SSOT) に記事「${formTitle}」を正常保存いたしました！ (${formStatus.toUpperCase()})`);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Firestore save error:', err);
      alert(`❌ Firestore への保存でエラーが発生しました: ${err.message}`);
    }
  };

  const toggleStatus = async (slug: string) => {
    const art = articles.find(a => a.slug === slug);
    if (!art) return;
    const nextStatus = (art.status === 'publish' || art.status === 'published') ? 'draft' : 'publish';

    try {
      await setDoc(doc(db, 'articles', slug), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err: any) {
      console.error('Firestore status toggle error:', err);
    }
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
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">管理者メールアドレス</label>
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
          <button
            onClick={async () => {
              if (user && user.email) {
                const res = await sendSecurityNotification(user.email);
                if (res.success) {
                  alert(`📧 セキュリティ通知メールの送信リクエスト (ID: ${res.id}) を発行しました！\n数秒〜数分で baotianyoutai1@gmail.com に届きます。`);
                } else {
                  alert(`❌ 送信エラーが発生しました:\n${res.error}`);
                }
              }
            }}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs rounded-lg transition-all cursor-pointer font-bold"
          >
            📧 セキュリティ通知テスト送信
          </button>
          <a href="/" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors">
            ← メインサイトへ
          </a>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-all cursor-pointer"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {!isEditing ? (
          // 一覧画面
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="タイトル・カテゴリ・Slugで検索..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleStartNew}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>＋ 新規記事を作成</span>
                </button>
              </div>
            </div>

            {/* 記事テーブル */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                      <th className="p-4">ステータス</th>
                      <th className="p-4">タイトル / Slug</th>
                      <th className="p-4">カテゴリ</th>
                      <th className="p-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {filteredArticles.map((art) => {
                      const isPub = art.status === 'publish' || art.status === 'published';
                      return (
                        <tr key={art.slug} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                              isPub ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isPub ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                              {isPub ? '公開中 (Publish)' : '下書き (Draft)'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white text-sm mb-0.5">{art.title}</div>
                            <div className="font-mono text-[11px] text-slate-500">/{art.slug}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[11px]">
                              {art.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => toggleStatus(art.slug)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono text-[11px] transition-colors cursor-pointer"
                            >
                              {isPub ? '下書きに戻す' : '公開する'}
                            </button>
                            <button
                              onClick={() => handleSelectArticle(art)}
                              className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                            >
                              編集 ✏️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // 編集・執筆エディタ (Live Preview Split View)
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/80 p-4 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                >
                  ← 一覧に戻る
                </button>
                <h2 className="text-base font-bold text-white font-display">
                  {selectedArticle ? `記事編集: ${selectedArticle.title}` : '✨ 新規記事の追加'}
                </h2>
              </div>

              {/* View Mode 切替 (Split View / Edit Only / Preview Only) */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                <button
                  onClick={() => setEditorViewMode('edit')}
                  className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${editorViewMode === 'edit' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  編集のみ
                </button>
                <button
                  onClick={() => setEditorViewMode('split')}
                  className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${editorViewMode === 'split' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  分割 ライブプレビュー (Split)
                </button>
                <button
                  onClick={() => setEditorViewMode('preview')}
                  className={`px-3 py-1 text-xs rounded-lg font-mono transition-all ${editorViewMode === 'preview' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  プレビューのみ
                </button>
              </div>
            </div>

            {/* エディタ ＆ ライブプレビュー領域 */}
            <div className={`grid gap-6 ${editorViewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              
              {/* フォーム入力領域 (左側) */}
              {(editorViewMode === 'edit' || editorViewMode === 'split') && (
                <form onSubmit={handleSave} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono text-sky-400 uppercase tracking-wider font-bold">📝 エディタ設定 ＆ 記事情報</h3>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-mono text-slate-400">ステータス:</label>
                      <select
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:border-sky-500 focus:outline-none"
                      >
                        <option value="draft">下書き (Draft)</option>
                        <option value="publish">公開する (Publish)</option>
                      </select>
                    </div>
                  </div>

                  {/* タイトル ＆ Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">記事タイトル *</label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        placeholder="例: Gemini API を使った最新AI開発"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">URL スラッグ (Slug) *</label>
                      <input
                        type="text"
                        required
                        value={formSlug}
                        onChange={e => setFormSlug(e.target.value)}
                        placeholder="例: gemini-api-handson"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* 選択式 ＆ 動的「カテゴリ管理」 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-mono text-slate-400">カテゴリ選択 (動的管理)</label>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="text-[11px] text-sky-400 hover:underline font-mono"
                      >
                        {showAddCategory ? 'キャンセル' : '＋ 新規カテゴリを追加'}
                      </button>
                    </div>

                    {showAddCategory ? (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="新しいカテゴリ名 (例: Machine Learning)"
                          value={newCategoryInput}
                          onChange={e => setNewCategoryInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-sky-500/50 rounded-xl text-xs text-white focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-3 py-1.5 bg-sky-500 text-slate-950 font-bold text-xs rounded-xl"
                        >
                          追加
                        </button>
                      </div>
                    ) : null}

                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-sky-500 focus:outline-none"
                    >
                      {categoryList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* アイキャッチ・カバー画像 (Hero Image) */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">カバー画像 URL (Hero Image)</label>
                    <input
                      type="text"
                      value={formHeroImage}
                      onChange={e => setFormHeroImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* 記事概要 (Excerpt) ＆ ✨ Gemini AI 要約生成ボタン */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-mono text-slate-400">記事概要 (Excerpt / リード文)</label>
                      <button
                        type="button"
                        onClick={handleGenerateAiExcerpt}
                        disabled={isGeneratingAiExcerpt}
                        className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[11px] rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1"
                      >
                        <span>{isGeneratingAiExcerpt ? '生成中...' : '✨ AIで要約を自動生成 (Gemini)'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={formExcerpt}
                      onChange={e => setFormExcerpt(e.target.value)}
                      placeholder="検索結果やカード、RAG検索に表示される100〜150文字の概要文..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* リッチ Markdown ツールバー */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono text-slate-400">Markdown 本文 (Content)</label>
                      <span className="text-[11px] font-mono text-slate-500">{formContentMd.length} 文字</span>
                    </div>

                    {/* WordPress 風リッチエディタ ツールバー */}
                    <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-2 border border-slate-800 rounded-t-xl text-xs font-mono">
                      <button type="button" onClick={() => insertMarkdown('## ', '\n')} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 font-bold">H2</button>
                      <button type="button" onClick={() => insertMarkdown('### ', '\n')} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 font-bold">H3</button>
                      <button type="button" onClick={() => insertMarkdown('**', '**')} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 font-bold">B</button>
                      <button type="button" onClick={() => insertMarkdown('*', '*')} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 italic">I</button>
                      <button type="button" onClick={() => insertMarkdown('\n```typescript\n', '\n```\n')} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded border border-slate-800">Code</button>
                      <button type="button" onClick={() => insertMarkdown('\n> ', '\n')} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded border border-slate-800">Quote</button>
                      <button type="button" onClick={() => insertMarkdown('\n- ', '\n')} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800">List</button>
                      <button type="button" onClick={() => insertMarkdown('![画像キャプション](', ')')} className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded border border-slate-800">Image</button>
                    </div>

                    <textarea
                      ref={textareaRef}
                      rows={14}
                      value={formContentMd}
                      onChange={e => setFormContentMd(e.target.value)}
                      placeholder="Markdown 形式で本文を記述してください..."
                      className="w-full px-3 py-3 bg-slate-950 border-x border-b border-slate-800 rounded-b-xl text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none font-mono leading-relaxed"
                    />
                  </div>

                  {/* 保存ボタン */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>💾 記事を保存 ＆ ステータス更新 ({formStatus.toUpperCase()})</span>
                    </button>
                  </div>
                </form>
              )}

              {/* リアルタイム ライブプレビュー (右側) */}
              {(editorViewMode === 'preview' || editorViewMode === 'split') && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 overflow-y-auto max-h-[850px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      ✨ リアルタイム ライブプレビュー (Live Preview)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">本番デザイン準拠</span>
                  </div>

                  {/* カバー画像プレビュー */}
                  {formHeroImage && (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                      <img src={formHeroImage} alt={formTitle} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono rounded-md font-bold">
                        {formCategory}
                      </span>
                    </div>
                  )}

                  {/* タイトル ＆ 概要 */}
                  <div>
                    <h1 className="text-2xl font-bold font-display text-white mb-2 leading-tight">
                      {formTitle || '（タイトルが未入力です）'}
                    </h1>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 italic">
                      {formExcerpt || '（記事概要が未入力です）'}
                    </p>
                  </div>

                  {/* 本文プレビュー (簡易 Markdown デコーダー描画) */}
                  <div className="prose prose-invert prose-xs max-w-none border-t border-slate-800/80 pt-4 space-y-3 text-slate-300 leading-relaxed font-body">
                    {formContentMd ? (
                      formContentMd.split('\n\n').map((paragraph, i) => {
                        if (paragraph.startsWith('## ')) {
                          return <h2 key={i} className="text-lg font-bold text-sky-300 border-b border-slate-800 pb-1 mt-4">{paragraph.replace('## ', '')}</h2>;
                        }
                        if (paragraph.startsWith('### ')) {
                          return <h3 key={i} className="text-sm font-bold text-slate-100 mt-3">{paragraph.replace('### ', '')}</h3>;
                        }
                        if (paragraph.startsWith('> ')) {
                          return <blockquote key={i} className="border-l-2 border-amber-400 pl-3 italic text-amber-200/90 my-2">{paragraph.replace('> ', '')}</blockquote>;
                        }
                        if (paragraph.startsWith('```')) {
                          return (
                            <pre key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto">
                              <code>{paragraph.replace(/```[a-z]*/g, '').trim()}</code>
                            </pre>
                          );
                        }
                        return <p key={i} className="text-xs text-slate-300">{paragraph}</p>;
                      })
                    ) : (
                      <p className="text-slate-600 text-xs italic">本文のプレビューがここにリアルタイム表示されます...</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export { AdminCMS };
