import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVTT } from '@/vtt/hooks/useVTT';
import { VTTLayout } from '@/components/vtt/VTTLayout';
import { FogTools } from '@/vtt/ui/FogTools';
import { Loader2 } from 'lucide-react';
import { socketService } from '@/services/socket';
import { supabase } from '@/integrations/supabase/client';

export default function VTTBattlePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const isDM = sessionData?.dm_id === currentUser?.id;
  
  const { canvasRef, core, state, fog } = useVTT({
    sessionId: sessionId || 'test-session',
    isDM,
    gridSize: 50,
    mapUrl: sessionData?.battle_map?.url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80'
  });

  // Connect socket and fetch session info
  useEffect(() => {
    if (!sessionId || !currentUser) return;

    const joinGame = async () => {
      try {
        const session = await socketService.joinSession(
          sessionId, 
          currentUser.user_metadata?.full_name || currentUser.email || 'Player',
          undefined // No character for now
        );
        setSessionData(session);
      } catch (err) {
        console.error('Failed to join session:', err);
      }
    };

    joinGame();
  }, [sessionId, currentUser]);

  // Initializing fog
  useEffect(() => {
    if (!core || !state.initialized || !sessionData) return;
    fog.initializeFog(sessionId!, 'map-id', isDM, 50, 50);
  }, [core, state.initialized, sessionData, isDM]);

  return (
    <VTTLayout>
      {/* WebGL Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* Loading & Error States */}
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Entering the Shadow Weave...</p>
          </div>
        </div>
      )}

      {/* DM Fog Tools Overlay */}
      {isDM && state.initialized && (
        <div className="absolute top-20 left-4 z-50">
          <FogTools
            brush={fog.brush}
            onBrushChange={fog.setBrush}
            onRevealAll={() => core?.revealAllFog()}
            onHideAll={() => core?.hideAllFog()}
            visible={fog.enabled}
          />
        </div>
      )}
    </VTTLayout>
  );
}
