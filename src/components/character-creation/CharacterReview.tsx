
import React from 'react';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Исправляем интерфейс, добавляя updateCharacter
export interface CharacterReviewProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  setCurrentStep: (step: number) => void;
  prevStep?: () => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ 
  character, 
  updateCharacter, 
  setCurrentStep, 
  prevStep 
}) => {
  // Реализация компонента
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Обзор персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Общая информация</h3>
            <p><strong>Имя:</strong> {character.name}</p>
            <p><strong>Раса:</strong> {character.race}</p>
            <p><strong>Класс:</strong> {character.class}</p>
            <p><strong>Уровень:</strong> {character.level}</p>
            <p><strong>Мировоззрение:</strong> {character.alignment}</p>
            <p><strong>Предыстория:</strong> {character.background}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Характеристики</h3>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Сила:</strong> {character.abilities.strength}</p>
              <p><strong>Ловкость:</strong> {character.abilities.dexterity}</p>
              <p><strong>Телосложение:</strong> {character.abilities.constitution}</p>
              <p><strong>Интеллект:</strong> {character.abilities.intelligence}</p>
              <p><strong>Мудрость:</strong> {character.abilities.wisdom}</p>
              <p><strong>Харизма:</strong> {character.abilities.charisma}</p>
            </div>
          </div>
          
          {character.spells && character.spells.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Заклинания</h3>
              <ul className="list-disc list-inside">
                {character.spells.map((spell, index) => (
                  <li key={index}>{typeof spell === 'string' ? spell : spell.name}</li>
                ))}
              </ul>
            </div>
          )}
          
          {character.equipment && character.equipment.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Снаряжение</h3>
              <ul className="list-disc list-inside">
                {character.equipment.map((item, index) => (
                  <li key={index}>{item.name} (x{item.quantity})</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            {prevStep && (
              <Button variant="secondary" onClick={prevStep}>
                Назад
              </Button>
            )}
            <Button>Сохранить персонажа</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterReview;
