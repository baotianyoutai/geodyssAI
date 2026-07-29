import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, toggleStardustBookmark, syncUserProfile } from '../lib/firebase-client';

interface WebLink {
  title: string;
  url: string;
  description: string;
}

interface ArticleGuideData {
  summary: string;
  nextSteps: string[];
  webLinks: WebLink[];
}

interface ArticleProps {
  title: string;
  slug: string;
  excerpt?: string;
  contentMd?: string;
  category?: string;
}

export function ArticleNavigator({ article }: { article: ArticleProps }) {
  const [guide, setGuide] = useState<ArticleGuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answering, setAnswering] = useState(false);
  const [answers, setAnswers] = useState<Array<{ q: string; a: string }>>([]);
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

  useEffect(() => {
    async function fetchGuide() {
      try {
        const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY || import.meta.env.PUBLIC_FIREBASE_API_KEY || 'AIzaSyBPQroXo69568ahiG1Zydzy1r9gTcb7Rxo';
        const truncatedContent = (article.contentMd || article.excerpt || '').slice(0, 3000);
        const prompt = `あなたは「geodyssAI」のナビゲーターである愛らしい「マンチカン航海士」だニャ。
以下の記事を読み終えた旅行者に向けて、要約とステップアップ学習のアドバイスを提示してください。

【記事タイトル】: ${article.title}
【記事本文】: ${truncatedContent}

以下の JSON フォーマットのみで返答してください（余計なテキストは含めないでください）:
{
  "summary": "この記事の核心を2文で表現した要約（語尾は〜だニャ）",
  "nextSteps": [
    "ステップ1 (ハンズオン): この記事のサンプルコードや概念を手元で実行・検証してみるニャ",
    "ステップ2 (ドキュメント): 関連する公式リファレンスを参照し仕様の理解を深めるニャ",
    "ステップ3 (発展応用): 自分のアイデアを組み込んで応用プロダクトを作ってみるニャ"
  ]
}`;

        const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
        let guideData: ArticleGuideData | null = null;

        for (const modelName of CANDIDATE_MODELS) {
          try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const res = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            });

            if (res.ok) {
              const data = await res.json();
              const textRes = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const cleaned = textRes.replace(/```json|```/g, '').trim();
              const json = JSON.parse(cleaned);

              if (json.summary && Array.isArray(json.nextSteps)) {
                guideData = {
                  summary: json.summary,
                  nextSteps: json.nextSteps,
                  webLinks: [
                    { title: "Firebase Console", url: "https://console.firebase.google.com", description: "プロジェクト設定・Firestore・Authの公式管理コンソール" },
                    { title: "Google AI Studio", url: "https://aistudio.google.com", description: "Gemini API キーの発行・プロンプト試行公式環境" }
                  ]
                };
                break;
              }
            }
          } catch (mErr) {
            console.warn(`Model ${modelName} guide fetch failed:`, mErr);
          }
        }

        if (guideData) {
          setGuide(guideData);
          setLoading(false);
          return;
        }

        throw new Error('Guide generation failed on client');

      } catch (e) {
        console.warn('Using fallback article guide:', e);
        setGuide({
          summary: `ニャー！「${article.title}」の読了おめでとうだにゃ 🐾 ${article.excerpt || '知の星海がまた一つ明るく照らされたにゃ！'}`,
          nextSteps: [
            "ステップ1 (ハンズオン): 記事内のサンプルコードを手元で実行・検証してみるにゃ",
            "ステップ2 (ドキュメント): 関連する公式開発リファレンスを参照してみるにゃ",
            "ステップ3 (発展応用): 自分のアイデアを組み込んで応用プロダクトを作ってみるにゃ"
          ],
          webLinks: [
            { title: "Firebase Console", url: "https://console.firebase.google.com", description: "プロジェクト設定・Firestore・Authの公式管理コンソール" },
            { title: "Google AI Studio", url: "https://aistudio.google.com", description: "Gemini API キーの発行・プロンプト試行公式環境" }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    fetchGuide();
  }, [article.slug, article.title]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || answering) return;

    const userQ = question.trim();
    setQuestion('');
    setAnswering(true);

    try {
      const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY || import.meta.env.PUBLIC_FIREBASE_API_KEY || 'AIzaSyBPQroXo69568ahiG1Zydzy1r9gTcb7Rxo';
      const truncatedContent = (article.contentMd || article.excerpt || '').slice(0, 3000);
      const sys = "あなたはデータサイエンティストのブログの猫アシスタント「マンチカン航海士」だニャ。語尾に「〜ニャ」「〜だニャ」を付け、論理的かつ丁寧に回答して。";
      const prompt = `${sys}\n\n【記事タイトル】: ${article.title}\n【記事本文】: ${truncatedContent}\n\n質問: ${userQ}`;

      const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
      let answerText = '';

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              tools: [{ googleSearch: {} }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const candidate = data?.candidates?.[0];
            const partText = candidate?.content?.parts?.[0]?.text;

            if (partText) {
              answerText = partText;
              const meta = candidate?.groundingMetadata;
              if (meta && Array.isArray(meta.groundingChunks)) {
                const links: string[] = [];
                meta.groundingChunks.forEach((chunk: any) => {
                  if (chunk.web?.uri) {
                    const linkTitle = chunk.web.title || "参考技術記事";
                    links.push(`- [${linkTitle}](${chunk.web.uri})`);
                  }
                });
                if (links.length > 0) {
                  answerText += `\n\n👉 **参考リンクだニャ** 🐾\n` + links.join('\n');
                }
              }
              break;
            }
          }
        } catch (mErr) {
          console.warn(`Model ${modelName} Q&A fetch failed:`, mErr);
        }
      }

      setAnswers(prev => [...prev, { q: userQ, a: answerText || 'ニャー！質問の回答を取得できなかったニャ。' }]);

    } catch (e) {
      console.error('Question submission error:', e);
    } finally {
      setAnswering(false);
    }
  };

  return (
    <section className="my-12 p-6 md:p-8 bg-slate-950/80 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-md text-slate-100 font-sans">
      
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6 border-b border-slate-800/80 pb-4">
        <img
          src="/assets/cat.jpg"
          alt="Munchkin Navigator"
          className="w-14 h-14 rounded-full object-cover border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
        />
        <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
              ARTICLE VOYAGE GUIDE
            </span>
            <h3 className="text-lg md:text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300 mt-1">
              マンチカン航海士のステップアップ指導
            </h3>
          </div>
          
          <button
            onClick={handleBookmarkToggle}
            className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
            }`}
          >
            <span>{isBookmarked ? '星屑の栞に保存済み' : '星屑の栞に保存'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-mono text-slate-400 animate-pulse">
          🐾 星の知識を分析し、ステップアップガイドを生成中だにゃ...
        </div>
      ) : (
        <div className="space-y-6">

          {/* 1. 要点ノート */}
          {guide?.summary && (
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
              <h4 className="text-xs font-bold font-mono text-sky-400 flex items-center gap-2">
                <span>🐾</span> この記事の要点ノート (Key Summary)
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-body">
                {guide.summary}
              </p>
            </div>
          )}

          {/* 2. ステップアップ学習アドバイス */}
          {guide?.nextSteps && guide.nextSteps.length > 0 && (
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
              <h4 className="text-xs font-bold font-mono text-indigo-400 flex items-center gap-2">
                次に学ぶステップアップ・アドバイス (What to Learn Next)
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                {guide.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-mono font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. 公式 Web ドキュメント ＆ 参考リンク */}
          {guide?.webLinks && guide.webLinks.length > 0 && (
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
              <h4 className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-2">
                <span>🔗</span> 公式 Web ドキュメント ＆ 参考リンク (Official Resources)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guide.webLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-lg transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                        {link.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">↗</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {link.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 4. 質疑応答履歴 */}
          {answers.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold font-mono text-slate-400">
                💬 この記事に関する質疑応答
              </h4>
              {answers.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="text-slate-200 font-bold flex items-center gap-2">
                    <span className="text-sky-400 font-mono">Q:</span> {item.q}
                  </div>
                  <div className="text-slate-300 leading-relaxed pl-4 border-l-2 border-sky-400/50 whitespace-pre-wrap">
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. 質問投稿フォーム */}
          <form onSubmit={handleAskQuestion} className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="この記事のコードや内容について航海士に質問する..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-sky-400 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={answering || !question.trim()}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_12px_rgba(56,189,248,0.3)]"
              >
                {answering ? (
                  <span className="font-mono text-[10px] animate-pulse">解析中...</span>
                ) : (
                  <span>質問する 🐾</span>
                )}
              </button>
            </div>
          </form>

        </div>
      )}

    </section>
  );
}
