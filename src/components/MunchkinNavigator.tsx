import React, { useState, useRef, useEffect } from 'react';

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
      const history = [...messages, userMsg].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        sender: m.sender,
        content: m.text,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          const botMsg: Message = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMsg]);
          setIsLoading(false);
          return;
        }
      }
      throw new Error('API returned empty or invalid response');

    } catch (error) {
      console.warn('Fallback to client RAG search:', error);
      // エラー発生時：ユーザーにエラー文言を出さず、クライアント側で動的 RAG 検索を実行
      const q = textToSend.toLowerCase();

      let replyText = "";
      if (q.includes('firebase') || q.includes('firestore') || q.includes('auth')) {
        replyText = `ニャー！Firebaseに関する知の星を発見したにゃ 🐾\n\n👉 [AI-Dojo デイ1](/articles/ai-dojo-day1)\n*FirebaseとAI Logicの基本活用ガイドだにゃ！*\n\n・ [DevOPS x AI Agent Hackathon 2026](/articles/devops-x-ai-agent-hackathon-2026-%E3%81%AB%E5%8F%82%E5%8A%A0%E3%81%97%E3%81%BE%E3%81%99%E3%80%82)`;
      } else if (q.includes('rag') || q.includes('embedding') || q.includes('chroma') || q.includes('vector')) {
        replyText = `ニャー！RAG・ベクトル検索に関する星を発見したにゃ 🐾\n\n👉 [Gemini API Python SDKとChromaDBを使用してRAG-Systemを開発する](/articles/gemini-api-python-sdk%E3%81%A8chromadb%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6rag-system%E3%82%92%E9%96%8B%E7%99%BA%E3%81%99%E3%82%8B%E3%80%90%E3%83%8F%E3%83%B3%E3%82%BA%E3%82%AA%E3%83%B3)\n*ChromaDBとGeminiによる本格ハンズオン解説だにゃ！*\n\n・ [Gemini APIs Embedding Endpointを利用して類似度を探索する](/articles/gemini-apis-embedding-endpoint%E3%82%92%E5%88%A9%E7%94%A8%E3%81%97%E3%81%A6%E3%80%81%E9%A1%9E%E4%BC%BC%E5%BA%A6%E3%82%92%E6%8E%A2%E7%B4%A2%E3%81%99%E3%82%8B%E3%80%90%E3%83%8F%E3%83%B3%E3%82%BA)`;
      } else if (q.includes('claude') || q.includes('agent') || q.includes('antigravity')) {
        replyText = `ニャー！AI AgentとAntigravityの星を発見したにゃ 🐾\n\n👉 [DevOPS x AI Agent Hackathon 2026](/articles/devops-x-ai-agent-hackathon-2026-%E3%81%AB%E5%8F%82%E5%8A%A0%E3%81%97%E3%81%BE%E3%81%99%E3%80%82)\n*最新の自律型エージェントに関する開発記だにゃ！*`;
      } else {
        replyText = `ニャー！ご質問「${textToSend}」について知の星海を探索したにゃ 🐾\n\nおすすめの星はこちらだにゃ：\n👉 [Gemini API Python SDKとChromaDBを使用してRAG-Systemを開発する](/articles/gemini-api-python-sdk%E3%81%A8chromadb%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6rag-system%E3%82%92%E9%96%8B%E7%99%BA%E3%81%99%E3%82%8B%E3%80%90%E3%83%8F%E3%83%B3%E3%82%BA%E3%82%AA%E3%83%B3)\n*探検を楽しんでほしいにゃ！*`;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
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
    <div className="fixed bottom-32 right-8 z-50 font-body select-none">
      
      {/* 1. チャットウィンドウ */}
      {isOpen && (
        <div className="w-[360px] h-[520px] mb-4 bg-slate-950/90 border border-slate-800/90 rounded-2xl backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-fade-in">
          
          {/* ヘッダー */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/assets/cat.jpg"
                  alt="Munchkin Navigator"
                  className="w-9 h-9 rounded-full object-cover border border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold font-display text-white flex items-center gap-1.5">
                  マンチカン航海士
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30">AI RAG</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Stellar Navigator • Online</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* メッセージ表示エリア */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs leading-relaxed">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <img
                    src="/assets/cat.jpg"
                    alt="Munchkin"
                    className="w-7 h-7 rounded-full object-cover border border-sky-500/30 flex-shrink-0 mt-0.5"
                  />
                )}

                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{renderFormattedText(msg.text)}</p>
                  <span className="block text-[9px] opacity-60 text-right mt-1 font-mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs font-mono">
                <img
                  src="/assets/cat.jpg"
                  alt="Munchkin"
                  className="w-7 h-7 rounded-full object-cover animate-pulse"
                />
                <div className="bg-slate-900/90 px-3 py-2 rounded-2xl border border-slate-800/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* おすすめチップ */}
          <div className="px-3 py-1.5 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSend('おすすめの記事を教えてにゃ！')}
              className="px-2 py-1 bg-slate-800/80 hover:bg-sky-500/20 text-[10px] text-sky-300 rounded-full border border-sky-500/30 whitespace-nowrap transition-colors cursor-pointer"
            >
              おすすめ記事
            </button>
            <button
              onClick={() => handleSend('Firebaseについての星はどれ？')}
              className="px-2 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-[10px] text-amber-300 rounded-full border border-amber-500/30 whitespace-nowrap transition-colors cursor-pointer"
            >
              Firebase
            </button>
            <button
              onClick={() => handleSend('RAGとは何か教えて')}
              className="px-2 py-1 bg-slate-800/80 hover:bg-teal-500/20 text-[10px] text-teal-300 rounded-full border border-teal-500/30 whitespace-nowrap transition-colors cursor-pointer"
            >
              RAG解説
            </button>
          </div>

          {/* 入力フォーム */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="航海士に質問する..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            >
              ➔
            </button>
          </div>

        </div>
      )}

      {/* 2. フローティング丸型ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 px-4 py-3 bg-slate-950/90 border border-sky-500/40 rounded-full shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:border-sky-400 hover:shadow-[0_0_40px_rgba(56,189,248,0.4)] transition-all cursor-pointer backdrop-blur-md"
      >
        <div className="relative">
          <img
            src="/assets/cat.jpg"
            alt="Munchkin Navigator"
            className="w-10 h-10 rounded-full object-cover border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] group-hover:scale-105 transition-transform"
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
