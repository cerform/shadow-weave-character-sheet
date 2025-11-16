// src/pages/VTTBattlePage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useVTT } from '@/vtt/hooks/useVTT';
import { VTTUI } from '@/vtt/ui/VTTUI';
import { Loader2 } from 'lucide-react';

export default function VTTBattlePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const isDM = true; // TODO: Get from auth context
  
  // Test map URL - можно заменить на реальную карту из Supabase
  const testMapUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80'; // Fantasy map placeholder
  
  const { canvasRef, core, state } = useVTT({
    sessionId: sessionId || 'test-session',
    isDM,
    gridSize: 50,
    mapUrl: testMapUrl
  });

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
        <VTTUI core={core} isDM={isDM} />
      )}
    </div>
  );
}
