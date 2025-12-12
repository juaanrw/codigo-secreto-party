// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBs_hJ-daOlDqqCULv2_ImmcC5WC2eVfTc",
  authDomain: "codigo-secreto-party.firebaseapp.com",
  databaseURL: "https://codigo-secreto-party-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "codigo-secreto-party",
  storageBucket: "codigo-secreto-party.firebasestorage.app",
  messagingSenderId: "914961060476",
  appId: "1:914961060476:web:069f685f985bd4ce176ff9",
  measurementId: "G-9J9S8NKWYX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);