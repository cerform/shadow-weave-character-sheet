import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { CharacterProvider } from "@/contexts/CharacterContext";
import { SpellbookProvider } from "@/contexts/SpellbookContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { SocketProvider } from "@/contexts/SocketContext";
import DynamicFantasyBackground from "@/components/layout/DynamicFantasyBackground";
import AppRoutes from "@/AppRoutes";
import FloatingActionWidget from "@/components/ui/FloatingActionWidget";
import { Toaster } from "@/components/ui/sonner";

function App() {
  // ...
  const basename = import.meta.env.BASE_URL || "/";

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CharacterProvider>
            <SpellbookProvider>
              <SessionProvider>
                <SocketProvider>
                  <Router basename={basename}>
                    <DynamicFantasyBackground>
                      <AppRoutes />
                      <FloatingActionWidget />
                      <Toaster />
                    </DynamicFantasyBackground>
                  </Router>
                </SocketProvider>
              </SessionProvider>
            </SpellbookProvider>
          </CharacterProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
