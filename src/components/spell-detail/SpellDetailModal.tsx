
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Book, BookOpen, Clock, Flame, Maximize2, ScrollText, Shield, Wand, Wand2 } from 'lucide-react';

interface SpellDetailModalProps {
  spell: SpellData | null;
  open: boolean;
  onClose: () => void;
  currentTheme: any;
  showAddButton?: boolean;
  onAddSpell?: (spell: SpellData) => void;
  alreadyAdded?: boolean;
  addButtonText?: string;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({
  spell,
  open,
  onClose,
  currentTheme,
  showAddButton = false,
  onAddSpell,
  alreadyAdded = false,
  addButtonText = "Добавить заклинание"
}) => {
  if (!spell) return null;

  const handleAddSpell = () => {
    if (onAddSpell && spell) onAddSpell(spell);
  };

  // Safely format classes array or string
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return "—";
    if (typeof classes === 'string') return classes;
    if (Array.isArray(classes)) return classes.join(', ');
    return "—";
  };
  
  // Safely render description which can be string or string array
  const renderDescription = () => {
    if (!spell.description) return <p>Нет описания</p>;
    
    if (Array.isArray(spell.description)) {
      return spell.description.map((paragraph, index) => (
        <p key={index} className="mb-2">{paragraph}</p>
      ));
    }
    
    return <p>{spell.description}</p>;
  };
  
  // Safely render higher level effects
  const renderHigherLevels = () => {
    // Check different possible property names
    const higherLevelText = 
      spell.higherLevels || 
      spell.higherLevel || 
      spell.higher_level || 
      '';
      
    if (!higherLevelText) return null;
    
    // Handle array or string
    if (Array.isArray(higherLevelText)) {
      return (
        <>
          <h4 className="font-bold mt-4 mb-2">На более высоких уровнях:</h4>
          {higherLevelText.map((text, index) => (
            <p key={`higher-${index}`} className="mb-2">{text}</p>
          ))}
        </>
      );
    }
    
    return (
      <>
        <h4 className="font-bold mt-4 mb-2">На более высоких уровнях:</h4>
        <p>{higherLevelText}</p>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-auto" 
        style={{
          backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.8)',
          color: currentTheme.textColor || 'white',
          borderColor: currentTheme.accent
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 
                className="h-6 w-6" 
                style={{ color: currentTheme.accent }}
              />
              <span>{spell.name}</span>
            </div>
            <Badge 
              className="ml-2"
              style={{
                backgroundColor: currentTheme.accent,
                color: '#fff'
              }}
            >
              {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" style={{ borderColor: currentTheme.accent }}>
              <ScrollText className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
              {spell.school}
            </Badge>
            {spell.ritual && (
              <Badge variant="outline" style={{ borderColor: currentTheme.accent }}>
                <Book className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
                Ритуал
              </Badge>
            )}
            {spell.concentration && (
              <Badge variant="outline" style={{ borderColor: currentTheme.accent }}>
                <Flame className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
                Концентрация
              </Badge>
            )}
          </div>
          
          <Separator className="my-2" style={{ backgroundColor: currentTheme.accent + '40' }} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-1" style={{ color: currentTheme.accent }} />
                <div>
                  <p className="font-semibold">Время накладывания</p>
                  <p>{spell.castingTime}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Maximize2 className="h-4 w-4 mt-1" style={{ color: currentTheme.accent }} />
                <div>
                  <p className="font-semibold">Дистанция</p>
                  <p>{spell.range}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-1" style={{ color: currentTheme.accent }} />
                <div>
                  <p className="font-semibold">Компоненты</p>
                  <p>{spell.components}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 mt-1" style={{ color: currentTheme.accent }} />
                <div>
                  <p className="font-semibold">Длительность</p>
                  <p>{spell.duration}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="font-semibold">Доступно классам: </p>
            <p>{formatClasses(spell.classes)}</p>
          </div>
          
          <Separator className="my-4" style={{ backgroundColor: currentTheme.accent + '40' }} />
          
          <div className="prose prose-invert max-w-none" style={{ color: currentTheme.textColor }}>
            {renderDescription()}
            {renderHigherLevels()}
          </div>
        </div>
        
        <DialogFooter>
          {showAddButton && onAddSpell && (
            <Button 
              onClick={handleAddSpell} 
              disabled={alreadyAdded}
              style={{
                backgroundColor: alreadyAdded ? '#6b7280' : currentTheme.accent,
                color: '#fff'
              }}
            >
              {alreadyAdded ? "Уже добавлено" : addButtonText}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
