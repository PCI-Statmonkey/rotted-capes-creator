import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveAnalyticsEvent } from "@/lib/firebase";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Plus, 
  AlertCircle,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import CharactersList from "@/components/CharactersList";
import { trackEvent } from "@/lib/analytics";

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [hasDirectAccess, setHasDirectAccess] = useState(false);

  // Check for Opera browser login in localStorage
  useEffect(() => {
    const directAccess = localStorage.getItem('isAdmin') === 'true';
    setHasDirectAccess(directAccess);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    // Skip all checks if user has direct Opera admin access
    if (hasDirectAccess) {
      setIsLoading(false);
      return;
    }
    
    if (!currentUser && !isLoading) {
      navigate("/");
      toast({
        title: "Login Required",
        description: "Please login to view your profile and saved characters.",
        variant: "destructive"
      });
    }
  }, [currentUser, isLoading, navigate, toast, hasDirectAccess]);

  // Track profile view for analytics
  useEffect(() => {
    if (currentUser || hasDirectAccess) {
      setIsLoading(false);
      
      // Log analytics event
      if (currentUser) {
        saveAnalyticsEvent('profile_view', {
          userId: currentUser.uid
        }, currentUser.uid);
      } else if (hasDirectAccess) {
        // For Opera browser login
        saveAnalyticsEvent('profile_view', {
          userId: 'opera-admin-user',
          note: 'Opera browser direct access'
        }, 'opera-admin-user');
      }
      
      // Also track in Google Analytics
      trackEvent('profile_view', 'user');
    }
  }, [currentUser, hasDirectAccess]);

  const handleCreateCharacter = () => {
    // Track button click for creating new character
    if (currentUser) {
      saveAnalyticsEvent('new_character_start', {
        userId: currentUser.uid
      }, currentUser.uid);
    }
    
    trackEvent('new_character_start', 'character');
    navigate("/creator");
  };
  
  const handleLogout = async () => {
    try {
      if (currentUser) {
        saveAnalyticsEvent('user_logout', {
          userId: currentUser.uid
        }, currentUser.uid);
      }
      
      trackEvent('user_logout', 'user');
      await logout();
      
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  // Allow either regular Firebase login or Opera browser login
  if (!currentUser && !hasDirectAccess) {
    return null; // Will redirect in useEffect
  }
  
  // Set default user info for Opera browser login
  const displayName = currentUser?.displayName || 
                    (hasDirectAccess ? localStorage.getItem('mockUserName') || "Opera Admin User" : null);
  const userEmail = currentUser?.email || 
                  (hasDirectAccess ? localStorage.getItem('mockUserEmail') || "admin@rottedcapes.com" : null);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 text-center">
          <h1 className="font-comic text-4xl text-accent mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            {displayName || userEmail}
            {hasDirectAccess && !currentUser && (
              <span className="ml-2 text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full text-xs">
                Opera Browser
              </span>
            )}
          </p>
        </div>

        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="characters" className="font-comic">
              My Characters
            </TabsTrigger>
            <TabsTrigger value="account" className="font-comic">
              Account Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="characters">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-comic text-2xl">Saved Characters</h2>
              <Button 
                className="bg-accent hover:bg-red-700" 
                onClick={handleCreateCharacter}
              >
                <Plus className="mr-2 h-4 w-4" /> New Character
              </Button>
            </div>
            
            {/* Use our new CharactersList component that integrates with database */}
            <CharactersList />
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="bg-panel halftone-bg comic-border">
              <CardHeader>
                <CardTitle className="font-comic text-xl">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    {currentUser?.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover" 
                      />
                    ) : (
                      <UserIcon className={`h-12 w-12 ${hasDirectAccess && !currentUser ? 'text-amber-500' : 'text-accent'}`} />
                    )}
                  </div>
                  {hasDirectAccess && !currentUser && (
                    <div className="text-center text-amber-500 mb-2">
                      Opera Browser Direct Admin Access
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Email</h3>
                    <p>{userEmail}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Display Name</h3>
                    <p>{displayName || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Account Type</h3>
                    <p>{hasDirectAccess && !currentUser ? 
                      "Opera Browser Admin (Temporary)" : 
                      (currentUser?.metadata?.creationTime ? 
                        `Account created on ${new Date(currentUser.metadata.creationTime).toLocaleDateString()}` : 
                        "Unknown")}</p>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}