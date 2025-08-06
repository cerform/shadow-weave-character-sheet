import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { CharacterProvider } from '@/contexts/CharacterContext';
import { SpellbookProvider } from '@/contexts/SpellbookContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from '@/components/ui/toaster';

import DynamicFantasyBackground from '@/components/layout/DynamicFantasyBackground';

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
                <DynamicFantasyBackground autoRotate={true} rotateInterval={45}>
                  
                  <AppRoutes />
                  <Toaster />
                  
                 </DynamicFantasyBackground>
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