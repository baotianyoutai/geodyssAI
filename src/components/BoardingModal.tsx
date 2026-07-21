import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, syncUserProfile, type UserProfile } from '../lib/firebase-client';
import type { User } from 'firebase/auth';

interface BoardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BoardingModal({ isOpen, onClose }: BoardingModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const prof = await syncUserProfile(currentUser);
          setProfile(prof);
        } catch (e) {
          console.error('Failed to sync user profile:', e);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const prof = await syncUserProfile(result.user);
      setProfile(prof);
    } catch (e) {
      console.error('Sign-in error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error('Sign-out error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const displayAvatar = (!imgError && (profile?.photoURL || user?.photoURL)) || '/assets/cat.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in font-body">
      
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 font-sans">
        
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            乗船手続き — Boarding
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Voyager's Credentials & Log
          </p>
        </div>

        {user ? (
          /* ログイン済み状態 */
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <img
                src={displayAvatar}
                alt="User Avatar"
                onError={() => setImgError(true)}
                className="w-14 h-14 rounded-full object-cover border-2 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
              />
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {user.displayName || '航海士 Navigator'}
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                  {user.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  RANK: VOYAGER
                </span>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="block text-[10px] text-slate-500 uppercase">Read Articles</span>
                <span className="text-lg font-bold text-sky-400">
                  {profile?.readHistory?.length || 0} <span className="text-xs text-slate-500">本</span>
                </span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="block text-[10px] text-slate-500 uppercase">Stardust Bookmarks</span>
                <span className="text-lg font-bold text-indigo-400">
                  {profile?.stardustBookmarks?.length || 0} <span className="text-xs text-slate-500">個</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-rose-950 text-rose-300 hover:text-rose-200 border border-slate-800 hover:border-rose-800 font-mono text-xs rounded-xl transition-colors cursor-pointer"
            >
              Sign Out (下船)
            </button>
          </div>
        ) : (
          /* 未ログイン状態 */
          <div className="space-y-6 text-center">
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
                🚀
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                乗船手続きを行うと、読了した星の記録や「星屑の栞（ブックマーク）」がクラウドに保存されます。
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-sky-500 text-slate-200 hover:text-slate-950 border border-slate-700 font-bold font-display text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Google アカウントで乗船</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
