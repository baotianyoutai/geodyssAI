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
    <>
      {/* 1. ハンバーガー [menu] トリガーボタン (固定位置 top-3 left-3) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-3 left-3 z-50 p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg cursor-pointer flex items-center justify-center border active:scale-95 ${
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

      {/* 2. 背景暗転バックドロップ（タップで閉じる） */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
        />
      )}

      {/* 3. 画面最左端 (left-0) から完璧に滑らかにスライド表示されるサイドバーパネル */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 h-screen transition-transform duration-300 ease-out flex flex-col justify-between p-5 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark
            ? 'bg-[#090F1E]/98 border-r border-slate-800/90 text-slate-200 backdrop-blur-2xl'
            : 'bg-white/98 border-r border-slate-200 text-slate-800 backdrop-blur-2xl'
        }`}
      >
        <div className="space-y-6 pt-2">
          {/* ヘッダーロゴ (geodyssAI) ＆ 閉じるボタン */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <a href="/" className="flex items-center font-display font-bold text-xl tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2fd9f4] via-[#38BDF8] to-[#818CF8]">
                geodyssAI
              </span>
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 text-xs cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          {/* ナビゲーションメニュー */}
          <nav className="space-y-2">
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
                className="w-full mt-4 flex items-center gap-3.5 px-4 py-3 rounded-full text-xs font-bold transition-all bg-[#0B57D0] hover:bg-[#0948AD] text-white shadow-md cursor-pointer active:scale-95"
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
        <div className="px-2 py-3 border-t border-slate-800/50 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>© 2026 geodyssAI</span>
        </div>
      </aside>
    </>
  );
}
