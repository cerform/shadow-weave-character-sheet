// components/AttributeDistribution.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const attributes = [
  { key: "strength", label: "Сила" },
  { key: "dexterity", label: "Ловкость" },
  { key: "constitution", label: "Телосложение" },
  { key: "intelligence", label: "Интеллект" },
  { key: "wisdom", label: "Мудрость" },
  { key: "charisma", label: "Харизма" },
];

const pointBuyCosts = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

const AttributeDistribution = () => {
  const navigate = useNavigate();

  const [method, setMethod] = useState<"pointbuy" | "roll" | "freeform" | null>(null);
  const [stats, setStats] = useState<Record<string, number>>(() =>
    Object.fromEntries(attributes.map((a) => [a.key, 8]))
  );
  const [pointBuyRemaining, setPointBuyRemaining] = useState(27);

  const roll4d6DropLowest = () => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    rolls.shift(); // удалить минимальный бросок
    return rolls.reduce((sum, current) => sum + current, 0);
  };

  const rollStats = () => {
    const newStats = Object.fromEntries(
      attributes.map((attr) => [attr.key, roll4d6DropLowest()])
    );
    setStats(newStats);
  };

  const calculateModifier = (value: number) => {
    return Math.floor((value - 10) / 2);
  };

  const handleChange = (attribute: string, newValue: number) => {
    if (method === "pointbuy") {
      const oldVal = stats[attribute];
      const oldCost = pointBuyCosts[oldVal] ?? 0;
      const newCost = pointBuyCosts[newValue] ?? 0;
      const delta = newCost - oldCost;

      if (pointBuyRemaining - delta < 0) return; // недостаточно очков
      if (newValue > 15 || newValue < 8) return; // границы пойнт-бая

      setPointBuyRemaining((prev) => prev - delta);
      setStats((prev) => ({
        ...prev,
        [attribute]: newValue,
      }));
    } else {
      setStats((prev) => ({
        ...prev,
        [attribute]: newValue,
      }));
    }
  };

  const handleMethodSelect = (newMethod: typeof method) => {
    setMethod(newMethod);
    if (newMethod === "roll") {
      rollStats();
    } else {
      setStats(Object.fromEntries(attributes.map((a) => [a.key, 8])));
      setPointBuyRemaining(27);
    }
  };

  const handleContinue = () => {
    console.log("Итоговые характеристики:", stats);
    navigate("/create/summary");
  }; // ← Здесь обязательно закрыли функцию!

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Распределение характеристик</h1>

      {/* Выбор метода */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => handleMethodSelect("pointbuy")}>
          Пойнт-Бай (27 очков)
        </Button>
        <Button onClick={() => handleMethodSelect("roll")}>
          Броски кубиков (4d6 drop 1)
        </Button>
        <Button onClick={() => handleMethodSelect("freeform")}>
          Свободная форма
        </Button>
      </div>

      {/* Остаток пойнт-бай */}
      {method === "pointbuy" && (
        <div className="mb-4 text-lg font-semibold">
          Осталось очков: {pointBuyRemaining}
        </div>
      )}

      {/* Таблица */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl bg-card p-6 rounded shadow">
        <div className="font-bold text-center">Характеристика</div>
        <div className="font-bold text-center">Значение</div>
        <div className="font-bold text-center">Модификатор</div>

        {attributes.map((attr) => (
          <div className="contents" key={attr.key}>
            <div className="text-center">{attr.label}</div>
            <div className="text-center">
              <input
                type="number"
                min={method === "pointbuy" ? 8 : 1}
                max={method === "pointbuy" ? 15 : 30}
                value={stats[attr.key]}
                onChange={(e) => handleChange(attr.key, Number(e.target.value))}
                className="w-16 text-center border rounded p-1 bg-background"
              />
            </div>
            <div className="text-center">
              {calculateModifier(stats[attr.key]) >= 0 ? "+" : ""}
              {calculateModifier(stats[attr.key])}
            </div>
          </div>
        ))}
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-4 mt-10">
        <Button variant="secondary" onClick={() => navigate("/create/class")}>
          Назад
        </Button>
        <Button
          onClick={handleContinue}
          disabled={method === "pointbuy" && pointBuyRemaining !== 0}
        >
          Сохранить и продолжить
        </Button>
      </div>
    </div>
  );
};

export default AttributeDistribution;
