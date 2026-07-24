import React, { useState } from 'react';

interface SidebarProps {
  currentPath?: string;
  onOpenBoarding?: () => void;
  isDark?: boolean;
}

export function Sidebar({ currentPath = '/', onOpenBoarding, isDark = true }: SidebarProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const menuItems = [
    {
      name: 'ホーム',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      )
    },
    {
      name: 'カタログ',
      path: '/observatory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      )
    },
    {
      name: 'スレッド',
      path: '/tavern',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      )
    },
    {
      name: '全記事一覧',
      path: '/articles',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="fixed top-0 left-0 z-40 flex items-start pointer-events-none font-sans">
      
      {/* 1. ハンバーガー [menu] トリガーボタン (Streamlit style) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`m-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg cursor-pointer pointer-events-auto flex items-center justify-center border active:scale-95 ${
          isDark
            ? 'bg-slate-900/90 text-slate-100 hover:bg-slate-800 border-slate-700/80'
            : 'bg-white/90 text-slate-700 hover:bg-slate-100 border-slate-200'
        }`}
        title="メニューサイドバーを開閉"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* 2. Streamlit / Google Skills スタイルのサイドバーパネル */}
      <aside
        className={`h-screen transition-all duration-300 pointer-events-auto flex flex-col justify-between p-4 ${
          isOpen ? 'w-64 opacity-100 shadow-2xl' : 'w-0 opacity-0 overflow-hidden -translate-x-full pointer-events-none'
        } ${
          isDark
            ? 'bg-[#090F1E]/95 border-r border-slate-800/90 text-slate-200 backdrop-blur-xl'
            : 'bg-white/95 border-r border-slate-200 text-slate-800 backdrop-blur-xl'
        }`}
      >
        <div className="space-y-6 pt-2">
          {/* ヘッダーロゴ */}
          <div className="flex items-center justify-between px-2">
            <a href="/" className="flex items-center font-display font-bold text-lg tracking-tight">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
              <span className={`font-medium ml-1.5 text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Skills</span>
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/60 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* ナビゲーションメニュー */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-[#0B57D0]/30 text-[#A8C7FA] font-bold border border-[#0B57D0]/50 shadow-inner'
                        : 'bg-[#E8F0FE] text-[#1A73E8] font-bold'
                      : isDark
                      ? 'hover:bg-slate-800/60 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className={isActive ? (isDark ? 'text-[#A8C7FA]' : 'text-[#1A73E8]') : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </a>
              );
            })}

            {/* 乗船手続きアクションボタン */}
            {onOpenBoarding && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenBoarding();
                }}
                className="w-full mt-3 flex items-center gap-3.5 px-4 py-3 rounded-full text-xs font-bold transition-all bg-[#0B57D0] hover:bg-[#0948AD] text-white shadow-md cursor-pointer"
              >
                <svg className="w-5 h-5 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                <span>乗船手続き / Sign in</span>
              </button>
            )}
          </nav>
        </div>

        {/* フッター情報 */}
        <div className="px-3 py-3 border-t border-slate-800/50 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>Google Skills Protocol</span>
          <span className="text-sky-400">v2.4</span>
        </div>
      </aside>
    </div>
  );
}
