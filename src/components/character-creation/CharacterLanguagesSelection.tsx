
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { 
  SelectionSubOption, 
  SelectionSubOptionsContainer 
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
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
      
      <Card className="mb-8" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', borderColor: currentTheme.accent }}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Языки</h3>
            <Badge 
              style={{backgroundColor: currentTheme.accent}}
              className="text-white font-medium"
            >
              {selectedLanguages.length}/3
            </Badge>
          </div>
          
          <div className="bg-black/50 p-4 rounded-lg border border-primary/30 mb-4">
            <SelectionSubOptionsContainer className="gap-3 flex-wrap">
              {languages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <div key={lang} className="relative">
                    <SelectionSubOption
                      label={lang}
                      selected={isSelected}
                      onClick={() => toggleLanguage(lang)}
                      style={{
                        backgroundColor: isSelected ? currentTheme.accent : 'rgba(0, 0, 0, 0.6)',
                        color: '#FFFFFF',
                        borderColor: isSelected ? '#FFFFFF' : currentTheme.accent,
                        boxShadow: isSelected ? `0 0 10px ${currentTheme.accent}80` : 'none',
                        paddingRight: isSelected ? '30px' : '12px'
                      }}
                      className={`
                        transition-all duration-200 font-medium
                        ${isSelected ? 'scale-105' : 'hover:bg-white/20'}
                      `}
                    />
                    {isSelected && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </SelectionSubOptionsContainer>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-2 text-white">Выбранные языки:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {selectedLanguages.map((lang, idx) => (
                <li key={idx} className="text-white">{lang}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', borderColor: currentTheme.accent }}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Навыки</h3>
            <Badge 
              style={{backgroundColor: currentTheme.accent}}
              className="text-white font-medium"
            >
              {selectedProficiencies.length}/4
            </Badge>
          </div>
          
          <div className="bg-black/50 p-4 rounded-lg border border-primary/30 mb-4">
            <SelectionSubOptionsContainer className="gap-3 flex-wrap">
              {availableProficiencies.map((prof) => {
                const isSelected = selectedProficiencies.includes(prof);
                return (
                  <div key={prof} className="relative">
                    <SelectionSubOption
                      label={prof}
                      selected={isSelected}
                      onClick={() => toggleProficiency(prof)}
                      style={{
                        backgroundColor: isSelected ? currentTheme.accent : 'rgba(0, 0, 0, 0.6)',
                        color: '#FFFFFF',
                        borderColor: isSelected ? '#FFFFFF' : currentTheme.accent,
                        boxShadow: isSelected ? `0 0 10px ${currentTheme.accent}80` : 'none',
                        paddingRight: isSelected ? '30px' : '12px'
                      }}
                      className={`
                        transition-all duration-200 font-medium
                        ${isSelected ? 'scale-105' : 'hover:bg-white/20'}
                      `}
                    />
                    {isSelected && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </SelectionSubOptionsContainer>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-white">Выбранные навыки:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {selectedProficiencies.length > 0 ? (
                selectedProficiencies.map((prof, idx) => (
                  <li key={idx} className="text-white">{prof}</li>
                ))
              ) : (
                <li className="text-gray-400 italic">Не выбрано навыков</li>
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
