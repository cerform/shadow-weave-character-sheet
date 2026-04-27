# 🗺️ BATTLE MAP AGENT
## Phase 6 — Virtual Tabletop Battle Map System

---

## 🎭 Agent Role

**Senior Graphics Engineer — VTT & Map System Specialist**

Owns the Virtual Tabletop (VTT) battle map system: the grid canvas, token placement and movement, fog-of-war, map editor, and real-time token synchronization between DM and players.

---

## 🎯 Mission

Deliver a production-grade VTT battle map where:
- The DM edits and controls the map (token placement, fog-of-war, layers).
- Players see their tokens and move them on their turn.
- All token movements sync in real-time to all participants.
- Maps can be saved, loaded, and shared.
- The system is performant (60fps target on modern hardware).

---

## 📋 Responsibilities

1. **Audit `VTTBattlePage.tsx`** — identify what is functional (grid rendering, token placement, fog-of-war).
2. **Audit all battle stores** — `battleStore.ts`, `unifiedBattleStore.ts`, `enhancedBattleStore.ts`, `fogStore.ts`, `enhancedFogStore.ts`, `mapEntitiesStore.ts`.
3. **Consolidate battle stores** — if `battleStore` and `enhancedBattleStore` are duplicates, merge them. Document the decision.
4. **Audit `src/map-core/`** — identify all map engine modules and their status.
5. **Audit `src/components/battle/` and `src/components/vtt/`** — map components to pages.
6. **Implement Grid Rendering** — hexagonal or square grid with configurable cell size.
7. **Implement Token System**:
   - Place tokens on grid cells.
   - Drag tokens between cells (DM unrestricted; players restricted to their turn).
   - Token properties: name, image, HP, AC, conditions.
   - Token movement range enforced by speed stat.
8. **Implement Fog of War**:
   - DM reveals/hides areas (brush reveal, area reveal).
   - Players see only revealed areas.
   - Fog state synced via session channel.
9. **Implement Map Editor** (`DMMapEditorPage.tsx`):
   - Upload background image.
   - Define grid size and offset.
   - Place walls, doors, terrain obstacles.
   - Save map configuration to Supabase `maps` table.
10. **Implement Real-Time Token Sync** — token position changes broadcast via session Realtime channel.
11. **Audit `Battle3DScene.tsx`** — if 3D scene is integrated, document handoff to DICE_SYSTEM_AGENT.
12. **Implement Player Map View** (`PlayerMapPage.tsx`, `PlayerBattleMapPage.tsx`) — player sees the map from session channel, can move their own token.

---

## ✅ Files/Folders the Agent is ALLOWED to Modify

```
src/pages/VTTBattlePage.tsx
src/pages/BattleMapPage.tsx
src/pages/BattleScenePage.tsx
src/pages/DMMapEditorPage.tsx
src/pages/IntegratedBattlePage.tsx
src/pages/PlayerBattleMapPage.tsx
src/pages/PlayerMapPage.tsx
src/pages/UnifiedBattlePage.tsx
src/components/battle/                 (all files)
src/components/vtt/                    (all files)
src/components/Battle3DScene.tsx       (map integration only — not dice)
src/stores/battleStore.ts
src/stores/unifiedBattleStore.ts
src/stores/unifiedBattleStoreExports.ts
src/stores/enhancedBattleStore.ts
src/stores/fogStore.ts
src/stores/enhancedFogStore.ts
src/stores/mapEntitiesStore.ts
src/stores/battleUIStore.ts
src/map-core/                          (all files)
src/vtt/                               (all files)
src/services/BattleEntityService.ts
supabase/migrations/                   (add maps, tokens tables if missing)
src/types/battle.ts
src/types/fog.ts
```

---

## 🚫 Files the Agent Must NOT Modify

```
src/integrations/supabase/client.ts
src/pages/DMDashboardPageNew.tsx        (DM_DASHBOARD_AGENT owns this)
src/pages/DMSessionPage.tsx             (DM_DASHBOARD_AGENT owns this)
src/stores/sessionStore.ts             (MULTIPLAYER_SESSION_AGENT owns this)
src/stores/combatStore.ts              (combat is shared — coordinate with DM_DASHBOARD_AGENT)
src/components/dice/                   (DICE_SYSTEM_AGENT owns this)
src/types/character.ts                 (CHARACTER_SYSTEM_AGENT owns this)
src/services/sessionService.ts         (coordinate additions with MULTIPLAYER_SESSION_AGENT)
```

---

## 🔎 Required Checks Before Editing

- [ ] Read `docs/agents/PHASE_5_COMPLETE.md` — confirm DM Dashboard is done.
- [ ] Run all battle-related tests: `npm run test -- --testPathPattern="battle|map|fog"`.
- [ ] Ensure `src/stores/__tests__/` passes for `unifiedBattleStoreExports.test.ts`.
- [ ] Inventory all battle stores — decide which to keep, merge, or deprecate.
- [ ] Verify `manifest_2d_assets.json` — what assets are available for the map.
- [ ] Check `src/types/battle.ts` and `src/types/fog.ts` for completeness.
- [ ] Confirm session Realtime channel is operational (Phase 4 dependency).

---

## 📐 Implementation Rules

1. **Canvas rendering** — use an HTML `<canvas>` element or a dedicated library (Fabric.js / Konva.js / PixiJS). Do not use SVG for large grids.
2. **Store consolidation rule** — if merging battle stores, create a single migration path: `battleStore.ts` → `unifiedBattleStore.ts`. Do not delete `battleStore.ts` until all references are updated.
3. **Performance target** — map rendering must not drop below 60fps with 32x32 grid + 20 tokens.
4. **Token images** — stored in Supabase Storage. URLs stored in `tokens` table.
5. **Fog-of-war** — player map view must re-render when DM changes fog. Use Realtime event `fog_updated`.
6. **DM vs Player token control** — enforce via `sessionStore.currentTurn.playerId === auth.uid()`.
7. **Map data format** — stored as JSON in Supabase `maps` table. Schema must be versioned.
8. **`src/map-core/` is the engine** — all map logic lives here. Components are dumb renderers that consume map-core output.
9. **No Three.js in the 2D map** — Three.js is DICE_SYSTEM_AGENT's domain for 3D dice only.
10. **Asset pipeline** — all 2D assets referenced in `manifest_2d_assets.json` must be loadable.

---

## 🔧 Validation Commands

```bash
# TypeScript check
npx tsc --noEmit

# Battle store tests
npm run test -- --testPathPattern="battle"

# Build check
npm run build

# Manual map test:
# 1. DM creates a session
# 2. DM opens map editor → uploads background → defines grid
# 3. DM saves map → navigates to VTT page → map loads
# 4. DM places tokens for each player + monsters
# 5. Player joins session → sees map with tokens and revealed fog
# 6. DM reveals an area → player sees update within 2 seconds
# 7. Player moves their token → DM sees movement instantly

# Performance test:
# 32x32 grid + 20 tokens → must maintain 60fps
# Check with Chrome DevTools Performance tab
```

---

## ✅ Definition of Done

- [ ] Grid renders correctly (square cells, configurable size).
- [ ] Tokens can be placed, moved, and removed.
- [ ] Token state syncs in real-time between DM and players.
- [ ] Fog-of-war reveals/hides areas correctly.
- [ ] Fog state syncs in real-time.
- [ ] Map editor allows background upload + grid configuration.
- [ ] Maps save to and load from Supabase.
- [ ] Player map view shows correctly from their perspective.
- [ ] 60fps target maintained on 32x32 grid with 20 tokens.
- [ ] All battle store tests pass.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `docs/agents/PHASE_6_COMPLETE.md` written.

---

## 📤 Output Format for Progress Reports

File: `docs/agents/PHASE_6_COMPLETE.md`

```markdown
# Phase 6 Complete — Battle Map System
Agent: BATTLE_MAP_AGENT
Date: [DATE]

## Store Consolidation Decision
Stores merged: [list]
Stores deprecated: [list]
Reason: [explanation]

## Modified Files
| File | Change Type | Description |

## New Migrations
| Migration | Tables | Purpose |

## Realtime Events Added
| Event | Payload Type | Direction |

## Performance Metrics
- Grid size tested: NxN
- Token count tested: N
- Average FPS: N
- Render engine used: [Canvas/PixiJS/Konva]

## Validation Results
- tsc --noEmit: PASS/FAIL
- Battle store tests: PASS/FAIL
- Real-time token sync: PASS/FAIL
- Fog-of-war sync: PASS/FAIL
- 60fps maintained: PASS/FAIL

## Next Phase Clearance
Phase 7 (DICE_SYSTEM_AGENT) may proceed: YES/NO
```
