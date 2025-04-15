// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBNbpygN_dSy1WALrAwlfuOSEn6GU-UG7o",
    authDomain: "githubbounty.firebaseapp.com",
    projectId: "githubbounty",
    storageBucket: "githubbounty.firebasestorage.app",
    messagingSenderId: "586869952734",
    appId: "1:586869952734:web:89ebb53dae098ef066324f"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GithubAuthProvider();
const db = getFirestore(app); 

export { auth, provider, signInWithPopup };
export {app, db, addDoc, collection, doc, setDoc, getDoc };
