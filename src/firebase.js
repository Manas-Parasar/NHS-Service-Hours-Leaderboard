import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDVWVuzUuiIKu6eZDTL_mBGfTGQ-SFhcE",
  authDomain: "nhs-leaderboard-a4fc3.firebaseapp.com",
  projectId: "nhs-leaderboard-a4fc3",
  storageBucket: "nhs-leaderboard-a4fc3.firebasestorage.app",
  messagingSenderId: "1041967898551",
  appId: "1:1041967898551:web:29daa64f6cd5ef9041d232"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };