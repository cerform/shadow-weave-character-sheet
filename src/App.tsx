
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import { ThemeProvider } from './contexts/ThemeContext'
import { UserThemeProvider } from './contexts/UserThemeContext'
import { CharacterProvider } from './contexts/CharacterContext'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { SessionProvider } from './contexts/SessionContext'
import { Toaster } from './components/ui/toaster'

import Index from './pages/Index'
import Home from './pages/Home'
import DMDashboardPage from './pages/DMDashboardPage'
import CharacterCreationPage from './pages/CharacterCreationPage'
import CharacterSheetPage from './pages/CharacterSheetPage'
import AuthPage from './pages/AuthPage'
import BattleScenePage from './pages/BattleScenePage'
import PlayerHandbookPage from './pages/PlayerHandbookPage'
import SpellbookPage from './pages/SpellbookPage'
import PlayBattlePage from './pages/PlayBattlePage'
import DMSessionPage from './pages/DMSessionPage'
import JoinSessionPage from './pages/JoinSessionPage'
import CreateSessionPage from './pages/CreateSessionPage'
import PlayerSessionPage from './pages/PlayerSessionPage'
import NotFound from './pages/NotFound'

// Добавляем компонент с плавающей кнопкой кубиков
import AppDiceButton from './AppDiceButton'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <UserThemeProvider>
          <CharacterProvider>
            <SessionProvider>
              <SocketProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/dm" element={<DMDashboardPage />} />
                    <Route path="/dm-dashboard" element={<Navigate to="/dm" replace />} />
                    <Route path="/create-character" element={<Navigate to="/character-creation" replace />} />
                    <Route path="/character-creation" element={<CharacterCreationPage />} />
                    <Route path="/character-sheet" element={<CharacterSheetPage />} />
                    <Route path="/sheet" element={<CharacterSheetPage />} />
                    <Route path="/handbook" element={<PlayerHandbookPage />} />
                    <Route path="/spellbook" element={<SpellbookPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/battle" element={<BattleScenePage />} />
                    <Route path="/play-battle" element={<PlayBattlePage />} />
                    <Route path="/join" element={<JoinSessionPage />} />
                    <Route path="/session/dm" element={<DMSessionPage />} />
                    <Route path="/session/join" element={<JoinSessionPage />} />
                    <Route path="/session/create" element={<CreateSessionPage />} />
                    <Route path="/session/player" element={<PlayerSessionPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  {/* Плавающая кнопка кубиков */}
                  <AppDiceButton />
                  
                  <Toaster />
                </Router>
              </SocketProvider>
            </SessionProvider>
          </CharacterProvider>
        </UserThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
