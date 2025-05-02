import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlayBattlePage from './pages/PlayBattlePage';
import SpellbookPage from './pages/SpellbookPage';

// Assuming other imports are already here...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/battle" element={<PlayBattlePage />} />
        <Route path="/spellbook" element={<SpellbookPage />} />
        {/* Other routes would go here */}
        <Route path="/" element={<SpellbookPage />} /> {/* For now, default to spellbook */}
      </Routes>
    </Router>
  );
}

export default App;
