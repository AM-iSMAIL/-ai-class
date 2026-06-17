import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let authInstance = null;
let googleProviderInstance = null;
let dbInstance = null;
const isMock = true; // Forced offline Local Sandbox Mode

console.log("Running ClassAI in offline Local Sandbox Mode. Firebase database sync disabled.");

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
export const isLocalSandboxMode = isMock;
export const toggleForceLocalMode = () => {
  const current = localStorage.getItem('classai_force_local_mode') === 'true';
  localStorage.setItem('classai_force_local_mode', (!current).toString());
  window.location.reload();
};

export const runWithTimeout = async (promise, timeoutMs = 6000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Database connection timed out. Please check your Firestore security rules, Firebase setup, or switch to Local Sandbox Mode."));
    }, timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};


