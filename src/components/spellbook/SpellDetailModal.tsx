
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpellData } from '@/types/spells';
import { Plus, BookOpen, Sparkles } from 'lucide-react';
import { componentsToString } from '@/utils/spellProcessors';

export interface SpellDetailModalProps {
  spell: SpellData;
  isOpen: boolean;
  onClose: () => void;
  theme?: any;
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
  if (!spell) return null;
  
  const getLevelAndSchoolText = (spell: SpellData) => {
    if (spell.level === 0) {
      return `Заговор, ${spell.school}`;
    }
    return `${spell.level} уровень, ${spell.school}`;
  };
  
  const getSpellClasses = (classes: string[] | string | undefined) => {
    if (!classes) return "—";
    if (typeof classes === 'string') return classes;
    return classes.join(', ');
  };
  
  const formatDescription = (description: string | string[]) => {
    if (typeof description === 'string') {
      return description.split('\n').map((paragraph, index) => (
        <p key={index} className="mb-2">{paragraph}</p>
      ));
    }
    
    if (Array.isArray(description)) {
      return description.map((paragraph, index) => (
        <p key={index} className="mb-2">{paragraph}</p>
      ));
    }
    
    return <p>Нет описания</p>;
  };
  
  const handleAddSpell = () => {
    if (onAddSpell && !isSpellAdded) {
      onAddSpell(spell);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-auto"
        style={{
          backgroundColor: theme?.cardBackground || 'rgba(16, 16, 16, 0.8)',
          borderColor: theme?.accent,
          color: theme?.textColor || 'white',
        }}
      >
        <DialogHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-philosopher">{spell.name}</DialogTitle>
            {showAddButton && onAddSpell && (
              <Button
                variant={isSpellAdded ? "outline" : "default"}
                onClick={handleAddSpell}
                disabled={isSpellAdded}
                style={isSpellAdded ? {} : { backgroundColor: theme?.accent }}
              >
                {isSpellAdded ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
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
          <DialogDescription>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" className={`${spell.level === 0 ? 'border-blue-400 text-blue-400' : ''}`}>
                {getLevelAndSchoolText(spell)}
              </Badge>
              {spell.ritual && (
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  Ритуал
                </Badge>
              )}
              {spell.concentration && (
                <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                  Концентрация
                </Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-semibold mb-2">Детали заклинания</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-medium">Время:</span>
                <span>{spell.castingTime}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-medium">Дистанция:</span>
                <span>{spell.range}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-medium">Компоненты:</span>
                <span>
                  {componentsToString(spell)}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-medium">Длительность:</span>
                <span>{spell.duration}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-medium">Классы:</span>
                <span>{getSpellClasses(spell.classes)}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-medium">Источник:</span>
                <span>{spell.source}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Описание</h3>
              <div className="text-sm">
                {formatDescription(spell.description)}
              </div>
            </div>
            
            {(spell.higherLevels || spell.higherLevel) && (
              <div>
                <h3 className="font-semibold mb-2">На более высоких уровнях</h3>
                <div className="text-sm">
                  {formatDescription(spell.higherLevels || spell.higherLevel || '')}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
