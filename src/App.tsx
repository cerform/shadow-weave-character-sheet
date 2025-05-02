import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import PlayBattlePage from './pages/PlayBattlePage';
import SpellbookPage from './pages/SpellbookPage';
import HandbookPage from './pages/HandbookPage';

// Assuming other imports are already here...

function App() {
  return (
    <ThemeProvider defaultTheme="default">
      <Router>
        <Routes>
          <Route path="/battle" element={<PlayBattlePage />} />
          <Route path="/spellbook" element={<SpellbookPage />} />
          <Route path="/handbook" element={<HandbookPage />} />
          {/* Other routes would go here */}
          <Route path="/" element={<SpellbookPage />} /> {/* For now, default to spellbook */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
