import React from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";

interface CharacterReviewProps {
  character: any;
  prevStep: () => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ character, prevStep }) => {
  const handleFinish = () => {
    localStorage.setItem("character", JSON.stringify(character));
    alert("Персонаж успешно сохранён!");
    window.location.href = "/sheet"; // После сохранения переход на страницу листа персонажа
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Ваш персонаж готов!</h2>

      <div className="space-y-6 mb-8">
        {/* Базовая информация */}
        <div className="p-4 border rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Базовая информация</h3>
          <p><strong>Имя:</strong> {character.name || "Не указано"}</p>
          <p><strong>Раса:</strong> {character.race || "Не выбрана"}</p>
          <p><strong>Класс:</strong> {character.class || "Не выбран"}</p>
          <p><strong>Пол:</strong> {character.gender || "Не указан"}</p>
          <p><strong>Мировоззрение:</strong> {character.alignment || "Не выбрано"}</p>
          <p><strong>Предыстория:</strong> {character.background || "Не выбрана"}</p>
        </div>

        {/* Характеристики */}
        <div className="p-4 border rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Характеристики</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(character.stats).map(([stat, value]) => (
              <div key={stat} className="flex justify-between">
                <span className="capitalize">{stat}</span>
                <span className="font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Заклинания */}
        {character.spells && character.spells.length > 0 && (
          <div className="p-4 border rounded shadow">
            <h3 className="text-xl font-semibold mb-2">Выбранные заклинания</h3>
            <ul className="list-disc list-inside">
              {character.spells.map((spell: string, idx: number) => (
                <li key={idx}>{spell}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* КНОПКИ */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={prevStep}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded"
        >
          Назад
        </button>

        <button
          onClick={handleFinish}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Завершить создание
        </button>
      </div>
    </div>
  );
};

export default CharacterReview;
