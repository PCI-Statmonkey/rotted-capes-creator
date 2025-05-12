import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Creator from "@/pages/Creator";
import { lazy, Suspense } from "react";
import MainLayout from "@/components/MainLayout";

// Lazy-load pages for better performance
const Profile = lazy(() => import("@/pages/Profile"));
const Analytics = lazy(() => import("@/pages/Analytics"));

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <MainLayout>
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/creator" component={Creator} />
            <Route path="/profile" component={Profile} />
            <Route path="/analytics" component={Analytics} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </MainLayout>
    </TooltipProvider>
  );
}

export default App;
