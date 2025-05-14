
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpellData } from '@/types/spells';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Check, BookText } from 'lucide-react';

export interface SpellDetailModalProps {
  spell: SpellData;
  isOpen: boolean;
  onClose: () => void;
  theme: any;
  showAddButton?: boolean;
  onAddSpell?: (spell: SpellData) => void;
  isSpellAdded?: boolean;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({
  spell,
  isOpen,
  onClose,
  theme,
  showAddButton = false,
  onAddSpell,
  isSpellAdded = false
}) => {
  const getSpellLevelText = (level: number) => {
    if (level === 0) return 'Заговор';
    return `${level} уровень`;
  };

  const getSchoolWithLevel = (school: string, level: number) => {
    if (level === 0) {
      return `${school} (заговор)`;
    }
    return `${school} (${level} уровень)`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-hidden p-0"
        style={{
          backgroundColor: theme.cardBackground || 'rgba(0, 0, 0, 0.95)', 
          borderColor: theme.accent,
          color: theme.textColor
        }}
      >
        <DialogHeader className="p-6 pb-2 border-b border-primary/10">
          <div className="flex justify-between items-center">
            <div>
              <Badge 
                variant="outline" 
                className="mb-2"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                {getSpellLevelText(spell.level)}
              </Badge>
              <DialogTitle className="text-2xl font-philosopher" style={{ color: theme.accent }}>
                {spell.name}
              </DialogTitle>
              <div className="text-sm opacity-70 mt-1">
                {getSchoolWithLevel(spell.school, spell.level)}
              </div>
            </div>
            
            {showAddButton && onAddSpell && (
              <Button
                onClick={() => onAddSpell(spell)}
                disabled={isSpellAdded}
                style={!isSpellAdded ? { backgroundColor: theme.accent } : {}}
                className={isSpellAdded ? "bg-green-600" : ""}
              >
                {isSpellAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Добавлено
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="p-6 h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-sm opacity-70 mb-1">Время накладывания</h3>
              <p>{spell.castingTime}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm opacity-70 mb-1">Дистанция</h3>
              <p>{spell.range}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm opacity-70 mb-1">Компоненты</h3>
              <p>
                {typeof spell.components === 'string' ? spell.components : 
                  `${spell.verbal ? 'В' : ''}${spell.somatic ? 'С' : ''}${spell.material ? 'М' : ''}`}
                {spell.material && spell.materials && (
                  <span className="opacity-70"> ({spell.materials})</span>
                )}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm opacity-70 mb-1">Длительность</h3>
              <p>{spell.duration}</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex flex-wrap gap-2">
              {spell.ritual && (
                <Badge variant="secondary">Ритуал</Badge>
              )}
              {spell.concentration && (
                <Badge variant="secondary">Концентрация</Badge>
              )}
              {typeof spell.classes === 'string' ? (
                <Badge variant="outline">{spell.classes}</Badge>
              ) : (
                Array.isArray(spell.classes) && spell.classes.map(cls => (
                  <Badge key={cls} variant="outline">{cls}</Badge>
                ))
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <BookText className="h-5 w-5" />
              Описание
            </h3>
            
            {typeof spell.description === 'string' ? (
              <p className="leading-relaxed">{spell.description}</p>
            ) : (
              <>
                {Array.isArray(spell.description) && spell.description.map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">{paragraph}</p>
                ))}
              </>
            )}
            
            {(spell.higherLevels) && (
              <div className="mt-4 pt-4 border-t border-primary/10">
                <h4 className="font-bold mb-2">На более высоких уровнях</h4>
                <p className="leading-relaxed">{spell.higherLevels}</p>
              </div>
            )}
            
            <div className="text-sm opacity-70 mt-4 pt-4 border-t border-primary/10">
              <p>Источник: {spell.source}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
