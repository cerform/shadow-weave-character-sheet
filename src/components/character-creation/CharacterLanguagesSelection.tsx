
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { 
  SelectionSubOption, 
  SelectionSubOptionsContainer 
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";

interface CharacterLanguagesSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterLanguagesSelection: React.FC<CharacterLanguagesSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(character.languages || ["Общий"]);
  const [selectedProficiencies, setSelectedProficiencies] = useState<string[]>(character.proficiencies || []);
  
  // Языки в D&D 5e
  const languages = [
    "Общий", "Эльфийский", "Дварфийский", "Гномий", "Полуросликов", 
    "Орочий", "Гоблинский", "Драконий", "Великаний", "Бездны",
    "Глубинная речь", "Небесный", "Инфернальный", "Первичный", "Сильван"
  ];

  // Навыки в D&D 5e
  const skills = [
    "Атлетика", "Акробатика", "Ловкость рук", "Скрытность", "Магия",
    "История", "Анализ", "Природа", "Религия", "Обращение с животными",
    "Проницательность", "Медицина", "Восприятие", "Выживание", "Обман",
    "Запугивание", "Выступление", "Убеждение"
  ];

  const classProficiencies: Record<string, string[]> = {
    "Воин": ["Атлетика", "Выживание", "Восприятие", "Запугивание"],
    "Волшебник": ["Магия", "История", "Анализ", "Религия"],
    "Жрец": ["Религия", "Медицина", "Проницательность", "Убеждение"],
    "Бард": ["Выступление", "Убеждение", "История", "Ловкость рук"],
    "Плут": ["Скрытность", "Ловкость рук", "Обман", "Восприятие"],
    // Добавьте другие классы по необходимости
  };

  const [availableProficiencies, setAvailableProficiencies] = useState<string[]>([]);

  useEffect(() => {
    // Установка навыков на основе класса
    if (character.class && classProficiencies[character.class]) {
      setAvailableProficiencies(classProficiencies[character.class]);
    } else {
      setAvailableProficiencies(skills);
    }
  }, [character.class]);

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (lang === "Общий") return; // Нельзя убрать Общий язык
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      if (selectedLanguages.length < 3) { // Максимум 3 языка
        setSelectedLanguages([...selectedLanguages, lang]);
      }
    }
  };

  const toggleProficiency = (prof: string) => {
    if (selectedProficiencies.includes(prof)) {
      setSelectedProficiencies(selectedProficiencies.filter(p => p !== prof));
    } else {
      if (selectedProficiencies.length < 4) { // Максимум 4 навыка
        setSelectedProficiencies([...selectedProficiencies, prof]);
      }
    }
  };

  const handleNext = () => {
    updateCharacter({ 
      languages: selectedLanguages,
      proficiencies: selectedProficiencies
    });
    nextStep();
  };

  return (
    <div>
      <SectionHeader
        title="Выберите языки и навыки"
        description="Определите, какими языками и навыками владеет ваш персонаж."
      />
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2">Языки (максимум 3)</h3>
          <p className="mb-4 text-muted-foreground">
            Выберите языки, которыми владеет ваш персонаж.
          </p>
          
          <SelectionSubOptionsContainer className="mb-4">
            {languages.map((lang) => (
              <SelectionSubOption
                key={lang}
                label={lang}
                selected={selectedLanguages.includes(lang)}
                onClick={() => toggleLanguage(lang)}
              />
            ))}
          </SelectionSubOptionsContainer>
          
          <div className="mb-6">
            <h4 className="font-medium mb-1">Выбранные языки:</h4>
            <ul className="list-disc pl-5">
              {selectedLanguages.map((lang, idx) => (
                <li key={idx}>{lang}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2">Навыки (максимум 4)</h3>
          <p className="mb-4 text-muted-foreground">
            Выберите навыки, которыми владеет ваш персонаж.
          </p>
          
          <SelectionSubOptionsContainer className="mb-4">
            {availableProficiencies.map((prof) => (
              <SelectionSubOption
                key={prof}
                label={prof}
                selected={selectedProficiencies.includes(prof)}
                onClick={() => toggleProficiency(prof)}
              />
            ))}
          </SelectionSubOptionsContainer>
          
          <div>
            <h4 className="font-medium mb-1">Выбранные навыки:</h4>
            <ul className="list-disc pl-5">
              {selectedProficiencies.length > 0 ? (
                selectedProficiencies.map((prof, idx) => (
                  <li key={idx}>{prof}</li>
                ))
              ) : (
                <li className="text-muted-foreground italic">Не выбрано навыков</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        allowNext={selectedLanguages.length > 0 && selectedProficiencies.length > 0}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterLanguagesSelection;
