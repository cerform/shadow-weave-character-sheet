
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SpellData } from "@/types/spells";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface SpellDetailsModalProps {
  spell: SpellData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SpellDetailsModal: React.FC<SpellDetailsModalProps> = ({
  spell,
  open,
  onOpenChange,
}) => {
  // Форматируем описание заклинания
  const formatDescription = (description: string | string[]): string[] => {
    if (Array.isArray(description)) {
      return description;
    }
    return description.split('\n\n').filter(Boolean);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{spell.name}</DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline">
              {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
            </Badge>
            <Badge variant="outline">{spell.school}</Badge>
            {spell.concentration && <Badge variant="destructive">Концентрация</Badge>}
            {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Время накладывания</p>
                <p>{spell.castingTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Дистанция</p>
                <p>{spell.range}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Компоненты</p>
                <p>{spell.components}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Длительность</p>
                <p>{spell.duration}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Описание</p>
              <div className="space-y-2">
                {formatDescription(spell.description || '').map((paragraph, idx) => (
                  <p key={idx} className="text-base">{paragraph}</p>
                ))}
              </div>
            </div>
            
            {spell.higherLevels && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">На более высоких уровнях</p>
                <p>{spell.higherLevels}</p>
              </div>
            )}
            
            {spell.classes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Классы</p>
                <p>{Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailsModal;
