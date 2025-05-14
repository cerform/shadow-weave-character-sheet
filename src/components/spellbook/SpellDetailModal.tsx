
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export interface SpellDetailModalProps {
  spell: SpellData;
  open: boolean;
  onClose: () => void;
  currentTheme?: any;
  showAddButton?: boolean;
  onAddSpell?: (spell: SpellData) => void;
  alreadyAdded?: boolean;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({
  spell,
  open,
  onClose,
  currentTheme,
  showAddButton = false,
  onAddSpell,
  alreadyAdded = false
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const modalTheme = currentTheme || themes[themeKey] || themes.default;

  // Обработка компонентов заклинания
  const renderComponents = () => {
    const components = [];
    if (spell.verbal) components.push('Вербальный');
    if (spell.somatic) components.push('Соматический');
    if (spell.material) components.push('Материальный');
    return components.join(', ') || 'Нет';
  };

  if (!spell) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden" 
                    style={{ 
                      backgroundColor: modalTheme.cardBackground || 'rgba(0, 0, 0, 0.95)',
                      borderColor: modalTheme.accent,
                      color: modalTheme.textColor
                    }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-philosopher"
                      style={{ color: modalTheme.accent }}>
            {spell.name}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge style={{ backgroundColor: modalTheme.accent, color: '#000' }}>
              {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
            </Badge>
            <Badge variant="outline" style={{ borderColor: modalTheme.accent, color: modalTheme.textColor }}>
              {spell.school}
            </Badge>
            {spell.ritual && (
              <Badge variant="outline" style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}>
                Ритуал
              </Badge>
            )}
            {spell.concentration && (
              <Badge variant="outline" style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                Концентрация
              </Badge>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-75">Время накладывания</p>
                <p>{spell.castingTime}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Дистанция</p>
                <p>{spell.range}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Компоненты</p>
                <p>{renderComponents()}</p>
                {spell.materials && (
                  <p className="text-xs opacity-70 mt-1">{spell.materials}</p>
                )}
              </div>
              <div>
                <p className="text-sm opacity-75">Длительность</p>
                <p>{spell.duration}</p>
              </div>
            </div>
            
            <Separator style={{ backgroundColor: `${modalTheme.accent}30` }} />
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Описание</h4>
              {typeof spell.description === 'string' ? (
                <p className="text-sm whitespace-pre-line">{spell.description}</p>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(spell.description) && spell.description.map((desc, index) => (
                    <p key={index} className="text-sm whitespace-pre-line">{desc}</p>
                  ))}
                </div>
              )}
            </div>
            
            {spell.higherLevels && (
              <div>
                <h4 className="text-lg font-semibold mb-2">На более высоких уровнях</h4>
                <p className="text-sm">{spell.higherLevels}</p>
              </div>
            )}
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Доступно классам</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(spell.classes) ? (
                  spell.classes.map((cls, index) => (
                    <Badge key={index} variant="outline" 
                          style={{ borderColor: modalTheme.accent, color: modalTheme.textColor }}>
                      {cls}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" 
                        style={{ borderColor: modalTheme.accent, color: modalTheme.textColor }}>
                    {spell.classes}
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-xs opacity-70 text-right">Источник: {spell.source || 'PHB'}</p>
            </div>
          </div>
        </ScrollArea>
        
        {showAddButton && onAddSpell && (
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={() => onAddSpell(spell)} 
              disabled={alreadyAdded}
              className={alreadyAdded ? "bg-green-700" : ""}
              style={!alreadyAdded ? { 
                backgroundColor: modalTheme.accent, 
                color: '#000' 
              } : {}}
            >
              {alreadyAdded ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Добавлено
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить заклинание
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
