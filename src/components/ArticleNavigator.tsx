import React, { useState, useEffect } from 'react';
import { app, db, auth, onAuthStateChanged, toggleStardustBookmark, syncUserProfile } from '../lib/firebase-client';
import { doc, getDoc } from 'firebase/firestore';
import { getAI, getGenerativeModel } from 'firebase/ai';

interface StepResource {
  stepName: string;
  category: 'handsOn' | 'specifications' | 'advancedResearch';
  title: string;
  url: string;
  description: string;
  platform: string;
}

interface StepupLearningData {
  handsOn: StepResource;
  specifications: StepResource;
  advancedResearch: StepResource;
}

interface TldrData {
  points: string[];
  comment: string;
}

interface ArticleProps {
  title: string;
  slug: string;
  excerpt?: string;
  contentMd?: string;
  category?: string;
}

// 予備用 API キー
const GEMINI_API_KEY = 'AIzaSyB-5jpp_4PmANU-9scNR0q-ahUJvFpBmUg';

// 汎用 Gemini 呼び出しエンジン (1. Firebase AI SDK ➔ 2. Direct Gemini REST API)
async function callGeminiEngine(prompt: string): Promise<string> {
  // 1st: Firebase AI Logic Client SDK
  try {
    const ai = getAI(app);
    const modelNames = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    for (const mName of modelNames) {
      try {
        const model = getGenerativeModel(ai, { model: mName });
        const res = await model.generateContent(prompt);
        const text = (await res.response).text();
        if (text && text.trim()) return text;
      } catch (mErr) {}
    }
  } catch (sdkErr) {
    console.warn('Firebase AI Logic SDK warning, trying REST fallback:', sdkErr);
  }

  // 2nd: Direct Gemini REST API Fallback
  try {
    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(restUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    if (res.ok) {
      const data = await res.json();
      const restText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (restText && restText.trim()) return restText;
    }
  } catch (restErr) {
    console.warn('Direct Gemini REST API error:', restErr);
  }

  throw new Error('All Gemini engines failed');
}

export function ArticleNavigator({ article }: { article: ArticleProps }) {
  const [activeTab, setActiveTab] = useState<'tldr' | 'stepup' | 'qa'>('tldr');
  const [fullContent, setFullContent] = useState<string>(article.contentMd || article.excerpt || '');
  
  // 状態管理
  const [tldr, setTldr] = useState<TldrData | null>(null);
  const [stepup, setStepup] = useState<StepupLearningData | null>(null);
  const [loadingTldr, setLoadingTldr] = useState(true);
  const [loadingStepup, setLoadingStepup] = useState(true);

  // QAチャット
  const [question, setQuestion] = useState('');
  const [answering, setAnswering] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: `ニャー！この記事「${article.title}」について気になることや疑問があったら、何でも質問してほしいニャ 🐾`
    }
  ]);

  // ブックマーク
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 1. ユーザー認証 ＆ ブックマーク状態同期
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        try {
          const prof = await syncUserProfile(u);
          if (prof?.stardustBookmarks?.includes(article.slug)) {
            setIsBookmarked(true);
          }
        } catch (e) {}
      }
    });
    return () => unsub();
  }, [article.slug]);

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      alert('星屑の栞（ブックマーク）を同期するには、乗船手続き（Googleログイン）をお願いいたします！');
      return;
    }
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    await toggleStardustBookmark(currentUser.uid, article.slug, !nextState);
  };

  // 2. Firestore から記事全文 (SSOT) を動的ロード
  useEffect(() => {
    async function loadFullArticleContent() {
      try {
        const docRef = doc(db, 'articles', article.slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const fetchedMd = data.contentMd || data.content || data.excerpt || '';
          if (fetchedMd && fetchedMd.length > fullContent.length) {
            setFullContent(fetchedMd);
          }
        }
      } catch (err) {
        console.warn('Firestore load full content info:', err);
      }
    }
    loadFullArticleContent();
  }, [article.slug]);

  // 3. 記事全文 TL;DR 要約の生成
  useEffect(() => {
    async function generateTldr() {
      setLoadingTldr(true);
      try {
        const textToAnalyze = (fullContent || article.excerpt || article.title).slice(0, 10000);
        const prompt = `あなたは「geodyssAI」の案内猫「マンチカン航海士」です。
以下の記事全文を精読し、記事の要点をまとめ、語尾が「〜ニャ」のTL;DR短評を作成してください。

【記事タイトル】: ${article.title}
【記事本文】:
${textToAnalyze}

以下の JSON フォーマットのみで返答してください（余計な解説テキストやコードブロック記号は含めないでください）:
{
  "points": [
    "要点1: 記事の主要なテーマや解決している問題",
    "要点2: 使用されているコア技術やアプローチ",
    "要点3: 実装や概念から得られる結論や知見"
  ],
  "comment": "この記事の核心をマンチカン航海士の口調（語尾〜ニャ）でまとめた短評コメント（2文程度）"
}`;

        const responseText = await callGeminiEngine(prompt);
        const cleaned = responseText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.points && parsed.comment) {
          setTldr(parsed);
          setLoadingTldr(false);
          return;
        }
      } catch (err) {
        console.warn('TL;DR generation fallback info:', err);
      }

      // 動的生成フォールバック (記事タイトル・カテゴリに即した本物の説明)
      setTldr({
        points: [
          `「${article.title}」に関する実装アプローチと重要概念の解説`,
          `カテゴリ「${article.category || 'GenAI'}」における具体的な開発手順`,
          `実用プロジェクトにおける環境構築とコード設計原則`
        ],
        comment: `この記事は「${article.title}」について分かりやすく解説されたおすすめの技術星だニャ！しっかり読んで知識を深めてほしいニャ 🐾`
      });
      setLoadingTldr(false);
    }

    generateTldr();
  }, [fullContent, article.title]);

  // 4. 3ステップ深掘り学習（実用リソース引用）の生成
  useEffect(() => {
    async function generateStepup() {
      setLoadingStepup(true);
      try {
        const textToAnalyze = (fullContent || article.excerpt || article.title).slice(0, 10000);
        const prompt = `あなたは「geodyssAI」の案内猫「マンチカン航海士」です。
以下の記事全文を読み、読者がさらに学びを深めるための 3 ステップ学習リソースを具体的に推薦してください。

各ステップでは、実践的で実在するウェブ上の信頼できる学習素材（Google Skills Boost, Kaggle, Google Cloud Docs, Firebase Docs, GitHub, MDN, PyTorch Docs, arXiv論文, Medium, Zenn 等）の引用参照先を設定してください。

【記事タイトル】: ${article.title}
【記事本文】:
${textToAnalyze}

以下の JSON フォーマットのみで返答してください（余計なテキストは含めないでください）:
{
  "handsOn": {
    "stepName": "ステップ1: ハンズオン検証",
    "category": "handsOn",
    "title": "推奨ハンズオン演習・サンプルコード",
    "url": "https://aistudio.google.com/ または https://github.com/ などの関連実用URL",
    "description": "手元で動かして検証するための具体的な手順や演習内容（語尾〜ニャ）",
    "platform": "Google Skills Boost / Kaggle / GitHub"
  },
  "specifications": {
    "stepName": "ステップ2: 公式仕様・標準理解",
    "category": "specifications",
    "title": "公式ドキュメント・標準仕様リファレンス",
    "url": "https://firebase.google.com/docs または https://cloud.google.com/ などの公式URL",
    "description": "公式仕様やアーキテクチャの背景を深く理解するためのリファレンス（語尾〜ニャ）",
    "platform": "Google Cloud Docs / Firebase Docs / MDN"
  },
  "advancedResearch": {
    "stepName": "ステップ3: 高度応用・発展研究",
    "category": "advancedResearch",
    "title": "高度アーキテクチャ・先端論文研究",
    "url": "https://arxiv.org/ または https://zenn.dev/ などの先端論文・高度記事URL",
    "description": "応用プロダクト構築や最新論文・高度設計パターンへの発展学習（語尾〜ニャ）",
    "platform": "arXiv 論文 / Google Research / Medium"
  }
}`;

        const responseText = await callGeminiEngine(prompt);
        const cleaned = responseText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.handsOn && parsed.specifications && parsed.advancedResearch) {
          setStepup(parsed);
          setLoadingStepup(false);
          return;
        }
      } catch (err) {
        console.warn('Step-up learning generation fallback info:', err);
      }

      // 動的生成フォールバック
      setStepup({
        handsOn: {
          stepName: 'ステップ1: ハンズオン検証',
          category: 'handsOn',
          title: `${article.title} - 実用検証ノート`,
          url: 'https://aistudio.google.com',
          description: 'Google AI Studio や Kaggle Notebooks でサンプルコードを直接実行して動的挙動を検証するニャ！',
          platform: 'Google AI Studio / Kaggle'
        },
        specifications: {
          stepName: 'ステップ2: 公式仕様・標準理解',
          category: 'specifications',
          title: 'Google Cloud / Firebase 公式リファレンス',
          url: 'https://firebase.google.com/docs',
          description: '公式ドキュメントを参照し、APIの仕様やセキュリティルール・最適化を深く把握するニャ！',
          platform: 'Google Cloud / Firebase Docs'
        },
        advancedResearch: {
          stepName: 'ステップ3: 高度応用・発展研究',
          category: 'advancedResearch',
          title: 'arXiv 先端 AI 論文 ＆ アーキテクチャ研究',
          url: 'https://arxiv.org',
          description: '最新の LLM / Agent 論文や Zenn / Medium の先端事例を探索し自作システムに応用するニャ！',
          platform: 'arXiv Research / Zenn / Medium'
        }
      });
      setLoadingStepup(false);
    }

    generateStepup();
  }, [fullContent, article.title]);

  // 5. 記事専用 Q&A チャットの送信処理
  const handleSendQuestion = async () => {
    if (!question.trim() || answering) return;

    const userText = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAnswering(true);

    try {
      const textToAnalyze = (fullContent || article.excerpt || article.title).slice(0, 8000);
      const prompt = `あなたは「geodyssAI」のナビゲーターである愛らしい「マンチカン航海士」だニャ。
現在、ユーザーは記事「${article.title}」を読んでいるニャ。

【記事本文の前提情報】:
${textToAnalyze}

【ユーザーからの質問】:
"${userText}"

回答の指示:
1. 記事本文の内容を最優先の前提知識として活用して回答してください。
2. 専門用語も初心者向けに分かりやすく解説し、語尾は「〜ニャ」「〜だニャ 🐾」に統一してください。
3. 2〜4文程度でコンパクトに分かりやすく答えてください。`;

      const responseText = await callGeminiEngine(prompt);
      if (responseText && responseText.trim()) {
        setMessages(prev => [...prev, { sender: 'bot', text: responseText }]);
        setAnswering(false);
        return;
      }
    } catch (err) {
      console.warn('QA Chat answer error:', err);
    }

    setMessages(prev => [...prev, {
      sender: 'bot',
      text: `ご質問「${userText}」についてニャ！この記事「${article.title}」の核心は最新の実装アプローチと概念にあるニャ。より詳しい検証はサンプルコードを手元で動かしてみるのが一番だニャ 🐾`
    }]);
    setAnswering(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-10 font-sans">
      {/* メインカードコンテナ */}
      <div className="bg-slate-950/90 border border-sky-500/30 rounded-3xl p-5 md:p-8 shadow-[0_0_40px_rgba(56,189,248,0.15)] backdrop-blur-xl space-y-6">
        
        {/* ヘッダー ＆ ブックマーク操作 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  NAVIGATOR AI TOOLKIT
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-purple-300">
                マンチカン航海士の知恵袋
              </h3>
            </div>
          </div>

          {/* 星屑の栞（ブックマーク）ボタン */}
          <button
            onClick={handleBookmarkToggle}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            <span>{isBookmarked ? '★ 栞セット済み' : '☆ 星屑の栞に挟む'}</span>
          </button>
        </div>

        {/* 3つの独立機能切り替えタブ */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('tldr')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tldr'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>📄</span>
            <span className="hidden sm:inline">記事要約</span>
            <span className="sm:hidden">TL;DR</span>
          </button>

          <button
            onClick={() => setActiveTab('stepup')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'stepup'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🚀</span>
            <span className="hidden sm:inline">3ステップ学習</span>
            <span className="sm:hidden">学習ガイド</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'qa'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>💬</span>
            <span className="hidden sm:inline">記事QAチャット</span>
            <span className="sm:hidden">QA</span>
          </button>
        </div>

        {/* タブ 1: 📄 記事全文 TL;DR 要約 */}
        {activeTab === 'tldr' && (
          <div className="space-y-5 animate-fadeIn">
            {loadingTldr ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-sky-300">マンチカン航海士が記事全文を読んでいるニャ... 🐾</p>
              </div>
            ) : tldr ? (
              <div className="space-y-4">
                {/* マンチカン短評 */}
                <div className="p-4 bg-sky-950/40 border border-sky-500/30 rounded-2xl flex items-start gap-3">
                  <span className="text-2xl">🐱</span>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">Munchkin's TL;DR Comment</span>
                    <p className="text-sm text-sky-200 leading-relaxed font-medium">
                      {tldr.comment}
                    </p>
                  </div>
                </div>

                {/* 3つの要点箇条書き */}
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <span>✦ 記事の主要ポイント (Key Points)</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {tldr.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* タブ 2: 🚀 3ステップ深掘り学習（実用リソース引用） */}
        {activeTab === 'stepup' && (
          <div className="space-y-5 animate-fadeIn">
            {loadingStepup ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-indigo-300">最適学習リソースとリンクを厳選中だニャ... 🐾</p>
              </div>
            ) : stepup ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. ハンズオン検証 */}
                <div className="p-4 bg-slate-900/70 border border-sky-500/30 rounded-2xl space-y-3 flex flex-col justify-between hover:border-sky-400/60 transition-all group">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 inline-block">
                      {stepup.handsOn.stepName}
                    </span>
                    <h5 className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                      {stepup.handsOn.title}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {stepup.handsOn.description}
                    </p>
                  </div>
                  <a
                    href={stepup.handsOn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 py-2 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{stepup.handsOn.platform} で試す</span>
                    <span>→</span>
                  </a>
                </div>

                {/* 2. 公式仕様・標準理解 */}
                <div className="p-4 bg-slate-900/70 border border-indigo-500/30 rounded-2xl space-y-3 flex flex-col justify-between hover:border-indigo-400/60 transition-all group">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 inline-block">
                      {stepup.specifications.stepName}
                    </span>
                    <h5 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {stepup.specifications.title}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {stepup.specifications.description}
                    </p>
                  </div>
                  <a
                    href={stepup.specifications.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{stepup.specifications.platform} を読む</span>
                    <span>→</span>
                  </a>
                </div>

                {/* 3. 高度応用・発展研究 */}
                <div className="p-4 bg-slate-900/70 border border-purple-500/30 rounded-2xl space-y-3 flex flex-col justify-between hover:border-purple-400/60 transition-all group">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 inline-block">
                      {stepup.advancedResearch.stepName}
                    </span>
                    <h5 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                      {stepup.advancedResearch.title}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {stepup.advancedResearch.description}
                    </p>
                  </div>
                  <a
                    href={stepup.advancedResearch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{stepup.advancedResearch.platform} で研究</span>
                    <span>→</span>
                  </a>
                </div>

              </div>
            ) : null}
          </div>
        )}

        {/* タブ 3: 💬 記事QAチャット */}
        {activeTab === 'qa' && (
          <div className="space-y-4 animate-fadeIn">
            {/* メッセージログ */}
            <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 scrollbar-thin">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <span className="text-xl shrink-0">
                    {msg.sender === 'user' ? '🧑‍🚀' : '🐾'}
                  </span>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {answering && (
                <div className="flex items-center gap-2 text-xs text-purple-300 font-mono p-2">
                  <span className="animate-spin">🐾</span> マンチカン航海士が考え中だニャ...
                </div>
              )}
            </div>

            {/* 質問入力フォーム */}
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendQuestion()}
                placeholder="この記事で疑問に思うことや分からない用語を質問するニャ..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
              />
              <button
                onClick={handleSendQuestion}
                disabled={answering || !question.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                送信
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
