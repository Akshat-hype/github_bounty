// src/githubLogin.js
import { getAuth, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from './firebase'; // Make sure firebase is initialized and exported from firebase.js

export async function githubLogin() {
  const auth = getAuth(app); 
  const provider = new GithubAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return user; // ✅ returning the user object
  } catch (error) {
    console.error(error);
    return null;
  }
}
