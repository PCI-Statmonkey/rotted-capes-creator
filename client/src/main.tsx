import './index.css';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { CharacterProvider, ThemeProvider } from "./context/CharacterContext";
import { AuthProvider } from "./context/AuthContext";
import { Suspense } from "react";

// Wrap the entire app with providers
createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<div>Loading...</div>}>
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CharacterProvider>
            <App />
          </CharacterProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </Suspense>
);
