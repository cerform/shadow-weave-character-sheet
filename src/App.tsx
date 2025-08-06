import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { CharacterProvider } from '@/contexts/CharacterContext';
import { SpellbookProvider } from '@/contexts/SpellbookContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from '@/components/ui/toaster';
import CompactNavigationMenu from '@/components/navigation/CompactNavigationMenu';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import UnifiedFloatingWidget from '@/components/ui/UnifiedFloatingWidget';
import AppRoutes from '@/AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CharacterProvider>
          <SpellbookProvider>
            <SessionProvider>
              <SocketProvider>
              <Router>
                <BackgroundWrapper>
                  <CompactNavigationMenu />
                  <AppRoutes />
                  <Toaster />
                  <UnifiedFloatingWidget />
                 </BackgroundWrapper>
              </Router>
              </SocketProvider>
            </SessionProvider>
          </SpellbookProvider>
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;