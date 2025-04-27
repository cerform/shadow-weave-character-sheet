// src/pages/create/RaceSelection.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCharacter } from "@/context/CharacterContext";

const races = [
  {
    name: "Человек",
    description: "Гибкие и универсальные. +1 ко всем характеристикам.",
    bonuses: "+1 ко всем характеристикам",
    image: "https://images.unsplash.com/photo-1597423244010-73b4429b5b4f?fit=crop&w=600&q=80",
  },
  {
    name: "Эльф",
    description: "Грациозные, живущие веками. +2 к Ловкости.",
    bonuses: "+2 Ловкость",
    image: "https://images.unsplash.com/photo-1622519400870-2c803f84e4f2?fit=crop&w=600&q=80",
  },
  {
    name: "Дварф",
    description: "Стойкие и выносливые. +2 к Телосложению.",
    bonuses: "+2 Телосложение",
    image: "https://images.unsplash.com/photo-1635322102825-2b32e1b07dca?fit=crop&w=600&q=80",
  },
  {
    name: "Халфлинг",
    description: "Маленькие и быстрые. +2 к Ловкости.",
    bonuses: "+2 Ловкость",
    image: "https://images.unsplash.com/photo-1612549396348-93e9e7c5e719?fit=crop&w=600&q=80",
  },
  {
    name: "Драконорожденный",
    description: "Сильные и гордые. +2 к Силе, +1 к Харизме.",
    bonuses: "+2 Сила, +1 Харизма",
    image: "https://images.unsplash.com/photo-1598470876548-94f18a1e64f5?fit=crop&w=600&q=80",
  },
  {
    name: "Гном",
    description: "Маленькие, умные и ловкие. +2 к Интеллекту.",
    bonuses: "+2 Интеллект",
    image: "https://images.unsplash.com/photo-1640451062232-4c29f1b6b8f5?fit=crop&w=600&q=80",
  },
  {
    name: "Полуэльф",
    description: "Гибкие и очаровательные. +2 к Харизме, +1 к двум характеристикам по выбору.",
    bonuses: "+2 Харизма, +1 к двум характеристикам",
    image: "https://images.unsplash.com/photo-1612947294037-62d6b3ed2de0?fit=crop&w=600&q=80",
  },
  {
    name: "Полуорк",
    description: "Сильные и яростные. +2 к Силе, +1 к Телосложению.",
    bonuses: "+2 Сила, +1 Телосложение",
    image: "https://images.unsplash.com/photo-1638039465193-1bba89980436?fit=crop&w=600&q=80",
  },
  {
    name: "Тифлинг",
    description: "Таинственные наследники инфернального наследия. +2 Харизма, +1 Интеллект.",
    bonuses: "+2 Харизма, +1 Интеллект",
    image: "https://images.unsplash.com/photo-1623776054262-d2f69e2d6e49?fit=crop&w=600&q=80",
  },
];

const RaceSelection = () => {
  const navigate = useNavigate();
  const { setCharacter } = useCharacter();

  const handleRaceSelect = (race: string) => {
    setCharacter((prev) => ({ ...prev, race }));
    navigate("/create/class");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">Выберите расу</h1>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
        {races.map((race) => (
          <Card
            key={race.name}
            className="bg-card text-card-foreground p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleRaceSelect(race.name)}
          >
            <img
              src={race.image}
              alt={race.name}
              className="rounded mb-4 object-cover h-48 w-full"
            />
            <h2 className="text-2xl font-semibold mb-2">{race.name}</h2>
            <p className="text-muted-foreground mb-2">{race.description}</p>
            <p className="text-sm text-primary">{race.bonuses}</p>
          </Card>
        ))}
      </div>

      <Button
        variant="secondary"
        className="mt-8"
        onClick={() => navigate("/create")}
      >
        Назад
      </Button>
    </div>
  );
};

export default RaceSelection;
