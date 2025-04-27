// pages/create/ClassSelection.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCharacter } from "@/context/CharacterContext";

const classes = [
  {
    name: "Варвар",
    description: "Сильные воины, полагающиеся на ярость.",
    hitDice: "d12",
    image: "/images/classes/barbarian.jpg",
  },
  {
    name: "Бард",
    description: "Мастера вдохновения и магии.",
    hitDice: "d8",
    image: "/images/classes/bard.jpg",
  },
  {
    name: "Клирик",
    description: "Священные заклинатели, служащие богам.",
    hitDice: "d8",
    image: "/images/classes/cleric.jpg",
  },
  {
    name: "Друид",
    description: "Мудрые стражи природы.",
    hitDice: "d8",
    image: "/images/classes/druid.jpg",
  },
  {
    name: "Боец",
    description: "Мастера оружия и тактики.",
    hitDice: "d10",
    image: "/images/classes/fighter.jpg",
  },
  {
    name: "Монах",
    description: "Боевые мастера духа и тела.",
    hitDice: "d8",
    image: "/images/classes/monk.jpg",
  },
  {
    name: "Паладин",
    description: "Священные воины, держащие клятву.",
    hitDice: "d10",
    image: "/images/classes/paladin.jpg",
  },
  {
    name: "Следопыт",
    description: "Охотники, исследователи и защитники дикой природы.",
    hitDice: "d10",
    image: "/images/classes/ranger.jpg",
  },
  {
    name: "Плут",
    description: "Мастера скрытности и ловушек.",
    hitDice: "d8",
    image: "/images/classes/rogue.jpg",
  },
  {
    name: "Колдун",
    description: "Заклинатели, обладающие врождённой магией.",
    hitDice: "d6",
    image: "/images/classes/sorcerer.jpg",
  },
  {
    name: "Чернокнижник",
    description: "Пользователи магии, заключившие пакт.",
    hitDice: "d8",
    image: "/images/classes/warlock.jpg",
  },
  {
    name: "Волшебник",
    description: "Учёные маги и мастера заклинаний.",
    hitDice: "d6",
    image: "/images/classes/wizard.jpg",
  },
];

const ClassSelection = () => {
  const navigate = useNavigate();
  const { setCharacter } = useCharacter();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const handleClassSelect = (cls: string) => {
    setSelectedClass(cls);
  };

  const handleContinue = () => {
    if (selectedClass) {
      setCharacter({ class: selectedClass });
      navigate("/create/attributes");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-8">Выберите класс</h1>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        {classes.map((cls) => (
          <Card
            key={cls.name}
            className={`p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 ${
              selectedClass === cls.name ? "border-primary" : "border-transparent"
            }`}
            onClick={() => handleClassSelect(cls.name)}
          >
            {/* Картинка */}
            {cls.image && (
              <img
                src={cls.image}
                alt={cls.name}
                className="rounded mb-4 object-cover h-40 w-full"
              />
            )}
            <h2 className="text-2xl font-semibold mb-2">{cls.name}</h2>
            <p className="text-muted-foreground mb-2">{cls.description}</p>
            <p className="text-sm text-primary">Кость хитов: {cls.hitDice}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 mt-10">
        <Button variant="secondary" onClick={() => navigate("/create/race")}>
          Назад
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedClass}
          className="font-semibold"
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};

export default ClassSelection;
