import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const hasFirebaseKeys = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

console.log("hasFirebaseKeys status:", hasFirebaseKeys);
console.log("API Key loaded:", import.meta.env.VITE_FIREBASE_API_KEY ? import.meta.env.VITE_FIREBASE_API_KEY.substring(0, 10) + "..." : "undefined");
console.log("Project ID loaded:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

let authInstance = null;
let googleProviderInstance = null;
let dbInstance = null;
let isMock = false;

if (hasFirebaseKeys) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    googleProviderInstance = new GoogleAuthProvider();
    dbInstance = getFirestore(app);
  } catch (err) {
    console.warn("Firebase initialization failed, switching to mock auth mode:", err);
    isMock = true;
  }
} else {
  console.log("No Firebase config keys found in environment. Running ClassAI in Mock Auth mode.");
  isMock = true;
}

// Mock auth setup
const mockAuth = {
  currentUser: null,
  signOut: async () => {
    mockAuth.currentUser = null;
    return true;
  }
};

const mockSignInWithGoogle = async () => {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  const user = {
    displayName: "Jane Doe",
    email: "jane.doe@university.edu",
    photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=Jane`,
    uid: "mock-google-uid-" + Math.random().toString(36).substring(2, 9),
  };
  mockAuth.currentUser = user;
  return { user };
};

export const auth = isMock ? mockAuth : authInstance;
export const googleProvider = isMock ? null : googleProviderInstance;
export const db = isMock ? null : dbInstance;
export const signInWithGoogle = async () => {
  if (isMock) {
    return mockSignInWithGoogle();
  } else {
    return signInWithPopup(auth, googleProvider);
  }
};
export const signOutUser = async () => {
  if (isMock) {
    return mockAuth.signOut();
  } else {
    return auth.signOut();
  }
};
export const authIsMock = isMock;
