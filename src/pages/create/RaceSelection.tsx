// pages/create/RaceSelection.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCharacter } from "@/context/CharacterContext";

const races = [
  {
    name: "Человек",
    description: "Гибкие и универсальные.",
    bonuses: "Все характеристики +1",
    image: "/images/races/human.jpg",
    subraces: [
      { name: "Обычный Человек", description: "+1 ко всем характеристикам." },
      { name: "Вариантный Человек", description: "+1 к двум характеристикам, навык и черта." },
    ],
  },
  {
    name: "Эльф",
    description: "Грациозные, живущие веками.",
    bonuses: "+2 Ловкость",
    image: "/images/races/elf.jpg",
    subraces: [
      { name: "Высокий Эльф", description: "+1 Интеллект, магия." },
      { name: "Лесной Эльф", description: "+1 Мудрость, скрытность." },
      { name: "Тёмный Эльф (Дроу)", description: "+1 Харизма, магия Дроу." },
    ],
  },
  {
    name: "Гном",
    description: "Маленькие, умные и любопытные.",
    bonuses: "+2 Интеллект",
    image: "/images/races/gnome.jpg",
    subraces: [
      { name: "Горный Гном", description: "+2 Телосложение, кузнечное дело." },
      { name: "Лесной Гном", description: "+1 Ловкость, общение с животными." },
    ],
  },
  {
    name: "Дварф",
    description: "Крепкие и стойкие бойцы.",
    bonuses: "+2 Телосложение",
    image: "/images/races/dwarf.jpg",
    subraces: [
      { name: "Горный Дварф", description: "+2 Сила, броня." },
      { name: "Холмовой Дварф", description: "+1 Мудрость, больше здоровья." },
    ],
  },
  {
    name: "Халфлинг",
    description: "Маленькие и очень удачливые.",
    bonuses: "+2 Ловкость",
    image: "/images/races/halfling.jpg",
    subraces: [
      { name: "Лёгконогий", description: "+1 Харизма, скрытность." },
      { name: "Стойкий", description: "+1 Телосложение, сопротивление ядам." },
    ],
  },
  // Остальные расы без подрас (Драконорожденный, Тифлинг, Полуэльф, Полуорк)
];

const RaceSelection = () => {
  const navigate = useNavigate();
  const { setCharacter } = useCharacter();
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedSubrace, setSelectedSubrace] = useState<string | null>(null);

  const race = races.find(r => r.name === selectedRace);

  const handleRaceSelect = (raceName: string) => {
    setSelectedRace(raceName);
    setSelectedSubrace(null); // сбрасываем подрасу если выбрали другую расу
  };

  const handleContinue = () => {
    if (selectedRace) {
      setCharacter({ race: selectedRace, subrace: selectedSubrace || undefined });
      navigate("/create/class");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-8">Выберите расу</h1>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
        {races.map((race) => (
          <Card
            key={race.name}
            className={`p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 ${
              selectedRace === race.name ? "border-primary" : "border-transparent"
            }`}
            onClick={() => handleRaceSelect(race.name)}
          >
            {race.image && (
              <img
                src={race.image}
                alt={race.name}
                className="rounded mb-4 object-cover h-40 w-full"
              />
            )}
            <h2 className="text-2xl font-semibold mb-2">{race.name}</h2>
            <p className="text-muted-foreground mb-2">{race.description}</p>
            <p className="text-sm text-primary">{race.bonuses}</p>
          </Card>
        ))}
      </div>

      {/* Если у выбранной расы есть подрасы */}
      {race?.subraces && (
        <>
          <h2 className="text-3xl font-bold mt-10 mb-4">Выберите подрасу</h2>
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
            {race.subraces.map((subrace) => (
              <Card
                key={subrace.name}
                className={`p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 ${
                  selectedSubrace === subrace.name ? "border-primary" : "border-transparent"
                }`}
                onClick={() => setSelectedSubrace(subrace.name)}
              >
                <h3 className="text-xl font-semibold mb-2">{subrace.name}</h3>
                <p className="text-muted-foreground">{subrace.description}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-4 mt-10">
        <Button variant="secondary" onClick={() => navigate("/create")}>
          Назад
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedRace || (race?.subraces && !selectedSubrace)}
          className="font-semibold"
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};

export default RaceSelection;
