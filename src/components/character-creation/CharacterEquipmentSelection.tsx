
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";

interface CharacterEquipmentSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterEquipmentSelection: React.FC<CharacterEquipmentSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(character.equipment || []);
  
  // Базовое снаряжение на основе класса
  const classEquipment: Record<string, string[]> = {
    "Воин": [
      "Цепная кольчуга",
      "Длинный меч и щит",
      "Арбалет и 20 болтов",
      "Набор исследователя подземелий",
      "Два кинжала"
    ],
    "Волшебник": [
      "Посох",
      "Компонентный мешочек",
      "Книга заклинаний",
      "Набор ученого",
      "Кинжал"
    ],
    "Жрец": [
      "Кольчужная рубаха",
      "Щит с символом божества",
      "Булава",
      "Священный символ",
      "Набор священника"
    ],
    "Бард": [
      "Кожаный доспех",
      "Рапира",
      "Музыкальный инструмент",
      "Набор дипломата",
      "Кинжал"
    ],
    "Плут": [
      "Кожаный доспех",
      "Два кинжала",
      "Короткий меч",
      "Воровские инструменты",
      "Набор взломщика"
    ],
    // Добавьте другие классы по необходимости
  };

  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);

  useEffect(() => {
    // Установка снаряжения на основе класса
    if (character.class && classEquipment[character.class]) {
      setAvailableEquipment(classEquipment[character.class]);
    } else {
      setAvailableEquipment([
        "Кожаный доспех",
        "Щит",
        "Короткий меч",
        "Длинный меч",
        "Лук и 20 стрел",
        "Набор путешественника",
        "Кинжал"
      ]);
    }
  }, [character.class]);

  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter((i) => i !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleNext = () => {
    updateCharacter({ equipment: selectedEquipment });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите снаряжение</h2>
      <p className="mb-4 text-muted-foreground">
        Выберите начальное снаряжение для вашего персонажа.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {availableEquipment.map((item) => (
          <button
            key={item}
            onClick={() => toggleEquipment(item)}
            className={`p-3 border rounded ${
              selectedEquipment.includes(item) ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Выбранное снаряжение:</h3>
        <ul className="list-disc pl-5">
          {selectedEquipment.length > 0 ? (
            selectedEquipment.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))
          ) : (
            <li className="text-muted-foreground italic">Не выбрано снаряжение</li>
          )}
        </ul>
      </div>

      <NavigationButtons
        allowNext={true}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterEquipmentSelection;
