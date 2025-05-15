
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpellData } from '@/types/spells';
import { Plus, X } from 'lucide-react';

interface SpellDetailModalProps {
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
  // Handle spell classes display
  const displayClasses = () => {
    if (!spell.classes) return "—";
    
    if (typeof spell.classes === 'string') {
      return spell.classes;
    }
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.join(', ');
    }
    
    return "—";
  };
  
  // Helper function to render description with formatting
  const renderDescription = () => {
    if (!spell.description) return <p>Нет описания</p>;
    
    if (typeof spell.description === 'string') {
      return <p>{spell.description}</p>;
    }
    
    if (Array.isArray(spell.description)) {
      return spell.description.map((paragraph, index) => (
        <p key={index} className={index > 0 ? "mt-4" : ""}>{paragraph}</p>
      ));
    }
    
    return <p>Нет описания</p>;
  };
  
  // Handle add button click
  const handleAddClick = () => {
    if (onAddSpell) {
      onAddSpell(spell);
    }
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
        <DialogHeader 
          className="p-6 pb-2 border-b" 
          style={{ borderColor: `${theme.accent}40` }}
        >
          <div className="flex justify-between items-start">
            <div>
              <Badge 
                variant="outline" 
                className="mb-2"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                {spell.school} • {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
              </Badge>
              
              <DialogTitle className="text-2xl font-philosopher" style={{ color: theme.accent }}>
                {spell.name}
              </DialogTitle>
            </div>
            
            {showAddButton && onAddSpell && (
              <Button 
                size="sm" 
                variant={isSpellAdded ? "outline" : "default"} 
                className={isSpellAdded ? "border-green-500 text-green-500 mt-1" : "mt-1"}
                style={!isSpellAdded ? { backgroundColor: theme.accent } : {}}
                onClick={handleAddClick}
              >
                {isSpellAdded ? <X size={18} /> : <Plus size={18} />}
                {isSpellAdded ? "Удалить" : "Добавить"}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-6rem)]">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm opacity-70">Время накладывания</p>
                <p className="font-medium">{spell.castingTime || "1 действие"}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Дистанция</p>
                <p className="font-medium">{spell.range || "На себя"}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Длительность</p>
                <p className="font-medium">{spell.duration || "Мгновенная"}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Компоненты</p>
                <p className="font-medium">
                  {spell.components || `${spell.verbal ? 'В' : ''}${spell.somatic ? 'С' : ''}${spell.material ? 'М' : ''}`}
                  {spell.material && spell.materials && (
                    <span className="text-sm ml-1 opacity-70">({spell.materials})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-70">Классы</p>
                <p className="font-medium">{displayClasses()}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Источник</p>
                <p className="font-medium">{spell.source || "Player's Handbook"}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {spell.ritual && (
                <Badge variant="secondary" className="bg-blue-900/30">Ритуал</Badge>
              )}
              {spell.concentration && (
                <Badge variant="secondary" className="bg-purple-900/30">Концентрация</Badge>
              )}
            </div>
            
            <div className="prose prose-invert max-w-none" style={{ color: theme.textColor }}>
              {renderDescription()}
              
              {(spell.higherLevels) && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium" style={{ color: theme.accent }}>На более высоких уровнях</h4>
                  <p>{spell.higherLevels}</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
