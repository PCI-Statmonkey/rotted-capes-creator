import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  User,
  Menu,
  Home,
  FileEdit,
  LogIn,
  LogOut,
  ChevronUp,
  BarChart4,
  Settings,
  Database,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth, signInWithGoogle, logoutUser } from "@/lib/firebase";
import { useEffect } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      
      // Admin check - this can be expanded with more sophisticated rules
      if (user) {
        const adminEmails = ['admin@rottedcapes.com']; // Add real admin emails
        setIsAdmin(adminEmails.includes(user.email || ''));
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Character mock - in real usage, we would use the context appropriately
  const character = location === "/creator" ? {
    name: "Test Character",
    origin: "Super-Human",
    archetype: "Blaster"
  } : null;
  
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      if (currentUser) {
        await logoutUser();
        // Manually clear the current user state
        setCurrentUser(null);
        setIsAdmin(false);
      } else {
        const user = await signInWithGoogle();
        console.log("Login completed, user:", user ? user.email : "none");
        
        // Manually set the current user state
        if (user) {
          setCurrentUser(user);
          
          // For development mode mock user, set admin flag
          if (user.email === 'admin@rottedcapes.com') {
            setIsAdmin(true);
          }
          
          // Force a page reload to make sure all components update
          // This is a failsafe approach when state updates might not propagate properly
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Opera browser direct login
 const handleOperaLogin = () => {
  localStorage.setItem('mockUserEmail', 'opera.user@rottedcapes.com');
  localStorage.setItem('mockUserName', 'Opera User');

  const mockUser = {
    uid: "opera-regular-user",
    email: "opera.user@rottedcapes.com",
    displayName: "Opera User"
  };

  setCurrentUser(mockUser as any);
  setIsAdmin(false);

  alert("Opera login successful! You are now logged in as a regular user.");

  window.location.reload();
};

  return (
    <div className="flex flex-col min-h-screen dark:bg-[#121212] halftone-bg bg-fixed">
      {/* Header */}
      <header className="bg-panel shadow-md fixed w-full z-10">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 19l3 3 5-5m-7-4h-5l-3 3-3-3H3v-3l3-3-3-3V4h5l3 3 3-3h4l-3 3 3 3-3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="font-display text-2xl md:text-3xl tracking-wide">Rotted Capes 2.0</h1>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => location !== "/profile" && window.location.assign("/profile")}
                className="hidden md:flex"
              >
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Button>
            )}
            {isAdmin && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => location !== "/analytics" && window.location.assign("/analytics")}
                className="hidden md:flex"
              >
                <BarChart4 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            )}
            {currentUser ? (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogin}
                className="rounded-full"
                disabled={isLoading}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                    disabled={isLoading}
                  >
                    <LogIn className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogin}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Regular Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOperaLogin}>
                    <Settings className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="text-amber-500 font-medium">Opera Browser Login</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              
              <DrawerContent className="bg-panel">
                <div className="p-4 space-y-4">
                  <Link href="/">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                    >
                      <Home className="mr-2 h-5 w-5" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/creator">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                    >
                      <FileEdit className="mr-2 h-5 w-5" />
                      Character Creator
                    </Button>
                  </Link>
                  {currentUser && (
                    <Link href="/profile">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-5 w-5" />
                        My Profile
                      </Button>
                    </Link>
                  )}
                  {/* Only show admin features to admin users */}
                  {isAdmin && (
                    <>
                      <Link href="/analytics">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                        >
                          <BarChart4 className="mr-2 h-5 w-5" />
                          Analytics
                        </Button>
                      </Link>
                      <Link href="/admin">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                        >
                          <Database className="mr-2 h-5 w-5" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    </>
                  )}
                  {currentUser ? (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={handleLogin}
                      disabled={isLoading}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={handleLogin}
                        disabled={isLoading}
                      >
                        <LogIn className="mr-2 h-5 w-5" />
                        Regular Login
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start mt-2 border-l-2 border-amber-500 pl-3"
                        onClick={handleOperaLogin}
                      >
                        <Settings className="mr-2 h-5 w-5 text-amber-500" />
                        <span className="text-amber-500 font-medium">Opera Browser Login</span>
                      </Button>
                    </>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer has been moved inside the header */}

      {/* Main Content */}
      <main className="flex-grow pt-16 pb-20">
        {children}
      </main>

      {/* Mobile Character Summary Button - Only shown in Creator when we have character data */}
      {location === "/creator" && character && (
        <Drawer>
          <DrawerTrigger asChild>
            <Button 
              className="fixed bottom-6 right-6 z-10 lg:hidden w-16 h-16 rounded-full bg-accent hover:bg-red-700 shadow-lg flex items-center justify-center"
              size="icon"
            >
              <User className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-panel max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="font-comic text-2xl flex items-center">
                <User className="mr-2 h-5 w-5 text-accent" />
                Character Summary
              </h3>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                // Close the drawer manually
                const drawerElement = document.querySelector('[role="dialog"]');
                if (drawerElement) {
                  drawerElement.setAttribute('data-state', 'closed');
                  drawerElement.setAttribute('aria-hidden', 'true');
                }
              }}>
                <ChevronUp className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              {/* On mobile we'd import and use CharacterSummary here */}
              <div className="text-center">
                <h3 className="font-comic text-lg">{character.name || "Unnamed Character"}</h3>
                <p className="text-sm text-muted-foreground">
                  {character.origin || "No Origin"} • {character.archetype || "No Archetype"}
                </p>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Footer */}
      <footer className="bg-panel text-gray-400 py-4 text-center text-sm shadow-inner w-full">
        <div className="container mx-auto flex flex-col items-center">
          <div className="mb-3">
            Rotted Capes 2.0 and all related IP © Paradigm Concepts.
          </div>
          
          {/* Admin login dropdown */}
          <div className="opacity-50 hover:opacity-100 transition-opacity mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-xs text-muted-foreground"
                >
                  Admin Access
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Admin Login</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  if (localStorage.getItem('isAdmin') === 'true') {
                    window.location.assign("/admin");
                  } else {
                    const password = prompt("Enter admin password:");
                    if (password === "rottedcapes2admin") {
                      // Store admin status in localStorage
                      localStorage.setItem('isAdmin', 'true');
                      localStorage.setItem('mockUserEmail', 'admin@rottedcapes.com');
                      localStorage.setItem('mockUserName', 'Admin User');
                      
                      // Create a mock user for auth context
                      const mockUser = {
                        uid: "admin-user",
                        email: "admin@rottedcapes.com",
                        displayName: "Admin User"
                      };
                      
                      // Force page reload to update auth context
                      alert("Admin login successful! Redirecting to admin panel.");
                      window.location.assign("/admin");
                    } else {
                      alert("Invalid password");
                    }
                  }
                }}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Standard Login</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  if (localStorage.getItem('isAdmin') === 'true') {
                    window.location.assign("/admin");
                  } else {
                    const password = prompt("Enter Opera browser admin password:");
                    if (password === "opera-admin-special") {
                      // Store admin status in localStorage with Opera identifier
                      localStorage.setItem('isAdmin', 'true');
                      localStorage.setItem('isOperaAdmin', 'true');
                      localStorage.setItem('mockUserEmail', 'opera-admin@rottedcapes.com');
                      localStorage.setItem('mockUserName', 'Opera Admin User');
                      
                      // Create a mock user for auth context
                      const mockUser = {
                        uid: "opera-admin-user",
                        email: "opera-admin@rottedcapes.com",
                        displayName: "Opera Admin User"
                      };
                      
                      // Force page reload to update auth context
                      alert("Opera admin login successful! Redirecting to admin panel.");
                      window.location.assign("/admin");
                    } else {
                      alert("Invalid Opera admin password");
                    }
                  }
                }}>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Opera Browser Login</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </footer>
    </div>
  );
}