import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is fully provided
const isFirebaseConfigured = typeof window !== 'undefined' && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-api-key-here';

// Use active config or placeholder config to prevent build crash when variables are loading
const activeConfig = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) 
  ? firebaseConfig 
  : {
      apiKey: "placeholder-api-key-for-build",
      authDomain: "placeholder-auth-domain.firebaseapp.com",
      projectId: "placeholder-project-id",
      storageBucket: "placeholder-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:placeholder"
    };

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, isFirebaseConfigured };

// Real-time Firestore sync helpers
export async function saveUserDataToFirebase(email: string, data: any) {
  try {
    await setDoc(doc(db, 'students', email.toLowerCase()), data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving user data to Firebase:", error);
    return false;
  }
}

export async function getUserDataFromFirebase(email: string) {
  try {
    const snap = await getDoc(doc(db, 'students', email.toLowerCase()));
    if (snap.exists()) return snap.data();
  } catch (error) {
    console.error("Error getting user data from Firebase:", error);
  }
  return null;
}

export async function signInWithGoogleReal(): Promise<{ email: string; name: string } | null> {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      return {
        email: result.user.email || '',
        name: result.user.displayName || 'Google User'
      };
    }
  } catch (error) {
    console.error("Firebase Google Sign-In error:", error);
    throw error;
  }
  return null;
}
