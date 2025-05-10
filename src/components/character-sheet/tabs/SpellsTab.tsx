import React, { useState, useEffect, useCallback } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Book, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  calculateSpellcastingDC,
  calculateSpellAttackBonus,
  getPreparedSpellsLimit,
  canPrepareMoreSpells,
  getDefaultCastingAbility
} from '@/utils/spellUtils';
import { SpellData } from '@/types/spells';

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate }) => {
  const [newSpell, setNewSpell] = useState('');
  const { toast } = useToast();
  
  // Получаем максимально возможное количество подготовленных заклинаний
  const preparedSpellsLimit = getPreparedSpellsLimit(character);
  
  // Подсчитываем количество уже подготовленных заклинаний
  const preparedSpellsCount = character.spells?.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Заговоры не учитываются
  }).length || 0;
  
  // Обработчик добавления нового заклинания
  const addSpell = () => {
    if (!newSpell.trim()) return;
    
    // Проверяем, есть ли уже такое заклинание в списке
    if (character.spells?.some(spell => typeof spell === 'string' ? spell === newSpell : spell.name === newSpell)) {
      toast({
        title: "Заклинание уже добавлено",
        description: "Это заклинание уже есть в вашем списке",
        variant: "destructive"
      });
      return;
    }
    
    // Добавляем новое заклинание в список
    const updatedSpells = [...(character.spells || []), newSpell];
    onUpdate({ spells: updatedSpells });
    setNewSpell('');
  };
  
  // Обработчик удаления заклинания
  const removeSpell = (index: number) => {
    if (!character.spells) return;
    
    const updatedSpells = [...character.spells];
    updatedSpells.splice(index, 1);
    onUpdate({ spells: updatedSpells });
  };
  
  // Переключение статуса подготовки заклинания
  const toggleSpellPrepared = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    // Проверяем, можно ли подготовить еще заклинания
    if (!spell.prepared && spell.level > 0 && !canPrepareMoreSpells(character)) {
      toast({
        title: "Лимит подготовленных заклинаний",
        description: `Вы не можете подготовить больше заклинаний. Максимум: ${preparedSpellsLimit}`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedSpells = character.spells.map(existingSpell => {
      if (typeof existingSpell === 'string') return existingSpell;
      
      if (existingSpell.name === spell.name) {
        return {
          ...existingSpell,
          prepared: !existingSpell.prepared
        };
      }
      return existingSpell;
    });
    
    onUpdate({ spells: updatedSpells });
    
    toast({
      title: spell.prepared ? "Заклинание не подготовлено" : "Заклинание подготовлено",
      description: `Заклинание ${spell.name} ${spell.prepared ? 'убрано из' : 'добавлено в'} список подготовленных`
    });
  };
  
  // Получаем модификатор характеристики, используемой для заклинаний
  const getSpellcastingModifier = useCallback(() => {
    const ability = character.spellcasting?.ability || getDefaultCastingAbility(character.class || "");
    
    switch (ability) {
      case 'strength': return character.abilities?.strength || 0;
      case 'dexterity': return character.abilities?.dexterity || 0;
      case 'constitution': return character.abilities?.constitution || 0;
      case 'intelligence': return character.abilities?.intelligence || 0;
      case 'wisdom': return character.abilities?.wisdom || 0;
      case 'charisma': return character.abilities?.charisma || 0;
      default: return 0;
    }
  }, [character]);
  
  // Рассчитываем бонус атаки заклинанием
  const spellAttackBonus = calculateSpellAttackBonus(character);
  
  // Рассчитываем СЛ спасброска от заклинаний
  const spellSaveDC = calculateSpellcastingDC(character);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Заклинания</CardTitle>
          <Book className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium">Характеристики заклинаний</h3>
              <Separator className="my-2" />
              <p className="text-sm text-muted-foreground">
                Основная характеристика: {character.spellcasting?.ability || getDefaultCastingAbility(character.class || "")}
                <br />
                Модификатор: {getSpellcastingModifier()}
                <br />
                СЛ спасброска: {character.spellcasting?.dc || calculateSpellcastingDC(character)}
                <br />
                Бонус атаки: {character.spellcasting?.attack || calculateSpellAttackBonus(character)}
              </p>
            </div>
            
            {preparedSpellsLimit > 0 && (
              <div>
                <h3 className="text-lg font-medium">Подготовка заклинаний</h3>
                <Separator className="my-2" />
                <p className="text-sm text-muted-foreground">
                  Подготовлено заклинаний: {preparedSpellsCount}/{preparedSpellsLimit}
                </p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Список заклинаний</h3>
            <Separator className="my-2" />
            <div className="flex items-center space-x-2 mb-2">
              <Input
                placeholder="Добавить новое заклинание"
                value={newSpell}
                onChange={(e) => setNewSpell(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSpell()}
              />
              <Button onClick={addSpell} size="icon" disabled={!newSpell.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {character.spells?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    У персонажа нет известных заклинаний
                  </p>
                ) : (
                  character.spells?.map((spell, index) => {
                    if (typeof spell === 'string') {
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-muted rounded-md"
                        >
                          <span>{spell}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSpell(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={spell.id || spell.name}
                          className="flex justify-between items-center p-2 bg-muted rounded-md"
                        >
                          <span>{spell.name} ({spell.level})</span>
                          <div className="flex items-center space-x-2">
                            {spell.level > 0 && (
                              <Button
                                variant={spell.prepared ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleSpellPrepared(spell)}
                                disabled={!spell.prepared && preparedSpellsCount >= preparedSpellsLimit}
                              >
                                {spell.prepared ? (
                                  <Check className="w-4 h-4 mr-1" />
                                ) : null}
                                {spell.prepared ? "Подготовлено" : "Подготовить"}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSpell(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
