import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, signInWithGoogle, logoutUser } from "@/lib/firebase";
import { saveAnalyticsEvent } from "@/lib/firebase";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: () => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mockUser, setMockUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // For development mode, check if we might need a mock user
    if (import.meta.env.DEV && !auth.currentUser) {
      console.log("Setting up auth state monitoring in development mode");
      
      // Check if we have Opera browser login stored in localStorage
      const isAdmin = localStorage.getItem('isAdmin');
      const mockUserEmail = localStorage.getItem('mockUserEmail');
      const mockUserName = localStorage.getItem('mockUserName');
      
      if (isAdmin === 'true' && mockUserEmail) {
        // Create a mock user for Opera browser login
        const operaUser = {
          uid: "opera-admin-user",
          email: mockUserEmail,
          displayName: mockUserName || "Opera Admin User"
        };
        
        console.log("Found Opera browser login in localStorage", operaUser);
        setCurrentUser(operaUser as any);
        setIsAdmin(true);
        setIsLoading(false);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If we have a real user from Firebase, use that
      if (user) {
        setCurrentUser(user);
        setMockUser(null); // Clear any mock user when we have a real one
        setIsLoading(false);
        
        // Admin check can be expanded later with more sophisticated rules
        // For now, we'll just consider users with specific emails as admins
        const adminEmails = ['admin@rottedcapes.com']; // Add real admin emails here
        setIsAdmin(adminEmails.includes(user.email || ''));
        
        // Log user login for analytics
        try {
          saveAnalyticsEvent('user_auth_state_changed', {
            userId: user.uid,
            email: user.email,
            displayName: user.displayName,
            action: 'signed_in'
          }, user.uid);
        } catch (error) {
          console.error("Could not save analytics event:", error);
        }
      } else if (mockUser) {
        // If we have a mock user (from development mode), keep using it
        setCurrentUser(mockUser);
        setIsLoading(false);
        setIsAdmin(mockUser.email === 'admin@rottedcapes.com');
      } else {
        // No real user and no mock user
        setCurrentUser(null);
        setIsLoading(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [mockUser]); // Add mockUser as dependency

  const login = async (): Promise<FirebaseUser | null> => {
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      
      if (user) {
        // If this is our development mock user, store it in state
        if (user.uid === 'dev-user-123') {
          setMockUser(user as any);
        }
        
        try {
          saveAnalyticsEvent('user_login', {
            userId: user.uid,
            method: 'google',
            timestamp: new Date().toISOString()
          }, user.uid);
        } catch (error) {
          console.error("Could not save analytics event:", error);
        }
      }
      
      return user;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (currentUser) {
        try {
          saveAnalyticsEvent('user_logout', {
            userId: currentUser.uid,
            timestamp: new Date().toISOString()
          }, currentUser.uid);
        } catch (error) {
          console.error("Could not save analytics event:", error);
        }
      }
      
      // Check if this is an Opera browser login (uid starts with 'opera-')
      if (currentUser?.uid?.startsWith('opera-')) {
        console.log("Logging out Opera browser user");
        
        // Clear Opera browser login from localStorage
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('mockUserEmail');
        localStorage.removeItem('mockUserName');
        
        // Reset the current user state
        setCurrentUser(null);
        setIsAdmin(false);
        
        // We're done here, no need to call Firebase logout
        return;
      }
      
      // Clear the mock user state
      setMockUser(null);
      
      // Actually log out from Firebase
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAdmin,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}