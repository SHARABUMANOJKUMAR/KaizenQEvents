import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyCKPJ4klGTGxdgTxC3Q93YiaTZixlI0vE0",
  authDomain: "shaivika-lms-ai.firebaseapp.com",
  projectId: "shaivika-lms-ai",
  storageBucket: "shaivika-lms-ai.firebasestorage.app",
  messagingSenderId: "977716272905",
  appId: "1:977716272905:web:ff7924e20741c02f823dd8",
  measurementId: "G-MPQ6E8M5KB"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force Google Account Selector prompt in browser popup
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword };
