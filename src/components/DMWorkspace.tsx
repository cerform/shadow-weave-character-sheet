import React, { useState, useEffect } from "react";

const DMWorkspace = () => {
  const [characters, setCharacters] = useState<any[]>([]);

  // Загрузка персонажей из localStorage
  useEffect(() => {
    const loadedCharacters = JSON.parse(localStorage.getItem('characters') || "[]");
    setCharacters(loadedCharacters);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Воркспейс Данжен Мастера</h2>

      {characters.length > 0 ? (
        <div>
          <h3>Сохранённые персонажи:</h3>
          <ul>
            {characters.map((char, index) => (
              <li key={index} className="mb-4">
                <h4>{char.className}</h4>
                <p><strong>Имя:</strong> {char.name}</p>
                <p><strong>Характеристики:</strong> {char.stats.join(", ")}</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Просмотреть
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>У вас пока нет сохранённых персонажей.</p>
      )}
    </div>
  );
};

export default DMWorkspace;
