# Shadow Weave Character Sheet — Project Audit Report
**Phase:** 0 — Baseline Discovery  
**Agent:** PROJECT_AUDIT_AGENT  
**Generated:** 2026-04-27  
**Status:** COMPLETE

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total pages | 36 pages |
| Total components (subdirs) | 24 |
| Total services | 23 files |
| Total stores | 15 stores |
| Total migrations | 67 SQL files |
| Duplicate `Character` interface | **2 files (BLOCKER)** |
| Firebase import in Supabase project | **1 (BLOCKER)** |
| 100% mock service | **1 (BLOCKER — spellService.ts)** |
| `console.log` in production routing | **HIGH** |
| TypeScript strict mode | **DISABLED (strictNullChecks: false)** |
| `any` types in critical paths | **Widespread** |
| `localStorage` as primary character persistence | **HIGH** |
| Dual transport (Socket.io + Supabase Realtime) | **MEDIUM — undocumented** |
| 3D dice connected to combat state | **NO — isolated** |
| Spell service connected to Supabase | **NO — 100% mock** |

---

## 1. Architecture Map

```
shadow-weave-character-sheet/
├── src/
│   ├── App.tsx                          → Root: wraps with QueryClient, BrowserRouter, themes
│   ├── AppRoutes.tsx                    → 40+ routes, 4 protected-route HOCs, console.log spam
│   ├── pages/ (36 pages)               → All feature pages
│   ├── components/ (24 dirs)           → Feature components
│   ├── stores/ (15 stores)             → Zustand (battleStore, sessionStore, fogStore…)
│   ├── services/ (23 files)            → Mixed: real Supabase + mock + Socket.IO
│   ├── types/ (20 files)               → DUPLICATED Character interface
│   ├── hooks/                          → Custom hooks
│   ├── contexts/                       → SessionContext (wraps session state)
│   ├── integrations/supabase/          → Single client.ts (CORRECT)
│   ├── map-core/                       → Map engine
│   ├── combat-core/                    → Combat logic
│   ├── vtt/                            → VTT engine hooks/UI
│   └── systems/                        → Game systems
│
├── supabase/
│   ├── migrations/ (67 files)          → Active schema: characters, game_sessions,
│   │                                      session_players, battle_maps, battle_tokens,
│   │                                      session_messages, initiative_tracker,
│   │                                      fog_of_war, monsters, ai_dm tables
│   └── config.toml
│
├── backend/                            → Node/Express backend (Socket.IO server)
├── api/                                → Vercel API routes
└── agents/                            → Multi-agent instruction system (PHASE 0 created this)
```

### Data Flow (Current State)
```
Auth:         Supabase Auth → useAuth hook → ProtectedRoute components  ✅
Characters:   Supabase (supabaseCharacterService) + localStorage (characterStorage) ⚠️ DUAL
Sessions:     Supabase Realtime + Socket.IO (backend optional) ✅ but undocumented
Battle Map:   battleStore (Zustand, in-memory only) + supabase battle_tokens ⚠️ NOT SYNCED
Dice:         Inline in VTTBattlePage (Math.random) — not 3D, not physics ⚠️
Spells:       FULLY MOCKED — spellService.ts returns empty array ❌
```

---

## 2. Routing Audit

| Route | Component | Protected | Auth Type | Noted Issues |
|-------|-----------|-----------|-----------|--------------|
| `/` | HomePage | No | — | OK |
| `/auth` | AuthPage | No | — | OK |
| `/unauthorized` | UnauthorizedPage | No | — | OK |
| `/dashboard` | RoleBasedRedirect | No | — | OK |
| `/spellbook` | SpellbookPage | **No** | — | Should require auth |
| `/character-creation` | CharacterCreationPage | **No** | — | Should require auth |
| `/characters` | CharactersListPage | **No** | — | Should require auth |
| `/character/:id` | CharacterViewPage | **No** | — | Should require auth |
| `/character-sheet/:id` | CharacterSheetPage | **No** | — | Should require auth |
| `/dm` | DMDashboardPageNew | `ProtectedDMRoute` | DM/Admin | OK |
| `/dm/session/:sessionId` | DMSessionPage | `ProtectedDMRoute` | DM | OK |
| `/vtt/:sessionId` | VTTBattlePage | `ProtectedAuthRoute` | Auth | OK |
| `/join` | JoinSessionPage | **No** | — | OK (intentional public) |
| `/create-session` | CreateSessionPage | `ProtectedDMRoute` | DM | OK |
| `/bestiary` | BestiaryPage | `ProtectedDMRoute` | DM | OK |
| `/dnd5e-combat` | DnD5ePage | No | — | Unknown purpose — audit needed |
| `/unified-battle` | UnifiedBattlePage | No | — | Redirects to legacy; file is 239 bytes |
| `/player-session/:sessionId` | PlayerBattleMapPage | `ProtectedAuthRoute` | Auth | OK |
| `/debug` | DebugPage | **No** | — | **Should be admin-only in prod** |
| `/debug/hooks` | HooksDebugPage | **No** | — | **Should be admin-only in prod** |

**Critical routing issue:** `AppRoutes.tsx` has 8+ `console.log` statements executing on every render (lines 164–170). This is a performance and information leak issue.

---

## 3. Character Creation Flow

**Status: PARTIALLY FUNCTIONAL**

| Step | Component | Connected to State | Connected to Supabase | Status |
|------|-----------|-------------------|----------------------|--------|
| Race Select | CharacterCreationContent | ✅ useCharacterCreation | ❌ — | OK |
| Subrace | CharacterCreationContent | ✅ | — | OK |
| Class Select | CharacterCreationContent | ✅ | — | OK |
| Background | CharacterCreationContent | ✅ | — | OK |
| Ability Scores | useAbilitiesRoller | ✅ | — | OK |
| Submit/Save | handleSaveCharacter | ✅ | ✅ saveCharacter() | OK |
| Redirect after save | navigate() | — | — | ✅ → `/character-sheet/:id` |

**Issues found:**
- `CharacterCreationPage.tsx` lines 192–258: `hasUndefinedValues()` and `cleanUndefinedValues()` utility functions are defined inline. This indicates data corruption from upstream — the spell component sends objects with `_type: "undefined"` fields. This is a **symptom of a bug, not the fix**.
- `CharacterCreationPage.tsx` line 87: Silent data mutation before save — corrupted data is "cleaned" without user knowledge.
- Route `/character-creation?edit=${character.id}` (line 216 in CharactersListPage) — **edit mode is referenced but NOT implemented** in CharacterCreationPage (no `edit` query param handling).
- Character creation is **NOT auth-protected** — unauthenticated users can start creation but will hit error only at final save step.

---

## 4. Supabase / Auth Integration

**Status: SOLID — one critical issue**

### Client (`src/integrations/supabase/client.ts`)
- ✅ Single client instance — correctly enforced
- ✅ PKCE flow enabled
- ✅ Auto token refresh
- ✅ localStorage → sessionStorage → in-memory fallback chain
- ⚠️ `storage: getStorageAdapter() as any` — uses `as any` cast (line 65). Not a bug but suppresses type safety.
- ⚠️ `VITE_SUPABASE_PUBLISHABLE_KEY` is a non-standard env var name — should be `VITE_SUPABASE_ANON_KEY`. The OR fallback `|| import.meta.env.VITE_SUPABASE_ANON_KEY` on line 6 compensates.

### Session Types (`src/types/session.ts`)
- **🔴 BLOCKER:** Line 2 — `import { Timestamp } from "firebase/firestore"` — **Firebase is imported in a Supabase-only project.** `firebase` package is installed (package.json line 76: `"firebase": "^10.11.0"`). This is an active dead dependency that adds ~400KB to the bundle and signals architectural confusion.
- The `Session` interface uses `lastActivity?: string | Timestamp` — Firestore Timestamp type in a Supabase project.

### Supabase Schema (67 migrations)
Active tables confirmed:
- `characters` — OK, used by supabaseCharacterService
- `game_sessions` — OK, used by sessionService
- `session_players` — OK
- `battle_maps` — OK
- `battle_tokens` — OK
- `session_messages` — OK
- `initiative_tracker` — OK
- `fog_of_war` — OK
- `monsters` — OK (via BestiaryService)
- `ai_dm_*` tables — Added in latest migration (2026-04-27)

⚠️ **67 migrations is extremely large** — signs of iterative trial-and-error. A migration with empty name exists: `20250812130124-.sql` — invalid filename.

---

## 5. Save / Load Logic

**Status: DUAL SYSTEM — high risk**

### Primary (Supabase): `src/services/supabaseCharacterService.ts`
- ✅ `saveCharacter()` — creates new character in Supabase
- ✅ `updateCharacter()` — updates by ID
- ✅ `deleteCharacter()` — hard delete (❌ no soft delete)
- ✅ `getUserCharacters()` — fetches by user_id
- ✅ `getCharacterById()` — fetches by ID
- ⚠️ `prepareCharacterForDB()` (line 158) — return type is `any`. This bypasses TypeScript safety.
- ⚠️ `convertFromDB()` (line 228) — parameter type is `any`. DB schema not typed against Character type.
- ❌ Missing: `spellSlots`, `resources`, `feats`, `skillProficiencies`, `languages` are **NOT saved to DB** — `prepareCharacterForDB()` only maps ~15 fields but Character interface has 40+.
- ❌ Missing: auto-save on character sheet changes (no debounce, no listener).
- ❌ Missing: soft delete (no `deleted_at` field).

### Secondary (localStorage): `src/services/characterStorage.ts`
- Uses `localStorage` as primary storage via `LocalCharacterStore` class
- IDs generated as `character_${Date.now()}_${random}` — **different from Supabase UUID** format
- **Still widely in use across the codebase** (must audit all consumers)
- This causes a split-brain: some characters exist only in localStorage, some only in Supabase.

**Result:** Character list page uses Supabase (correct). Character sheet may load from either source. High risk of inconsistency.

---

## 6. Battle Map Components

**Status: FUNCTIONAL BUT ISOLATED — not synced to Supabase**

### VTTBattlePage (`src/pages/VTTBattlePage.tsx`) — 588 lines
- ✅ Uses `useVTT` hook for canvas rendering
- ✅ Supabase Realtime subscriptions: `session_players`, `session_messages`, `game_sessions`
- ✅ Socket.IO secondary transport (optional, falls back gracefully)
- ✅ DM fog-of-war tools via `FogTools` component
- ⚠️ Direct Supabase calls inside component (lines 91-114, 214-220, 244-252) — **bypasses sessionService**
- ⚠️ `character_data?: any` in `PlayerInfo` interface (line 36) — untyped
- ❌ Battle tokens NOT subscribed in VTTBattlePage — token Realtime sync missing from this page
- ❌ `TokenRadialMenu` `onAction` callback is `console.log` only (line 485) — not implemented

### Battle Stores — FRAGMENTATION PROBLEM
| Store | Size | Zustand? | Synced to Supabase? | Status |
|-------|------|----------|---------------------|--------|
| `battleStore.ts` | 434 lines | ✅ | ❌ | In-memory only |
| `unifiedBattleStore.ts` | 11516 bytes | ✅ | ❌ | In-memory only |
| `enhancedBattleStore.ts` | 9157 bytes | ✅ | ❌ | In-memory only |
| `fogStore.ts` | 2235 bytes | ✅ | ❌ | In-memory only |
| `enhancedFogStore.ts` | 6891 bytes | ✅ | ❌ | In-memory only |
| `mapEntitiesStore.ts` | 3430 bytes | ✅ | ❌ | In-memory only |
| `battleUIStore.ts` | 3944 bytes | ✅ | — | UI state |

**Critical finding:** `battleStore.ts` token IDs are `number` (line 6: `id: number`). Supabase `battle_tokens` IDs are UUID strings. **Type mismatch — tokens cannot be round-tripped between store and Supabase.**

---

## 7. Dice System

**Status: FRAGMENTED — no 3D physics, simple Math.random in production**

### Components found in `src/components/dice/`:
| File | Size | Uses 3D? | Connected to Game State? |
|------|------|----------|--------------------------|
| `DiceBox3D.tsx` | 5068 | ✅ `@3d-dice/dice-box` | ❌ |
| `DiceDrawer.tsx` | 6123 | Unclear | Unclear |
| `DiceRenderer.tsx` | 11350 | ✅ Three.js | ❌ |
| `DiceRollModal.tsx` | 13204 | ✅ | ❌ |
| `DiceRoller3D.tsx` | 10385 | ✅ `@react-three/fiber` | ❌ |
| `DiceRoller3DFixed.tsx` | 5134 | ✅ | ❌ |
| `FloatingDiceButton.tsx` | 5786 | ❌ | ❌ |
| `GradientDice.tsx` | 7197 | ❌ | ❌ |

**Key finding:** Multiple dice implementations exist. **VTTBattlePage uses `Math.random()` inline** (line 224-225) — bypasses all dice components. Roll results are stored in local state only, not applied to combat initiative or HP.

**Dependency finding:** `@3d-dice/dice-box`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier` — 3D libraries installed. Three.js `^0.158.0` installed. **`cannon-es` is NOT installed** — only `@react-three/rapier` (Rapier physics, not Cannon.js).

---

## 8. Multiplayer / Session Readiness

**Status: ARCHITECTURE EXISTS — dual transport undocumented**

### `sessionService.ts` (536 lines) — COMPLETE
- ✅ `createSession()` — uses `generate_session_code` RPC
- ✅ `joinSession()` — uses `join_session` RPC
- ✅ `getSession()`, `getUserSessions()`, `getSessionPlayers()`
- ✅ `subscribeToSession()` — Supabase Realtime on battle_tokens, session_messages, session_players, initiative_tracker
- ✅ Full token CRUD, fog-of-war, initiative tracker
- ⚠️ `getUserSessions()` (line 160) — string interpolation in `.or()` filter with a nested async call → race condition risk

### `sessionStore.ts` — WRAPPER ANTI-PATTERN
- `sessionStore.ts` is **not a Zustand store** — it's a hook that wraps `SessionContext`
- Using hooks inside non-React functions (line 48-49: `useSession()` and `useAuth()` inside a regular function) — **violates Rules of Hooks**, will cause React Error #185 if called outside component tree
- All mutations return mock data if context is unavailable (lines 22-44)

### Transport Dual System
- **Primary:** Supabase Realtime (postgres_changes) — works without backend
- **Secondary:** Socket.IO via `socketService` — requires `VITE_BACKEND_URL` backend server
- Backend server in `backend/` directory but not deployed to Vercel (API routes in `api/`)
- Socket.IO falls back gracefully in production when `VITE_BACKEND_URL` not set
- **Not documented** which events are handled by which transport

---

## 9. TypeScript Types Audit

**Status: CRITICAL — duplicate interfaces, Firebase imports, widespread `any`**

### Duplicate `Character` Interface
| File | Interface | Differences |
|------|-----------|-------------|
| `src/types/character.ts` | `Character` | Has `money`, `currency`, `savingThrowProficiencies`, `skillProficiencies`, `expertise`, `skillBonuses`, `spellcasting`, `additionalClasses`, `languages` |
| `src/types/character.d.ts` | `Character` | Missing above fields. SpellSlots defined differently |
| `src/types/session.ts` | `Character` (line 38!) | Minimal — only id, name, race, class, level, avatarUrl |
| `src/services/socket.ts` | (implicit via imports) | Uses `Character` from `character.ts` |

**3 `Character` interfaces across the codebase** — TypeScript merge rules mean components pulling from different sources see different shapes. This is the primary source of runtime data inconsistencies.

### TypeScript Configuration Issues
```json
// tsconfig.json
"noImplicitAny": false,       // ❌ any types silently allowed
"strictNullChecks": false,     // ❌ null/undefined not checked
"noUnusedLocals": false,       // ❌ dead variables not flagged
"noUnusedParameters": false    // ❌ dead params not flagged
```
**Strict mode is disabled.** The `Character` type has optional `id?: string` — with `strictNullChecks: false`, accessing `character.id` without null guard causes silent `undefined` bugs.

### `any` Usage in Critical Files
| File | Location | Risk |
|------|----------|------|
| `supabaseCharacterService.ts` | `prepareCharacterForDB(): any` | DB writes bypass type safety |
| `supabaseCharacterService.ts` | `convertFromDB(dbData: any)` | DB reads bypass type safety |
| `battleStore.ts` | `character_data?: any` | Character data in battle untyped |
| `session.ts` | `dice_roll_data?: any` | Dice data untyped |
| `sessionStore.ts` | `joinSession: (code, player: { character: any })` | Character in session untyped |
| `CharactersListPage.tsx` | `useState<any[]>([])` | Character list untyped |

### Firebase Dependency (BLOCKER)
- `package.json` line 76: `"firebase": "^10.11.0"` — installed
- `src/types/session.ts` line 2: `import { Timestamp } from "firebase/firestore"` — active import
- `src/integrations/` — only Supabase exists (correct)
- No Firebase config or initialization found → Firebase is imported but **not configured** → **this import will cause a runtime error** if Firestore tries to initialize

---

## 10. Build / Runtime Errors (Predicted)

Based on code inspection (no `tsc --noEmit` run yet — must run locally):

| Issue | File | Severity | Expected Error Type |
|-------|------|----------|---------------------|
| Firebase import without config | `src/types/session.ts:2` | BLOCKER | Runtime: Firebase App not initialized |
| Hook called outside component | `src/stores/sessionStore.ts:48-49` | BLOCKER | React Error #185 |
| Token ID type mismatch (number vs string) | `battleStore.ts` + `sessionService.ts` | HIGH | Runtime: tokens not found in Supabase |
| `edit` query param not handled in creation | `CharactersListPage.tsx:216` | HIGH | Navigation to broken edit flow |
| 8 console.logs in route component | `AppRoutes.tsx:164-170` | MEDIUM | Performance, info leak |
| `as any` Supabase storage cast | `client.ts:65` | LOW | Suppresses type errors |

---

## 11. Issues Register

| ID | Severity | File | Description |
|----|----------|------|-------------|
| ISS-001 | **BLOCKER** | `src/types/session.ts:2` | Firebase import in Supabase project — runtime crash if Firestore initializes |
| ISS-002 | **BLOCKER** | `src/stores/sessionStore.ts:48-49` | `useSession()` and `useAuth()` called inside non-component function — violates Rules of Hooks |
| ISS-003 | **BLOCKER** | `src/types/character.ts` + `character.d.ts` + `session.ts` | 3 `Character` interfaces — type mismatch causes silent data corruption |
| ISS-004 | **BLOCKER** | `src/services/spellService.ts` | 100% mock — returns empty arrays, `setTimeout(500)` simulating network — NO real data |
| ISS-005 | **HIGH** | `src/services/supabaseCharacterService.ts:158,228` | `prepareCharacterForDB(): any` and `convertFromDB(any)` — 25+ character fields not persisted to DB |
| ISS-006 | **HIGH** | `src/services/characterStorage.ts` | localStorage still used as primary persistence — conflicts with Supabase |
| ISS-007 | **HIGH** | `tsconfig.json` | `strictNullChecks: false`, `noImplicitAny: false` — critical type safety disabled |
| ISS-008 | **HIGH** | `src/stores/battleStore.ts:6` | Token `id: number` vs Supabase UUID string — battle tokens cannot sync to DB |
| ISS-009 | **HIGH** | `src/pages/AppRoutes.tsx:164-170` | 8 `console.log` in route component body — runs on every render |
| ISS-010 | **HIGH** | `src/pages/CharactersListPage.tsx:29` | `useState<any[]>([])` for character list — untyped |
| ISS-011 | **HIGH** | `src/pages/CharacterCreationPage.tsx:192-258` | `hasUndefinedValues()` / `cleanUndefinedValues()` inline in page — symptom of upstream bug in spell component |
| ISS-012 | **HIGH** | Multiple routes | Character creation, character list, spellbook — NOT auth-protected |
| ISS-013 | **HIGH** | `src/pages/VTTBattlePage.tsx:485` | `TokenRadialMenu.onAction` is `console.log` only — token actions not implemented |
| ISS-014 | **MEDIUM** | `src/pages/VTTBattlePage.tsx:91,214,244` | Direct Supabase calls inside component — bypasses sessionService |
| ISS-015 | **MEDIUM** | `src/services/socket.ts:228-261` | Explicit mock mode in production service — mock sessions created when backend unavailable |
| ISS-016 | **MEDIUM** | `src/services/sessionService.ts:160` | Nested async call inside string interpolation — race condition |
| ISS-017 | **MEDIUM** | `package.json:76` | `firebase` package installed — 400KB dead dependency |
| ISS-018 | **MEDIUM** | `src/pages/CharactersListPage.tsx:216` | Edit route `/character-creation?edit={id}` referenced but NOT handled in CharacterCreationPage |
| ISS-019 | **MEDIUM** | `supabase/migrations/20250812130124-.sql` | Invalid migration filename (empty name) |
| ISS-020 | **MEDIUM** | `src/pages/` | `/debug` and `/debug/hooks` are public — should be admin-only |
| ISS-021 | **LOW** | `src/components/dice/` | 8 dice components, none connected to game state or Supabase |
| ISS-022 | **LOW** | `src/pages/UnifiedBattlePage.tsx` | 239 bytes — likely empty or placeholder |
| ISS-023 | **LOW** | `src/integrations/supabase/client.ts:65` | `as any` cast on storage adapter |

---

## 12. Duplicate / Mock Logic Register

| Area | File | Mock Type | Real Alternative Available? |
|------|------|-----------|--------------------------|
| Spell save | `spellService.ts:10-18` | 100% mock — `setTimeout(500)` | ❌ No `spells` table service |
| Spell load | `spellService.ts:25-33` | Returns `[]` always | ❌ No real implementation |
| Session create | `socket.ts:228-261` | Mock session if no backend | ✅ sessionService.createSession() |
| Session join | `socket.ts:291-331` | Mock session if no backend | ✅ sessionService.joinSession() |
| Character ID | `characterStorage.ts:17` | `character_${Date.now()}_${random}` | ✅ Supabase UUID |
| Token actions | `VTTBattlePage.tsx:485` | `console.log` | ❌ Not implemented |
| Edit character | `CharactersListPage.tsx:216` | Route exists, no handler | ❌ Not implemented |

---

## 13. Firebase Issues

| Finding | Severity | Impact |
|---------|----------|--------|
| `firebase` package installed (package.json:76) | HIGH | +400KB bundle bloat |
| `import { Timestamp } from "firebase/firestore"` in session.ts | BLOCKER | Runtime crash if Firestore SDK initializes |
| No Firebase config or `initializeApp()` call found | HIGH | Firebase unusable even if imported |
| `session.ts` uses `Timestamp` type in `Session.lastActivity` field | HIGH | Incompatible with Supabase ISO string timestamps |

**Action required (Phase 1):** Remove firebase package, delete the import, replace `Timestamp` with `string`.

---

## 14. Recommended Implementation Order

Based on this audit, the confirmed Phase execution order remains valid with these additions:

```
Phase 0 (NOW COMPLETE) → docs/audit-report.md written

Phase 1 PRIORITY ADDITIONS:
  1. Fix ISS-001: Remove firebase import from session.ts
  2. Fix ISS-003: Merge 3 Character interfaces into one
  3. Fix ISS-007: Enable strictNullChecks in tsconfig.app.json
  4. Fix ISS-017: Remove firebase from package.json
  5. Remove ISS-009: console.logs from AppRoutes.tsx

Phase 2 PRIORITY ADDITIONS:
  1. Fix ISS-011: Move undefined cleanup to spellService, not CharacterCreationPage
  2. Fix ISS-012: Add ProtectedAuthRoute to character creation routes
  3. Fix ISS-018: Implement edit mode in CharacterCreationPage

Phase 3 PRIORITY ADDITIONS:
  1. Fix ISS-005: Expand prepareCharacterForDB() to all 40+ fields
  2. Fix ISS-006: Remove LocalCharacterStore from active codebase
  3. Fix ISS-010: Type character list as Character[]

Phase 4 PRIORITY ADDITIONS:
  1. Fix ISS-002: Refactor sessionStore.ts to real Zustand store
  2. Fix ISS-016: Fix race condition in getUserSessions()
  3. Document dual transport (Socket.IO vs Supabase Realtime)

Phase 6 PRIORITY ADDITIONS:
  1. Fix ISS-008: Convert battleStore token IDs from number to string
  2. Fix ISS-013: Implement TokenRadialMenu onAction handlers
  3. Fix ISS-014: Move direct Supabase calls to sessionService

Phase 7 PRIORITY ADDITIONS:
  1. Fix ISS-021: Choose one dice implementation, connect to game state
  2. Add cannon-es to package.json if 3D physics needed

Phase 8 PRIORITY ADDITIONS:
  1. Fix ISS-004: Implement real spellService with Supabase

Phase 9 PRIORITY ADDITIONS:
  1. Fix ISS-015: Remove or gate mock mode in socket.ts
  2. Fix ISS-019: Rename invalid migration
  3. Fix ISS-020: Protect debug routes
  4. Fix ISS-022: Implement or delete UnifiedBattlePage
  5. Fix ISS-023: Type Supabase storage adapter properly
```

---

## 15. Exact File-Level Fix Plan

### Phase 1 — Immediate (Blockers + Types)

| # | File | Action | Agent |
|---|------|--------|-------|
| 1 | `src/types/session.ts` | Remove `import { Timestamp } from "firebase/firestore"`. Replace `Timestamp` with `string` in Session interface | CHARACTER_SYSTEM_AGENT |
| 2 | `src/types/character.d.ts` | DELETE this file. Merge unique fields into `character.ts` | CHARACTER_SYSTEM_AGENT |
| 3 | `src/types/session.ts:38-49` | Remove local `Character` interface. Import from `@/types/character` | CHARACTER_SYSTEM_AGENT |
| 4 | `package.json` | Remove `"firebase": "^10.11.0"` from dependencies | CHARACTER_SYSTEM_AGENT |
| 5 | `tsconfig.app.json` | Enable `"strictNullChecks": true` (warning: may surface new TS errors) | CHARACTER_SYSTEM_AGENT |
| 6 | `src/AppRoutes.tsx:164-170` | Remove all `console.log` statements from component body | CHARACTER_SYSTEM_AGENT |
| 7 | `src/types/index.ts` | Create file — re-export all types from `character.ts`, `session.ts`, `spells.ts`, etc. | CHARACTER_SYSTEM_AGENT |

### Phase 2 — Character System

| # | File | Action | Agent |
|---|------|--------|-------|
| 8 | `src/pages/CharacterCreationPage.tsx:192-258` | Move `hasUndefinedValues` / `cleanUndefinedValues` to `src/utils/characterSanitizer.ts` | CHARACTER_SYSTEM_AGENT |
| 9 | `src/AppRoutes.tsx:211-215` | Wrap character routes with `ProtectedAuthRoute` | CHARACTER_SYSTEM_AGENT |
| 10 | `src/pages/CharacterCreationPage.tsx` | Implement `?edit={id}` query param handling | CHARACTER_SYSTEM_AGENT |

### Phase 3 — Persistence

| # | File | Action | Agent |
|---|------|--------|-------|
| 11 | `src/services/supabaseCharacterService.ts:158` | Change return type of `prepareCharacterForDB` from `any` to typed object. Add missing 25+ fields | FIREBASE_PERSISTENCE_AGENT |
| 12 | `src/services/supabaseCharacterService.ts:228` | Change `convertFromDB(dbData: any)` to typed DB row type | FIREBASE_PERSISTENCE_AGENT |
| 13 | `src/services/characterStorage.ts` | Add deprecation warning to all methods. Audit all import sites | FIREBASE_PERSISTENCE_AGENT |
| 14 | `src/pages/CharactersListPage.tsx:29` | Change `useState<any[]>` to `useState<Character[]>` | FIREBASE_PERSISTENCE_AGENT |

### Phase 4 — Session

| # | File | Action | Agent |
|---|------|--------|-------|
| 15 | `src/stores/sessionStore.ts` | Refactor from hook-wrapper to real Zustand store. Remove hook calls outside component tree | MULTIPLAYER_SESSION_AGENT |
| 16 | `src/services/sessionService.ts:160` | Fix nested async `.or()` filter — fetch IDs first, then query | MULTIPLAYER_SESSION_AGENT |

### Phase 6 — Battle Map

| # | File | Action | Agent |
|---|------|--------|-------|
| 17 | `src/stores/battleStore.ts:6` | Change token `id: number` to `id: string` | BATTLE_MAP_AGENT |
| 18 | `src/pages/VTTBattlePage.tsx:485` | Implement TokenRadialMenu action handlers | BATTLE_MAP_AGENT |
| 19 | `src/pages/VTTBattlePage.tsx:91,214,244` | Move Supabase calls to sessionService | BATTLE_MAP_AGENT |

---

## 16. Validation Commands to Run

```bash
# Run these locally before Phase 1 begins:

# 1. TypeScript baseline — document ALL errors
npx tsc --noEmit 2>&1

# 2. Lint baseline
npm run lint 2>&1

# 3. Dead code / imports scan
grep -rn "from 'firebase" src/ --include="*.ts" --include="*.tsx"
grep -rn "from \"firebase" src/ --include="*.ts" --include="*.tsx"

# 4. Duplicate Character interface locations
grep -rn "interface Character" src/ --include="*.ts" --include="*.tsx"

# 5. Supabase client duplicates (must return only 1 result)
grep -rn "createClient" src/ --include="*.ts" --include="*.tsx"

# 6. localStorage usage (must be 0 in services/ after Phase 3)
grep -rn "localStorage" src/services/ --include="*.ts"

# 7. console.log in route file
grep -n "console.log" src/AppRoutes.tsx

# 8. Mock/hardcoded data in services
grep -rn "setTimeout\|mock\|MOCK\|fake\|hardcode" src/services/ --include="*.ts"

# 9. any types in critical files
grep -n ": any" src/types/character.ts src/services/supabaseCharacterService.ts

# 10. Firebase package installed
cat package.json | grep firebase

# 11. Build test
npm run build 2>&1
```

---

## 17. Phase 1 Task List

**Assigned to: CHARACTER_SYSTEM_AGENT**

### Pre-conditions (must verify first)
- [ ] Read this audit report fully
- [ ] Run `npx tsc --noEmit` and record baseline error count
- [ ] Run `npm run lint` and record violation count
- [ ] Run `npm run build` — document if it fails

### Task List

1. **[BLOCKER]** Remove `"firebase": "^10.11.0"` from `package.json` dependencies
2. **[BLOCKER]** Delete `import { Timestamp } from "firebase/firestore"` from `src/types/session.ts:2`
3. **[BLOCKER]** Replace `lastActivity?: string | Timestamp` with `lastActivity?: string` in `Session` interface
4. **[BLOCKER]** Remove `Character` interface from `src/types/session.ts:38-49` — import from `@/types/character`
5. **[BLOCKER]** Run `npm install` to remove firebase from node_modules
6. **[HIGH]** Read `src/types/character.ts` and `src/types/character.d.ts` — create unified merge
7. **[HIGH]** Delete `src/types/character.d.ts` after verifying all fields merged into `character.ts`
8. **[HIGH]** Create `src/types/index.ts` — barrel export all type files
9. **[HIGH]** Remove all 8 `console.log` statements from `src/AppRoutes.tsx:164-170`
10. **[MEDIUM]** Evaluate enabling `strictNullChecks` in `tsconfig.app.json` — run tsc, count new errors, decide if Phase 1 or Phase 9
11. **[MEDIUM]** Update all imports affected by `character.d.ts` deletion (run `grep -r "character.d" src/`)
12. **[LOW]** Add JSDoc comment to `src/types/character.ts` marking it as the canonical source

### Definition of Done for Phase 1
- [ ] Zero Firebase imports in `src/` directory
- [ ] Single `Character` interface in `src/types/character.ts`
- [ ] `src/types/index.ts` exports all shared types
- [ ] No `console.log` in `AppRoutes.tsx`
- [ ] `npm run build` succeeds
- [ ] `docs/agents/PHASE_1_COMPLETE.md` written

---

**READY FOR PHASE 1**
