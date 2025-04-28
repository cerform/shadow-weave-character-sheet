import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";

interface CharacterBasicInfoProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterBasicInfo: React.FC<CharacterBasicInfoProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [name, setName] = useState<string>(character.name || "");
  const [gender, setGender] = useState<string>(character.gender || "");
  const [alignment, setAlignment] = useState<string>(character.alignment || "");

  const handleNext = () => {
    updateCharacter({ name, gender, alignment });
    nextStep();
  };

  const allowContinue = name.trim() !== "" && gender.trim() !== "" && alignment.trim() !== "";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Основная информация</h2>
      <p className="mb-6 text-muted-foreground">
        Введите имя персонажа, выберите пол и мировоззрение.
      </p>

      <div className="space-y-6 mb-8">
        {/* Имя */}
        <div>
          <label className="block mb-2 font-semibold">Имя персонажа</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded bg-background text-foreground"
          />
        </div>

        {/* Пол */}
        <div>
          <label className="block mb-2 font-semibold">Пол</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 border rounded bg-background text-foreground"
          >
            <option value="">Выберите пол</option>
            <option value="Мужской">Мужской</option>
            <option value="Женский">Женский</option>
            <option value="Другое">Другое</option>
          </select>
        </div>

        {/* Мировоззрение */}
        <div>
          <label className="block mb-2 font-semibold">Мировоззрение</label>
          <select
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
            className="w-full p-2 border rounded bg-background text-foreground"
          >
            <option value="">Выберите мировоззрение</option>
            <option value="Законопослушный Добрый">Законопослушный Добрый</option>
            <option value="Нейтральный Добрый">Нейтральный Добрый</option>
            <option value="Хаотичный Добрый">Хаотичный Добрый</option>
            <option value="Законопослушный Нейтральный">Законопослушный Нейтральный</option>
            <option value="Истинно Нейтральный">Истинно Нейтральный</option>
            <option value="Хаотичный Нейтральный">Хаотичный Нейтральный</option>
            <option value="Законопослушный Злой">Законопослушный Злой</option>
            <option value="Нейтральный Злой">Нейтральный Злой</option>
            <option value="Хаотичный Злой">Хаотичный Злой</option>
          </select>
        </div>
      </div>

      {/* КНОПКИ НАВИГАЦИИ */}
      <NavigationButtons
        allowNext={allowContinue}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterBasicInfo;
