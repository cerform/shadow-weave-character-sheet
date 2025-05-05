
import React, { useState, useMemo } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { Character } from "@/types/character.d";
import type { CharacterSheet } from '@/utils/characterImports';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import SectionHeader from "@/components/ui/section-header";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";

interface CharacterBasicInfoProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
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
  
  // Получаем текущие стили темы
  const { themeStyles } = useTheme();
  
  // Мемоизируем стили для предотвращения мерцания
  const selectStyle = useMemo(() => ({
    color: themeStyles?.textColor || '#E3F2FD',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: `${themeStyles?.accent}50` || 'rgba(255, 255, 255, 0.1)'
  }), [themeStyles]);
  
  // Мемоизируем стили для опций
  const optionStyle = useMemo(() => ({
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: themeStyles?.textColor || '#E3F2FD',
  }), [themeStyles]);

  const handleNext = () => {
    updateCharacter({ name, gender, alignment });
    nextStep();
  };

  const allowContinue = name.trim() !== "" && gender.trim() !== "" && alignment.trim() !== "";

  return (
    <div>
      <SectionHeader
        title="Основная информация"
        description="Введите имя персонажа, выберите пол и мировоззрение."
      />

      <Card className="mb-8">
        <CardContent className="p-6 space-y-6">
          {/* Имя */}
          <div>
            <Label htmlFor="name" className="block mb-2 font-semibold">Имя персонажа</Label>
            <Input
              id="name"
              name="character-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Пол */}
          <div>
            <Label htmlFor="gender" className="block mb-2 font-semibold">Пол</Label>
            <select
              id="gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border rounded"
              style={selectStyle}
            >
              <option value="" style={optionStyle}>Выберите пол</option>
              <option value="Мужской" style={optionStyle}>Мужской</option>
              <option value="Женский" style={optionStyle}>Женский</option>
              <option value="Другое" style={optionStyle}>Другое</option>
            </select>
          </div>

          {/* Мировоззрение */}
          <div>
            <Label htmlFor="alignment" className="block mb-2 font-semibold">Мировоззрение</Label>
            <select
              id="alignment"
              name="alignment"
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              className="w-full p-2 border rounded"
              style={selectStyle}
            >
              <option value="" style={optionStyle}>Выберите мировоззрение</option>
              <option value="Законопослушный Добрый" style={optionStyle}>Законопослушный Добрый</option>
              <option value="Нейтральный Добрый" style={optionStyle}>Нейтральный Добрый</option>
              <option value="Хаотичный Добрый" style={optionStyle}>Хаотичный Добрый</option>
              <option value="Законопослушный Нейтральный" style={optionStyle}>Законопослушный Нейтральный</option>
              <option value="Истинно Нейтральный" style={optionStyle}>Истинно Нейтральный</option>
              <option value="Хаотичный Нейтральный" style={optionStyle}>Хаотичный Нейтральный</option>
              <option value="Законопослушный Злой" style={optionStyle}>Законопослушный Злой</option>
              <option value="Нейтральный Злой" style={optionStyle}>Нейтральный Злой</option>
              <option value="Хаотичный Злой" style={optionStyle}>Хаотичный Злой</option>
            </select>
          </div>
        </CardContent>
      </Card>

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
