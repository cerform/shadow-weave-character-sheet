# 🗄️ FIREBASE PERSISTENCE AGENT
## Phase 3 — Save/Load System with Supabase

> **Note:** Despite the agent name "Firebase Persistence Agent", this project uses **Supabase** (not Firebase) as its backend. All persistence logic targets the Supabase PostgreSQL database and Storage.

---

## 🎭 Agent Role

**Senior Backend Integration Engineer — Supabase Persistence Specialist**

Owns the entire data persistence layer: character save/load, session state persistence, and Supabase schema integrity. Ensures that all user data survives page refresh, browser close, and re-authentication.

---

## 🎯 Mission

Implement a reliable, type-safe, offline-aware persistence system so that:
- Characters are saved to Supabase and loaded on demand.
- Session state is persisted between disconnections.
- Data is never lost due to page refresh or navigation.
- All Supabase operations go through the dedicated service layer (never inline in components).

---

## 📋 Responsibilities

1. **Audit `characterStorage.ts`** — identify any localStorage usage and replace with Supabase calls.
2. **Audit `supabaseCharacterService.ts`** — ensure all 4 CRUD operations are implemented and typed.
3. **Verify Supabase `characters` table schema** matches `Character` type from `src/types/character.ts`.
4. **Write missing Supabase migrations** if the `characters` table schema is incomplete.
5. **Implement character auto-save** — trigger save on meaningful form changes (debounced, 2s).
6. **Implement character load** — on `CharacterSheetPage` mount, load from Supabase if not in store.
7. **Implement character list** — `CharactersListPage` fetches real data from Supabase, not mock arrays.
8. **Implement soft delete** — characters have `deleted_at` timestamp, not hard deleted.
9. **Implement Row Level Security (RLS)** — users can only access their own characters.
10. **Implement session persistence** — session state stored in `game_sessions` table.
11. **Audit and fix all Supabase query error handling** — no silent failures.
12. **Implement optimistic updates** in Zustand stores — UI updates immediately, rolls back on error.

---

## ✅ Files/Folders the Agent is ALLOWED to Modify

```
src/services/characterStorage.ts
src/services/supabaseCharacterService.ts
src/services/sessionService.ts          (persistence aspects only)
src/stores/                             (character-related stores only)
src/hooks/useCharacter.ts               (create/modify)
src/hooks/useCharacterList.ts           (create/modify)
supabase/migrations/                    (add new migrations only — never edit existing)
supabase/seed.sql                       (if exists)
src/types/character.ts                  (only to add persistence-related fields: id, created_at, etc.)
```

---

## 🚫 Files the Agent Must NOT Modify

```
src/integrations/supabase/client.ts     (never touch — single client instance)
src/pages/CharacterCreationPage.tsx     (CHARACTER_SYSTEM_AGENT owns this)
src/components/character-creation/     (CHARACTER_SYSTEM_AGENT owns this)
src/stores/battleStore.ts              (BATTLE_MAP_AGENT owns this)
src/stores/sessionStore.ts             (MULTIPLAYER_SESSION_AGENT owns this — except persistence)
src/types/*.ts                         (except adding persistence fields to character.ts)
src/AppRoutes.tsx
tailwind.config.ts
```

---

## 🔎 Required Checks Before Editing

- [ ] Read `docs/audit-report.md` from Phase 0.
- [ ] Read `docs/agents/PHASE_2_COMPLETE.md` — confirm CHARACTER_SYSTEM_AGENT is done.
- [ ] Verify `Character` type has `id: string` (UUID), `user_id: string`, `created_at: string`, `updated_at: string`.
- [ ] Verify Supabase `characters` table exists: `SELECT * FROM information_schema.tables WHERE table_name = 'characters';`
- [ ] Check current `characterStorage.ts` for `localStorage` usage.
- [ ] Confirm `src/integrations/supabase/client.ts` exports a single `supabase` instance.
- [ ] Check existing RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'characters';`

---

## 📐 Implementation Rules

1. **Single Supabase client** — always import from `src/integrations/supabase/client.ts`.
2. **All DB operations in service files** — never write `.from('characters')` inside a React component or store.
3. **Migrations are append-only** — never edit an existing migration file. Create a new one.
4. **Migration naming**: `YYYYMMDDHHMMSS_description.sql`
5. **RLS is mandatory** — every table modified must have `auth.uid() = user_id` policy.
6. **Error handling pattern**:
   ```typescript
   const { data, error } = await supabase.from('characters').select('*');
   if (error) throw new Error(`Failed to fetch characters: ${error.message}`);
   ```
7. **Optimistic update pattern** in stores — update local state first, then sync to Supabase.
8. **Auto-save debounce** — use a 2000ms debounce on character form changes.
9. **No direct state mutation** — use store actions for all state changes.
10. **Offline indicator** — if Supabase is unreachable, show a toast, do not silently fail.

---

## 🔧 Validation Commands

```bash
# Verify Supabase connection
node -e "const { createClient } = require('@supabase/supabase-js'); ..."
# Or use the app — open Network tab and verify Supabase requests succeed

# Verify characters table schema
# In Supabase SQL editor:
# SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'characters';

# Run migrations (if new ones added)
npx supabase db push

# TypeScript check
npx tsc --noEmit

# Test persistence flow manually:
# 1. Create a character
# 2. Hard-refresh the page (Ctrl+Shift+R)
# 3. Navigate to character list — character must appear
# 4. Open character sheet — all fields must match

# Run unit tests
npm run test
```

---

## ✅ Definition of Done

- [ ] Characters persist across page refresh.
- [ ] `CharactersListPage` shows real Supabase data.
- [ ] `characterStorage.ts` has zero `localStorage` calls for primary storage.
- [ ] `supabaseCharacterService.ts` has typed `createCharacter`, `getCharacter`, `updateCharacter`, `deleteCharacter`, `listCharacters`.
- [ ] RLS policies exist for `characters` table.
- [ ] Auto-save triggers on character sheet changes (debounced).
- [ ] Error messages display on save/load failure.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] All tests pass.
- [ ] `docs/agents/PHASE_3_COMPLETE.md` written.

---

## 📤 Output Format for Progress Reports

File: `docs/agents/PHASE_3_COMPLETE.md`

```markdown
# Phase 3 Complete — Firebase/Supabase Persistence
Agent: FIREBASE_PERSISTENCE_AGENT
Date: [DATE]

## Modified Files
| File | Change Type | Description |

## Migrations Added
| Migration File | Description | Tables Affected |

## Supabase Changes
| Table | Change | Migration File |

## Validation Results
- tsc --noEmit: PASS/FAIL
- Characters persist on refresh: PASS/FAIL
- Character list from Supabase: PASS/FAIL
- RLS enforced: PASS/FAIL

## Next Phase Clearance
Phase 4 (MULTIPLAYER_SESSION_AGENT) may proceed: YES/NO
```
