import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Characters collection operations
export const saveCharacterToFirebase = async (characterData: any, userId: string) => {
  try {
    const charactersRef = collection(db, "characters");
    const docRef = await addDoc(charactersRef, {
      ...characterData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving character: ", error);
    throw error;
  }
};

export const updateCharacterInFirebase = async (characterId: string, characterData: any) => {
  try {
    const characterRef = doc(db, "characters", characterId);
    await updateDoc(characterRef, {
      ...characterData,
      updatedAt: new Date(),
    });
    return characterId;
  } catch (error) {
    console.error("Error updating character: ", error);
    throw error;
  }
};

export const deleteCharacterFromFirebase = async (characterId: string) => {
  try {
    const characterRef = doc(db, "characters", characterId);
    await deleteDoc(characterRef);
    return characterId;
  } catch (error) {
    console.error("Error deleting character: ", error);
    throw error;
  }
};

export const getUserCharacters = async (userId: string) => {
  try {
    const charactersRef = collection(db, "characters");
    const q = query(charactersRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
  } catch (error) {
    console.error("Error getting user characters: ", error);
    throw error;
  }
};

export const getCharacterById = async (characterId: string) => {
  try {
    const characterRef = doc(db, "characters", characterId);
    const docSnap = await getDoc(characterRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting character: ", error);
    throw error;
  }
};

// Analytics operations
export const saveAnalyticsEvent = async (eventType: string, eventData: any, userId?: string) => {
  try {
    const analyticsRef = collection(db, "analytics");
    await addDoc(analyticsRef, {
      eventType,
      eventData,
      userId: userId || "anonymous",
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error saving analytics: ", error);
    // Don't throw here - analytics should not interrupt the user experience
  }
};

export const getAnalyticsSummary = async () => {
  try {
    const analyticsRef = collection(db, "analytics");
    const querySnapshot = await getDocs(analyticsRef);
    
    return querySnapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
  } catch (error) {
    console.error("Error getting analytics summary: ", error);
    throw error;
  }
};