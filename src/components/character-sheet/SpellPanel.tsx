
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Character, CharacterSpell } from '@/types/character';
import { 
  CirclePlay, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Ruler, 
  Hourglass,
  CircleCheck
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SpellPanelProps {
  spellData: CharacterSpell;
  character: Character;
  canPrepare?: boolean;
  onTogglePrepared: () => void;
  onRemoveSpell: () => void;
}

const SpellPanel: React.FC<SpellPanelProps> = ({
  spellData,
  character,
  canPrepare = false,
  onTogglePrepared,
  onRemoveSpell
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Преобразование описания в формат для отображения
  const formatDescription = (description: string | string[] | undefined) => {
    if (!description) return <p>Нет описания</p>;
    
    if (typeof description === 'string') {
      return description.split('\n').map((paragraph, idx) => (
        <p key={idx} className="mb-2">{paragraph}</p>
      ));
    }
    
    if (Array.isArray(description)) {
      return description.map((paragraph, idx) => (
        <p key={idx} className="mb-2">{paragraph}</p>
      ));
    }
    
    return <p>Нет описания</p>;
  };

  // Получение строки компонентов заклинания
  const getSpellComponents = () => {
    if (!spellData) return 'Н/Д';
    
    let componentsStr = '';
    
    if (typeof spellData.components === 'string') {
      return spellData.components; // Если компоненты уже представлены в виде строки
    }
    
    // Проверяем прямые булевские свойства
    if (spellData.verbal) componentsStr += 'В';
    if (spellData.somatic) componentsStr += 'С';
    if (spellData.material) componentsStr += 'М';
    
    return componentsStr || 'Н/Д';
  };
  
  // Получение материальных компонентов для отображения
  const getMaterialComponents = () => {
    if (!spellData) return '';
    
    if (typeof spellData === 'object' && 'materials' in spellData && spellData.materials) {
      return `(${spellData.materials})`;
    }
    
    return '';
  };
  
  return (
    <Card className={`border ${spellData.prepared ? 'border-green-500/50 bg-green-900/10' : 'border-gray-700 bg-gray-900/30'}`}>
      <CardContent className="p-3">
        <div className="flex flex-col">
          {/* Заголовок заклинания */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold">{spellData.name}</h3>
                {spellData.ritual && (
                  <Badge variant="outline" className="ml-2 border-purple-400 text-purple-400 text-xs">
                    Ритуал
                  </Badge>
                )}
                {spellData.concentration && (
                  <Badge variant="outline" className="ml-2 border-yellow-400 text-yellow-400 text-xs">
                    Концентрация
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3">
                <span>{spellData.level === 0 ? 'Заговор' : `${spellData.level} уровень`}</span>
                <span>{spellData.school}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canPrepare && (
                <div className="flex items-center mr-2">
                  <Checkbox 
                    id={`prepare-${spellData.id}`}
                    checked={spellData.prepared}
                    onCheckedChange={onTogglePrepared}
                  />
                  <Label 
                    htmlFor={`prepare-${spellData.id}`}
                    className="ml-1 text-xs text-muted-foreground"
                  >
                    {spellData.prepared ? (
                      <span className="text-green-400 flex items-center">
                        <CircleCheck className="w-3 h-3 mr-1" />
                        Подготовлено
                      </span>
                    ) : (
                      "Подготовить"
                    )}
                  </Label>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={toggleExpand}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive" 
                onClick={onRemoveSpell}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Детали заклинания (появляются при развороте) */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{spellData.castingTime || 'Не указано'}</span>
                </div>
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{spellData.range || 'Не указано'}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold mr-2">Компоненты:</span>
                  <span>
                    {getSpellComponents()} {getMaterialComponents()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Hourglass className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{spellData.duration || 'Не указано'}</span>
                </div>
              </div>
              
              <ScrollArea className="max-h-40 overflow-y-auto">
                <div className="text-sm">
                  {formatDescription(spellData.description)}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellPanel;
