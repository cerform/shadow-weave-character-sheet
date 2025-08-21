import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Map, 
  Lightbulb, 
  Settings, 
  Trash,
  Upload,
  Grid as GridIcon,
  Layers,
  Target
} from 'lucide-react';
import { MonsterSpawner } from '@/components/dm/MonsterSpawner';
import { CombatEntity } from '@/engine/combat/types';

interface DMToolsPanelProps {
  entities: CombatEntity[];
  sessionId: string;
  scene?: any;
  onToggleFogOfWar: () => void;
  onToggleGrid: () => void;
  onUploadMap: () => void;
  onAddLight: () => void;
  onClearMap: () => void;
  fogEnabled: boolean;
  gridVisible: boolean;
}

export function DMToolsPanel({
  entities,
  sessionId,
  scene,
  onToggleFogOfWar,
  onToggleGrid,
  onUploadMap,
  onAddLight,
  onClearMap,
  fogEnabled,
  gridVisible
}: DMToolsPanelProps) {
  const [activeTab, setActiveTab] = useState<'spawner' | 'map' | 'lighting'>('spawner');

  return (
    <Card className="fixed left-4 top-4 bottom-20 w-80 z-20 bg-background/95 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          DM Tools
        </CardTitle>
        
        {/* Tool Tabs */}
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'spawner' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('spawner')}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Spawn
          </Button>
          <Button
            variant={activeTab === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('map')}
            className="flex-1"
          >
            <Map className="h-4 w-4 mr-1" />
            Map
          </Button>
          <Button
            variant={activeTab === 'lighting' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('lighting')}
            className="flex-1"
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Light
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-full">
          {activeTab === 'spawner' && (
            <div className="space-y-4">
              <MonsterSpawner sessionId={sessionId} scene={scene} />
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Spawned Entities</h4>
                <div className="space-y-2">
                  {entities.filter(e => !e.isPlayer).map(entity => (
                    <div key={entity.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{entity.name}</div>
                        <div className="text-xs text-muted-foreground">
                          HP: {entity.hp.current}/{entity.hp.max} | AC: {entity.ac}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Target className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Map Controls</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={onUploadMap}
                    className="w-full justify-start"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Background
                  </Button>
                  
                  <Button
                    variant={gridVisible ? "default" : "outline"}
                    onClick={onToggleGrid}
                    className="w-full justify-start"
                  >
                    <GridIcon className="h-4 w-4 mr-2" />
                    Toggle Grid
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onClearMap}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Clear Map
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Fog of War</h4>
                <Button
                  variant={fogEnabled ? "default" : "outline"}
                  onClick={onToggleFogOfWar}
                  className="w-full justify-start"
                >
                  {fogEnabled ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {fogEnabled ? 'Disable Fog' : 'Enable Fog'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Fog of War controls what players can see on the map
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Map Layers</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Background</span>
                    <Badge variant="outline">Visible</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Grid</span>
                    <Badge variant={gridVisible ? "default" : "secondary"}>
                      {gridVisible ? 'Visible' : 'Hidden'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tokens</span>
                    <Badge variant="outline">Visible</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fog</span>
                    <Badge variant={fogEnabled ? "default" : "secondary"}>
                      {fogEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lighting' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Lighting Controls</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={onAddLight}
                    className="w-full justify-start"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Add Light Source
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Global Lighting</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Ambient Light</span>
                    <Badge variant="outline">40%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Directional Light</span>
                    <Badge variant="outline">100%</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}