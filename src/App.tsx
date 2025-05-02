
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import PlayBattlePage from './pages/PlayBattlePage';
import SpellbookPage from './pages/SpellbookPage';
import HandbookPage from './pages/HandbookPage';
import Index from './pages/Index';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider defaultTheme="default">
      <Router>
        <Routes>
          <Route path="/battle" element={<PlayBattlePage />} />
          <Route path="/spellbook" element={<SpellbookPage />} />
          <Route path="/handbook" element={<HandbookPage />} />
          <Route path="/home" element={<Index />} />
          <Route path="/" element={<Index />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
