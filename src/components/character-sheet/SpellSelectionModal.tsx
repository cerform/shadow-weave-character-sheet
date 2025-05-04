
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterSpell } from '@/types/character';
import { Check } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface SpellSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSpells: CharacterSpell[];
  onConfirm: (selectedSpells: CharacterSpell[]) => void;
  maxSpellsCount: number;
  maxCantripsCount: number;
  characterClass?: string;
  characterLevel?: number;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onOpenChange,
  availableSpells,
  onConfirm,
  maxSpellsCount,
  maxCantripsCount,
  characterClass = '',
  characterLevel = 0
}) => {
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [activeTab, setActiveTab] = useState<string>("0");
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Группируем заклинания по уровням
  const spellsByLevel = React.useMemo(() => {
    const grouped: Record<string, CharacterSpell[]> = {};
    
    availableSpells.forEach(spell => {
      const level = spell.level?.toString() || "0";
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(spell);
    });
    
    return grouped;
  }, [availableSpells]);
  
  // Получаем список доступных уровней заклинаний
  const spellLevels = React.useMemo(() => {
    return Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b));
  }, [spellsByLevel]);
  
  // При открытии модального окна устанавливаем первый доступный уровень заклинаний
  useEffect(() => {
    if (open && spellLevels.length > 0) {
      setActiveTab(spellLevels[0]);
    }
  }, [open, spellLevels]);
  
  // Выбор/отмена выбора заклинания
  const toggleSpell = (spell: CharacterSpell) => {
    const isSelected = selectedSpells.some(s => s.name === spell.name);
    
    if (isSelected) {
      setSelectedSpells(selectedSpells.filter(s => s.name !== spell.name));
    } else {
      // Проверяем лимиты для заклинаний и заговоров
      const selectedCantrips = selectedSpells.filter(s => s.level === 0);
      const selectedRegularSpells = selectedSpells.filter(s => s.level !== 0);
      
      if (spell.level === 0 && selectedCantrips.length >= maxCantripsCount) {
        return; // Достигнут лимит заговоров
      }
      
      if (spell.level !== 0 && selectedRegularSpells.length >= maxSpellsCount) {
        return; // Достигнут лимит обычных заклинаний
      }
      
      setSelectedSpells([...selectedSpells, spell]);
    }
  };
  
  // Количество выбранных заговоров и заклинаний
  const selectedCantripsCount = selectedSpells.filter(s => s.level === 0).length;
  const selectedSpellsCount = selectedSpells.filter(s => s.level !== 0).length;
  
  // Обработчик подтверждения выбора заклинаний
  const handleConfirm = () => {
    onConfirm(selectedSpells);
    onOpenChange(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Выбор новых заклинаний</SheetTitle>
          <SheetDescription>
            При повышении уровня вы можете выбрать новые заклинания
          </SheetDescription>
        </SheetHeader>
        
        <div className="px-4 py-2 bg-black/40 border-b flex flex-wrap justify-between gap-2">
          <div className="flex items-center">
            <span className="text-sm">Класс: {characterClass}</span>
            <span className="text-sm ml-2">Новый уровень: {characterLevel + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            {maxCantripsCount > 0 && (
              <Badge 
                variant="outline" 
                className={selectedCantripsCount === maxCantripsCount ? "bg-green-500/20" : ""}
              >
                Заговоры: {selectedCantripsCount}/{maxCantripsCount}
              </Badge>
            )}
            {maxSpellsCount > 0 && (
              <Badge 
                variant="outline"
                className={selectedSpellsCount === maxSpellsCount ? "bg-green-500/20" : ""}
              >
                Заклинания: {selectedSpellsCount}/{maxSpellsCount}
              </Badge>
            )}
          </div>
        </div>
        
        {spellLevels.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full bg-black/40 rounded-none">
              {spellLevels.map(level => (
                <TabsTrigger 
                  key={level} 
                  value={level}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  {level === "0" ? "Заговоры" : `Уровень ${level}`}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {spellLevels.map(level => (
              <TabsContent key={level} value={level} className="h-[calc(100vh-250px)]">
                <ScrollArea className="h-full pr-4 px-4">
                  <div className="grid grid-cols-1 gap-2 pb-4">
                    {spellsByLevel[level]?.map((spell, index) => {
                      const isSelected = selectedSpells.some(s => s.name === spell.name);
                      const isDisabled = !isSelected && (
                        (spell.level === 0 && selectedCantripsCount >= maxCantripsCount) ||
                        (spell.level !== 0 && selectedSpellsCount >= maxSpellsCount)
                      );
                      
                      return (
                        <Button 
                          key={index}
                          variant={isSelected ? "default" : "outline"}
                          className={`justify-start text-left h-auto py-3 relative ${isSelected ? 'border-white' : 'border-primary/30'} ${isDisabled ? 'opacity-50' : ''}`}
                          onClick={() => toggleSpell(spell)}
                          disabled={isDisabled}
                          style={{
                            backgroundColor: isSelected ? `${currentTheme.accent}80` : 'rgba(0, 0, 0, 0.6)',
                            boxShadow: isSelected ? `0 0 10px ${currentTheme.accent}80` : 'none'
                          }}
                        >
                          <div className="flex-1">
                            <div className="font-bold text-white">{spell.name}</div>
                            <div className="text-sm opacity-80 text-white">{spell.school} • {spell.castingTime}</div>
                          </div>
                          {isSelected && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Check size={20} className="text-white" />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <p className="text-gray-400">Нет доступных заклинаний для выбора</p>
          </div>
        )}
        
        <div className="p-4 border-t flex justify-end">
          <Button
            onClick={handleConfirm}
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText
            }}
          >
            Подтвердить выбор
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SpellSelectionModal;
