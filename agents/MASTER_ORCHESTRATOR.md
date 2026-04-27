# 🧿 MASTER ORCHESTRATOR
## Shadow Weave Character Sheet — D&D 5e Multiplayer Platform

---

## 🎯 Project Vision

Shadow Weave is a full-featured, production-grade D&D 5e character management and multiplayer session platform. It provides:

- **Character Creation & Management** — Full D&D 5e character lifecycle with class, race, stats, spells, and inventory.
- **Real-Time Multiplayer Sessions** — Players join sessions hosted by a Dungeon Master; live state sync via Supabase Realtime + WebSockets.
- **DM Dashboard** — Session orchestration, initiative tracking, NPC management, fog-of-war control.
- **Battle Map (VTT)** — Grid-based virtual tabletop with token placement, fog-of-war, and map editor.
- **3D Dice System** — Physics-based dice rolling with Three.js/Cannon.js.
- **Spells & Inventory** — Full SRD spell browser, spell slot tracking, equipment management.
- **AI Dungeon Master** — Claude-powered NPC interactions, narrative generation, campaign memory (Supabase).
- **Fantasy UI** — Dark, fantasy-themed, responsive design with smooth animations.

**Tech Stack:**
- Vite + React 18 + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, Realtime, Storage)
- Zustand (state stores)
- Three.js + Cannon.js (3D/physics)
- Socket.io / WebSocket (multiplayer)
- Vitest + Playwright (testing)
- Sentry (error monitoring)
- Vercel (deployment)

---

## 📦 Repository Map

```
shadow-weave-character-sheet/
├── src/
│   ├── App.tsx / AppRoutes.tsx          # Root routing
│   ├── pages/                           # Page-level components (36 pages)
│   ├── components/                      # Feature components (24 subdirs)
│   │   ├── character/                   # Character sheet UI
│   │   ├── character-creation/          # Creation wizard
│   │   ├── character-sheet/             # Sheet views
│   │   ├── battle/                      # Battle map UI
│   │   ├── dice/                        # Dice roller UI
│   │   ├── dm/                          # DM dashboard UI
│   │   ├── session/                     # Session management UI
│   │   ├── spellbook/                   # Spell browser
│   │   └── ui/                          # shadcn base components
│   ├── stores/                          # Zustand stores (15 stores)
│   ├── services/                        # API/data services (23 files)
│   ├── types/                           # Shared TypeScript types (20 files)
│   ├── hooks/                           # Custom React hooks
│   ├── contexts/                        # React contexts
│   ├── integrations/supabase/           # Supabase client & types
│   ├── map-core/                        # Map engine core
│   ├── combat-core/                     # Combat engine core
│   ├── engine/                          # Game engine logic
│   ├── systems/                         # Game systems
│   ├── vtt/                             # VTT-specific modules
│   └── utils/                           # Utility functions
├── supabase/                            # Supabase migrations & config
├── backend/                             # Backend API (Node/Express)
├── api/                                 # Vercel API routes
├── agents/                              # THIS directory — agent system
├── docs/                                # Documentation
├── e2e/                                 # Playwright e2e tests
└── scripts/                             # Dev/build scripts
```

---

## 🔗 Module Dependency Order

The following dependency graph MUST be respected. Lower phases depend on higher phases being stable.

```
Phase 0: Project Audit
    └─► Establishes current state baseline

Phase 1: Shared Types & Data Models
    └─► src/types/*.ts | src/integrations/supabase/types.ts
    └─► Required by ALL other phases

Phase 2: Character Creation & Sheet
    └─► Depends on: Phase 1
    └─► src/pages/CharacterCreationPage.tsx
    └─► src/components/character-creation/
    └─► src/services/supabaseCharacterService.ts

Phase 3: Firebase/Supabase Persistence (Save/Load)
    └─► Depends on: Phase 1, Phase 2
    └─► src/services/characterStorage.ts
    └─► src/services/supabaseCharacterService.ts
    └─► supabase/migrations/

Phase 4: Multiplayer Sessions
    └─► Depends on: Phase 1, Phase 2, Phase 3
    └─► src/services/sessionService.ts
    └─► src/services/socket.ts
    └─► src/stores/sessionStore.ts

Phase 5: DM Dashboard
    └─► Depends on: Phase 1, Phase 4
    └─► src/pages/DMDashboardPageNew.tsx
    └─► src/pages/DMSessionPage.tsx
    └─► src/components/dm/

Phase 6: Battle Map System
    └─► Depends on: Phase 1, Phase 4, Phase 5
    └─► src/pages/VTTBattlePage.tsx
    └─► src/stores/battleStore.ts + unifiedBattleStore.ts
    └─► src/components/battle/
    └─► src/map-core/

Phase 7: 3D Dice System
    └─► Depends on: Phase 1
    └─► src/components/dice/
    └─► Three.js + Cannon.js integration

Phase 8: Spells & Inventory
    └─► Depends on: Phase 1, Phase 2
    └─► src/pages/SpellbookPage.tsx
    └─► src/services/spellService.ts
    └─► src/types/spells.ts

Phase 9: QA & Production
    └─► Depends on: ALL phases complete
    └─► e2e/ | vitest | lighthouse
```

---

## ⚙️ Execution Pipeline

```
[Phase 0: Audit]
  → Run PROJECT_AUDIT_AGENT
  → Produces: audit-report.md in docs/
  → Gate: Baseline documented before any edits

[Phase 1: Shared Types]
  → Run CHARACTER_SYSTEM_AGENT (types only)
  → All shared types centralized in src/types/
  → No duplicates across services or components
  → Gate: tsc --noEmit passes with 0 errors

[Phase 2: Character System]
  → Run CHARACTER_SYSTEM_AGENT (full)
  → Character creation wizard complete
  → All fields connected to Supabase
  → Gate: Vitest character tests pass

[Phase 3: Persistence]
  → Run FIREBASE_PERSISTENCE_AGENT
  → Save/load character to Supabase
  → Offline-first cache strategy
  → Gate: Character persists across page refresh

[Phase 4: Multiplayer]
  → Run MULTIPLAYER_SESSION_AGENT
  → Session create/join flow
  → Real-time state sync
  → Gate: 2 browser windows sync state

[Phase 5: DM Dashboard]
  → Run DM_DASHBOARD_AGENT
  → Initiative tracker, NPC controls
  → Session management UI
  → Gate: DM can run a session end-to-end

[Phase 6: Battle Map]
  → Run BATTLE_MAP_AGENT
  → Grid, tokens, fog-of-war
  → Gate: Token movement syncs between DM/Player

[Phase 7: Dice System]
  → Run DICE_SYSTEM_AGENT
  → 3D physics dice
  → Roll results connected to combat
  → Gate: Roll a d20 — result applies to combat

[Phase 8: Spells & Inventory]
  → Run SPELLS_INVENTORY_AGENT
  → Full SRD spell browser
  → Spell slot tracking
  → Gate: Cast spell → slot consumed → updates sheet

[Phase 9: QA]
  → Run QA_PRODUCTION_AGENT
  → Lighthouse ≥ 90
  → 0 TypeScript errors
  → 0 console errors in production
  → Gate: Deploy checklist complete
```

---

## 🤝 Agent Handoff Rules

1. **No agent may begin its phase until the previous phase's Definition of Done is verified.**
2. **Each agent must read the audit-report first** (generated by PROJECT_AUDIT_AGENT).
3. **Each agent must output a progress report** in `docs/agents/` before passing control.
4. **Handoff document naming**: `docs/agents/PHASE_N_COMPLETE.md`
5. **If an agent discovers a blocker**, it must document it in `docs/agents/BLOCKERS.md` and halt — do not patch around it silently.
6. **No agent may touch files outside its allowed scope** without explicit escalation to MASTER_ORCHESTRATOR.

---

## 🛡️ Conflict Prevention Rules

| Rule | Description |
|------|-------------|
| **Type Ownership** | Only `CHARACTER_SYSTEM_AGENT` (Phase 1) may create/modify `src/types/*.ts` |
| **Supabase Client** | Only one client instance: `src/integrations/supabase/client.ts` — never duplicate |
| **Store Isolation** | Each agent owns specific stores — see individual agent files |
| **No Global Rewrites** | Agents may only modify files listed in their `ALLOWED_FILES` section |
| **CSS Ownership** | `src/index.css` and `tailwind.config.ts` — only `QA_PRODUCTION_AGENT` may refactor; others may append |
| **Routing** | `src/AppRoutes.tsx` — only modified by agent assigned to that feature's page |
| **Service Singletons** | All services are singletons — never instantiate directly in components |

---

## 🌿 Git Workflow

```bash
# Branch naming convention:
# feature/phase-N-<agent-name>-<short-description>
# Example:
git checkout -b feature/phase-2-character-system-creation-wizard

# Commit message convention:
# [PHASE-N][AGENT] scope: description
# Example:
git commit -m "[PHASE-2][CHARACTER_SYSTEM] feat: connect race selector to Supabase"

# PR rules:
# - Each phase gets ONE PR per agent
# - Must pass: tsc --noEmit, npm run test, npm run lint
# - Must include: list of modified files in PR description
# - Squash commits before merge to main
```

---

## ✅ Validation Workflow

Run these commands in order before any phase is considered complete:

```bash
# 1. TypeScript — zero errors required
npx tsc --noEmit

# 2. Linting — zero violations
npm run lint

# 3. Unit tests — all pass
npm run test

# 4. Build — must succeed
npm run build

# 5. E2E (if applicable)
npx playwright test

# 6. Lighthouse (Phase 9 only)
npx lhci autorun
```

---

## 🗺️ Priority Roadmap

| Priority | Phase | Agent | Goal |
|----------|-------|-------|------|
| P0 | Phase 0 | PROJECT_AUDIT_AGENT | Know exactly what exists and what's broken |
| P0 | Phase 1 | CHARACTER_SYSTEM_AGENT | Stabilize types — all other phases depend on this |
| P1 | Phase 2 | CHARACTER_SYSTEM_AGENT | Complete character creation flow |
| P1 | Phase 3 | FIREBASE_PERSISTENCE_AGENT | Characters must survive page refresh |
| P2 | Phase 4 | MULTIPLAYER_SESSION_AGENT | Core session sync |
| P2 | Phase 5 | DM_DASHBOARD_AGENT | DM can control sessions |
| P3 | Phase 6 | BATTLE_MAP_AGENT | VTT grid system |
| P3 | Phase 7 | DICE_SYSTEM_AGENT | Physics dice |
| P4 | Phase 8 | SPELLS_INVENTORY_AGENT | Polish spells/inventory |
| P4 | Phase 9 | QA_PRODUCTION_AGENT | Ship it |

---

## 📋 Global Agent Rules (Applies to ALL Agents)

1. **Do not rewrite the whole project from scratch.**
2. **Preserve existing UI and architecture** unless a change is explicitly required.
3. **Work module by module** — file by file, never batch-replace.
4. **Every change must be file-level specific** — name the file, the change, and why.
5. **No mock-only features** unless marked `// TODO: TEMPORARY MOCK` in code.
6. **Every feature must connect to real application state** (Zustand store or Supabase).
7. **Document every changed file** in the agent's progress report.
8. **Include validation steps** for every implemented feature.
9. **TypeScript must remain strict** — no `any`, no `@ts-ignore` without justification.
10. **Firebase/Supabase logic must not be duplicated** — use the existing service layer.
11. **Shared types must be centralized** in `src/types/`.
12. **UI must remain responsive and fantasy-themed.**
13. **Avoid breaking existing character creation flow** — test existing paths before modifying.
14. **Prefer small safe commits** over massive changes.
