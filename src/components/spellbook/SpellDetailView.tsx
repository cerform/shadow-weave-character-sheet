import React from 'react';
import { SpellData } from '@/types/spells';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { componentsToString, processSpellDescription } from '@/utils/spellProcessors';

interface SpellDetailViewProps {
  spell: SpellData;
  onClose: () => void;
}

const SpellDetailView: React.FC<SpellDetailViewProps> = ({ spell, onClose }) => {
  return (
    <div className="bg-card shadow-lg rounded-lg p-6 border max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{spell.name}</h2>
          <p className="text-muted-foreground">{spell.school} - {spell.level} уровень</p>
        </div>
        <button onClick={onClose} className="px-3 py-1 rounded-md bg-muted hover:bg-muted-foreground hover:text-card text-sm">
          Закрыть
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Badge>{spell.castingTime}</Badge>
        <Badge>{spell.range}</Badge>
        <Badge>{componentsToString({
          verbal: spell.verbal,
          somatic: spell.somatic,
          material: spell.material,
          ritual: spell.ritual,
          concentration: spell.concentration
        })}</Badge>
        <Badge>{spell.duration}</Badge>
      </div>

      <ScrollArea className="h-[200px] mb-4">
        <p className="text-muted-foreground">
          {processSpellDescription(spell.description)}
        </p>
      </ScrollArea>
      
      <div className="mt-6 space-y-4">
        {spell.classes && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Классы</h3>
            <p className="text-muted-foreground">
              {Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes}
            </p>
          </div>
        )}

        {spell.materials && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Материалы</h3>
            <p className="text-muted-foreground">{spell.materials}</p>
          </div>
        )}

        {spell.higherLevels && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">На более высоких уровнях</h3>
            <p className="text-muted-foreground">{spell.higherLevels}</p>
          </div>
        )}

        {spell.source && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Источник</h3>
            <p className="text-muted-foreground">{spell.source}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellDetailView;
