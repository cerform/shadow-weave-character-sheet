import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
// ...остальные импорты

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
