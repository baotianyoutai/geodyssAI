import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export function MunchkinNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'ニャー！知の星海へようこそだにゃ 🐾\n私は星海ガイドの「マンチカン航海士」だにゃ。探したい技術やおすすめの記事があったら何でも聞いてにゃ！',
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
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
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
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.response || '無事に星のシグナルを受信したにゃ！',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('API response not ok');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: '宇宙線ノイズで通信が一瞬途絶えたにゃ。もう一度試してみてにゃ！',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    // 簡易マークダウンリンク [テキスト](URL) のレンダリング
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
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
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 border border-slate-700"
                  />
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-100 border border-slate-800/80 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{renderFormattedText(msg.text)}</div>
                  <div className={`text-[9px] mt-1 font-mono text-right ${msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
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
              ✦ おすすめ記事
            </button>
            <button
              onClick={() => handleSend('Firebaseについての星はどれ？')}
              className="px-2 py-1 bg-slate-800/80 hover:bg-amber-500/20 text-[10px] text-amber-300 rounded-full border border-amber-500/30 whitespace-nowrap transition-colors cursor-pointer"
            >
              ✦ Firebase
            </button>
            <button
              onClick={() => handleSend('RAGとは何か教えて')}
              className="px-2 py-1 bg-slate-800/80 hover:bg-teal-500/20 text-[10px] text-teal-300 rounded-full border border-teal-500/30 whitespace-nowrap transition-colors cursor-pointer"
            >
              ✦ RAG解説
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
              className="w-8 h-8 flex items-center justify-center bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
            >
              ➔
            </button>
          </div>

        </div>
      )}

      {/* 2. トグルボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 px-4 py-3 bg-slate-950/85 hover:bg-slate-900 border border-sky-500/40 rounded-full backdrop-blur-xl shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all transform hover:scale-105 cursor-pointer"
      >
        <div className="relative">
          <img
            src="/assets/cat.jpg"
            alt="Munchkin"
            className="w-9 h-9 rounded-full object-cover border-2 border-sky-400/80 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
          />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-sky-400 rounded-full animate-ping opacity-75"></span>
        </div>
        <div className="text-left font-display">
          <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1">
            <span>Munchkin Navigator</span>
          </div>
          <div className="text-[10px] font-mono text-sky-400/80">AI 航海ガイドに質問</div>
        </div>
      </button>

    </div>
  );
}
