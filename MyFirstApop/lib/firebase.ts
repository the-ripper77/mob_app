import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDvorzVe8-tty18v_Yg0VCcpgJVRS8a31s',
  authDomain: 'potato-36643.firebaseapp.com',
  projectId: 'potato-36643',
  storageBucket: 'potato-36643.firebasestorage.app',
  messagingSenderId: '14321173976',
  appId: '1:14321173976:android:a267831cd8ca83c7411ead',
  databaseURL: 'https://potato-36643-default-rtdb.asia-southeast1.firebasedatabase.app',
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

let dbInstance: Database | null = null;

export function getFirebaseDatabase(): Database {
  if (!dbInstance) {
    dbInstance = getDatabase(getFirebaseApp());
  }
  return dbInstance;
}
