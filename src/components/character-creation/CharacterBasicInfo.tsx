
import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { CharacterSheet } from "@/types/character.d";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import SectionHeader from "@/components/ui/section-header";
import { Label } from "@/components/ui/label";

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
            <Label htmlFor="name" className="text-foreground block mb-2 font-semibold">Имя персонажа</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded bg-background text-foreground"
            />
          </div>

          {/* Пол */}
          <div>
            <Label htmlFor="gender" className="text-foreground block mb-2 font-semibold">Пол</Label>
            <select
              id="gender"
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
            <Label htmlFor="alignment" className="text-foreground block mb-2 font-semibold">Мировоззрение</Label>
            <select
              id="alignment"
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
