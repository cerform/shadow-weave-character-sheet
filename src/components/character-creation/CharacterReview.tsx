
import React from 'react';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';

interface CharacterReviewProps {
  character: Character;
  prevStep?: () => void;
  updateCharacter: (updates: Partial<Character>) => void;
  setCurrentStep: (step: number) => void;
  onSaveCharacter?: () => Promise<void>;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ 
  character, 
  prevStep, 
  updateCharacter,
  setCurrentStep,
  onSaveCharacter
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Обработчик сохранения персонажа
  const handleSaveCharacter = async () => {
    try {
      console.log('Сохранение персонажа:', character);
      
      if (onSaveCharacter) {
        // Используем функцию сохранения из родительского компонента
        await onSaveCharacter();
      } else {
        // Fallback на старый метод
        const { useCharacter } = await import('@/contexts/CharacterContext');
        const context = useCharacter();
        const savedCharacter = await context.saveCharacter(character);
        
        toast({
          title: "Персонаж сохранен",
          description: `${character.name} успешно сохранен!`,
        });
        
        navigate(`/character-sheet/${savedCharacter.id}`);
      }
    } catch (error) {
      console.error('Ошибка сохранения персонажа:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении персонажа",
        variant: "destructive"
      });
    }
  };
  
  // Функция для отображения характеристик персонажа
  const renderAbilityScores = () => {
    if (!character.abilities) return null;
    
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="font-bold">СИЛ</div>
          <div>{character.abilities.STR || character.abilities.strength || 10}</div>
        </div>
        <div className="text-center">
          <div className="font-bold">ЛОВ</div>
          <div>{character.abilities.DEX || character.abilities.dexterity || 10}</div>
        </div>
        <div className="text-center">
          <div className="font-bold">ТЕЛ</div>
          <div>{character.abilities.CON || character.abilities.constitution || 10}</div>
        </div>
        <div className="text-center">
          <div className="font-bold">ИНТ</div>
          <div>{character.abilities.INT || character.abilities.intelligence || 10}</div>
        </div>
        <div className="text-center">
          <div className="font-bold">МДР</div>
          <div>{character.abilities.WIS || character.abilities.wisdom || 10}</div>
        </div>
        <div className="text-center">
          <div className="font-bold">ХАР</div>
          <div>{character.abilities.CHA || character.abilities.charisma || 10}</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Просмотр персонажа</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Основные сведения</h3>
            <p>Имя: {character.name || "Не указано"}</p>
            <p>Раса: {character.race || "Не указано"}</p>
            {character.subrace && <p>Подраса: {character.subrace}</p>}
            <p>Класс: {character.class || "Не указано"}</p>
            <p>Уровень: {character.level || 1}</p>
            <p>Предыстория: {character.background || "Не указано"}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Характеристики</h3>
            {renderAbilityScores()}
          </div>
          
          <div>
            <h3 className="font-semibold">Здоровье</h3>
            <p>Максимум HP: {character.hitPoints?.maximum || character.maxHp || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        {prevStep && (
          <Button onClick={prevStep} variant="outline">
            Назад
          </Button>
        )}
        <Button onClick={handleSaveCharacter}>
          Завершить создание
        </Button>
      </div>
    </div>
  );
};

export default CharacterReview;
