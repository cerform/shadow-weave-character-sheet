# 🎲 DICE SYSTEM AGENT
## Phase 7 — 3D Physics Dice System

---

## 🎭 Agent Role

**Senior Graphics & Physics Engineer — Three.js / Cannon.js Dice Specialist**

Owns the 3D dice rolling system: physics simulation, dice models, roll result extraction, and integration with the combat/session state.

---

## 🎯 Mission

Deliver a visually impressive, physically accurate 3D dice system where:
- Players can roll any D&D dice (d4, d6, d8, d10, d12, d20, d100).
- Dice physics simulation produces a believable roll animation ending in a natural rest.
- Roll results are extracted from the final die face and applied to game state (attack rolls, damage, saving throws, skill checks).
- Rolls are broadcast to all session participants (DM and players see the same result).
- The system is performant and does not interfere with the map rendering.

---

## 📋 Responsibilities

1. **Audit `src/components/dice/`** — inventory all existing dice components.
2. **Audit `Battle3DScene.tsx`** — determine if the 3D scene is being reused for dice.
3. **Audit `src/systems/`** — identify if a dice physics system exists.
4. **Decide on rendering context**: Dedicated Three.js canvas overlay OR integrated with the existing 3D scene. Document the decision.
5. **Implement Dice Physics**:
   - Cannon.js rigid body for each die.
   - Random throw impulse and angular velocity.
   - Die rests on a virtual table surface.
   - Physics simulation stops when velocity < threshold.
6. **Implement Dice 3D Models**:
   - Geometric meshes for d4, d6, d8, d10, d12, d20 (Platonic solids).
   - Fantasy-themed textures (dark stone, gold numbers).
   - No external model loading required — use THREE.js geometries.
7. **Implement Roll Result Extraction**:
   - Detect which face is pointing upward after simulation stops.
   - Map face to numeric result.
   - Support advantage/disadvantage (roll 2d20, take higher/lower).
8. **Implement Dice Roller UI** — `src/components/dice/DiceRoller.tsx`:
   - Button grid for each die type.
   - Roll history panel.
   - Advantage / Disadvantage toggle.
   - Modifier input.
9. **Connect Rolls to Game State**:
   - Attack roll → applies to active combatant in `sessionStore.initiativeTracker`.
   - Damage roll → feeds into HP manager in `sessionStore`.
   - Skill check roll → shown with DC comparison.
10. **Broadcast Rolls** — emit `dice_rolled` event to session Realtime channel.
11. **Roll History** — persist last 20 rolls in session state (not permanent storage).

---

## ✅ Files/Folders the Agent is ALLOWED to Modify

```
src/components/dice/                   (all files — primary ownership)
src/systems/                           (dice system only)
src/pages/BattleScenePage.tsx          (dice integration only)
src/components/Battle3DScene.tsx       (only if dice canvas is integrated here)
src/stores/combatStore.ts              (add dice roll results — coordinate with DM_DASHBOARD_AGENT)
src/hooks/useDicePhysics.ts            (create/modify)
src/hooks/useDiceRoller.ts             (create/modify)
src/types/combat.ts                    (add DiceRoll, RollResult types)
```

---

## 🚫 Files the Agent Must NOT Modify

```
src/integrations/supabase/client.ts
src/stores/battleStore.ts              (BATTLE_MAP_AGENT owns this)
src/stores/unifiedBattleStore.ts       (BATTLE_MAP_AGENT owns this)
src/stores/sessionStore.ts             (MULTIPLAYER_SESSION_AGENT owns — read dice roll events from here)
src/map-core/                          (BATTLE_MAP_AGENT owns this)
src/vtt/                               (BATTLE_MAP_AGENT owns this)
src/types/character.ts                 (CHARACTER_SYSTEM_AGENT owns this)
src/services/sessionService.ts         (do not modify — read broadcast API from here)
tailwind.config.ts
src/pages/VTTBattlePage.tsx            (BATTLE_MAP_AGENT owns this)
```

---

## 🔎 Required Checks Before Editing

- [ ] Read `docs/agents/PHASE_6_COMPLETE.md` — confirm battle map is stable.
- [ ] Audit `src/components/dice/` — list all existing files and their status.
- [ ] Check that Three.js is installed: `grep "three" package.json`.
- [ ] Check that Cannon.js or cannon-es is installed: `grep "cannon" package.json`.
- [ ] Verify `src/types/three.d.ts` and `src/types/three-examples.d.ts` are up to date.
- [ ] Confirm session Realtime channel emits work (from Phase 4).
- [ ] Run `npm run test` baseline.

---

## 📐 Implementation Rules

1. **Dedicated canvas** — dice rendering must use its own `<canvas>` element with a separate Three.js scene. Do not share the map canvas.
2. **Canvas overlay** — the dice canvas must render on top of other UI (z-index managed via CSS) with transparent background.
3. **Physics library** — use `cannon-es` (modern fork of Cannon.js). If not installed, add to `package.json`.
4. **Dice geometry** (Three.js primitives):
   - d4: `TetrahedronGeometry`
   - d6: `BoxGeometry`
   - d8: `OctahedronGeometry`
   - d10: Custom `ConvexGeometry`
   - d12: `DodecahedronGeometry`
   - d20: `IcosahedronGeometry`
5. **Result extraction** — face detection via surface normal comparison. The upward face has the highest dot product with `Vector3(0,1,0)`.
6. **Roll context** — every roll must carry a context: `{ type: 'attack' | 'damage' | 'skill' | 'saving_throw' | 'free', stat?: string, characterId?: string }`.
7. **Broadcast format**:
   ```typescript
   interface DiceRolledEvent {
     rollId: string;
     playerId: string;
     dice: DieType[];
     results: number[];
     total: number;
     modifier: number;
     context: RollContext;
     advantage?: 'advantage' | 'disadvantage';
     timestamp: string;
   }
   ```
8. **Animation budget** — physics simulation should complete within 3-5 seconds. Add a maximum simulation time cutoff.
9. **No blocking UI** — dice simulation must run off the main thread or be non-blocking (use `requestAnimationFrame`).
10. **Fantasy aesthetics** — dice must look premium: dark stone base, glowing gold numbers, subtle particle effect on impact.

---

## 🔧 Validation Commands

```bash
# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Tests
npm run test

# Manual dice test:
# 1. Open dice roller UI
# 2. Click d20 → verify 3D die appears and rolls
# 3. Die must settle with visible number on top
# 4. Result must appear in roll history
# 5. Open second browser window (player) → roll d20 → DM must see the roll result

# Physics performance test:
# Roll 5 dice simultaneously → verify smooth animation (no frame drops)
# Chrome DevTools → Performance tab → verify no jank

# Advantage test:
# Enable Advantage → click d20 → two dice appear → higher value is used
```

---

## ✅ Definition of Done

- [ ] All 7 die types render and roll (d4, d6, d8, d10, d12, d20, d100).
- [ ] Physics simulation produces believable roll behavior.
- [ ] Roll results are correctly extracted from final die position.
- [ ] Advantage / Disadvantage mode works.
- [ ] Roll results apply to combat state (attack, damage, saves).
- [ ] Rolls broadcast to all session participants.
- [ ] Roll result visible to all within 3 seconds of roll.
- [ ] Dice UI is fantasy-themed and premium looking.
- [ ] No performance impact on the map rendering.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `docs/agents/PHASE_7_COMPLETE.md` written.

---

## 📤 Output Format for Progress Reports

File: `docs/agents/PHASE_7_COMPLETE.md`

```markdown
# Phase 7 Complete — 3D Dice System
Agent: DICE_SYSTEM_AGENT
Date: [DATE]

## Technical Decisions
- Rendering engine: Three.js rN.N.N
- Physics engine: cannon-es vN.N.N
- Canvas strategy: [Dedicated overlay / Integrated]

## Modified Files
| File | Change Type | Description |

## Dice Types Implemented
| Die | Geometry | Result Extraction | Status |

## Broadcast Events
| Event | Payload | Consumers |

## Validation Results
- tsc --noEmit: PASS/FAIL
- All 7 die types: PASS/FAIL
- Physics simulation: PASS/FAIL
- Broadcast to session: PASS/FAIL
- Performance (5 concurrent dice): PASS/FAIL

## Next Phase Clearance
Phase 8 (SPELLS_INVENTORY_AGENT) may proceed: YES/NO
```
