
import React from 'react';
import { SpellData } from '@/types/spells';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { componentsToString, processSpellDescription } from '@/utils/spellProcessors';
import { Theme } from '@/types/theme';

interface SpellDetailViewProps {
  spell: SpellData;
  onClose: () => void;
  currentTheme?: Theme;
}

const SpellDetailView: React.FC<SpellDetailViewProps> = ({ spell, onClose, currentTheme }) => {
  // Используем дефолтную тему, если не передана текущая тема
  const theme = currentTheme || {
    background: '#121212',
    foreground: '#1a1a1a',
    primary: '#8B5A2B',
    accent: '#8B5A2B',
    textColor: '#FFFFFF',
    mutedTextColor: '#9ca3af',
    cardBackground: 'rgba(0, 0, 0, 0.85)',
    inputBackground: 'rgba(0, 0, 0, 0.85)',
  };

  return (
    <div className="bg-card shadow-lg rounded-lg p-6 border max-w-3xl mx-auto"
         style={{ backgroundColor: theme.cardBackground, borderColor: theme.accent }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.textColor }}>{spell.name}</h2>
          <p style={{ color: theme.mutedTextColor }}>
            {spell.school} - {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="px-3 py-1 rounded-md hover:bg-muted-foreground hover:text-card text-sm"
          style={{ backgroundColor: theme.primary, color: theme.textColor }}
        >
          Закрыть
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge style={{ backgroundColor: theme.primary }}>{spell.castingTime}</Badge>
        <Badge style={{ backgroundColor: theme.primary }}>{spell.range}</Badge>
        <Badge style={{ backgroundColor: theme.primary }}>
          {componentsToString({
            verbal: spell.verbal,
            somatic: spell.somatic,
            material: spell.material,
            ritual: spell.ritual,
            concentration: spell.concentration
          })}
        </Badge>
        <Badge style={{ backgroundColor: theme.primary }}>{spell.duration}</Badge>
      </div>

      <ScrollArea className="h-[200px] mb-4">
        <p style={{ color: theme.mutedTextColor }}>
          {processSpellDescription(spell.description)}
        </p>
      </ScrollArea>
      
      <div className="mt-6 space-y-4">
        {spell.classes && (
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>Классы</h3>
            <p style={{ color: theme.mutedTextColor }}>
              {Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes}
            </p>
          </div>
        )}

        {spell.materials && (
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>Материалы</h3>
            <p style={{ color: theme.mutedTextColor }}>{spell.materials}</p>
          </div>
        )}

        {spell.higherLevels && (
          <div className="border-t pt-4" style={{ borderColor: theme.accent }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>На более высоких уровнях</h3>
            <p style={{ color: theme.mutedTextColor }}>{spell.higherLevels}</p>
          </div>
        )}

        {spell.source && (
          <div className="border-t pt-4" style={{ borderColor: theme.accent }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>Источник</h3>
            <p style={{ color: theme.mutedTextColor }}>{spell.source}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellDetailView;
