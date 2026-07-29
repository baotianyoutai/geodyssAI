import React, { useState, useRef, useEffect } from 'react';
import { app } from '../lib/firebase-client';
import { getAI, getGenerativeModel } from 'firebase/ai';
import allArticlesData from '../data/all-articles-data.json';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface MunchkinNavigatorProps {
  articles?: Array<{
    title: string;
    slug: string;
    excerpt?: string;
    category?: string;
  }>;
}

export const MunchkinNavigator: React.FC<MunchkinNavigatorProps> = ({ articles = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'ニャー！知の星海へようこそだにゃ 🐾 私は星海ガイドの「マンチカン航海士」だにゃ。探したい技術やおすすめの記事があったら何でも聞いてにゃ！',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      // 表記揺れ（gemiini ➔ gemini 等）の自動補正
      const rawQ = textToSend.toLowerCase();
      const q = rawQ.replace(/gemi+ni/g, 'gemini').trim();

      // 1. 公式 Firebase AI Logic SDK
      const ai = getAI(app);

      // 2. Props記事および静的抽出データを統合
      const propList = Array.isArray(articles) ? articles : [];
      const jsonList = Array.isArray(allArticlesData) ? allArticlesData : [];
      const fullCatalog = [...propList, ...jsonList];
      const uniqueCatalog = Array.from(new Map(fullCatalog.map(item => [item.slug, item])).values());

      // 既存の公開済み実在ルーティング記事の slug 集合
      const activeSlugs = new Set(propList.map(a => decodeURIComponent(a.slug)));

      // 入力キーワードに対するマッチング（Antigravity, ADK, RAG, Gemini, Firebase, etc.）
      const matched = uniqueCatalog.filter(art => {
        const title = (art.title || '').toLowerCase();
        const excerpt = (art.excerpt || '').toLowerCase();
        const category = (art.category || '').toLowerCase();
        const slug = (art.slug || '').toLowerCase();
        return title.includes(q) || excerpt.includes(q) || category.includes(q) || slug.includes(q);
      });

      // マッチ記事がある場合はそれを使い、無い場合は「公開中の主要おすすめ記事」を優先抽出
      const publishedOnly = uniqueCatalog.filter(a => a.status === 'publish' || a.status === 'published' || activeSlugs.has(decodeURIComponent(a.slug)));
      const targetList = matched.length > 0
        ? matched.slice(0, 6)
        : (publishedOnly.length > 0 ? publishedOnly.slice(0, 5) : uniqueCatalog.slice(0, 5));

      const contextText = targetList.map((art, idx) => {
        const decodedSlug = decodeURIComponent(art.slug);
        const isPublished = art.status === 'publish' || art.status === 'published' || activeSlugs.has(decodedSlug);
        const statusLabel = isPublished ? ' [公開中の星 - 閲覧可能]' : ' [✦ DRAFT/下書き準備中]';
        const urlPath = isPublished ? `/articles/${decodedSlug}` : `(準備中)`;
        return `【記事${idx + 1}】${statusLabel}\nタイトル: "${art.title}"\nカテゴリ: ${art.category}\nステータス: ${isPublished ? 'PUBLISHED (公開中・閲覧可能)' : 'DRAFT (下書き準備中)'}\n概要: ${art.excerpt || '詳細な技術解説・アプローチ'}\nURL: ${urlPath}`;
      }).join("\n\n");

      // ブログ内ナビゲーション特化システムプロンプト (DRAFT記事対応)
      const sys = `あなたはデータサイエンティストのブログ「geodyssAI」の案内ガイド「マンチカン航海士」だニャ。
語尾に「〜ニャ」「〜だニャ」を付け、愛らしく丁寧に回答して。

【あなたの役割】
ユーザーの質問や入力キーワード（例: "Antigravityの記事はある？", "Geminiの使い方", "おすすめの記事は？" など）に対し、下記の【ブログ内記事リスト】の中から最も関連性の高い記事を提示し、ブログ内の探検・ナビゲートを行ってニャ！

【回答ルール】
1. 公開中の記事（PUBLISHED）を提案する場合は、必ず案内リンク（例: 👉 [記事タイトル](/articles/slug)）を掲載してニャ。
2. 下書き準備中（DRAFT）の記事（例: Antigravity記事など）を提案する場合は、URLリンクの代わりに「✦ DRAFT (下書き準備中・まもなく着陸予定の星)」である旨を優しく添えて説明してニャ！
3. 旅行者が次にどの星（記事）を読むべきか提示してニャ！`;

      const prompt = `${sys}\n\n【ブログ内記事リスト】\n${contextText}\n\n【ユーザーの入力】\n${textToSend}`;

      // ユーザー指示に基づき gemini-2.5-flash-lite を最優先モデルとして設定
      const CANDIDATE_MODELS = ['gemini-2.5-flash-lite', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
      let aiText = '';
      let lastErr = null;

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const model = getGenerativeModel(ai, { model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          if (response && response.text) {
            aiText = response.text();
            break;
          }
        } catch (mErr) {
          lastErr = mErr;
          console.warn(`Firebase AI Logic model ${modelName} failed:`, mErr);
        }
      }

      if (aiText) {
        // 🛡️ 実在公開記事・確定動作リンク保証 (Link Safety Grounding)
        const validArticleLinks: string[] = [];
        targetList.forEach(art => {
          const decodedSlug = decodeURIComponent(art.slug);
          const isPublished = art.status === 'publish' || art.status === 'published' || activeSlugs.has(decodedSlug);
          
          if (isPublished) {
            const linkUrl = `/articles/${decodedSlug}`;
            validArticleLinks.push(`- [👉 ${art.title}](${linkUrl})`);
          } else {
            validArticleLinks.push(`- ✦ **${art.title}** *(下書き準備中の星)*`);
          }
        });

        // 提案記事カードブロックを確実に付与
        if (validArticleLinks.length > 0 && !aiText.includes('/articles/')) {
          aiText += `\n\n📌 **おすすめの星（ブログ内ナビゲーション）** 🐾\n` + validArticleLinks.join('\n');
        }

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
        return;
      }

      // 提案記事カードブロックの事前構築
      const validArticleLinks: string[] = [];
      targetList.forEach(art => {
        const decodedSlug = decodeURIComponent(art.slug);
        const isPublished = art.status === 'publish' || art.status === 'published' || activeSlugs.has(decodedSlug);
        if (isPublished) {
          validArticleLinks.push(`- [👉 ${art.title}](/articles/${decodedSlug})`);
        } else {
          validArticleLinks.push(`- ✦ **${art.title}** *(下書き準備中の星)*`);
        }
      });
      const articleCardBlock = `\n\n📌 **おすすめの星（ブログ内ナビゲーション）** 🐾\n` + validArticleLinks.join('\n');

      const fallbackText = `ニャー！「${textToSend}」に関する知の星海探索結果だニャ 🐾\n\n「geodyssAI」の航海日誌からおすすめの記事を見つけたニャ！` + articleCardBlock;

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error: any) {
      console.error('Firebase AI Logic error:', error);
      // 万が一の時でも記事リンク付きナビゲーションを提示
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `ニャー！「${textToSend}」に関する星海探索結果だニャ 🐾\n\nおすすめの記事を航海日誌から案内するニャ！`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          className="text-sky-300 underline font-bold hover:text-sky-200 transition-colors"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  };

  return (
    // 最外枠コンテナ (PC: 右下 / スマホ: 右上乗船ボタンのすぐ真下 top-16 right-4)
    <div className="fixed top-16 right-4 sm:top-auto sm:bottom-6 sm:right-6 z-30 pointer-events-auto flex flex-col items-end">

      {/* 1. 会話ウィジェット (スマホ: top-28 right-4, PC: bottom-20 right-0) */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[340px] sm:max-w-[360px] h-[340px] sm:h-[450px] bg-slate-950/95 border border-sky-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col overflow-hidden animate-fade-in z-40">

          {/* ヘッダー */}
          <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/cat.jpg"
                alt="Munchkin Avatar"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-sky-400"
              />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-1.5">
                  マンチカン航海士 <span className="text-[10px] text-sky-400 font-mono font-normal">AI Guide</span>
                </h3>
                <p className="text-[9px] text-slate-400 font-mono">Gemini 3.5 Flash Grounded</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* メッセージログ */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs font-body leading-relaxed">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <img
                    src="/assets/cat.jpg"
                    alt="Munchkin"
                    className="w-6 h-6 rounded-full object-cover border border-sky-500/30 flex-shrink-0 mt-0.5"
                  />
                )}

                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl ${msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-bl-none shadow-sm'
                    }`}
                >
                  <p className="whitespace-pre-wrap">{renderFormattedText(msg.text)}</p>
                  <span className="block text-[8px] opacity-60 text-right mt-1 font-mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs font-mono">
                <img
                  src="/assets/cat.jpg"
                  alt="Munchkin"
                  className="w-6 h-6 rounded-full object-cover animate-pulse"
                />
                <div className="bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-slate-800/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 質問例サンプル */}
          <div className="px-2.5 py-1.5 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span>💡 質問例:</span>
            </span>
            <button
              onClick={() => handleSend('おすすめの記事は？')}
              className="px-2.5 py-0.5 bg-slate-800/80 hover:bg-sky-500/20 text-[10px] text-sky-300 rounded-full border border-sky-500/30 whitespace-nowrap cursor-pointer transition-colors"
            >
              おすすめの記事は？
            </button>
          </div>

          {/* 入力フォーム */}
          <div className="p-2.5 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="航海士に質問する..."
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              ➔
            </button>
          </div>

        </div>
      )}

      {/* 2. トグルボタン (スマホ: 乗船手続き真下 top-16 right-4, PC: 右下) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-slate-950/90 border border-sky-500/40 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:border-sky-400 transition-all cursor-pointer backdrop-blur-md active:scale-95"
      >
        <div className="relative">
          <img
            src="/assets/cat.jpg"
            alt="Munchkin Navigator"
            className="w-7 h-7 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
        </div>

        <div className="text-left pr-1">
          <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
            Munchkin Navigator
          </p>
          <p className="text-[10px] text-sky-400/80 font-mono flex items-center gap-1">
            AI 航海ガイドに質問
          </p>
        </div>
      </button>

    </div>
  );
};
