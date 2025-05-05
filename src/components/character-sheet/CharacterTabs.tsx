
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export interface CharacterTabsProps {
  active: string;
  onChange: (value: string) => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({ 
  active, 
  onChange, 
  character,
  onUpdate
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <Tabs value={active} onValueChange={onChange} className="w-full">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="характеристики">Характеристики</TabsTrigger>
        <TabsTrigger value="снаряжение">Снаряжение</TabsTrigger>
        <TabsTrigger value="заметки">Заметки</TabsTrigger>
      </TabsList>
      
      <TabsContent value="характеристики" className="space-y-4 mt-4">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries({
            "СИЛ": character.strength || 10,
            "ЛОВ": character.dexterity || 10,
            "ТЕЛ": character.constitution || 10,
            "ИНТ": character.intelligence || 10,
            "МДР": character.wisdom || 10,
            "ХАР": character.charisma || 10
          }).map(([stat, value]) => (
            <div key={stat} className="text-center p-2 border rounded-md bg-opacity-10 bg-black">
              <div className="text-sm text-muted-foreground">{stat}</div>
              <div className="text-xl font-bold" style={{ color: currentTheme.textColor }}>{value}</div>
              <div className="text-sm" style={{ color: currentTheme.textColor }}>
                {Math.floor((value - 10) / 2) >= 0 ? 
                  `+${Math.floor((value - 10) / 2)}` : 
                  Math.floor((value - 10) / 2)}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="снаряжение" className="mt-4">
        <div className="space-y-4">
          <h3 className="font-semibold" style={{ color: currentTheme.textColor }}>Оружие и снаряжение</h3>
          <div className="space-y-2">
            {(character.equipment || []).map((item, index) => (
              <div key={`equipment-${index}`} className="flex justify-between items-center p-2 border-b">
                <span style={{ color: currentTheme.textColor }}>{item}</span>
              </div>
            ))}
            {(!character.equipment || character.equipment.length === 0) && (
              <div className="text-center text-muted-foreground py-2">
                Нет предметов снаряжения
              </div>
            )}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="заметки" className="mt-4">
        <div className="space-y-4">
          <textarea
            className="w-full h-40 p-2 rounded-md border bg-transparent"
            placeholder="Заметки о персонаже..."
            value={character.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            style={{ color: currentTheme.textColor }}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CharacterTabs;
