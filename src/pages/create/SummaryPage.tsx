// src/pages/create/SummaryPage.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCharacter } from "@/context/CharacterContext";

const SummaryPage = () => {
  const navigate = useNavigate();
  const { character } = useCharacter();

  if (!character) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-6">Персонаж не найден</h1>
        <Button onClick={() => navigate("/create")}>Создать нового персонажа</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">Ваш персонаж готов!</h1>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mb-8">
        {/* Раса */}
        <Card className="p-6 bg-card text-card-foreground">
          <h2 className="text-2xl font-semibold mb-4">Раса</h2>
          <p className="text-xl">{character.race ?? "-"}</p>
        </Card>

        {/* Класс */}
        <Card className="p-6 bg-card text-card-foreground">
          <h2 className="text-2xl font-semibold mb-4">Класс</h2>
          <p className="text-xl">{character.class ?? "-"}</p>
        </Card>

        {/* Характеристики */}
        <Card className="p-6 bg-card text-card-foreground md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Характеристики</h2>
          <div className="grid grid-cols-2 gap-4">
            {character.attributes &&
              Object.entries(character.attributes).map(([attr, value]) => (
                <div key={attr} className="flex justify-between">
                  <span>{attr}</span>
                  <span className="font-semibold">{value} ({Math.floor((value - 10) / 2) >= 0 ? "+" : ""}{Math.floor((value - 10) / 2)})</span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => navigate("/create/attributes")}>
          Назад
        </Button>
        <Button onClick={() => navigate("/")}>
          На главную
        </Button>
      </div>
    </div>
  );
};

export default SummaryPage;
