import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, syncUserProfile, type UserProfile } from '../lib/firebase-client';
import { MonolithCard, type MonolithData } from './MonolithCard';
import type { User } from 'firebase/auth';

interface BoardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_MONOLITH: MonolithData = {
  id: 'monolith-firebase-cloud',
  constellationId: 'firebase-cloud',
  constellationLabel: 'Firebase & Cloud 座',
  unlockedAt: new Date().toISOString(),
  tomeStory: '「太古の星海において、航海士は Firebase 座に属するすべての知の星を繋ぎ合わせ、偉大なるクラウドの光を呼び覚ました。この碑には、未知なる領域を開拓した voyager の不滅の功績が永久に記録されているニャ。」',
  badge: 'Complete: Firebase 座'
};

export function BoardingModal({ isOpen, onClose }: BoardingModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [demoUser, setDemoUser] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    // リダイレクト認証結果の検出
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        setUser(result.user);
        const fallbackProf: UserProfile = {
          uid: result.user.uid,
          displayName: result.user.displayName || 'Google Voyager',
          photoURL: result.user.photoURL || '/assets/cat.jpg',
          createdAt: new Date().toISOString(),
          readHistory: [],
          stardustBookmarks: [],
          badges: ['Google Sign-in']
        };
        setProfile(fallbackProf);
        setDemoUser(null);
        try {
          const prof = await syncUserProfile(result.user);
          if (prof) setProfile(prof);
        } catch (e) {
          console.warn('Firestore sync skipped', e);
        }
      }
    }).catch((e) => {
      console.warn('Redirect auth result check:', e);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const fallbackProf: UserProfile = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Google Voyager',
          photoURL: currentUser.photoURL || '/assets/cat.jpg',
          createdAt: new Date().toISOString(),
          readHistory: [],
          stardustBookmarks: [],
          badges: ['Google Sign-in']
        };
        setProfile(fallbackProf);
        setDemoUser(null);
        setErrorMessage(null);

        try {
          const prof = await syncUserProfile(currentUser);
          if (prof) setProfile(prof);
        } catch (e) {
          console.warn('Firestore user sync warning:', e);
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
    setErrorMessage(null);
    setNoticeMessage('Google 認証を実行中...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      
      const fallbackProf: UserProfile = {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Google Voyager',
        photoURL: result.user.photoURL || '/assets/cat.jpg',
        createdAt: new Date().toISOString(),
        readHistory: [],
        stardustBookmarks: [],
        badges: ['Google Sign-in']
      };
      setProfile(fallbackProf);
      setDemoUser(null);
      setNoticeMessage('ログインに成功しました！');

      try {
        const prof = await syncUserProfile(result.user);
        if (prof) setProfile(prof);
      } catch (e) {
        console.warn('Firestore user sync skipped:', e);
      }
    } catch (e: any) {
      console.error('Firebase Google Auth error:', e);
      if (e.code === 'auth/popup-blocked') {
        setNoticeMessage('ポップアップがブロックされました。直接ログイン画面へ移動します...');
        setTimeout(() => {
          signInWithRedirect(auth, googleProvider);
        }, 1000);
      } else if (e.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google サインインダイアログが閉じられました。');
        setNoticeMessage(null);
      } else {
        setErrorMessage(`サインインエラー (${e.code || 'UNKNOWN'}): ${e.message || '認証に失敗しました'}`);
        setNoticeMessage(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setNoticeMessage('Google ログイン画面へ接続中...');
    signInWithRedirect(auth, googleProvider);
  };

  const handleDemoSignIn = () => {
    const fallbackDemo: UserProfile = {
      uid: 'demo-voyager-777',
      displayName: '星海 航海士 (Voyager)',
      photoURL: '/assets/cat.jpg',
      createdAt: new Date().toISOString(),
      readHistory: ['ai-dojo-day1', 'post-131', 'post-135'],
      stardustBookmarks: ['post-131'],
      badges: ['First Voyage', 'Stellar Explorer']
    };
    setDemoUser(fallbackDemo);
    setErrorMessage(null);
    setNoticeMessage('デモ乗船モードでログインしました。');
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setNoticeMessage(null);
    try {
      if (user) {
        await signOut(auth);
      }
      setUser(null);
      setProfile(null);
      setDemoUser(null);
    } catch (e) {
      console.error('Sign-out error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeProfile = profile || demoUser || (user ? {
    uid: user.uid,
    displayName: user.displayName || 'Google Voyager',
    photoURL: user.photoURL || '/assets/cat.jpg',
    createdAt: new Date().toISOString(),
    readHistory: [],
    stardustBookmarks: [],
    badges: ['Google Sign-in']
  } : null);

  const displayAvatar = (!imgError && (user?.photoURL || activeProfile?.photoURL)) || '/assets/cat.jpg';
  const isLoggedIn = Boolean(user || demoUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in font-body">
      
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 font-sans max-h-[90vh] overflow-y-auto">
        
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

        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono leading-relaxed space-y-2">
            <div>{errorMessage}</div>
            <button
              onClick={handleGoogleRedirectSignIn}
              className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer border border-rose-500/40"
            >
              直接ページ遷移で Google ログイン
            </button>
          </div>
        )}

        {/* お知らせメッセージ */}
        {noticeMessage && (
          <div className="mb-4 p-3 bg-sky-500/15 border border-sky-500/30 rounded-xl text-xs text-sky-300 font-mono text-center">
            {noticeMessage}
          </div>
        )}

        {isLoggedIn && activeProfile ? (
          /* ログイン済み状態 */
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <img
                src={displayAvatar}
                alt="User Avatar"
                onError={() => setImgError(true)}
                className="w-14 h-14 rounded-full object-cover border-2 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
              />
              <div className="overflow-hidden">
                <h3 className="text-base font-bold text-white font-display truncate">
                  {user?.displayName || activeProfile.displayName}
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-[220px]">
                  {user?.email || 'voyager@geodyssai.com'}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {demoUser ? 'MODE: DEMO VOYAGER' : 'RANK: GOOGLE VOYAGER'}
                </span>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="block text-[10px] text-slate-500 uppercase">Read Articles</span>
                <span className="text-lg font-bold text-sky-400">
                  {activeProfile.readHistory?.length || 0} <span className="text-xs text-slate-500">本</span>
                </span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="block text-[10px] text-slate-500 uppercase">Stardust Bookmarks</span>
                <span className="text-lg font-bold text-indigo-400">
                  {activeProfile.stardustBookmarks?.length || 0} <span className="text-xs text-slate-500">個</span>
                </span>
              </div>
            </div>

            {/* 知の星海碑 (Monoliths Collection) */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>MONOLITHS (知の星海碑)</span>
                <span className="text-[10px] text-slate-500 font-normal">1 / 7 Complete</span>
              </h4>
              <MonolithCard monolith={DEMO_MONOLITH} />
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-rose-950 text-rose-300 hover:text-rose-200 border border-slate-800 hover:border-rose-800 font-mono text-xs rounded-full transition-colors cursor-pointer"
            >
              Sign Out (下船)
            </button>
          </div>
        ) : (
          /* 未ログイン状態 (Google Skills スタイル) */
          <div className="space-y-6 text-center">
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#F0F4F9] flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Google アカウントでログインすると、読了した星の記録や「星屑の栞（ブックマーク）」、「知の星海碑」が同期されます。
              </p>
            </div>

            {/* Google アカウントでサインイン Pill ボタン */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-6 bg-white hover:bg-slate-100 text-slate-800 font-bold font-sans text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer border border-slate-300 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="font-mono text-slate-600 animate-pulse">Processing...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google アカウントでサインイン</span>
                </>
              )}
            </button>

            {/* サブアクション: デモログインボタン */}
            <div className="pt-2">
              <button
                onClick={handleDemoSignIn}
                className="text-[11px] font-mono text-slate-500 hover:text-sky-400 transition-colors underline cursor-pointer"
              >
                デモアカウントで乗船（体験モード）
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
