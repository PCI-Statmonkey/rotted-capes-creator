import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Simplified admin check that relies only on localStorage
  useEffect(() => {
    // Check for opera admin or standard admin flag in localStorage
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const operaAdmin = localStorage.getItem('operaAdmin') === 'true';
    const adminUid = localStorage.getItem('adminUid');

    if (isAdmin || operaAdmin || adminUid) {
      setHasAccess(true);
      setIsLoading(false);
      return;
    }
    
    // If no admin access is found, redirect with message
    navigate("/");
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin dashboard.",
      variant: "destructive"
    });
    
    setIsLoading(false);
  }, [navigate, toast]);
  
  if (isLoading) {
    // Show loading state
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }
  
  if (!hasAccess) {
    return null;
  }
  
  return <>{children}</>;
}