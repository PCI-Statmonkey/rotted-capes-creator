import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  User,
  Menu,
  Home,
  FileEdit,
  LogIn,
  LogOut,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useCharacter } from "@/context/CharacterContext";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { character } = useCharacter();
  const { currentUser, login, logout, isLoading } = useAuth();
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const handleLogin = async () => {
    if (currentUser) {
      await logout();
    } else {
      await login();
    }
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
              <h1 className="font-comic text-2xl md:text-3xl tracking-wide">Rotted Capes 2.0</h1>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogin}
              className="rounded-full"
              disabled={isLoading}
            >
              {currentUser ? <LogOut className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-full"
              asChild
            >
              <DrawerTrigger>
                <Menu className="h-5 w-5" />
              </DrawerTrigger>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Drawer>
        <DrawerContent className="bg-panel">
          <div className="p-4 space-y-4">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setMobileSummaryOpen(false)}
              >
                <Home className="mr-2 h-5 w-5" />
                Home
              </Button>
            </Link>
            <Link href="/creator">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setMobileSummaryOpen(false)}
              >
                <FileEdit className="mr-2 h-5 w-5" />
                Character Creator
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {currentUser ? (
                <>
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </>
              )}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <main className="flex-grow pt-16 pb-20">
        {children}
      </main>

      {/* Mobile Character Summary Button - Only shown in Creator */}
      {location === "/creator" && (
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
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
            </div>
            <div className="p-4">
              {/* Dynamically inserted character summary component */}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Footer */}
      <footer className="bg-panel text-gray-400 py-4 text-center text-sm shadow-inner w-full">
        <div className="container mx-auto">
          Rotted Capes 2.0 and all related IP © Paradigm Concepts.
        </div>
      </footer>
    </div>
  );
}
