
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { UserThemeProvider } from '@/contexts/UserThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppRoutes from './AppRoutes';
import './App.css';

// Создаем клиент для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      refetchOnWindowFocus: false,
    },
  },
});

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
