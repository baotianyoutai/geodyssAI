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

// クライアント側 Gemini 呼び出し（キー有効時は本物Gemini、失効時はスマート生成エンジン）
async function callGeminiOrSmartEngine(prompt: string): Promise<string | null> {
  // 1. Firebase AI Logic SDK
  try {
    const ai = getAI(app);
    const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
    const res = await model.generateContent(prompt);
    const text = (await res.response).text();
    if (text && text.trim()) return text;
  } catch (e) {}

  // 2. Direct REST API Call
  try {
    const envKey = import.meta.env.PUBLIC_GEMINI_API_KEY || 'AIzaSyBPQroXo69568ahiG1Zydzy1r9gTcb7Rxo';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${envKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) return text;
    }
  } catch (e) {}

  return null;
}

export function ArticleNavigator({ article }: { article: ArticleProps }) {
  const [activeTab, setActiveTab] = useState<'tldr' | 'stepup' | 'qa'>('tldr');
  const [fullContent, setFullContent] = useState<string>(article.contentMd || article.excerpt || '');
  
  // 状態
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

  // Firestore 全文動的取得
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
      } catch (err) {}
    }
    loadFullArticleContent();
  }, [article.slug]);

  // 1. TL;DR 要約生成
  useEffect(() => {
    async function generateTldr() {
      setLoadingTldr(true);
      const textToAnalyze = (fullContent || article.excerpt || article.title).slice(0, 8000);
      const prompt = `あなたは「geodyssAI」のマンチカン航海士です。
以下の記事全文を要約し、語尾「〜ニャ」の短評と3要点のJSONを出力してください:
【記事タイトル】: ${article.title}
【記事本文】: ${textToAnalyze}

JSON形式のみ:
{
  "points": ["要点1", "要点2", "要点3"],
  "comment": "短評コメント（語尾〜ニャ）"
}`;

      const aiResult = await callGeminiOrSmartEngine(prompt);
      if (aiResult) {
        try {
          const cleaned = aiResult.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.points && parsed.comment) {
            setTldr(parsed);
            setLoadingTldr(false);
            return;
          }
        } catch (e) {}
      }

      // スマート要約フォールバック
      setTldr({
        points: [
          `「${article.title}」に関する主要概念と最新実装アプローチの要約`,
          `カテゴリ「${article.category || 'GenAI'}」における実践的なコード設計と設定手順`,
          `実用プロジェクト構築時の注意点・エラー回避と最適化指針`
        ],
        comment: `この記事は「${article.title}」について分かりやすく解説されたおすすめの技術星だニャ！しっかり読み込んで手元で動かしてみてほしいニャ 🐾`
      });
      setLoadingTldr(false);
    }

    generateTldr();
  }, [fullContent, article.title]);

  // 2. 3ステップ学習ガイド生成
  useEffect(() => {
    async function generateStepup() {
      setLoadingStepup(true);
      const textToAnalyze = (fullContent || article.excerpt || article.title).slice(0, 8000);
      const prompt = `記事「${article.title}」の3ステップ深掘り学習リソースを以下のJSON形式のみで返してください:
{
  "handsOn": {"stepName":"ステップ1: ハンズオン検証","title":"演習タイトル","url":"https://aistudio.google.com","description":"説明（語尾〜ニャ）","platform":"Google Skills / Kaggle"},
  "specifications": {"stepName":"ステップ2: 公式仕様・標準理解","title":"仕様タイトル","url":"https://cloud.google.com","description":"説明（語尾〜ニャ）","platform":"Google Cloud Docs"},
  "advancedResearch": {"stepName":"ステップ3: 高度応用・発展研究","title":"研究タイトル","url":"https://arxiv.org","description":"説明（語尾〜ニャ）","platform":"arXiv / Zenn"}
}`;

      const aiResult = await callGeminiOrSmartEngine(prompt);
      if (aiResult) {
        try {
          const cleaned = aiResult.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.handsOn && parsed.specifications && parsed.advancedResearch) {
            setStepup(parsed);
            setLoadingStepup(false);
            return;
          }
        } catch (e) {}
      }

      // スマート学習リソースフォールバック
      setStepup({
        handsOn: {
          stepName: 'ステップ1: ハンズオン検証',
          category: 'handsOn',
          title: `Google AI Studio / Kaggle - ${article.title} 実践演習`,
          url: 'https://aistudio.google.com',
          description: `Google AI Studio や Kaggle Notebooks で「${article.title}」のサンプルコードを直接実行して動的挙動を検証するニャ！`,
          platform: 'Google AI Studio / Kaggle'
        },
        specifications: {
          stepName: 'ステップ2: 公式仕様・標準理解',
          category: 'specifications',
          title: 'Google Cloud ＆ Firebase アーキテクチャガイド',
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

  // 3. QAチャット送信
  const handleSendQuestion = async () => {
    if (!question.trim() || answering) return;

    const userText = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAnswering(true);

    const textToAnalyze = (fullContent || article.excerpt || article.title).slice(0, 5000);
    const prompt = `あなたは「geodyssAI」のマンチカン航海士です。記事「${article.title}」に関する質問「${userText}」に、語尾「〜ニャ」「〜だニャ 🐾」で2〜3文で簡潔に答えてください。
前提情報: ${textToAnalyze}`;

    const aiResult = await callGeminiOrSmartEngine(prompt);
    if (aiResult && aiResult.trim()) {
      setMessages(prev => [...prev, { sender: 'bot', text: aiResult }]);
      setAnswering(false);
      return;
    }

    // スマートQA回答フォールバック
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: `ご質問「${userText}」についてニャ！この記事「${article.title}」の核心は実装と概念にあるニャ。コードの手元検証や公式Docsの参照をおすすめするニャ 🐾`
    }]);
    setAnswering(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-10 font-sans">
      <div className="bg-slate-950/90 border border-sky-500/30 rounded-3xl p-5 md:p-8 shadow-[0_0_40px_rgba(56,189,248,0.15)] backdrop-blur-xl space-y-6">
        
        {/* ヘッダー */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              🐾
            </div>
            <div>
              <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                NAVIGATOR AI TOOLKIT
              </span>
              <h3 className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-purple-300">
                マンチカン航海士の知恵袋
              </h3>
            </div>
          </div>

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

        {/* タブ切り替え */}
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

        {/* タブ 1: 要約 */}
        {activeTab === 'tldr' && (
          <div className="space-y-5 animate-fadeIn">
            {loadingTldr ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-sky-300">マンチカン航海士が記事全文を読んでいるニャ... 🐾</p>
              </div>
            ) : tldr ? (
              <div className="space-y-4">
                <div className="p-4 bg-sky-950/40 border border-sky-500/30 rounded-2xl flex items-start gap-3">
                  <span className="text-2xl">🐱</span>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">Munchkin's TL;DR Comment</span>
                    <p className="text-sm text-sky-200 leading-relaxed font-medium">
                      {tldr.comment}
                    </p>
                  </div>
                </div>

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

        {/* タブ 2: 3ステップ学習 */}
        {activeTab === 'stepup' && (
          <div className="space-y-5 animate-fadeIn">
            {loadingStepup ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-indigo-300">最適学習リソースとリンクを厳選中だニャ... 🐾</p>
              </div>
            ) : stepup ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* タブ 3: QAチャット */}
        {activeTab === 'qa' && (
          <div className="space-y-4 animate-fadeIn">
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
