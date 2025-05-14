
import React, { useState } from 'react';
import { CharacterSpell, Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, Trash2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

interface SpellPanelProps {
  spellData: CharacterSpell;
  character: Character;
  canPrepare: boolean;
  onTogglePrepared: () => void;
  onRemoveSpell: () => void;
}

const SpellPanel: React.FC<SpellPanelProps> = ({
  spellData,
  character,
  canPrepare,
  onTogglePrepared,
  onRemoveSpell
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getLevelText = (level: number) => {
    if (level === 0) return 'Заговор';
    return `${level} уровень`;
  };

  // Helper function to safely interpret components
  const getComponentString = () => {
    // If components is a string, use it directly
    if (typeof spellData.components === 'string') {
      return spellData.components;
    }
    
    // If it's an object with verbal/somatic/material properties
    if (spellData.components && typeof spellData.components === 'object') {
      const comp = spellData.components as Record<string, boolean>;
      const componentParts: string[] = [];
      
      if (comp.verbal) componentParts.push('В');
      if (comp.somatic) componentParts.push('С');
      if (comp.material) componentParts.push('М');
      
      return componentParts.join(", ");
    }
    
    // If we have direct verbal/somatic/material properties on the spell
    const componentParts: string[] = [];
    if (spellData.verbal) componentParts.push('В');
    if (spellData.somatic) componentParts.push('С');
    if (spellData.material) componentParts.push('М');
    
    return componentParts.join(", ");
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-primary/10 rounded-lg bg-black/30 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center p-3">
        <CollapsibleTrigger className="flex-1 flex items-center text-left">
          <div className="mr-4">
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0 text-xs font-normal",
                spellData.level === 0 ? "border-blue-400 text-blue-400" :
                spellData.level <= 3 ? "border-green-400 text-green-400" :
                spellData.level <= 6 ? "border-amber-400 text-amber-400" :
                "border-purple-400 text-purple-400"
              )}
            >
              {getLevelText(spellData.level)}
            </Badge>
          </div>
          <div className="flex-1">
            <div className="font-medium">{spellData.name}</div>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
              <span>{spellData.school || 'Универсальная'}</span>
              {spellData.ritual && <span>• Ритуал</span>}
              {spellData.concentration && <span>• Концентрация</span>}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <div className="flex items-center gap-2">
          {canPrepare && (
            <Button
              size="sm"
              variant={spellData.prepared ? "default" : "outline"}
              className={spellData.prepared ? "bg-primary" : ""}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePrepared();
              }}
              title={spellData.prepared ? "Снять подготовку" : "Подготовить заклинание"}
            >
              {spellData.prepared ? (
                <Check className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSpell();
            }}
            title="Удалить заклинание"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="p-4 pt-1 border-t border-primary/10">
          <dl className="space-y-2 text-sm">
            {spellData.castingTime && (
              <div className="flex">
                <dt className="w-1/3 font-medium">Время накладывания:</dt>
                <dd>{spellData.castingTime}</dd>
              </div>
            )}
            
            {spellData.range && (
              <div className="flex">
                <dt className="w-1/3 font-medium">Дистанция:</dt>
                <dd>{spellData.range}</dd>
              </div>
            )}
            
            <div className="flex">
              <dt className="w-1/3 font-medium">Компоненты:</dt>
              <dd>
                {getComponentString()}
                {spellData.material && spellData.materials && (
                  <span className="text-muted-foreground ml-1">({spellData.materials})</span>
                )}
              </dd>
            </div>
            
            {spellData.duration && (
              <div className="flex">
                <dt className="w-1/3 font-medium">Длительность:</dt>
                <dd>{spellData.duration}</dd>
              </div>
            )}
          </dl>
          
          {spellData.description && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Описание</h4>
              {typeof spellData.description === 'string' ? (
                <p className="text-sm">{spellData.description}</p>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(spellData.description) &&
                    spellData.description.map((paragraph, idx) => (
                      <p key={idx} className="text-sm">{paragraph}</p>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SpellPanel;
