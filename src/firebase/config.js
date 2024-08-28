// src/firebase/config.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyAvKydC0EhnSfQXAPkvTzbk9JKMRMzjeDU",
  authDomain: "partdime-77009.firebaseapp.com",
  projectId: "partdime-77009",
  storageBucket: "partdime-77009.appspot.com",
  messagingSenderId: "555281842405",
  appId: "1:555281842405:web:cad97948127a8cbe32540c",
  measurementId: "G-8CZDVB5FGK",
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Ensure getAuth can also be used as a fallback
const fallbackAuth = getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app); 
export { auth, db, storage, app, fallbackAuth };
