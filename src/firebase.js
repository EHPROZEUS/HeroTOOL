// src/firebase.js - secure init (lit les vars d'env, supprime guillemets éventuels)
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const clean = v => (typeof v === 'string' ? v.replace(/^["']|["']$/g, '') : v);

const firebaseConfig = {
  apiKey: clean(process.env.REACT_APP_FIREBASE_API_KEY || ""),
  authDomain: clean(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || ""),
  projectId: clean(process.env.REACT_APP_FIREBASE_PROJECT_ID || ""),
  storageBucket: clean(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || ""),
  messagingSenderId: clean(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || ""),
  appId: clean(process.env.REACT_APP_FIREBASE_APP_ID || "")
};

// Debug court (temporaire) : affiche uniquement la fin de la clé
if (!firebaseConfig.apiKey) {
  console.error("⚠️ REACT_APP_FIREBASE_API_KEY manquante. Vérifie .env.local puis redémarre le serveur.");
} else {
  console.log("Firebase apiKey chargée (last 6 chars):", firebaseConfig.apiKey.slice(-6));
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;