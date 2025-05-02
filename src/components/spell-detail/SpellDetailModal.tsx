
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CharacterSpell } from "@/types/character";
import { BookOpen, Clock, Ruler, Box, Award } from "lucide-react";

interface SpellDetailModalProps {
  spell: CharacterSpell | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ 
  spell, 
  isOpen, 
  setIsOpen 
}) => {
  if (!spell) return null;

  // Определяем цвет для школы магии
  const getSchoolColor = (school: string) => {
    const schoolColors: Record<string, string> = {
      'Воплощение': 'bg-red-500',
      'Некромантия': 'bg-purple-900',
      'Преобразование': 'bg-blue-500',
      'Очарование': 'bg-pink-500',
      'Прорицание': 'bg-amber-500',
      'Ограждение': 'bg-emerald-500',
      'Иллюзия': 'bg-indigo-500',
      'Вызов': 'bg-yellow-500'
    };
    
    return schoolColors[school] || 'bg-gray-500';
  };

  // Определяем текст для уровня заклинания
  const getLevelText = (level: number) => {
    if (level === 0) return "Заговор";
    return `${level}-й уровень`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            {spell.name}
            <div className="flex gap-2">
              {spell.ritual && (
                <Badge variant="outline" className="border-amber-500 text-amber-500">
                  Ритуал
                </Badge>
              )}
              {spell.concentration && (
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                  Концентрация
                </Badge>
              )}
            </div>
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge className={`${getSchoolColor(spell.school)} text-white`}>
              {spell.school}
            </Badge>
            <span>{getLevelText(spell.level)}</span>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">Время накладывания:</span> {spell.castingTime}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">Дистанция:</span> {spell.range}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">Компоненты:</span> {spell.components}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">Длительность:</span> {spell.duration}
            </span>
          </div>
          
          <div className="flex items-center gap-2 col-span-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">Классы:</span> {spell.classes.join(", ")}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="prose dark:prose-invert max-w-none">
            <h4 className="text-lg font-semibold">Описание</h4>
            <p className="whitespace-pre-line">{spell.description}</p>
            
            {spell.higherLevels && (
              <>
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  На более высоких уровнях
                </h4>
                <p className="whitespace-pre-line">{spell.higherLevels}</p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
