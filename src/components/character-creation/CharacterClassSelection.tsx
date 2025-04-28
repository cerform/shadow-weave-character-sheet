import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";

const classes = [
  { name: "Варвар", description: "Воин ярости и силы." },
  { name: "Бард", description: "Мастер магии и вдохновения." },
  { name: "Жрец", description: "Служитель божественной магии." },
  { name: "Друид", description: "Мастер природы и превращений." },
  { name: "Боец", description: "Опытный воин любого оружия." },
  { name: "Монах", description: "Воин тела и духа." },
  { name: "Паладин", description: "Святой рыцарь в служении." },
  { name: "Следопыт", description: "Мастер выживания и охоты." },
  { name: "Плут", description: "Ловкий вор и скрытный мастер." },
  { name: "Чародей", description: "Маг врожденной силы." },
  { name: "Чернокнижник", description: "Заключивший пакт с сущностью маг." },
  { name: "Волшебник", description: "Мастер изученной магии." },
];

interface CharacterClassSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterClassSelection: React.FC<CharacterClassSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(character.class || "");

  const handleNext = () => {
    if (selectedClass) {
      updateCharacter({ class: selectedClass });
      nextStep();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите класс</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {classes.map((cls) => (
          <button
            key={cls.name}
            onClick={() => setSelectedClass(cls.name)}
            className={`p-4 border rounded ${
              selectedClass === cls.name ? "bg-green-500 text-white" : "bg-background"
            }`}
          >
            <div className="font-semibold">{cls.name}</div>
            <div className="text-sm text-muted-foreground">{cls.description}</div>
          </button>
        ))}
      </div>

      <NavigationButtons
        allowNext={!!selectedClass}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterClassSelection;
