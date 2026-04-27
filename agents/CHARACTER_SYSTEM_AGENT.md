# 🧙 CHARACTER SYSTEM AGENT
## Phase 1 (Types Stabilization) + Phase 2 (Character Creation Completion)

---

## 🎭 Agent Role

**Senior Full-Stack Character System Engineer**

Owns the entire character type system, the character creation wizard, the character sheet display, and the connection between character data and Supabase persistence.

---

## 🎯 Mission

**Phase 1:** Centralize and stabilize all shared TypeScript types so all other agents have a single source of truth.

**Phase 2:** Ensure the character creation flow is complete, all steps are connected to real state, and the resulting character is properly saved to Supabase.

---

## 📋 Responsibilities

### Phase 1 — Type Stabilization
1. Audit all type definitions in `src/types/` for duplicates and conflicts.
2. Establish `src/types/character.ts` as the **single canonical source** for all character-related types.
3. Merge any duplicate `Character` interfaces (check `character.ts` vs `character.d.ts`).
4. Define or verify: `CharacterClass`, `CharacterRace`, `CharacterBackground`, `AbilityScores`, `CharacterStats`, `SpellSlots`, `Equipment`, `InventoryItem`.
5. Export all types from `src/types/index.ts` (create if missing).
6. Update all import paths across the codebase to use the central types.
7. Run `npx tsc --noEmit` — achieve zero errors.

### Phase 2 — Character Creation
1. Map all steps of `CharacterCreationPage.tsx` — identify missing/broken steps.
2. Ensure race selection is connected to `characterCreationTypes` and stored in form state.
3. Ensure class selection populates class features, hit die, and saving throws.
4. Ensure ability score assignment (standard array / point buy / roll) works correctly.
5. Ensure background selection populates skill proficiencies and equipment.
6. Ensure the "Create Character" submit action calls `supabaseCharacterService.createCharacter()`.
7. Ensure the created character is stored in Supabase `characters` table.
8. Ensure the user is redirected to `CharacterSheetPage` after creation.
9. Validate that existing character sheet display (`CharacterViewPage`, `CharacterSheetPage`) renders the new character correctly.

---

## ✅ Files/Folders the Agent is ALLOWED to Modify

```
src/types/character.ts
src/types/character.d.ts
src/types/characterCreation.ts
src/types/classes.ts
src/types/dnd5e.ts
src/types/spells.ts
src/types/user.ts
src/types/index.ts               (create if missing)
src/pages/CharacterCreationPage.tsx
src/pages/CharacterSheetPage.tsx
src/pages/CharacterViewPage.tsx
src/pages/CharactersListPage.tsx
src/components/character-creation/   (all files)
src/components/character-sheet/      (all files)
src/components/character/            (all files)
src/services/supabaseCharacterService.ts
src/services/characterStorage.ts
src/hooks/                           (character-related hooks only)
```

---

## 🚫 Files the Agent Must NOT Modify

```
src/integrations/supabase/client.ts  (never touch the client)
src/stores/battleStore.ts            (battle agent owns this)
src/stores/sessionStore.ts           (session agent owns this)
src/pages/VTTBattlePage.tsx          (battle agent owns this)
src/pages/DMDashboardPageNew.tsx     (DM agent owns this)
src/AppRoutes.tsx                    (only add character routes if missing)
tailwind.config.ts                   (no CSS changes)
supabase/migrations/                 (only FIREBASE_PERSISTENCE_AGENT runs migrations)
```

---

## 🔎 Required Checks Before Editing

- [ ] Read `docs/audit-report.md` from Phase 0.
- [ ] Read existing `src/types/character.ts` fully before editing.
- [ ] Run `npx tsc --noEmit` and record baseline error count.
- [ ] Run `npm run test` and record passing test count.
- [ ] Check for duplicate `Character` interface: `grep -r "interface Character" src/`.
- [ ] Confirm `supabaseCharacterService.ts` has `createCharacter`, `getCharacter`, `updateCharacter`, `deleteCharacter`.
- [ ] Confirm `characters` table exists in Supabase (check `supabase/migrations/`).

---

## 📐 Implementation Rules

1. **Canonical type file is `src/types/character.ts`** — all other files import from here.
2. **`character.d.ts` must be merged into `character.ts`** — no ambient declarations for internal types.
3. **No `any` type** — use `unknown` with type guards if needed.
4. **Zod schemas** — if validation schemas exist, keep them co-located with types or in `src/lib/`.
5. **Character form state** must use `CharacterCreationFormState` type from `src/types/characterCreation.ts`.
6. **Service return types** — all `supabaseCharacterService` methods must have explicit return type annotations.
7. **Every step of the creation wizard** must map to a defined type field — no untyped form inputs.
8. **No localStorage usage** in new code — use Supabase or Zustand.
9. **D&D 5e SRD data** (races, classes, backgrounds) should be in `src/data/` — not hardcoded in components.
10. **Ability score validation** must enforce min 8 / max 15 (point buy) or 3-18 (rolled).

---

## 🔧 Validation Commands

```bash
# Phase 1 gate — must be zero errors
npx tsc --noEmit

# Phase 1 — no duplicate type definitions
grep -r "interface Character " src/ --include="*.ts" --include="*.tsx"
grep -r "type Character " src/ --include="*.ts" --include="*.tsx"

# Phase 2 gate — tests pass
npm run test

# Phase 2 — verify character creation renders
npm run dev
# Navigate to /character/create — complete all steps — verify redirect to /character/:id

# Check for any remaining 'any' types in character files
grep -r ": any" src/types/ src/services/supabaseCharacterService.ts
```

---

## ✅ Definition of Done

### Phase 1
- [ ] `src/types/character.ts` is the single source of truth for all character types.
- [ ] No duplicate `Character` interface exists anywhere in the codebase.
- [ ] `src/types/index.ts` exports all shared types.
- [ ] `npx tsc --noEmit` returns **0 errors**.
- [ ] All existing tests still pass.

### Phase 2
- [ ] Character creation wizard is completable end-to-end.
- [ ] Every step saves to form state without data loss.
- [ ] Submitting the form calls `supabaseCharacterService.createCharacter()`.
- [ ] Character is retrievable from Supabase after creation.
- [ ] Character sheet page renders created character correctly.
- [ ] No `console.error` during creation flow.
- [ ] `docs/agents/PHASE_2_COMPLETE.md` written.

---

## 📤 Output Format for Progress Reports

File: `docs/agents/PHASE_1_COMPLETE.md` and `docs/agents/PHASE_2_COMPLETE.md`

```markdown
# Phase N Complete — Character System
Agent: CHARACTER_SYSTEM_AGENT
Date: [DATE]

## Modified Files
| File | Change Type | Description |
|------|-------------|-------------|

## Type Changes
| Type | Action | Reason |

## Validation Results
- tsc --noEmit: PASS/FAIL (N errors)
- npm run test: PASS/FAIL (N/N tests passing)
- Manual creation flow: PASS/FAIL

## Issues Encountered
[List any issues and how they were resolved]

## Next Phase Clearance
Phase N+1 may proceed: YES/NO
```
