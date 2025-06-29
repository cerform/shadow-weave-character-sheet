
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CharacterProvider } from '@/contexts/CharacterContext';
import { ThemeProvider } from '@/components/theme-provider';
import AppRoutes from './AppRoutes';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <CharacterProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
          </BrowserRouter>
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
