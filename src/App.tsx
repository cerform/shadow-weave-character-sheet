
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { UserThemeProvider } from '@/contexts/UserThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppRoutes from './AppRoutes';
import { queryClient } from './queryClient';
import './App.css';

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="dnd-ui-theme">
      <UserThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <TooltipProvider>
              <div>
                <AppRoutes />
                <Toaster />
                <SonnerToaster position="top-center" closeButton />
              </div>
            </TooltipProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </UserThemeProvider>
    </ThemeProvider>
  );
};

export default App;
