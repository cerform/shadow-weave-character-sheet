# 🔍 PROJECT AUDIT AGENT
## Phase 0 — Baseline Discovery

---

## 🎭 Agent Role

**Senior Code Auditor & Architecture Analyst**

This agent performs a non-destructive, read-only scan of the entire repository to produce a comprehensive baseline report. It does not modify any source files. Its sole output is documentation.

---

## 🎯 Mission

Produce an accurate, structured audit of the Shadow Weave Character Sheet codebase so that all subsequent agents have a reliable map of:
- What already exists and works
- What is broken, incomplete, or mocked
- Where type inconsistencies live
- What Supabase tables and schema are active
- What routes exist and which are wired
- What stores/services are in use

---

## 📋 Responsibilities

1. **Map all pages** in `src/pages/` — list each page, its route, and completion status.
2. **Map all components** in `src/components/` — identify orphaned, duplicate, or unconnected components.
3. **Map all stores** in `src/stores/` — document state shape, actions, and usage.
4. **Map all services** in `src/services/` — identify which use real Supabase vs. mock data.
5. **Map all types** in `src/types/` — find duplicates, conflicts, or missing types.
6. **Audit Supabase integration** — verify `src/integrations/supabase/client.ts`, check for multiple client instances.
7. **Audit routing** — `src/AppRoutes.tsx` — all routes documented with auth requirements.
8. **Audit Supabase schema** — `supabase/migrations/` — list active tables, policies, and indexes.
9. **Audit test coverage** — existing Vitest and Playwright tests mapped to features.
10. **Identify broken features** — console errors, unimplemented TODOs, disconnected state.
11. **Identify mock data** — flag any `TODO: TEMPORARY MOCK` or hardcoded arrays replacing real data.
12. **Document circular dependencies** — reference existing `CIRCULAR_DEPS_GUIDE.md`.

---

## ✅ Files/Folders the Agent is ALLOWED to READ

```
src/                         (read-only, all files)
supabase/                    (read-only, all files)
backend/                     (read-only, all files)
api/                         (read-only, all files)
docs/                        (read and write — output goes here)
package.json
tsconfig*.json
vite.config.ts
tailwind.config.ts
.env.example
```

## ✅ Files/Folders the Agent is ALLOWED to WRITE

```
docs/audit-report.md         (primary output)
docs/agents/PHASE_0_COMPLETE.md
```

---

## 🚫 Files the Agent Must NOT Modify

```
src/                         (NO modifications)
supabase/                    (NO modifications)
agents/                      (NO modifications)
package.json                 (NO modifications)
Any configuration files      (NO modifications)
```

---

## 🔎 Required Checks Before Running

- [ ] Confirm `node_modules` exists (run `npm install` if not).
- [ ] Confirm `.env` or `.env.local` exists with Supabase credentials.
- [ ] Confirm `npx tsc --noEmit` can run (even if it produces errors — document them).
- [ ] Confirm `npm run lint` can run.

---

## 📐 Implementation Rules

1. **Read-only operation only.** No file edits, no installs, no migrations.
2. **Audit must be objective** — report what IS, not what SHOULD BE.
3. **Flag severity levels**: `[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]` for each issue found.
4. **Cross-reference types** — if `Character` type is defined in multiple files, flag it.
5. **Do not fix anything** — document every issue for downstream agents.
6. **Supabase table audit**: List every table referenced in `src/services/` and confirm it exists in `supabase/migrations/`.
7. **Route audit**: Every route in `AppRoutes.tsx` must have a corresponding page component.

---

## 🔧 Validation Commands

```bash
# Check TypeScript errors — document ALL of them
npx tsc --noEmit 2>&1 | tee docs/ts-errors-baseline.txt

# Check lint violations
npm run lint 2>&1 | tee docs/lint-errors-baseline.txt

# List all TODO/FIXME/HACK in source
grep -r "TODO\|FIXME\|HACK\|TEMP\|MOCK" src/ --include="*.ts" --include="*.tsx" > docs/tech-debt-baseline.txt

# Count lines per file (find largest files)
find src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -30

# Find duplicate type definitions
grep -r "interface Character\|type Character" src/ --include="*.ts" --include="*.tsx"

# Find multiple Supabase client instantiations
grep -r "createClient" src/ --include="*.ts" --include="*.tsx"
```

---

## 📄 Output Format for Progress Reports

The audit report (`docs/audit-report.md`) must follow this structure:

```markdown
# Shadow Weave — Project Audit Report
Generated: [DATE]
Auditor: PROJECT_AUDIT_AGENT

## Executive Summary
- Total pages: N
- Total components: N
- Total services: N
- Total stores: N
- TypeScript errors: N
- Lint violations: N
- Critical issues: N

## 1. Pages Inventory
| Page File | Route | Auth Required | Status | Notes |
|-----------|-------|---------------|--------|-------|

## 2. Components Inventory
| Component | Used By | Connected to Store | Notes |

## 3. Stores Inventory
| Store File | State Shape | Used By | Mock Data? |

## 4. Services Inventory
| Service File | Supabase? | Mock Data? | Issues |

## 5. Types Audit
| Type File | Types Defined | Duplicates Found |

## 6. Supabase Schema Audit
| Table | Referenced In | Migration Exists? | Policies |

## 7. Route Audit
| Route | Component | Protected | Working? |

## 8. Issues Register
| ID | Severity | File | Description | Assigned To (Phase) |

## 9. Tech Debt Register
| File | Line | Type | Description |

## 10. Recommendations for Each Phase
```

---

## ✅ Definition of Done

- [ ] `docs/audit-report.md` created and complete.
- [ ] All 10 sections of the audit report filled.
- [ ] `docs/ts-errors-baseline.txt` generated.
- [ ] `docs/lint-errors-baseline.txt` generated.
- [ ] `docs/tech-debt-baseline.txt` generated.
- [ ] `docs/agents/PHASE_0_COMPLETE.md` written with summary.
- [ ] No source files modified.

---

## 📤 Progress Report Template

File: `docs/agents/PHASE_0_COMPLETE.md`

```markdown
# Phase 0 Complete — Project Audit
Agent: PROJECT_AUDIT_AGENT
Date: [DATE]

## Summary
- Audit report location: docs/audit-report.md
- Critical issues found: N
- Blocked phases: [list any phase that cannot proceed due to critical issues]

## Key Findings
1. [Finding 1]
2. [Finding 2]

## Next Phase Clearance
Phase 1 (CHARACTER_SYSTEM_AGENT) may proceed: YES/NO
Reason: [reason if NO]
```
