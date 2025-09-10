import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FileEdit, Info, Shield, User, LogIn, Settings } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { auth, signInWithGoogle } from "@/lib/firebase";

export default function Home() {
  // Simplified authentication for now
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  
  // Handler for login button
  const handleLogin = async () => {
    try {
      trackEvent('login_attempt', 'user', 'home_page');
      await signInWithGoogle();
      setCurrentUser(auth.currentUser);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 mt-8"
      >
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-red-500 tracking-wide mb-4">
          Rotted Capes 2.0
        </h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90">
          Create your superhero for the post-apocalyptic world with this interactive character creator.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-panel halftone-bg comic-border h-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center h-full">
                <FileEdit className="h-12 w-12 text-accent mb-4" />
                <h2 className="font-display text-2xl mb-3">Character Creator</h2>
                <p className="mb-6 text-muted-foreground flex-grow">
                  Use our step-by-step wizard to create your super hero with custom abilities, powers, and more.
                </p>
                <Link href="/creator">
                  <Button className="bg-accent hover:bg-red-700 w-full font-comic">
                    Start Creating
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-panel halftone-bg comic-border h-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center h-full">
                <User className="h-12 w-12 text-accent mb-4" />
                <h2 className="font-display text-2xl mb-3">My Characters</h2>
                <p className="mb-6 text-muted-foreground flex-grow">
                  Save characters to your account and access them anywhere. Export to PDF for game sessions.
                </p>
                {currentUser ? (
                  <Link href="/profile">
                    <Button className="bg-accent hover:bg-red-700 w-full font-comic">
                      <User className="mr-2 h-4 w-4" /> My Characters
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Button className="bg-accent hover:bg-red-700 w-full font-comic" onClick={handleLogin}>
                      <LogIn className="mr-2 h-4 w-4" /> Login Required
                    </Button>
                    <Button 
                      className="w-full bg-accent hover:bg-red-700 font-comic"
                      onClick={() => {
                        // Store admin status in localStorage
                        localStorage.setItem('isAdmin', 'true');
                        localStorage.setItem('mockUserEmail', 'admin@rottedcapes.com');
                        localStorage.setItem('mockUserName', 'Opera Admin User');
                        
                        // Redirect to profile page
                        window.location.href = '/profile';
                        
                        // Track event
                        trackEvent('opera_login', 'user', 'home_page');
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Opera Browser Login
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-panel halftone-bg comic-border h-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center h-full">
                <Info className="h-12 w-12 text-accent mb-4" />
                <h2 className="font-display text-2xl mb-3">Game Resources</h2>
                <p className="mb-6 text-muted-foreground flex-grow">
                  Quick references, rule summaries, and helpful guides for Rotted Capes 2.0 players.
                </p>
                <div className="w-full space-y-2">
                  <Button className="bg-gray-700 hover:bg-gray-600 w-full font-comic">
                    Player Resources
                  </Button>
                  <Link href="/editor">
                    <Button className="bg-gray-700 hover:bg-gray-600 w-full font-comic">
                      Editor-in-Chief's Resources
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-3xl mx-auto text-center p-6 bg-panel rounded-2xl comic-border"
      >
        <Shield className="h-10 w-10 text-accent mx-auto mb-4" />
        <h2 className="font-display text-2xl mb-4">About Rotted Capes</h2>
        <p className="text-muted-foreground">
          Rotted Capes is a post-apocalyptic superhero role-playing game where players take on the roles of the remaining heroes (or villains) in a world devastated by a zombie plague that affects everyone, including those with superpowers.
        </p>
      </motion.div>
    </div>
  );
}
