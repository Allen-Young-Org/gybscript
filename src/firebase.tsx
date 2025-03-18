/* eslint-disable no-unused-vars */

import React from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Define a TypeScript type for the Firebase configuration object
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string; // Optional
}

const firebaseConfig: FirebaseConfig = {
  /*
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  */

  apiKey: "AIzaSyAdpMFKWIDsqT6uQzWzN8ZEDvtw4c9R8Ig",
  authDomain: "got-your-back-34b51.firebaseapp.com",
  projectId: "got-your-back-34b51",
  storageBucket: "got-your-back-34b51.appspot.com",
  messagingSenderId: "86192186217",
  appId: "1:86192186217:web:19aae35bd888606e7f53f8",
  measurementId: "G-MQPNGSGPEV",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Create a React Context for Firebase
const FirebaseContext = React.createContext<{
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}>({
  auth,
  db,
  storage,
});

// Provider Component
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <FirebaseContext.Provider value={{ auth, db, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase services
export const useFirebase = () => React.useContext(FirebaseContext);

export { auth, db, storage, app };
