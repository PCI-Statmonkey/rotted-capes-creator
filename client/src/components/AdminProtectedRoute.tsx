import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { currentUser, isAdmin, isLoading } = useAuth();
  const [hasDirectAccess, setHasDirectAccess] = useState(false);
  const [access, setAccess] = useState(false);
  
  // Check for administrative access from various sources
  useEffect(() => {
    const directAccess = localStorage.getItem('isAdmin') === 'true';
    setHasDirectAccess(directAccess);
    
    // Skip all checks if user has direct admin access or localStorage admin
    if (directAccess || localStorage.getItem('isAdmin') === 'true') {
      setAccess(true);
      return;
    }
    
    if (!currentUser && !isLoading) {
      navigate("/");
      toast({
        title: "Login Required",
        description: "Please login to access this page.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentUser && !isAdmin && !isLoading) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentUser && isAdmin) {
      setAccess(true);
    }
  }, [currentUser, isAdmin, isLoading, navigate, toast]);
  
  if (isLoading) {
    // Show loading state
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }
  
  if (!access && !isLoading) {
    return null;
  }
  
  return <>{children}</>;
}