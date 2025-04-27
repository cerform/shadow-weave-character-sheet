// src/components/AttributeDistribution.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "@/context/CharacterContext";

const attributesList = [
  "Сила",
  "Ловкость",
  "Телосложение",
  "Интеллект",
  "Мудрость",
  "Харизма",
];

const standardArray = [15, 14, 13, 12, 10, 8];

const AttributeDistribution = () => {
  const navigate = useNavigate();
  const { setCharacter } = useCharacter();

  const [method, setMethod] = useState<"standard" | "roll" | "pointbuy" | null>(null);
  const [attributes, setAttributes] = useState<{ [key: string]: number }>({});
  const [rolledStats, setRolledStats] = useState<number[]>([]);

  const roll4d6DropLowest = () => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    rolls.shift();
    return rolls.reduce((a, b) => a + b, 0);
  };

  const rollStats = () => {
    const results = Array.from({ length: 6 }, roll4d6DropLowest);
    setRolledStats(results);
    const updated = { ...attributes };
    attributesList.forEach((attr, idx) => {
      updated[attr] = results[idx];
    });
    setAttributes(updated);
  };

  const useStandardArray = () => {
    const updated = { ...attributes };
    attributesList.forEach((attr, idx) => {
      updated[attr] = standardArray[idx];
    });
    setAttributes(updated);
  };

  const handleContinue = () => {
    setCharacter((prev) => ({
      ...prev,
      attributes,
    }));
    navigate("/create/summary");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">Распределение характеристик</h1>

      {/* Выбор метода */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => { setMethod("standard"); useStandardArray(); }}>
          Стандартный набор
        </Button>
        <Button onClick={() => { setMethod("roll"); rollStats(); }}>
          Бросить кубики
        </Button>
        <Button variant="secondary" disabled>
          Пойнт-Бай (в разработке)
        </Button>
      </div>

      {/* Отображение характеристик */}
      {method && (
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mb-8">
          {attributesList.map((attr) => (
            <Card key={attr} className="p-6 bg-card text-card-foreground">
              <h2 className="text-2xl font-semibold mb-2">{attr}</h2>
              <p className="text-3xl">{attributes[attr] ?? "-"}</p>
              <p className="text-muted-foreground">
                Модификатор: {attributes[attr] ? Math.floor((attributes[attr] - 10) / 2) : "-"}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Кнопки */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => navigate("/create/class")}>
          Назад
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!method}
          className="font-semibold"
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};

export default AttributeDistribution;
