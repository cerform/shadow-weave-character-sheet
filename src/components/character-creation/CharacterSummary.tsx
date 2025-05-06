
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Character, CharacterSpell } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CharacterSummaryProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
  onSave?: () => void;
}

const CharacterSummary: React.FC<CharacterSummaryProps> = ({
  character,
  nextStep,
  prevStep,
  onSave
}) => {
  // Получаем модификатор характеристики
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Форматируем список заклинаний для отображения
  const formatSpells = (spells: (CharacterSpell | string)[] | undefined) => {
    if (!spells || spells.length === 0) return "Нет заклинаний";
    
    // Группируем заклинания по уровням
    const spellsByLevel: Record<number, string[]> = {};
    
    spells.forEach((spell) => {
      const spellLevel = typeof spell === 'string' ? 0 : (spell.level || 0);
      if (!spellsByLevel[spellLevel]) {
        spellsByLevel[spellLevel] = [];
      }
      
      const spellName = typeof spell === 'string' ? spell : spell.name;
      spellsByLevel[spellLevel].push(spellName);
    });
    
    // Формируем строку с заклинаниями по уровням
    return Object.entries(spellsByLevel)
      .sort(([levelA], [levelB]) => parseInt(levelA) - parseInt(levelB))
      .map(([level, spellNames]) => {
        const levelName = level === '0' ? 'Заговоры' : `Уровень ${level}`;
        return `${levelName}: ${spellNames.join(', ')}`;
      })
      .join('\n');
  };
  
  // Форматируем список снаряжения
  const formatEquipment = () => {
    if (!character.equipment) return "Нет снаряжения";
    
    if (Array.isArray(character.equipment)) {
      if (typeof character.equipment[0] === 'string') {
        return (character.equipment as string[]).join(', ');
      } else {
        return (character.equipment as any[]).map(item => item.name || item).join(', ');
      }
    }
    
    const equipment = character.equipment as { weapons?: string[], armor?: string, items?: string[] };
    const parts = [];
    
    if (equipment.weapons && equipment.weapons.length > 0) {
      parts.push(`Оружие: ${equipment.weapons.join(', ')}`);
    }
    
    if (equipment.armor) {
      parts.push(`Броня: ${equipment.armor}`);
    }
    
    if (equipment.items && equipment.items.length > 0) {
      parts.push(`Предметы: ${equipment.items.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join('\n') : "Нет снаряжения";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Сводка персонажа</h2>
      
      <ScrollArea className="h-[500px] pr-4 pb-4">
        <div className="space-y-6">
          {/* Основная информация */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Основные данные</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Имя:</span> {character.name}
                </div>
                <div>
                  <span className="font-medium">Пол:</span> {character.gender}
                </div>
                <div>
                  <span className="font-medium">Раса:</span> {character.race}
                  {character.subrace && ` (${character.subrace})`}
                </div>
                <div>
                  <span className="font-medium">Класс:</span> {character.class}
                  {character.subclass && ` (${character.subclass})`}
                </div>
                <div>
                  <span className="font-medium">Уровень:</span> {character.level}
                </div>
                <div>
                  <span className="font-medium">Мировоззрение:</span> {character.alignment}
                </div>
                <div>
                  <span className="font-medium">Предыстория:</span> {character.background}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Характеристики */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Характеристики</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {character.abilities && Object.entries({
                  "СИЛ": character.abilities.STR || character.abilities.strength,
                  "ЛОВ": character.abilities.DEX || character.abilities.dexterity,
                  "ТЕЛ": character.abilities.CON || character.abilities.constitution,
                  "ИНТ": character.abilities.INT || character.abilities.intelligence,
                  "МДР": character.abilities.WIS || character.abilities.wisdom,
                  "ХАР": character.abilities.CHA || character.abilities.charisma
                }).map(([name, value]) => (
                  <div key={name} className="flex flex-col items-center border rounded p-3">
                    <span className="font-bold">{name}</span>
                    <span className="text-xl">{value}</span>
                    <span className="text-sm text-muted-foreground">
                      {getModifier(value as number)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Снаряжение */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Снаряжение и золото</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="whitespace-pre-line">{formatEquipment()}</div>
                <div>
                  <span className="font-medium">Золото:</span> {character.gold || 0} зм
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Заклинания */}
          {character.spells && character.spells.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Заклинания</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">{formatSpells(character.spells)}</div>
              </CardContent>
            </Card>
          )}
          
          {/* Личность */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Личность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Черты характера:</h4>
                  <p className="text-sm">{character.personalityTraits || "Не указано"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Идеалы:</h4>
                  <p className="text-sm">{character.ideals || "Не указано"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Привязанности:</h4>
                  <p className="text-sm">{character.bonds || "Не указано"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Слабости:</h4>
                  <p className="text-sm">{character.flaws || "Не указано"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Предыстория */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>История персонажа</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{character.backstory || "История персонажа не указана."}</p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
      
      <NavigationButtons
        allowNext={true}
        nextStep={onSave || nextStep || (() => {})}
        prevStep={prevStep || (() => {})}
        isFirstStep={false}
        nextLabel="Сохранить персонажа"
      />
    </div>
  );
};

export default CharacterSummary;
