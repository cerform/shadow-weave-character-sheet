# Stabilization Recovery Report: Realtime Sync & WebSockets

## Executive Summary
This document outlines the stabilization and architectural overhaul performed on the Supabase Realtime (WebSocket) infrastructure for the Shadow Weave Character Sheet VTT. The platform was previously suffering from severe WebSocket connection failures, "reconnection loops", and memory leaks due to excessive and fragmented channel subscriptions. 

This stabilization initiative effectively halts Phase 11 feature development in favor of addressing critical regressions in production capabilities.

## The Problem
Prior to stabilization, the application utilized an uncoordinated approach to Realtime synchronization:
1. **Redundant Channels:** Components like `VTTBattlePage`, `DMSessionPage`, `PlayersList`, `BattleController`, and custom hooks (`useBattleTokensSync`, `useFogSync`, `useSessionSync`, etc.) all opened their own dedicated `supabase.channel()` instances.
2. **Connection Leakage:** Some components failed to properly unsubscribe or disconnect on unmount, leading to hanging sockets.
3. **Limit Exhaustion:** Supabase enforces strict limits on concurrent WebSocket channels. By opening 10-15 independent channels per user session, the VTT quickly exhausted these limits, triggering connection refusals, WebSocket drops, and infinite reconnection loops.
4. **Data Race Conditions:** Overlapping subscriptions to the same Postgres tables led to duplicate UI updates and state race conditions.

## The Solution: Unified RealtimeManager
To resolve these blockers, we implemented a centralized `RealtimeManager` singleton (`src/services/RealtimeService.ts`).

### Key Architectural Changes
1. **The "One-Channel" Policy:** The `RealtimeManager` enforces a single, multiplexed Supabase channel per active Game Session (`unified-session-{sessionId}`).
2. **Centralized Pub/Sub Registry:** Components no longer create channels. Instead, they register callbacks with the `RealtimeManager` for specific Postgres tables (`game_sessions`, `session_messages`, `battle_tokens`, `initiative_tracker`, `fog_of_war`, `map_entities`, `battle_entities`) or Presence events.
3. **Automatic Presence Tracking:** `RealtimeManager` handles user presence tracking automatically when a connection is established, ensuring reliable online/offline statuses without manual component intervention.
4. **Broadcast Integration:** The service unifies legacy Socket.io requirements (e.g., cursor tracking) into the same Supabase WebSocket channel.

### Refactored Components
The following key systems were migrated to the unified manager:
*   `src/pages/VTTBattlePage.tsx`
*   `src/pages/DMSessionPage.tsx`
*   `src/components/battle/PlayersList.tsx`
*   `src/components/battle/ModernDMDashboard.tsx`
*   `src/components/battle/BattleSystem.tsx`
*   `src/components/battle/BattleMapUI/core/BattleController.ts`
*   `src/contexts/SocketContext.tsx`
*   `src/hooks/useBattleTokensSync.ts`
*   `src/hooks/useSessionSync.ts`
*   `src/hooks/useBattleMapSync.ts`
*   `src/hooks/useFogSync.ts`
*   `src/hooks/useBattleEntitySync.ts`

## Production Readiness
*   **Stability:** The system now guarantees minimal WebSocket overhead (1 connection per client).
*   **Resource Cleanup:** All replaced hooks correctly utilize the returned `unsub()` function to cleanly deregister listeners upon unmounting.
*   **Future Proofing:** Any future real-time features must strictly adhere to the `RealtimeManager.onPgChange()` pattern instead of creating standalone channels.

## Next Steps
While the connection instability has been resolved, we must continue to monitor:
1.  **Row Level Security (RLS):** Ensure that consolidated database updates correctly pass RLS rules for all multiplexed tables.
2.  **Legacy Socket Deprecation:** We have preserved the `socketService` for fallback, but it should be completely excised in favor of `RealtimeManager.sendBroadcast` in upcoming stabilization rounds.
