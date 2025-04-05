import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNbpygN_dSy1WALrAwlfuOSEn6GU-UG7o",
  authDomain: "githubbounty.firebaseapp.com",
  projectId: "githubbounty",
  storageBucket: "githubbounty.firebasestorage.app",
  messagingSenderId: "586869952734",
  appId: "1:586869952734:web:89ebb53dae098ef066324f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
