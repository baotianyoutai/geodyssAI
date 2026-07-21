import React from 'react';

export interface MonolithData {
  id: string;
  constellationId: string;
  constellationLabel: string;
  unlockedAt: string;
  tomeStory: string;
  badge: string;
}

export function MonolithCard({ monolith }: { monolith: MonolithData }) {
  const formattedDate = new Date(monolith.unlockedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="relative p-5 bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/40 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.15)] font-sans text-slate-100 overflow-hidden group">
      
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🗿</span>
          <div>
            <h4 className="text-sm font-bold font-display text-amber-300">
              {monolith.constellationLabel}
            </h4>
            <span className="text-[10px] font-mono text-amber-400/80">
              {monolith.badge}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {formattedDate}
        </span>
      </div>

      {/* 要約物語 */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs leading-relaxed text-amber-100/90 font-serif italic border-l-2 border-l-amber-400">
        "{monolith.tomeStory}"
      </div>

    </div>
  );
}
