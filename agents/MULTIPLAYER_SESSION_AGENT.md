# 🌐 MULTIPLAYER SESSION AGENT
## Phase 4 — Real-Time Multiplayer Sessions

---

## 🎭 Agent Role

**Senior Real-Time Systems Engineer — WebSocket & Supabase Realtime Specialist**

Owns the entire session management system: session creation, player join/leave flows, real-time state synchronization between DM and players, and presence tracking.

---

## 🎯 Mission

Implement a fully functional, real-time multiplayer session system where:
- A Dungeon Master can create a session with a unique join code.
- Players can join a session using that code.
- All participants see live state updates (initiative, HP changes, map state, dice rolls).
- Disconnection/reconnection is handled gracefully without data loss.
- Session state is persisted in Supabase between reconnects.

---

## 📋 Responsibilities

1. **Audit `sessionService.ts`** — identify what's implemented vs. mocked.
2. **Audit `socket.ts` and `websocketService.ts`** — determine which transport is in use and consolidate.
3. **Audit `sessionStore.ts`** — verify state shape matches `src/types/session.ts`.
4. **Implement session creation** in `CreateSessionPage.tsx` — creates a `game_sessions` row in Supabase.
5. **Implement session join** in `JoinSessionPage.tsx` — validates join code, adds player to session.
6. **Implement Supabase Realtime channel** for session events:
   - `player_joined` / `player_left`
   - `initiative_updated`
   - `hp_changed`
   - `map_state_updated`
   - `dice_rolled`
   - `dm_message`
7. **Implement presence tracking** — who is online, player + DM avatars.
8. **Implement session chat** — `SessionChat.tsx` connected to real Supabase Realtime channel.
9. **Implement graceful disconnect** — reconnect automatically, restore state.
10. **Implement session end** — DM can end session, all players see "session ended" screen.
11. **Audit `PlayerSessionPage.tsx` and `DMSessionPage.tsx`** — ensure they use sessionStore, not local state.

---

## ✅ Files/Folders the Agent is ALLOWED to Modify

```
src/services/sessionService.ts
src/services/socket.ts
src/services/websocketService.ts
src/stores/sessionStore.ts
src/types/session.ts
src/types/socket.d.ts
src/pages/CreateSessionPage.tsx
src/pages/JoinSessionPage.tsx
src/pages/PlayerSessionPage.tsx
src/pages/PlayerSessionsPage.tsx
src/pages/GameRoomPage.tsx
src/components/session/             (all files)
src/components/SessionChat.tsx
src/hooks/useSession.ts             (create/modify)
src/hooks/usePresence.ts            (create/modify)
supabase/migrations/                (add new migrations only — game_sessions, session_players tables)
```

---

## 🚫 Files the Agent Must NOT Modify

```
src/integrations/supabase/client.ts     (never touch)
src/pages/DMDashboardPageNew.tsx        (DM_DASHBOARD_AGENT owns this)
src/pages/DMSessionPage.tsx             (DM_DASHBOARD_AGENT owns this)
src/pages/VTTBattlePage.tsx             (BATTLE_MAP_AGENT owns this)
src/stores/battleStore.ts              (BATTLE_MAP_AGENT owns this)
src/stores/unifiedBattleStore.ts       (BATTLE_MAP_AGENT owns this)
src/types/character.ts                 (CHARACTER_SYSTEM_AGENT owns this)
src/services/characterStorage.ts       (FIREBASE_PERSISTENCE_AGENT owns this)
src/components/battle/                 (BATTLE_MAP_AGENT owns this)
src/AppRoutes.tsx                      (only add session routes if missing — careful)
tailwind.config.ts
```

---

## 🔎 Required Checks Before Editing

- [ ] Read `docs/agents/PHASE_3_COMPLETE.md` — confirm persistence is stable.
- [ ] Read `src/types/session.ts` fully before modifying.
- [ ] Determine which transport is primary: `socket.ts` (Socket.io) or `websocketService.ts` (native).
- [ ] Check if `game_sessions` table exists in Supabase.
- [ ] Check if `session_players` table exists in Supabase.
- [ ] Verify Supabase Realtime is enabled for the project.
- [ ] Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
- [ ] Run `npm run test` and record baseline.

---

## 📐 Implementation Rules

1. **Single transport layer** — decide between Socket.io and Supabase Realtime. Do not use both for the same events. Prefer Supabase Realtime for simplicity; use Socket.io only if the backend server is already functional.
2. **Session state shape** — strictly use `src/types/session.ts`. No inline type definitions.
3. **Session ID format** — UUID v4. Join codes are 6-character alphanumeric (e.g., "XK7D2M").
4. **All session mutations go through `sessionService.ts`** — never call Supabase directly from components.
5. **Realtime channel naming**: `session:{sessionId}` — consistent across all events.
6. **Cleanup on unmount** — always call `channel.unsubscribe()` in `useEffect` cleanup.
7. **No polling** — all live updates must be push-based (Realtime or WebSocket).
8. **Error recovery** — on WebSocket disconnect, attempt reconnect with exponential backoff (1s, 2s, 4s, max 30s).
9. **Player identity** — always tied to `auth.uid()` from Supabase Auth. No anonymous sessions.
10. **Session capacity** — enforce maximum player count (default: 6 players + 1 DM).

---

## 🔧 Validation Commands

```bash
# TypeScript check
npx tsc --noEmit

# Unit tests
npm run test

# Manual multiplayer test:
# 1. Open two browser windows (or incognito)
# 2. Window 1: Log in as DM, create a session → get join code
# 3. Window 2: Log in as Player, join with code
# 4. DM changes initiative order → Player sees update within 2 seconds
# 5. Player changes HP → DM sees update

# Verify Supabase Realtime subscription
# In browser console (on session page):
# window.__sessionChannel?.state should be 'joined'

# Check for WebSocket connection
# Browser DevTools → Network → WS tab → verify active connection
```

---

## ✅ Definition of Done

- [ ] DM can create a session with a unique join code.
- [ ] Player can join using that code.
- [ ] Both users see the same session state.
- [ ] State updates propagate within 2 seconds.
- [ ] Disconnection shows a toast — reconnects automatically.
- [ ] Session persists in Supabase between reconnects.
- [ ] `SessionChat.tsx` sends/receives real messages.
- [ ] Presence shows who is online.
- [ ] Session end flow works.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `docs/agents/PHASE_4_COMPLETE.md` written.

---

## 📤 Output Format for Progress Reports

File: `docs/agents/PHASE_4_COMPLETE.md`

```markdown
# Phase 4 Complete — Multiplayer Sessions
Agent: MULTIPLAYER_SESSION_AGENT
Date: [DATE]

## Transport Decision
Primary transport: [Supabase Realtime / Socket.io]
Reason: [explanation]

## Modified Files
| File | Change Type | Description |

## New Migrations
| Migration | Tables | Purpose |

## Events Implemented
| Event Name | Direction | Handler |

## Validation Results
- tsc --noEmit: PASS/FAIL
- Two-window sync test: PASS/FAIL
- Reconnection test: PASS/FAIL
- Session persistence: PASS/FAIL

## Next Phase Clearance
Phase 5 (DM_DASHBOARD_AGENT) may proceed: YES/NO
```
