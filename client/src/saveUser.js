// src/saveUser.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // ⬅️ import db

export async function saveUserData(githubUsername, walletAddress) {
  try {
    // Create a document with the GitHub username as the ID
    const userRef = doc(db, "users", githubUsername);

    await setDoc(userRef, {
      githubUsername: githubUsername,
      walletAddress: walletAddress,
    });

    console.log("User data saved successfully!");
  } catch (error) {
    console.error("Error saving user data: ", error);
  }
}
