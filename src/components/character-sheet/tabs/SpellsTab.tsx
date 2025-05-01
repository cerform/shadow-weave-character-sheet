
import React, { useContext } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterContext } from "@/contexts/CharacterContext";
import { getSpellDetails } from "@/data/spells";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Book } from "lucide-react";

export const SpellsTab = () => {
  const { character } = useContext(CharacterContext);
  
  // Group spells by level
  const spellsByLevel = character?.spells?.reduce((acc: {[key: string]: string[]}, spell: string) => {
    const spellDetails = getSpellDetails(spell);
    const level = spellDetails?.level ?? 0;
    
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(spell);
    return acc;
  }, {}) || {};

  const getLevelName = (level: number): string => {
    return level === 0 ? "Заговоры" : `${level} круг`;
  };

  const getSchoolColor = (school: string): string => {
    const schoolColors: {[key: string]: string} = {
      "Воплощение": "bg-red-500/20",
      "Ограждение": "bg-blue-500/20",
      "Иллюзия": "bg-purple-500/20",
      "Некромантия": "bg-green-500/20",
      "Призывание": "bg-amber-500/20",
      "Прорицание": "bg-cyan-500/20",
      "Очарование": "bg-pink-500/20",
      "Трансмутация": "bg-emerald-500/20",
      "Зачарование": "bg-violet-500/20"
    };
    
    return schoolColors[school] || "bg-primary/20";
  };

  if (!character?.spells || character?.spells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Book className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Нет доступных заклинаний</h3>
        <p className="text-muted-foreground text-center max-w-md">
          У вашего персонажа еще нет заклинаний. Заклинания можно получить 
          при создании персонажа или при повышении уровня.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Заклинания</h3>
      
      {character?.spellSlots && Object.keys(character.spellSlots).length > 0 && (
        <div className="bg-primary/5 rounded-lg p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center">
          {Object.entries(character.spellSlots).map(([level, slot]: [string, any]) => (
            <div key={level}>
              <div className="text-xs text-muted-foreground">{level} круг</div>
              <div className="font-bold">{slot.max - slot.used}/{slot.max}</div>
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-6">
        {Object.entries(spellsByLevel)
          .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
          .map(([level, spellNames]) => (
            <div key={level}>
              <h4 className="font-medium mb-2">{getLevelName(Number(level))}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {spellNames.map((spell: string) => {
                  const details = getSpellDetails(spell);
                  
                  return (
                    <HoverCard key={spell}>
                      <HoverCardTrigger asChild>
                        <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">{spell}</h5>
                            {details?.school && (
                              <span className={`text-xs px-2 py-1 rounded ${getSchoolColor(details.school)}`}>
                                {details.school}
                              </span>
                            )}
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">{spell}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${details?.school ? getSchoolColor(details.school) : ''}`}>
                              {Number(level) === 0 ? "Заговор" : `${level} круг`}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{details?.school}</p>
                          <p className="text-sm mt-2">{details?.description}</p>
                          <div className="text-xs text-muted-foreground pt-2 border-t">
                            Классы: {details?.classes.join(", ")}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
