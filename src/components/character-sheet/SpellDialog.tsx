
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CharacterSpell } from '@/types/character';
import { Separator } from '@/components/ui/separator';
import { Star, RefreshCw } from 'lucide-react';

interface SpellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spell: CharacterSpell;
  onTogglePrepared?: () => void;
}

const SpellDialog: React.FC<SpellDialogProps> = ({ open, onOpenChange, spell, onTogglePrepared }) => {
  const getSpellLevelText = (level: number = 0) => {
    if (level === 0) return 'Заговор';
    if (level === 1) return '1-й уровень';
    if (level === 2) return '2-й уровень';
    if (level === 3) return '3-й уровень';
    return `${level}-й уровень`;
  };

  const renderDescription = (description: string | string[]) => {
    if (Array.isArray(description)) {
      return description.map((paragraph, index) => (
        <p key={index} className="mb-2">{paragraph}</p>
      ));
    }
    return <p>{description}</p>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{spell.name}</DialogTitle>
            <div className="flex space-x-2">
              {spell.level > 0 && onTogglePrepared && (
                <Button
                  variant={spell.prepared ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePrepared();
                  }}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {spell.prepared ? 'Подготовлено' : 'Подготовить'}
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
            <Badge variant="outline">{getSpellLevelText(spell.level)}</Badge>
            <Badge variant="outline">{spell.school || 'Универсальная'}</Badge>
            {spell.ritual && <Badge variant="secondary">Ритуал</Badge>}
            {spell.concentration && <Badge variant="secondary">Концентрация</Badge>}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Время накладывания</p>
              <p>{spell.castingTime || '1 действие'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Дистанция</p>
              <p>{spell.range || 'На себя'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Компоненты</p>
              <p>{spell.components || 'В, С'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Длительность</p>
              <p>{spell.duration || 'Мгновенная'}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Описание</p>
            <div className="text-sm space-y-2">
              {renderDescription(spell.description || 'Нет описания')}
            </div>
          </div>

          {spell.classes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Классы</p>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(spell.classes) 
                    ? spell.classes.map(cls => (
                        <Badge key={cls} variant="outline">{cls}</Badge>
                      ))
                    : <Badge variant="outline">{spell.classes}</Badge>
                  }
                </div>
              </div>
            </>
          )}

          {spell.source && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium">Источник</p>
                <p className="text-sm">{spell.source}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDialog;
