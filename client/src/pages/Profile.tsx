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

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate("/");
      toast({
        title: "Login Required",
        description: "Please login to view your profile and saved characters.",
        variant: "destructive"
      });
    }
  }, [currentUser, isLoading, navigate, toast]);

  // Track profile view for analytics
  useEffect(() => {
    if (currentUser) {
      setIsLoading(false);
      
      // Log analytics event
      saveAnalyticsEvent('profile_view', {
        userId: currentUser.uid
      }, currentUser.uid);
      
      // Also track in Google Analytics
      trackEvent('profile_view', 'user');
    }
  }, [currentUser]);

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

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

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
            {currentUser.displayName || currentUser.email}
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
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover" 
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-accent" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Email</h3>
                    <p>{currentUser.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Display Name</h3>
                    <p>{currentUser.displayName || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Account Created</h3>
                    <p>{currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "Unknown"}</p>
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