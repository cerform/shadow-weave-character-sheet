import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SpellData } from '@/types/spells';
import { Character, CharacterSpell } from '@/types/character';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, CheckCircle, Circle, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { normalizeSpells } from '@/utils/spellUtils';

interface SpellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spell: SpellData;
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

const SpellDialog: React.FC<SpellDialogProps> = ({
  open,
  onOpenChange,
  spell,
  character,
  onUpdate
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Проверяем, подготовлено ли заклинание
  const isPrepared = () => {
    if (!character.spells) return false;
    const characterSpells = normalizeSpells(character.spells || []);
    const foundSpell = characterSpells.find(s => s.name === spell.name);
    return foundSpell?.prepared || false;
  };
  
  // Переключение статуса "подготовлено"
  const togglePrepared = () => {
    if (!onUpdate || !character.spells) return;
    
    const characterSpells = normalizeSpells(character.spells || []);
    const updatedSpells = characterSpells.map((s: CharacterSpell) => {
      if (s.name === spell.name) {
        return { ...s, prepared: !s.prepared };
      }
      return s;
    });
    
    onUpdate({ spells: updatedSpells });
  };
  
  // Получаем цвет для бейджа уровня заклинания
  const getSpellLevelColor = (level: number): string => {
    const colors = {
      0: "#6b7280", // Заговор - серый
      1: "#10b981", // 1 уровень - зеленый
      2: "#3b82f6", // 2 уровень - синий
      3: "#8b5cf6", // 3 уровень - фиолетовый
      4: "#ec4899", // 4 уровень - розовый
      5: "#f59e0b", // 5 уровень - оранжевый
      6: "#ef4444", // 6 уровень - красный
      7: "#6366f1", // 7 уровень - индиго
      8: "#0ea5e9", // 8 уровень - голубой
      9: "#7c3aed"  // 9 уровень - насыщенный фиолетовый
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[80vh]"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.85)', 
          borderColor: getSpellLevelColor(spell.level)
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ color: currentTheme.textColor }}>{spell.name}</span>
              <Badge style={{ backgroundColor: getSpellLevelColor(spell.level) }}>
                {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
              </Badge>
              <Badge variant="outline">{spell.school}</Badge>
            </div>
            {onUpdate && spell.level > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePrepared}
                className="ml-auto"
              >
                {isPrepared() ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    <span style={{ color: currentTheme.textColor }}>Подготовлено</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 mr-2" />
                    <span style={{ color: currentTheme.textColor }}>Не подготовлено</span>
                  </>
                )}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <span className="text-sm text-gray-400">Время накладывания</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-300" />
              <span style={{ color: currentTheme.textColor }}>{spell.castingTime}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-gray-400">Дальность</span>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-4 w-4 text-gray-300" />
              <span style={{ color: currentTheme.textColor }}>{spell.range}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-gray-400">Компоненты</span>
            <div className="flex items-center gap-1">
              <span style={{ color: currentTheme.textColor }}>{spell.components}</span>
              {spell.material && (
                <Badge variant="outline" className="ml-1">M</Badge>
              )}
              {spell.verbal && (
                <Badge variant="outline" className="ml-1">В</Badge>
              )}
              {spell.somatic && (
                <Badge variant="outline" className="ml-1">С</Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-gray-400">Длительность</span>
            <div className="flex items-center gap-1">
              <span style={{ color: currentTheme.textColor }}>{spell.duration}</span>
              {spell.concentration && (
                <Badge variant="outline" className="ml-1">Концентрация</Badge>
              )}
              {spell.ritual && (
                <Badge variant="outline" className="ml-1">Ритуал</Badge>
              )}
            </div>
          </div>
          
          <div className="col-span-2 space-y-1">
            <span className="text-sm text-gray-400">Классы</span>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(spell.classes) ? (
                spell.classes.map((cls, index) => (
                  <Badge key={index} variant="secondary">{cls}</Badge>
                ))
              ) : (
                spell.classes && <Badge variant="secondary">{spell.classes}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm text-gray-400">Описание</span>
          <ScrollArea className="h-[200px] pr-4">
            <p style={{ color: currentTheme.textColor }} className="whitespace-pre-line">
              {typeof spell.description === 'string' ? 
                spell.description : 
                Array.isArray(spell.description) ? 
                  spell.description.join('\n\n') : ''}
            </p>
            
            {(spell.higherLevel || spell.higherLevels) && (
              <>
                <h4 className="text-sm text-gray-400 mt-4 mb-1">На более высоких уровнях</h4>
                <p style={{ color: currentTheme.textColor }}>
                  {spell.higherLevel || spell.higherLevels}
                </p>
              </>
            )}
          </ScrollArea>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText || 'white'
            }}
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDialog;
