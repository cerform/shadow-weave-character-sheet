// src/pages/VTTBattlePage.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVTT } from '@/vtt/hooks/useVTT';
import { VTTUI } from '@/vtt/ui/VTTUI';
import { FogTools } from '@/vtt/ui/FogTools';
import { Loader2 } from 'lucide-react';

export default function VTTBattlePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const isDM = true; // TODO: Get from auth context
  
  // Test map URL - можно заменить на реальную карту из Supabase
  const testMapUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80'; // Fantasy map placeholder
  
  const { canvasRef, core, state, fog } = useVTT({
    sessionId: sessionId || 'test-session',
    isDM,
    gridSize: 50,
    mapUrl: testMapUrl
  });

  // Initialize fog of war
  useEffect(() => {
    if (!core || !state.initialized) return;

    const mapId = 'test-map-id';
    const gridWidth = 40;
    const gridHeight = 40;

    fog.initializeFog(sessionId || 'test-session', mapId, isDM, gridWidth, gridHeight);
  }, [core, state.initialized, sessionId, isDM]);

  // Add test tokens for demonstration
  useEffect(() => {
    if (!core || !state.initialized) return;

    // Add demo tokens
    const demoTokens = [
      {
        id: 'player-1',
        name: 'Fighter',
        position: [-100, -100] as [number, number],
        size: 1,
        color: '#4444ff',
        hp: 45,
        maxHp: 50,
        ac: 18,
        isPlayer: true,
        isVisible: true
      },
      {
        id: 'player-2',
        name: 'Wizard',
        position: [-50, -100] as [number, number],
        size: 1,
        color: '#8844ff',
        hp: 28,
        maxHp: 30,
        ac: 12,
        isPlayer: true,
        isVisible: true
      },
      {
        id: 'enemy-1',
        name: 'Goblin',
        position: [100, 100] as [number, number],
        size: 0.8,
        color: '#ff4444',
        hp: 7,
        maxHp: 7,
        ac: 15,
        isPlayer: false,
        isVisible: true
      },
      {
        id: 'enemy-2',
        name: 'Orc',
        position: [150, 100] as [number, number],
        size: 1.2,
        color: '#dd2222',
        hp: 15,
        maxHp: 15,
        ac: 13,
        isPlayer: false,
        isVisible: true
      }
    ];

    demoTokens.forEach(token => core.addOrUpdateToken(token));
    
    // Select first player token for demo
    setTimeout(() => {
      core.selectToken('player-1');
    }, 500);

    console.log('[VTTBattlePage] Demo tokens added');
  }, [core, state.initialized]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* WebGL Canvas - all graphics rendered here */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Loading state */}
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Initializing WebGL engine...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="max-w-md p-6 bg-destructive/10 border border-destructive rounded-lg">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              WebGL Initialization Error
            </h2>
            <p className="text-sm text-muted-foreground">{state.error}</p>
          </div>
        </div>
      )}

      {/* React UI overlay (only when initialized) */}
      {state.initialized && (
        <>
          <VTTUI core={core} isDM={isDM} />
          
          {/* Fog Tools (DM only) */}
          {isDM && (
            <FogTools
              brush={fog.brush}
              onBrushChange={fog.setBrush}
              onRevealAll={() => core?.revealAllFog()}
              onHideAll={() => core?.hideAllFog()}
              visible={fog.enabled}
            />
          )}
        </>
      )}
    </div>
  );
}
