
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, X } from 'lucide-react';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useMediaQuery } from '@/hooks/use-media-query';

interface SpellDetailViewProps {
  spell: SpellData | null;
  isOpen: boolean;
  onClose: () => void;
}

const SpellDetailView: React.FC<SpellDetailViewProps> = ({
  spell,
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!spell) return null;

  // Форматируем описание, если оно в виде массива
  const formattedDescription = Array.isArray(spell.description)
    ? spell.description.join('\n\n')
    : spell.description;

  // Форматируем компоненты заклинания
  const formatComponents = () => {
    const components = [];
    if (spell.verbal) components.push('В');
    if (spell.somatic) components.push('С');
    if (spell.material) components.push('М');
    
    return components.length > 0 
      ? components.join(', ') + (spell.materials ? ` (${spell.materials})` : '')
      : spell.components || 'Нет';
  };
  
  // Форматируем классы заклинания
  const formatClasses = () => {
    if (!spell.classes) return 'Нет данных';
    if (typeof spell.classes === 'string') return spell.classes;
    return spell.classes.join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-hidden bg-card/90 backdrop-blur-md p-0 ${isMobile ? 'w-[95vw]' : ''}`}>
        <DialogHeader className="p-6 bg-accent/10 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
                {spell.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge>{spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}</Badge>
                <Badge variant="outline">{spell.school}</Badge>
                {spell.ritual && <Badge variant="secondary">Ритуал</Badge>}
                {spell.concentration && <Badge variant="secondary">Концентрация</Badge>}
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className={`max-h-[calc(90vh-200px)] px-6 py-4 ${isMobile ? 'px-4' : ''}`}>
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-6`}>
            <div className={`${isMobile ? '' : 'md:col-span-1'} space-y-4`}>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Время накладывания</h3>
                <p>{spell.castingTime}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Дистанция</h3>
                <p>{spell.range}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Компоненты</h3>
                <p>{formatComponents()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Длительность</h3>
                <p>
                  {spell.concentration ? 'Концентрация, ' : ''}
                  {spell.duration}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Классы</h3>
                <p>{formatClasses()}</p>
              </div>
              
              {spell.source && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Источник</h3>
                  <p>{spell.source}</p>
                </div>
              )}
            </div>
            
            <div className={`${isMobile ? '' : 'md:col-span-2'}`}>
              <div className="space-y-4">
                <h3 className="text-lg font-medium" style={{ color: currentTheme.accent }}>Описание</h3>
                <div className="text-pretty whitespace-pre-line">
                  {formattedDescription}
                </div>
                
                {(spell.higherLevel || spell.higherLevels) && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium" style={{ color: currentTheme.accent }}>На более высоких уровнях</h3>
                    <p className="text-pretty">{spell.higherLevel || spell.higherLevels}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4 bg-accent/10">
          <Button variant="outline" onClick={onClose}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailView;
