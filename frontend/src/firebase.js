import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";

// ✅ YOUR SPECIFIC CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyA3hKn4CxN-oYEh0kiS3w6KZ3pB_BJqy8k",
  authDomain: "streamnexus-8c3a7.firebaseapp.com",
  projectId: "streamnexus-8c3a7",
  storageBucket: "streamnexus-8c3a7.firebasestorage.app",
  messagingSenderId: "946578529518",
  appId: "1:946578529518:web:3d3d87d416e1143ceba7ff",
  measurementId: "G-FR7ZPYCDT2"
};

// 1. Initialize App
const app = initializeApp(firebaseConfig);

// 2. Initialize Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 3. Initialize Database (Firestore)
const db = getFirestore(app);

// 4. EXPORT EVERYTHING (Crucial Step!)
export { 
  auth, 
  provider, 
  signInWithPopup, 
  signOut, 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
};