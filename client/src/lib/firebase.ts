import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc, serverTimestamp, Timestamp, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log("FIREBASE CONFIG:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication helper functions
// We're using a simpler approach for development mode
// Track if we're using a mock development user
let usingMockUser = false;

export const signInWithGoogle = async () => {
  try {
    // For development purposes, create a mock user when Firebase auth has configuration issues
    // This allows testing the app without a fully configured Firebase project
    if (import.meta.env.DEV) {
      // Check if we're in development mode and Firebase config is missing
      console.log("Using development mock login due to Firebase configuration issues");
      
      // Simulate a successful login with a mock user
      const mockUser = {
        uid: "dev-user-123",
        email: "admin@rottedcapes.com", // This will grant admin access for testing
        displayName: "Development User",
        photoURL: null,
        emailVerified: true
      };
      
      // Set our mock user flag
      usingMockUser = true;
      
      // Return the mock user
      return mockUser as any;
    }
    
    // In production, use the actual Firebase authentication
    // Add some OAuth scopes to request
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    // Set custom parameters for better UX
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Login successful");
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google: ", error);
    
    // Try to provide more user-friendly error info
    let errorMessage = "Failed to sign in. Please try again.";
    if (error && error.code === "auth/configuration-not-found") {
      errorMessage = "Firebase configuration issue detected. Using development mode login.";
      
      // If Firebase is not configured properly, use a mock user in development
      if (import.meta.env.DEV) {
        const mockUser = {
          uid: "dev-user-123",
          email: "admin@rottedcapes.com", // This will grant admin access for testing
          displayName: "Development User",
          photoURL: null,
          emailVerified: true
        };
        
        // Set our mock user flag
        usingMockUser = true;
        
        return mockUser as any;
      }
    }
    
    console.error("Login error:", error);
    alert(errorMessage);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    if (usingMockUser) {
      console.log("Logging out development mode user");
      
      // Set the global flag to indicate we're logged out
      usingMockUser = false;
      
      // Since we can't directly manipulate Firebase's internal auth state,
      // we'll manually reload the page to reset all state
      window.location.reload();
      return;
    }
    
    // For real Firebase users, use Firebase signOut
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