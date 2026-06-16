import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8GkqSUFgqLHvKqrz7xRJiyDYYLRjOejs",
  authDomain: "foodrush-e80bd.firebaseapp.com",
  projectId: "foodrush-e80bd",
  storageBucket: "foodrush-e80bd.firebasestorage.app",
  messagingSenderId: "768850205070",
  appId: "1:768850205070:web:f03131a3ca7bace282acdf"
  
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;