
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { UserThemeProvider } from '@/contexts/UserThemeContext';
import { CharacterProvider } from '@/contexts/CharacterContext';
import AppRoutes from './AppRoutes';
import './App.css';
import { app } from '@/firebase';

// Создаем клиент запросов
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  // Добавляем эффект для отладки инициализации
  useEffect(() => {
    console.log('App: Инициализация приложения');
    console.log('Firebase app initialized:', app.name);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider>
            <SessionProvider>
              <UserThemeProvider>
                <CharacterProvider>
                  <AppRoutes />
                  <Toaster />
                </CharacterProvider>
              </UserThemeProvider>
            </SessionProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
