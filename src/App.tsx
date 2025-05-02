import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import PlayBattlePage from './pages/PlayBattlePage';
import SpellbookPage from './pages/SpellbookPage';
import HandbookPage from './pages/HandbookPage';
import Index from './pages/Index';
import Home from './pages/Home'; // Импортируем Home если есть

// Assuming other imports are already here...

function App() {
  return (
    <ThemeProvider defaultTheme="default">
      <Router>
        <Routes>
          <Route path="/battle" element={<PlayBattlePage />} />
          <Route path="/spellbook" element={<SpellbookPage />} />
          <Route path="/handbook" element={<HandbookPage />} />
          <Route path="/home" element={<Index />} />
          {/* Если есть компонент Home, используем его */}
          {/* <Route path="/home-new" element={<Home />} /> */}
          {/* Other routes would go here */}
          <Route path="/" element={<Index />} /> {/* Теперь используем Index как домашнюю страницу */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
