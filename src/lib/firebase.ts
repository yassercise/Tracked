import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyA0QDm49wVArv6oJA4YNGdRCXDe9OEtkI0',
  authDomain: 'ekk-hub.firebaseapp.com',
  projectId: 'ekk-hub',
  storageBucket: 'ekk-hub.firebasestorage.app',
  messagingSenderId: '68211752660',
  appId: '1:68211752660:web:1098c3baed22cae8b7c541',
});

// Local cache keeps the app usable offline; writes queue and sync when back online.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
