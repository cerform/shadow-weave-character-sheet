// src/pages/create/ClassSelection.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCharacter } from "@/context/CharacterContext";

const classes = [
  {
    name: "Варвар",
    description: "Дикий воин, полагающийся на ярость и силу.",
    image: "https://images.unsplash.com/photo-1573399168010-3e2b55f7f03b?fit=crop&w=600&q=80",
  },
  {
    name: "Бард",
    description: "Музыкант и заклинатель, вдохновляющий союзников.",
    image: "https://images.unsplash.com/photo-1549833074-1739f5c8d1b7?fit=crop&w=600&q=80",
  },
  {
    name: "Клирик",
    description: "Священный воин, черпающий силы у божества.",
    image: "https://images.unsplash.com/photo-1604430350700-560578ebd2a3?fit=crop&w=600&q=80",
  },
  {
    name: "Друид",
    description: "Хранитель природы и маг дикой природы.",
    image: "https://images.unsplash.com/photo-1616123602461-21eaf4c2b5d3?fit=crop&w=600&q=80",
  },
  {
    name: "Боец",
    description: "Мастер тактики и владения оружием.",
    image: "https://images.unsplash.com/photo-1579613832129-6c3c89e3d780?fit=crop&w=600&q=80",
  },
  {
    name: "Монах",
    description: "Воин духа и тела, сражающийся без оружия.",
    image: "https://images.unsplash.com/photo-1589055309334-3ab5c188e41e?fit=crop&w=600&q=80",
  },
  {
    name: "Паладин",
    description: "Рыцарь с священной миссией, борец со злом.",
    image: "https://images.unsplash.com/photo-1549921296-3a2c5c3fbc57?fit=crop&w=600&q=80",
  },
  {
    name: "Следопыт",
    description: "Мастер выслеживания и стрельбы из лука.",
    image: "https://images.unsplash.com/photo-1578332991875-beb07b3048a5?fit=crop&w=600&q=80",
  },
  {
    name: "Плут",
    description: "Ловкач, мастер скрытности и ловушек.",
    image: "https://images.unsplash.com/photo-1589254065923-79a6b0a6fb0c?fit=crop&w=600&q=80",
  },
  {
    name: "Чародей",
    description: "Заклинатель, черпающий магию из внутренней силы.",
    image: "https://images.unsplash.com/photo-1613685147034-cdf5b9c153bb?fit=crop&w=600&q=80",
  },
  {
    name: "Колдун",
    description: "Заключивший сделку с могущественным существом.",
    image: "https://images.unsplash.com/photo-1595231760053-1d0bba01a4ef?fit=crop&w=600&q=80",
  },
  {
    name: "Волшебник",
    description: "Учёный маг, владеющий тайнами магии.",
    image: "https://images.unsplash.com/photo-1618496194757-83c7f6a626d7?fit=crop&w=600&q=80",
  },
];

const ClassSelection = () => {
  const navigate = useNavigate();
  const { setCharacter } = useCharacter();

  const handleClassSelect = (selectedClass: string) => {
    setCharacter((prev) => ({ ...prev, class: selectedClass }));
    navigate("/create/attributes");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">Выберите класс</h1>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
        {classes.map((cls) => (
          <Card
            key={cls.name}
            className="bg-card text-card-foreground p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleClassSelect(cls.name)}
          >
            <img
              src={cls.image}
              alt={cls.name}
              className="rounded mb-4 object-cover h-48 w-full"
            />
            <h2 className="text-2xl font-semibold mb-2">{cls.name}</h2>
            <p className="text-muted-foreground">{cls.description}</p>
          </Card>
        ))}
      </div>

      <Button
        variant="secondary"
        className="mt-8"
        onClick={() => navigate("/create/race")}
      >
        Назад
      </Button>
    </div>
  );
};

export default ClassSelection;
