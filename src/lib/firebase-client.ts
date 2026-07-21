import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// クライアントサイド Firebase 設定
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment12345",
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "geodyssai.firebaseapp.com",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || "geodyssai",
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || "geodyssai.appspot.com",
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  readHistory: string[];
  stardustBookmarks: string[];
  badges: string[];
}

// ユーザー情報ドキュメントの初期化または取得
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const fallbackPhoto = '/assets/cat.jpg';
  const photoURL = user.photoURL || fallbackPhoto;

  if (!userSnap.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || '航海士 Navigator',
      photoURL,
      createdAt: new Date().toISOString(),
      readHistory: [],
      stardustBookmarks: [],
      badges: []
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    const data = userSnap.data() as UserProfile;
    return {
      ...data,
      photoURL: data.photoURL || photoURL
    };
  }
}

// ブックマーク（星屑の栞）のトグル機能
export async function toggleBookmark(uid: string, slug: string, isBookmarked: boolean) {
  const userRef = doc(db, 'users', uid);
  if (isBookmarked) {
    await updateDoc(userRef, {
      stardustBookmarks: arrayRemove(slug)
    });
  } else {
    await updateDoc(userRef, {
      stardustBookmarks: arrayUnion(slug)
    });
  }
}

// 記事読了の記録
export async function markArticleAsRead(uid: string, slug: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    readHistory: arrayUnion(slug)
  });
}

export { signInWithPopup, signOut, onAuthStateChanged };
