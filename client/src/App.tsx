import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Creator from "@/pages/Creator";
import { lazy, Suspense, useEffect } from "react";
import MainLayout from "./components/MainLayout";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import { CharacterProvider } from "@/context/CharacterContext";
import { AuthProvider } from "@/context/AuthContext";

// Lazy-load pages for better performance
const Profile = lazy(() => import("@/pages/Profile"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminOrigins = lazy(() => import("@/pages/AdminOrigins"));
const AdminArchetypes = lazy(() => import("@/pages/AdminArchetypes"));
const AdminManeuvers = lazy(() => import("@/pages/AdminManeuvers")); // ✅ NEW
const AdminFeats = lazy(() => import("@/pages/AdminFeats"));

// Router component to track page views
function AppRouter() {
  useAnalytics();

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/creator/:step?">
          {() => (
            <CharacterProvider>
              <Creator />
            </CharacterProvider>
          )}
        </Route>
        <Route path="/profile" component={Profile} />
        <Route path="/analytics" component={Analytics} />

        {/* Admin Routes */}
        <Route path="/admin" component={Admin} />
        <Route path="/admin/origins" component={AdminOrigins} />
        <Route path="/admin/archetypes" component={AdminArchetypes} />
        <Route path="/admin/feats" component={AdminFeats} />
        <Route path="/adminmaneuvers" component={AdminManeuvers} /> {/* ✅ NEW ROUTE */}

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Google Analytics Measurement ID not found in environment variables');
    } else {
      console.log('Initializing Google Analytics');
      initGA();
    }
  }, []);

  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <MainLayout>
          <AppRouter />
        </MainLayout>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
