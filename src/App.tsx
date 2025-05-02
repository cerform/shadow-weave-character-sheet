
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { SessionProvider } from './contexts/SessionContext';
import { SocketProvider } from './contexts/SocketContext'; // Добавляем импорт SocketProvider
import { Toaster } from './components/ui/sonner';

import PlayBattlePage from './pages/PlayBattlePage';
import SpellbookPage from './pages/SpellbookPage';
import HandbookPage from './pages/HandbookPage';
import Index from './pages/Index';
import Home from './pages/Home';
import CharacterCreationPage from './pages/CharacterCreationPage';
import DMDashboardPage from './pages/DMDashboardPage';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import JoinSessionPage from './pages/JoinSessionPage';
import CharacterSheetPage from './pages/CharacterSheetPage';

function App() {
  return (
    <ThemeProvider defaultTheme="default">
      <AuthProvider>
        <CharacterProvider>
          <SessionProvider>
            <SocketProvider> {/* Добавляем SocketProvider */}
              <Router>
                <Routes>
                  <Route path="/battle" element={<PlayBattlePage />} />
                  <Route path="/spellbook" element={<SpellbookPage />} />
                  <Route path="/handbook" element={<HandbookPage />} />
                  <Route path="/create-character" element={<CharacterCreationPage />} />
                  <Route path="/character-creation" element={<CharacterCreationPage />} />
                  <Route path="/dm-dashboard" element={<DMDashboardPage />} />
                  <Route path="/dm" element={<DMDashboardPage />} />
                  <Route path="/auth" element={<AuthPage />} /> 
                  <Route path="/join" element={<JoinSessionPage />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/sheet" element={<CharacterSheetPage />} />
                  <Route path="/" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              
              <Toaster position="top-center" />
            </SocketProvider> {/* Закрываем SocketProvider */}
          </SessionProvider>
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
