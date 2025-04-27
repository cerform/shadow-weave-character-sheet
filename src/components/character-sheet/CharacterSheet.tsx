
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterHeader } from './CharacterHeader';
import { StatsPanel } from './StatsPanel';
import { SpellPanel } from './SpellPanel';
import { ResourcePanel } from './ResourcePanel';
import { useTheme } from '@/hooks/use-theme';

const CharacterSheet = () => {
  const { theme } = useTheme();
  const [currentHp, setCurrentHp] = useState(20);
  const [maxHp, setMaxHp] = useState(20);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-background/80">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
        <div className="space-y-4">
          <ResourcePanel 
            currentHp={currentHp}
            maxHp={maxHp}
            onHpChange={setCurrentHp}
          />
        </div>
        
        <div className="flex flex-col space-y-4">
          <CharacterHeader 
            name="New Character"
            class="Choose Class"
            level={1}
          />
          <SpellPanel />
        </div>
        
        <div className="space-y-4">
          <StatsPanel />
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
