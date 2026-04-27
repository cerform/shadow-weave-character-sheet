# 📚 SPELLS & INVENTORY AGENT
## Phase 8 — Spells Browser & Inventory Polish

---

## 🎭 Agent Role

**Senior Feature Engineer — D&D Content Systems Specialist**

Owns the spells browser, spell slot tracking, inventory management, equipment system, and the connection of these systems to the character sheet and combat state.

---

## 🎯 Mission

Deliver polished, fully functional spells and inventory systems where:
- Players can browse the full D&D 5e SRD spell list with filtering and search.
- Players can add spells to their character's known spells and prepared spells.
- Casting a spell consumes the appropriate spell slot and updates the character sheet.
- Players can manage their equipment and inventory with weight tracking.
- All data is real (Supabase) — no mock arrays.

---

## 📋 Responsibilities

### Spells System
1. **Audit `SpellbookPage.tsx`** — identify what is functional vs. placeholder.
2. **Audit `DndSpellsPage.tsx`** — what is this page for? Is it duplicate?
3. **Audit `src/components/spellbook/`** — map all spell UI components.
4. **Audit `spellService.ts`** — does it pull from Supabase or static data?
5. **Audit `src/types/spells.ts`** — verify `Spell`, `SpellSlot`, `KnownSpell` types are complete.
6. **Implement Spells Browser**:
   - Full SRD spell list from Supabase `spells` table (or open5e API fallback).
   - Filter by: School, Level, Class, Concentration, Ritual, Casting Time, Components.
   - Search by name.
   - Spell detail modal/drawer with full description, damage, components, range, duration.
7. **Implement Known/Prepared Spells**:
   - Character can mark spells as "known" and "prepared".
   - Known spells stored in Supabase `character_spells` table.
   - Prepared spells capped by class + INT/WIS modifier rule.
8. **Implement Spell Slot Tracker**:
   - UI shows available slots per spell level (1-9 + cantrips).
   - "Cast" action decrements the appropriate spell slot.
   - Short/Long rest restores slots according to class rules.
   - Slot state stored in Supabase `character_resources` (or `characters.spell_slots` JSON field).

### Inventory System
9. **Audit character sheet** — does it render equipment/inventory from character data?
10. **Implement Equipment Slots**:
    - Visual character silhouette with slot positions: head, chest, legs, feet, main-hand, off-hand, ring, amulet, cloak.
    - Item equipped to slot updates character AC, stats modifiers.
11. **Implement Inventory Management**:
    - Add, remove, stack items.
    - Item weight tracking with encumbrance rules.
    - Currency tracking (PP, GP, SP, CP).
12. **Implement Item Database**:
    - Standard SRD equipment from Supabase `items` table.
    - Homebrew item creation.
13. **Connect to Combat** — weapon attacks use equipped weapon stats (damage dice, damage type, properties).

---

## ✅ Files/Folders the Agent is ALLOWED to Modify

```
src/pages/SpellbookPage.tsx
src/pages/DndSpellsPage.tsx
src/pages/DnD5ePage.tsx             (spells integration only)
src/components/spellbook/           (all files)
src/components/spell-detail/        (all files)
src/services/spellService.ts
src/services/ttgClubService.ts      (if used for spell import)
src/services/ttgClubParser.ts       (if used for spell import)
src/types/spells.ts
src/hooks/useSpells.ts              (create/modify)
src/hooks/useSpellSlots.ts          (create/modify)
src/hooks/useInventory.ts           (create/modify)
src/components/character-sheet/     (inventory and spell slot display only)
src/types/character.ts              (ONLY to add spellSlots, inventory, equipment fields — coordinate with CHARACTER_SYSTEM_AGENT)
supabase/migrations/                (add spells, character_spells, items, character_inventory tables)
```

---

## 🚫 Files the Agent Must NOT Modify

```
src/integrations/supabase/client.ts
src/pages/CharacterCreationPage.tsx     (CHARACTER_SYSTEM_AGENT owns this)
src/components/character-creation/     (CHARACTER_SYSTEM_AGENT owns this)
src/stores/battleStore.ts              (BATTLE_MAP_AGENT owns this)
src/stores/sessionStore.ts             (MULTIPLAYER_SESSION_AGENT owns this)
src/components/dice/                   (DICE_SYSTEM_AGENT owns this)
src/pages/VTTBattlePage.tsx            (BATTLE_MAP_AGENT owns this)
src/services/supabaseCharacterService.ts   (coordinate additions — do not replace existing methods)
tailwind.config.ts
```

---

## 🔎 Required Checks Before Editing

- [ ] Read `docs/agents/PHASE_7_COMPLETE.md` — confirm prior phases are stable.
- [ ] Read `src/types/spells.ts` fully before editing.
- [ ] Check if `spells` table exists in Supabase: `SELECT COUNT(*) FROM spells;`
- [ ] Check if `character_spells` table exists.
- [ ] Check if `items` table exists.
- [ ] Determine if spell data comes from: Supabase, TTG Club API, Open5e API, or static JSON.
- [ ] Run `npm run test` baseline.
- [ ] Audit `SpellbookPage.tsx` — count how many features are mocked vs. real.

---

## 📐 Implementation Rules

1. **SRD Content Source** — prefer Supabase `spells` table populated via migration seeder. If empty, fall back to Open5e API (`https://api.open5e.com/v1/spells/`). Document which is in use.
2. **Spell filtering** — filtering must be client-side (data already loaded) for instant response. Use `useMemo` with filter state.
3. **Spell slots** — class-specific slot progression is defined in `src/data/classSpellSlots.ts` (create if missing). Never hardcode in components.
4. **Cast spell flow**:
   ```
   User clicks "Cast" → validate slot available → decrement slot in local store
   → call supabaseCharacterService.updateSpellSlots() → show "Spell cast" toast
   ```
5. **Character equipment** — stored as `equipment: InventoryItem[]` in character JSON (Supabase JSONB column).
6. **Weight tracking** — encumbrance threshold = STR stat × 15 (standard 5e rule).
7. **Currency** — stored as `{ pp: number, gp: number, ep: number, sp: number, cp: number }` in character.
8. **No open5e API calls in component render** — fetch once, cache in store.
9. **Fantasy UI** — spell school colors, magical glow effects on spell cards, parchment-style inventory.
10. **Accessibility** — spell detail modal must be keyboard-navigable and screen-reader friendly.

---

## 🔧 Validation Commands

```bash
# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Tests
npm run test

# Manual spells test:
# 1. Open character sheet → navigate to Spellbook tab
# 2. Browse spell list → verify search and filters work
# 3. Click a spell → verify detail modal shows full description
# 4. Prepare a spell → verify it appears in "Prepared" list
# 5. Cast a spell (Level 1 slot) → verify slot count decrements
# 6. Refresh page → verify slot count persisted

# Manual inventory test:
# 1. Open character sheet → navigate to Inventory tab
# 2. Add an item → verify it appears in list
# 3. Equip item to a slot → verify AC updates (if armor)
# 4. Remove item → verify weight decreases

# Verify spell data source:
# Open Network tab → navigate to spellbook → check for spells API call
```

---

## ✅ Definition of Done

- [ ] Full SRD spell list displays from real data source (Supabase or Open5e).
- [ ] Spell search and all filters work correctly.
- [ ] Spell detail shows complete information (description, components, damage, etc.).
- [ ] Known and prepared spells are persistent per character.
- [ ] Spell slot tracker shows correct slots per level for each class.
- [ ] Casting a spell decrements the appropriate slot and persists.
- [ ] Short/long rest restores slots.
- [ ] Inventory management: add, remove, stack items.
- [ ] Equipment slots update character stats (AC, attack bonus).
- [ ] Weight and encumbrance tracked.
- [ ] Currency tracked.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `docs/agents/PHASE_8_COMPLETE.md` written.

---

## 📤 Output Format for Progress Reports

File: `docs/agents/PHASE_8_COMPLETE.md`

```markdown
# Phase 8 Complete — Spells & Inventory
Agent: SPELLS_INVENTORY_AGENT
Date: [DATE]

## Data Sources
- Spell data: [Supabase / Open5e API / Static JSON]
- Item data: [Supabase / Static JSON]

## Modified Files
| File | Change Type | Description |

## New Migrations
| Migration | Tables | Records Seeded |

## Features Implemented
| Feature | Status | Notes |

## Validation Results
- tsc --noEmit: PASS/FAIL
- Spell browser: PASS/FAIL
- Spell slot tracking: PASS/FAIL
- Inventory management: PASS/FAIL
- Data persistence: PASS/FAIL

## Next Phase Clearance
Phase 9 (QA_PRODUCTION_AGENT) may proceed: YES/NO
```
