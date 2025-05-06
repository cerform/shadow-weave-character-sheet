import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/mobile-app/MobileAppLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { CircleCheck, ArrowRight, Save } from 'lucide-react';
import { Character } from '@/types/character';
import { createCharacter } from '@/lib/supabase';
import { getCurrentUid } from '@/utils/authHelpers';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';

// Импорт компонентов для шагов создания
import CharacterRaceSelection from '@/components/character-creation/CharacterRaceSelection';
import CharacterSubraceSelection from '@/components/character-creation/CharacterSubraceSelection';
import CharacterClassSelection from '@/components/character-creation/CharacterClassSelection';
import CharacterLevelSelection from '@/components/character-creation/CharacterLevelSelection';
import CharacterAbilityScores from '@/components/character-creation/CharacterAbilityScores';
import CharacterBackgroundSelection from '@/components/character-creation/CharacterBackgroundSelection';
import CharacterHitPointsCalculator from '@/components/character-creation/CharacterHitPointsCalculator';
import CharacterEquipment from '@/components/character-creation/CharacterEquipment';
import CharacterBasicInfo from '@/components/character-creation/CharacterBasicInfo';
import CharacterSpellSelection from '@/components/character-creation/CharacterSpellSelection';
import CharacterSummary from '@/components/character-creation/CharacterSummary';

const MobileCharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { character, updateCharacter, isMagicClass } = useCharacterCreation();
  const [activeTab, setActiveTab] = useState('race');
  const [isLoading, setIsLoading] = useState(false);
  
  // Определяем доступные вкладки и их статус
  const tabs = [
    { id: 'race', label: 'Раса', isCompleted: !!character.race },
    { id: 'subrace', label: 'Подраса', isCompleted: !needsSubrace() || !!character.subrace },
    { id: 'class', label: 'Класс', isCompleted: !!character.class },
    { id: 'level', label: 'Уровень', isCompleted: !!character.level && character.level > 0 },
    { id: 'abilities', label: 'Характеристики', isCompleted: hasAbilities() },
    { id: 'background', label: 'Предыстория', isCompleted: !!character.background },
    { id: 'hitpoints', label: 'Здоровье', isCompleted: !!character.maxHp && character.maxHp > 0 },
    { id: 'equipment', label: 'Снаряжение', isCompleted: !!character.equipment },
    { id: 'details', label: 'Детали', isCompleted: !!character.name },
    { id: 'spells', label: 'Заклинания', isCompleted: !isMagicClass() || hasSpells() },
    { id: 'summary', label: 'Завершение' },
  ];
  
  // Вспомогательные функции для проверки заполненных полей
  function needsSubrace() {
    // Логика определения, нужна ли подраса для выбранной расы
    return false; // Замените на реальную логику
  }
  
  function hasAbilities() {
    return character.strength !== 10 || 
           character.dexterity !== 10 || 
           character.constitution !== 10 || 
           character.intelligence !== 10 || 
           character.wisdom !== 10 || 
           character.charisma !== 10;
  }
  
  function hasSpells() {
    return Array.isArray(character.spells) && character.spells.length > 0;
  }
  
  // Перейти к следующей вкладке
  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
      // Скроллим вверх для лучшего UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Сохранить персонажа
  const handleSaveCharacter = async () => {
    setIsLoading(true);
    try {
      const uid = getCurrentUid();
      if (!uid) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему для сохранения персонажа.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Проверка обязательных полей
      if (!character.name || !character.race || !character.class) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля (Имя, Раса, Класс).",
          variant: "destructive",
        });
        return;
      }

      // Преобразуем и сохраняем персонажа
      const characterToSave: Character = {
        ...character,
        userId: uid
      };

      const newCharacter = await createCharacter(characterToSave);

      if (newCharacter) {
        toast({
          title: "Персонаж сохранен!",
          description: "Ваш персонаж успешно сохранен.",
        });
        navigate(`/character-sheet/${newCharacter.id}`);
      } else {
        toast({
          title: "Ошибка сохранения",
          description: "Не удалось сохранить персонажа. Попробуйте еще раз.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении персонажа.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Получаем компонент для текущей вкладки
  const getTabContent = (tabId: string) => {
    switch (tabId) {
      case 'race':
        return <CharacterRaceSelection character={character} onUpdate={(updates: Partial<Character>) => updateCharacter(updates)} />;
      case 'subrace':
        return needsSubrace() ? 
          <CharacterSubraceSelection character={character} onUpdate={(updates: Partial<Character>) => updateCharacter(updates)} /> :
          <div className="text-center py-4">
            <p>Выбранная раса не имеет подрас.</p>
            <Button onClick={goToNextTab} className="mt-4">Перейти к следующему шагу</Button>
          </div>;
      case 'class':
        return <CharacterClassSelection character={character} onUpdate={(updates: Partial<Character>) => updateCharacter(updates)} />;
      case 'level':
        return <CharacterLevelSelection character={character} onUpdate={updateCharacter} />;
      case 'abilities':
        return <CharacterAbilityScores character={character} onUpdate={updateCharacter} />;
      case 'background':
        return <CharacterBackgroundSelection character={character} onUpdate={updateCharacter} />;
      case 'hitpoints':
        return <CharacterHitPointsCalculator character={character} onUpdate={updateCharacter} />;
      case 'equipment':
        return <CharacterEquipment character={character} onUpdate={updateCharacter} />;
      case 'details':
        return <CharacterBasicInfo character={character} onUpdate={updateCharacter} />;
      case 'spells':
        return isMagicClass() ? 
          <CharacterSpellSelection character={character} onUpdate={updateCharacter} /> : 
          <div className="text-center py-4">
            <p>Этот класс не использует заклинания.</p>
            <Button onClick={goToNextTab} className="mt-4">Перейти к следующему шагу</Button>
          </div>;
      case 'summary':
        return <CharacterSummary character={character} onSave={handleSaveCharacter} isLoading={isLoading} />;
      default:
        return null;
    }
  };
  
  // Определяем, показывать ли кнопку "Далее"
  const showNextButton = activeTab !== 'summary';
  const isTabCompleted = tabs.find(tab => tab.id === activeTab)?.isCompleted;
  
  return (
    <MobileAppLayout fullHeight>
      <div className="flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-4">Создание персонажа</h1>
        
        {/* Индикатор прогресса */}
        <div className="mb-4 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <div 
                key={tab.id}
                className={`relative flex items-center justify-center h-8 w-8 rounded-full border transition-colors cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : tab.isCompleted 
                      ? 'border-primary/50 bg-primary/10 text-primary' 
                      : 'border-muted bg-muted/30'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.isCompleted ? (
                  <CircleCheck className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{tabs.indexOf(tab) + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-2">
          <h2 className="text-lg font-medium">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
        </div>
        
        {/* Содержимое текущей вкладки */}
        <div className="flex-grow">
          {getTabContent(activeTab)}
        </div>
        
        {/* Кнопки навигации */}
        {showNextButton && (
          <div className="flex justify-end mt-6">
            <Button
              onClick={goToNextTab}
              disabled={!isTabCompleted}
              className="flex items-center"
            >
              Далее
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        {activeTab === 'summary' && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSaveCharacter}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? "Сохранение..." : "Сохранить персонажа"}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <FloatingDiceButton />
    </MobileAppLayout>
  );
};

export default MobileCharacterCreationPage;
