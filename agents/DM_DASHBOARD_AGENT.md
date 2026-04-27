# 👁️ DM DASHBOARD AGENT
## Phase 5 — Dungeon Master Dashboard

---

## 🎭 Agent Role

**Senior Feature Engineer — Dungeon Master Experience Specialist**

Owns the DM Dashboard and DM Session pages. Responsible for giving the Dungeon Master complete control over the session: initiative tracker, HP management, NPC controls, encounter builder, scene/music control, and player status overview.

---

## 🎯 Mission

Deliver a fully functional DM Dashboard where the Dungeon Master can:
- See all connected players and their character status at a glance.
- Run combat with a real initiative tracker.
- Manage NPC/monster HP and conditions.
- Send narrative messages to all players.
- Control map visibility (fog-of-war triggers).
- Build and manage encounters.

All UI must integrate with the session real-time state established in Phase 4.

---

## 📋 Responsibilities

1. **Audit `DMDashboardPageNew.tsx`** — identify what is functional vs. placeholder.
2. **Audit `DMSessionPage.tsx`** — identify all incomplete panels.
3. **Audit `src/components/dm/`** — map all existing DM components to their functionality.
4. **Implement Initiative Tracker**:
   - Add combatants (players from session + manual NPC entries).
   - Sort by initiative roll (d20 + DEX modifier).
   - "Next Turn" advances the tracker.
   - Active combatant highlighted.
   - Initiative synced to all players via session channel.
5. **Implement HP Manager**:
   - DM can deal damage or heal any combatant.
   - HP changes sync to player character sheets.
   - Conditions (Stunned, Prone, etc.) can be applied.
6. **Implement Encounter Builder**:
   - DM selects monsters from `BestiaryService` (Supabase `monsters` table).
   - Monsters added to initiative with their stats pre-loaded.
7. **Implement Scene Control Panel**:
   - DM sends background/scene descriptors to players.
   - Trigger AI DM narration (if AI_DM feature enabled).
8. **Implement Player Overview**:
   - Grid of player cards showing: HP bar, AC, conditions, active spells.
   - Click player → inspect full character sheet (read-only).
9. **Integrate with Session Store** — all DM actions must update `sessionStore` and broadcast via Realtime.
10. **Ensure DM-only route protection** — DM pages must check user role from `userRolesService.ts`.

---

## ✅ Files/Folders the Agent is ALLOWED to Modify

```
src/pages/DMDashboardPageNew.tsx
src/pages/DMSessionPage.tsx
src/pages/DMMapEditorPage.tsx
src/components/dm/                     (all files)
src/services/sessionService.ts         (DM-specific actions only)
src/stores/sessionStore.ts             (DM state additions only — must not break player state)
src/types/session.ts                   (add DM-specific event types — do not remove existing)
src/hooks/useDMSession.ts              (create/modify)
src/hooks/useInitiativeTracker.ts      (create/modify)
```

---

## 🚫 Files the Agent Must NOT Modify

```
src/integrations/supabase/client.ts
src/pages/PlayerSessionPage.tsx        (MULTIPLAYER_SESSION_AGENT owns player side)
src/pages/CharacterCreationPage.tsx    (CHARACTER_SYSTEM_AGENT owns this)
src/pages/VTTBattlePage.tsx            (BATTLE_MAP_AGENT owns this)
src/stores/battleStore.ts             (BATTLE_MAP_AGENT owns this)
src/stores/unifiedBattleStore.ts      (BATTLE_MAP_AGENT owns this)
src/services/characterStorage.ts      (FIREBASE_PERSISTENCE_AGENT owns this)
src/types/character.ts                (CHARACTER_SYSTEM_AGENT owns this)
supabase/migrations/                  (use existing tables — if new table needed, coordinate with FIREBASE_PERSISTENCE_AGENT)
tailwind.config.ts
```

---

## 🔎 Required Checks Before Editing

- [ ] Read `docs/agents/PHASE_4_COMPLETE.md` — confirm session sync is functional.
- [ ] Read current `DMDashboardPageNew.tsx` fully before editing.
- [ ] Verify user role enforcement: `userRolesService.ts` has `isDM()` or equivalent.
- [ ] Verify DM routes are protected in `AppRoutes.tsx`.
- [ ] Confirm `monsters` table exists in Supabase for encounter builder.
- [ ] Run `npm run test` baseline.
- [ ] Verify `src/types/session.ts` has `InitiativeCombatant`, `HPChangeEvent`, `SessionEvent` types.

---

## 📐 Implementation Rules

1. **All session state mutations** must go through `sessionService.ts` — never direct Supabase calls from DM components.
2. **Initiative tracker state** lives in `sessionStore.initiativeTracker` — not local component state.
3. **HP changes must broadcast** to session channel immediately — no deferred sync.
4. **Player character HP** — when DM deals damage, it must call `supabaseCharacterService.updateCharacter()` to persist.
5. **DM status** — DM is always the session creator (`session.dm_user_id === auth.uid()`). Never hard-code user roles.
6. **Encounter builder** — monsters loaded from Supabase `monsters` table via `BestiaryService`.
7. **Conditions system** — use D&D 5e standard conditions (Blinded, Charmed, Frightened, etc.) from `src/types/dnd5e.ts`.
8. **No inline Tailwind class dumps** — use existing CSS patterns from `src/index.css` or component classes.
9. **Fantasy theme preserved** — DM Dashboard must use dark theme with gold/amber accents matching existing UI.
10. **Responsive layout** — DM Dashboard should function on 1280px+ screens (DM typically uses a laptop/desktop).

---

## 🔧 Validation Commands

```bash
# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Unit tests
npm run test

# Manual DM test:
# 1. Log in as DM → navigate to DM Dashboard
# 2. Start a session → add players (from session)
# 3. Add monsters via encounter builder
# 4. Roll initiative for all combatants
# 5. Advance through turns
# 6. Deal damage to a player → verify their HP changes
# 7. Player opens their character sheet in another window → verify HP matches

# Role protection test:
# 1. Log in as non-DM player
# 2. Attempt to navigate to /dm/dashboard
# 3. Should redirect to /unauthorized
```

---

## ✅ Definition of Done

- [ ] Initiative tracker is functional — add, sort, advance, and clear combatants.
- [ ] Initiative changes sync to players via Realtime.
- [ ] HP manager deals damage and heals — syncs to player character sheets.
- [ ] Encounter builder loads monsters from Supabase.
- [ ] Player overview shows all session participants with live HP bars.
- [ ] DM-only routes are protected by role check.
- [ ] No placeholder "TODO" panels in DM Dashboard.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `docs/agents/PHASE_5_COMPLETE.md` written.

---

## 📤 Output Format for Progress Reports

File: `docs/agents/PHASE_5_COMPLETE.md`

```markdown
# Phase 5 Complete — DM Dashboard
Agent: DM_DASHBOARD_AGENT
Date: [DATE]

## Modified Files
| File | Change Type | Description |

## Features Implemented
| Feature | Status | Notes |

## Initiative Tracker
- State location: sessionStore.initiativeTracker
- Realtime event: [event_name]
- Syncs to players: YES/NO

## Validation Results
- tsc --noEmit: PASS/FAIL
- Initiative tracker functional: PASS/FAIL
- HP sync to players: PASS/FAIL
- DM route protection: PASS/FAIL

## Next Phase Clearance
Phase 6 (BATTLE_MAP_AGENT) may proceed: YES/NO
```
