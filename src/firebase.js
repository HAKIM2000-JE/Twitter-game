// firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Paste your firebaseConfig object here
  apiKey: "AIzaSyDR7oa-uxtZKzQs7omj-OcNnj3R-B6CdDA",
  authDomain: "twitter-game-ed473.firebaseapp.com",
  projectId: "twitter-game-ed473",
  storageBucket: "twitter-game-ed473.appspot.com",
  messagingSenderId: "635868874379",
  appId: "1:635868874379:web:e81c97e675ab857f4bb68e",
  measurementId: "G-BHY81L683G"
};

const app =firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = getStorage(app)

export  {db, storage};