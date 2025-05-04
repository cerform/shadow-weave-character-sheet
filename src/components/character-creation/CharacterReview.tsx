
import React from 'react';
import { CharacterSheet } from '@/types/character';
import NavigationButtons from '@/components/character-creation/NavigationButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface CharacterReviewProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  prevStep: () => void;
  onSave: () => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({
  character,
  updateCharacter,
  prevStep,
  onSave,
}) => {
  const handleSave = () => {
    onSave();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Обзор персонажа</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">Основная информация</h3>
              <ul className="space-y-2 mt-2">
                <li><span className="font-medium">Имя:</span> {character.name}</li>
                <li><span className="font-medium">Раса:</span> {character.race}</li>
                <li><span className="font-medium">Класс:</span> {character.class}</li>
                <li><span className="font-medium">Уровень:</span> {character.level}</li>
                <li><span className="font-medium">Предыстория:</span> {character.background}</li>
                <li><span className="font-medium">Мировоззрение:</span> {character.alignment}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Характеристики</h3>
              <ul className="space-y-2 mt-2">
                <li><span className="font-medium">Сила:</span> {character.abilities?.strength}</li>
                <li><span className="font-medium">Ловкость:</span> {character.abilities?.dexterity}</li>
                <li><span className="font-medium">Телосложение:</span> {character.abilities?.constitution}</li>
                <li><span className="font-medium">Интеллект:</span> {character.abilities?.intelligence}</li>
                <li><span className="font-medium">Мудрость:</span> {character.abilities?.wisdom}</li>
                <li><span className="font-medium">Харизма:</span> {character.abilities?.charisma}</li>
              </ul>
            </div>
          </div>
          
          {character.equipment && character.equipment.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Снаряжение</h3>
              <ul className="list-disc list-inside mt-2">
                {character.equipment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {character.spells && character.spells.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Заклинания</h3>
              <ul className="list-disc list-inside mt-2">
                {character.spells.map((spell, index) => (
                  <li key={index}>{typeof spell === 'string' ? spell : spell.name}</li>
                ))}
              </ul>
            </div>
          )}
          
          {character.backstory && (
            <div>
              <h3 className="text-lg font-semibold">История персонажа</h3>
              <p className="mt-2">{character.backstory}</p>
            </div>
          )}
          
          <div className="flex justify-center pt-4">
            <Button onClick={handleSave} size="lg" className="gap-2">
              <Save className="h-5 w-5" />
              Сохранить персонажа
            </Button>
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        prevStep={prevStep}
        nextStep={handleSave}
        nextLabel="Сохранить"
        allowNext={true}
        isFirstStep={false}
        isLastStep={true}
      />
    </div>
  );
};

export default CharacterReview;
