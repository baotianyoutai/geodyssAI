import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

// Astro (PUBLIC_) および Next.js (NEXT_PUBLIC_) の両方の環境変数命名規則に対応
const apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY || 
               import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
               "AIzaSyDummyKeyForDevelopment12345";

const authDomain = import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || 
                   import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 
                   "geodyssai.firebaseapp.com";

const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 
                  import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
                  "geodyssai";

const storageBucket = import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || 
                      import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                      "geodyssai.appspot.com";

const messagingSenderId = import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
                          import.meta.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
                          "1234567890";

const appId = import.meta.env.PUBLIC_FIREBASE_APP_ID || 
              import.meta.env.NEXT_PUBLIC_FIREBASE_APP_ID || 
              "1:1234567890:web:abcdef123456";

const recaptchaSiteKey = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY || 
                         import.meta.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 
                         "6LdDummyRecaptchaSiteKeyForDev12345678";

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Firebase App Check (reCAPTCHA Enterprise) の初期化
if (typeof window !== 'undefined') {
  try {
    if (import.meta.env.DEV) {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
    console.log('Firebase App Check successfully initialized.');
  } catch (e) {
    console.warn('Firebase App Check initialization skipped (development/unconfigured):', e);
  }
}

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
  try {
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
  } catch (error) {
    console.warn('Firestore user sync warning (using fallback profile):', error);
    return {
      uid: user.uid,
      displayName: user.displayName || '航海士 Navigator',
      photoURL: user.photoURL || '/assets/cat.jpg',
      createdAt: new Date().toISOString(),
      readHistory: ['post-131', 'post-135'],
      stardustBookmarks: ['post-131'],
      badges: ['First Voyage']
    };
  }
}

export { signInWithPopup, signOut, onAuthStateChanged };
