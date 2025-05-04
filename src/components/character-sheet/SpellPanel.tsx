import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/contexts/CharacterContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterSpell } from '@/types/character';
import { spells as allSpells } from '@/data/spells';

interface SpellPanelProps {
  character: Character | null;
}

const SpellPanel: React.FC<SpellPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  // Determine if the spells array contains strings or CharacterSpell objects
  const isSpellObjectArray = (spells: string[] | CharacterSpell[]): spells is CharacterSpell[] => {
    return spells.length > 0 && typeof spells[0] !== 'string';
  };

  const renderSpellList = () => {
    if (!character?.spells || character.spells.length === 0) {
      return (
        <div className="text-center py-2">
          <p className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
            Нет известных заклинаний
          </p>
        </div>
      );
    }

    // Group spells by level
    const spellsByLevel: { [level: number]: any[] } = {};

    character.spells.forEach(spell => {
      let spellObject: any;
      
      if (isSpellObjectArray(character.spells as any[])) {
        // It's already a CharacterSpell object
        spellObject = spell;
      } else {
        // It's a string, find the full spell in the spells database
        spellObject = allSpells.find(s => s.name === spell) || {
          name: spell,
          level: 0,
          school: "Unknown",
          description: "No description available"
        };
      }
      
      const level = spellObject.level || 0;
      if (!spellsByLevel[level]) spellsByLevel[level] = [];
      spellsByLevel[level].push(spellObject);
    });

    const getSpellClasses = (spell: any) => {
      if (!spell) return "";
      
      if (spell.classes) {
        if (Array.isArray(spell.classes)) {
          return spell.classes.join(", ");
        }
        return spell.classes;
      }
      return "";
    };

    const getSpellHigherLevels = (spell: any) => {
      return spell.higherLevels || spell.higherLevel || "";
    };

    return (
      <div className="space-y-3">
        {Object.entries(spellsByLevel).sort((a, b) => Number(a[0]) - Number(b[0])).map(([level, spells]) => (
          <div key={level}>
            <h4 className="text-md font-semibold mb-1" style={{ color: currentTheme.textColor }}>
              {level === "0" ? "Заговоры" : `Уровень ${level}`}
            </h4>
            <div className="space-y-2">
              {spells.map((spell: CharacterSpell | any) => (
                <Card
                  key={spell.name}
                  className="bg-card/40 backdrop-blur-sm border-primary/10"
                >
                  <CardHeader className="p-3 flex items-center justify-between">
                    <CardTitle style={{ color: currentTheme.textColor }} className="text-sm">
                      {spell.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {spell.school}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
                      {spell.description?.substring(0, 100)}...
                    </p>
                    {expandedSpell === spell.name && (
                      <div className="mt-2">
                        <p className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
                          Классы: {getSpellClasses(spell)}
                        </p>
                        {getSpellHigherLevels(spell) && (
                          <p className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
                            На больших уровнях: {getSpellHigherLevels(spell)}
                          </p>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setExpandedSpell(expandedSpell === spell.name ? null : spell.name)
                      }
                      className="text-xs mt-2 underline"
                      style={{ color: currentTheme.accent }}
                    >
                      {expandedSpell === spell.name ? "Скрыть" : "Подробнее"}
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20 p-4">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Заклинания</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full">
          <div className="p-4">
            {renderSpellList()}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SpellPanel;
