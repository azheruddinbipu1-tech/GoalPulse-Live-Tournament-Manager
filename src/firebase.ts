import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database with the configured databaseId or fallback to default
let firestoreDb: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreDb = getFirestore(app);
  }
} catch (e) {
  console.warn('[FIRESTORE] Named database init warning, falling back to default:', e);
  firestoreDb = getFirestore(app);
}

export const db: Firestore = firestoreDb;
