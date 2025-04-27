import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CharacterCreation from "./components/CharacterCreation"; // Путь к компоненту создания персонажа
import DMWorkspace from "./components/DMWorkspace"; // Путь к компоненту для Данжен Мастера
import HomePage from "./pages/HomePage"; // Главная страница с интерфейсом выбора

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-character" element={<CharacterCreation />} />
        <Route path="/dm" element={<DMWorkspace />} />
      </Routes>
    </Router>
  );
};

export default App;
