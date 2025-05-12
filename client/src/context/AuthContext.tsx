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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      
      // Admin check can be expanded later with more sophisticated rules
      if (user) {
        // For now, we'll just consider users with specific emails as admins
        const adminEmails = ['admin@rottedcapes.com']; // Add real admin emails here
        setIsAdmin(adminEmails.includes(user.email || ''));
        
        // Log user login for analytics
        saveAnalyticsEvent('user_auth_state_changed', {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName,
          action: 'signed_in'
        }, user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (): Promise<FirebaseUser | null> => {
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      
      if (user) {
        saveAnalyticsEvent('user_login', {
          userId: user.uid,
          method: 'google',
          timestamp: new Date().toISOString()
        }, user.uid);
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
        saveAnalyticsEvent('user_logout', {
          userId: currentUser.uid,
          timestamp: new Date().toISOString()
        }, currentUser.uid);
      }
      
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