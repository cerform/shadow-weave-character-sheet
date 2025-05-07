// src/pages/DMDashboardPage.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SessionManager from '@/components/dm/SessionManager';
import PlayerMonitor from '@/components/dm/PlayerMonitor';
import EncounterBuilder from '@/components/dm/EncounterBuilder';
import MapControl from '@/components/dm/MapControl';
import DiceControl from '@/components/dm/DiceControl';
import InitiativeTracker from '@/components/dm/InitiativeTracker';
import EffectPanel from '@/components/dm/EffectPanel';
import TimelineControl from '@/components/dm/TimelineControl';
import NarrativeNotes from '@/components/dm/NarrativeNotes';
import WebCamGrid from '@/components/dm/WebCamGrid';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

const DMDashboardPage: React.FC = () => {
  return (
    <OBSLayout
      topPanelContent={
        <div className="flex justify-between items-center p-3">
          <h1 className="text-xl font-bold text-yellow-400">DM Dashboard</h1>
          <IconOnlyNavigation includeThemeSelector />
        </div>
      }
    >
      <div className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger value="session">🎲 Сессия</TabsTrigger>
            <TabsTrigger value="map">🗺️ Карта</TabsTrigger>
            <TabsTrigger value="combat">⚔️ Бой</TabsTrigger>
            <TabsTrigger value="narrative">📖 Сюжет</TabsTrigger>
          </TabsList>

          {/* Session Control */}
          <TabsContent value="session">
            <div className="grid md:grid-cols-2 gap-4">
              <SessionManager />
              <PlayerMonitor />
              <DiceControl />
            </div>
          </TabsContent>

          {/* Map Control */}
          <TabsContent value="map">
            <MapControl />
            <WebCamGrid />
          </TabsContent>

          {/* Combat Tracker */}
          <TabsContent value="combat">
            <div className="grid md:grid-cols-2 gap-4">
              <EncounterBuilder />
              <InitiativeTracker />
              <EffectPanel />
            </div>
          </TabsContent>

          {/* Narrative Tools */}
          <TabsContent value="narrative">
            <NarrativeNotes />
            <TimelineControl />
          </TabsContent>
        </Tabs>
      </div>
    </OBSLayout>
  );
};

export default DMDashboardPage;