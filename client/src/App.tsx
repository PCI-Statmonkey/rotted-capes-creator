import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Creator from "@/pages/Creator";
import { lazy, Suspense, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";

// Lazy-load pages for better performance
const Profile = lazy(() => import("@/pages/Profile"));
const Analytics = lazy(() => import("@/pages/Analytics"));

// Router component to track page views
function AppRouter() {
  // Use our analytics hook to track page views
  useAnalytics();
  
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/creator" component={Creator} />
        <Route path="/profile" component={Profile} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Initialize Google Analytics when the app loads
  useEffect(() => {
    // Check if we have the measurement ID
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Google Analytics Measurement ID not found in environment variables');
    } else {
      console.log('Initializing Google Analytics');
      initGA();
    }
  }, []);
  
  return (
    <TooltipProvider>
      <Toaster />
      <MainLayout>
        <AppRouter />
      </MainLayout>
    </TooltipProvider>
  );
}

export default App;
