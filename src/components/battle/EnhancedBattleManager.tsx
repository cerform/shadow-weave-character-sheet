import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CombatManager } from './CombatManager';
import { CombatLog } from './CombatLog';
import { ConditionsPanel } from './ConditionsPanel';
import InitiativeTracker from './InitiativeTracker';
import useBattleStore from '@/stores/battleStore';
import { useCombatStore } from '@/stores/combatStore';

export const EnhancedBattleManager: React.FC = () => {
  const { tokens, selectedTokenId, isDM } = useBattleStore();
  const { initiative, isInCombat } = useCombatStore();

  if (!isDM) {
    return (
      <div className="w-full space-y-4">
        <InitiativeTracker 
          initiative={initiative}
          tokens={tokens}
          battleActive={isInCombat}
        />
        {selectedTokenId && (
          <ConditionsPanel tokenId={selectedTokenId.toString()} />
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="combat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="combat">Бой</TabsTrigger>
          <TabsTrigger value="initiative">Инициатива</TabsTrigger>
          <TabsTrigger value="conditions">Состояния</TabsTrigger>
          <TabsTrigger value="log">Лог</TabsTrigger>
        </TabsList>
        
        <TabsContent value="combat" className="space-y-4">
          <CombatManager />
        </TabsContent>
        
        <TabsContent value="initiative" className="space-y-4">
          <InitiativeTracker 
            initiative={initiative}
            tokens={tokens}
            battleActive={isInCombat}
          />
        </TabsContent>
        
        <TabsContent value="conditions" className="space-y-4">
          <ConditionsPanel tokenId={selectedTokenId?.toString()} />
        </TabsContent>
        
        <TabsContent value="log" className="space-y-4">
          <CombatLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};