import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';
import { CharacterSheet } from '@/types/character';

interface Props {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
}

const CharacterReview: React.FC<Props> = ({ character, prevStep, updateCharacter, setCurrentStep }) => {
  const { toast } = useToast();

  // Конвертируем заклинания в строки для отображения
  const formatSpells = (spells: CharacterSheet['spells'] | string[]): JSX.Element => {
    if (!spells || spells.length === 0) return <span className="text-muted-foreground">Нет выбранных заклинаний</span>;
    
    return (
      <div className="space-y-1">
        {spells.map((spell, index) => {
          // Проверяем тип spell и преобразуем в строку
          const spellName = typeof spell === 'string' 
            ? spell 
            : spell.name;
          
          return (
            <div key={index} className="text-sm">
              {spellName}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Основные характеристики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Имя: {character.name}</div>
              <div className="text-sm">Класс: {character.class || character.className}</div>
              <div className="text-sm">Раса: {character.race}</div>
              <div className="text-sm">Уровень: {character.level}</div>
              <div className="text-sm">Мировоззрение: {character.alignment}</div>
              <div className="text-sm">Предыстория: {character.background}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Характеристики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Сила: {character.abilities?.strength || character.abilities?.STR}</div>
              <div className="text-sm">Ловкость: {character.abilities?.dexterity || character.abilities?.DEX}</div>
              <div className="text-sm">Телосложение: {character.abilities?.constitution || character.abilities?.CON}</div>
              <div className="text-sm">Интеллект: {character.abilities?.intelligence || character.abilities?.INT}</div>
              <div className="text-sm">Мудрость: {character.abilities?.wisdom || character.abilities?.WIS}</div>
              <div className="text-sm">Харизма: {character.abilities?.charisma || character.abilities?.CHA}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Отображение заклинаний с использованием formatSpells */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Заклинания</CardTitle>
            </CardHeader>
            <CardContent>
              {formatSpells(character.spells || [])}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Снаряжение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {character.equipment && character.equipment.length > 0 ? (
                character.equipment.map((item, index) => (
                  <div key={index} className="text-sm">{item}</div>
                ))
              ) : (
                <span className="text-muted-foreground">Нет выбранного снаряжения</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CharacterReview;
