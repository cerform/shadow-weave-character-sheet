
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { SpellbookProvider } from './contexts/SpellbookContext';
import { ThemeProvider } from './hooks/use-theme'; // This should now work correctly
import AppRoutes from './AppRoutes';
import { SocketProvider } from './contexts/SocketContext';

// Компонент для применения темы глобально
const App = () => {
  console.log('App: Инициализация приложения');
  
  return (
    <ThemeProvider defaultTheme="dark">
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
  );
};

export default App;
