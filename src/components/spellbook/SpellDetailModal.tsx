
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpellData } from '@/types/spells';
import { Separator } from '@/components/ui/separator';
import { Book, BookOpen, Sparkles, Clock, HandMetal, Mountain, Calendar } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface SpellDetailModalProps {
  spell: SpellData;
  open: boolean;
  onClose: () => void;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ spell, open, onClose }) => {
  const { themeStyles } = useTheme();
  
  // Форматирование классов
  const formatClasses = (classes: string[] | string | undefined) => {
    if (!classes) return "—";
    if (typeof classes === 'string') return classes;
    return classes.join(', ');
  };

  // Отображение описания заклинания
  const renderDescription = (description: string | string[]) => {
    if (Array.isArray(description)) {
      return description.map((paragraph, index) => (
        <p key={index} className="mb-2">{paragraph}</p>
      ));
    }
    
    return <p>{description}</p>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">{spell.name}</DialogTitle>
            <Badge
              variant={spell.level === 0 ? "outline" : "default"}
              className="text-base"
            >
              {spell.level === 0 ? 'Заговор' : `${spell.level}-й уровень`}
            </Badge>
          </div>
          <DialogDescription className="flex flex-wrap gap-2 items-center text-base">
            <Badge variant="secondary">{spell.school}</Badge>
            {spell.ritual && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Book className="h-3 w-3" />
                Ритуал
              </Badge>
            )}
            {spell.concentration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Концентрация
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Время накладывания:</span> {spell.castingTime}
            </div>
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Дистанция:</span> {spell.range}
            </div>
            <div className="flex items-center gap-2">
              <HandMetal className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Компоненты:</span> {spell.components}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Длительность:</span> {spell.duration}
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Описание</h3>
              <div className="text-base space-y-2">
                {renderDescription(spell.description)}
              </div>
            </div>
            
            {(spell.higherLevel || spell.higherLevels) && (
              <div>
                <h3 className="font-medium text-lg mb-2">На больших уровнях</h3>
                <p>{spell.higherLevel || spell.higherLevels}</p>
              </div>
            )}
            
            {spell.materials && (
              <div>
                <h3 className="font-medium text-lg mb-2">Материальные компоненты</h3>
                <p>{spell.materials}</p>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="font-medium text-base mb-2">Классы</h3>
            <div className="flex flex-wrap gap-2">
              {formatClasses(spell.classes).split(', ').map((className, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {className}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
