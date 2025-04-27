import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Добро пожаловать в D&D 5e Character Creator</h2>
      <p>Создайте своего героя, выбрав класс и создайте персонажа с нужными характеристиками и заклинаниями.</p>

      {/* Кнопки для выбора */}
      <div className="flex justify-between mt-8">
        <Link to="/create-character">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg">
            Создать персонажа
          </button>
        </Link>

        <Link to="/dm">
          <button className="px-6 py-3 bg-green-500 text-white rounded-lg">
            Воркспейс Данжен Мастера
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
