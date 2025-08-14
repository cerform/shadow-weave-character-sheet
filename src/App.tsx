import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { CharacterProvider } from '@/contexts/CharacterContext';
import { SpellbookProvider } from '@/contexts/SpellbookContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from '@/components/ui/toaster';

import DynamicFantasyBackground from '@/components/layout/DynamicFantasyBackground';
import FloatingActionWidget from '@/components/ui/FloatingActionWidget';
import AppRoutes from '@/AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SpellbookProvider>
          <SessionProvider>
            <SocketProvider>
            <Router>
              <DynamicFantasyBackground>
                <AppRoutes />
                <FloatingActionWidget />
                <Toaster />
              </DynamicFantasyBackground>
            </Router>
            </SocketProvider>
          </SessionProvider>
        </SpellbookProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;