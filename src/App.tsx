
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { SpellbookProvider } from './contexts/SpellbookContext';
import { UserThemeProvider } from '@/hooks/use-user-theme';
import { ThemeProvider } from '@/components/theme-provider';
import AppRoutes from './AppRoutes';
import { SocketProvider } from './contexts/SocketContext';

// Компонент для применения темы глобально
const App = () => {
  console.log('App: Инициализация приложения');
  
  return (
    <UserThemeProvider>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <AuthProvider>
          <CharacterProvider>
            <SpellbookProvider>
              <SocketProvider>
                <Router>
                  <AppRoutes />
                  <Toaster />
                </Router>
              </SocketProvider>
            </SpellbookProvider>
          </CharacterProvider>
        </AuthProvider>
      </ThemeProvider>
    </UserThemeProvider>
  );
};

export default App;
