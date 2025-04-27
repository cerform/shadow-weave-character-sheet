// src/pages/create/SummaryPage.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const dummyCharacter = {
  race: "Человек",
  class: "Воин",
  attributes: {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  },
};

const calculateModifier = (value: number) => {
  return Math.floor((value - 10) / 2);
};

const SummaryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6">Итоговый персонаж</h1>

      <div className="bg-card rounded shadow p-8 w-full max-w-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Раса: {dummyCharacter.race}</h2>
          <h2 className="text-2xl font-semibold">Класс: {dummyCharacter.class}</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="font-bold text-center">Характеристика</div>
          <div className="font-bold text-center">Значение</div>
          <div className="font-bold text-center">Модификатор</div>

          {Object.entries(dummyCharacter.attributes).map(([key, value]) => (
            <div className="contents" key={key}>
              <div className="text-center capitalize">{key}</div>
              <div className="text-center">{value}</div>
              <div className="text-center">
                {calculateModifier(value) >= 0 ? "+" : ""}
                {calculateModifier(value)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => navigate("/create/attributes")}>
            Назад к характеристикам
          </Button>
          <Button onClick={() => alert("Скоро будет экспорт в PDF! 🚀")}>
            Завершить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
