import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc, serverTimestamp, Timestamp, orderBy } from "firebase/firestore";

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
/**
 * Saves a character to Firebase and returns the document ID
 */
export const saveCharacterToFirebase = async (characterData: any, userId: string) => {
  try {
    // Prepare the character data for Firebase
    // Make a deep copy to avoid modifying the original
    const characterToSave = JSON.parse(JSON.stringify(characterData));
    
    // Add ownership and timestamp information
    characterToSave.ownerId = userId;
    
    // Add to Firestore
    const charactersRef = collection(db, "characters");
    const docRef = await addDoc(charactersRef, {
      userId,
      data: characterToSave,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("Character saved with ID: ", docRef.id);
    
    // Also log this event to analytics
    await saveAnalyticsEvent('character_created', {
      characterId: docRef.id,
      name: characterData.name,
      origin: characterData.origin,
      archetype: characterData.archetype
    }, userId);
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving character: ", error);
    throw error;
  }
};

/**
 * Updates an existing character in Firebase
 */
export const updateCharacterInFirebase = async (characterId: string, characterData: any) => {
  try {
    // Prepare the character data
    const characterToUpdate = JSON.parse(JSON.stringify(characterData));
    
    // Update the document
    const characterRef = doc(db, "characters", characterId);
    await updateDoc(characterRef, {
      data: characterToUpdate,
      updatedAt: serverTimestamp()
    });
    
    console.log("Character updated successfully");
    
    // Log the update event
    await saveAnalyticsEvent('character_updated', {
      characterId,
      name: characterData.name
    });
    
    return characterId;
  } catch (error) {
    console.error("Error updating character: ", error);
    throw error;
  }
};

/**
 * Deletes a character from Firebase
 */
export const deleteCharacterFromFirebase = async (characterId: string) => {
  try {
    // Get the character data before deletion for analytics
    const characterRef = doc(db, "characters", characterId);
    const characterSnap = await getDoc(characterRef);
    
    if (characterSnap.exists()) {
      const characterData = characterSnap.data();
      
      // Delete the character
      await deleteDoc(characterRef);
      console.log("Character deleted successfully");
      
      // Log the deletion event
      await saveAnalyticsEvent('character_deleted', {
        characterId,
        name: characterData.data?.name || 'Unknown Character'
      });
      
      return characterId;
    } else {
      console.error("Character not found");
      return null;
    }
  } catch (error) {
    console.error("Error deleting character: ", error);
    throw error;
  }
};

/**
 * Gets all characters for a specific user
 */
export const getUserCharacters = async (userId: string) => {
  try {
    const charactersRef = collection(db, "characters");
    const q = query(charactersRef, where("userId", "==", userId), orderBy("updatedAt", "desc"));
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

/**
 * Gets a specific character by its document ID
 */
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
      console.log("No such character!");
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