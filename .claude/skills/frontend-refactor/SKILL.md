---
name: frontend-refactor
description: Refactor existing frontend code — analyze current state, restructure safely, verify no regressions with UI/UX reviewer
argument-hint: '[refactor-description]'
allowed-tools: Read Grep Glob Bash Edit Write Agent
---

# Frontend Refactor

Follow this workflow when refactoring existing frontend code.

## Step 1: Analyze Current State

- Read and understand the code being refactored — components, hooks, routes, styles
- Identify all usages and dependents: grep for imports, component references, hook calls
- Note the current behavior so regressions can be caught later
- Run the TypeScript compiler to confirm a clean starting point: `npx tsc --noEmit` from `frontend/`

## Step 2: Capture Baseline

1. Start the dev server if not running: `npm run dev` from `frontend/`
2. Launch the **ui-ux-reviewer** agent to screenshot all affected pages/components before making changes
3. These screenshots serve as the visual baseline for regression comparison

## Step 3: Plan the Refactor

- Identify the minimal set of changes needed — don't expand scope
- Break into small, independently verifiable steps if the refactor touches multiple files
- If types in `frontend/app/generated/` are involved, those are generated — change the OpenAPI spec and run `npm run generate:api` from the project root instead

## Step 4: Implement

Apply the refactor following the project's established rules:

- **React standards** (`.claude/rules/react.md`): functional components, hooks, TypeScript strict mode, organize by feature
- **Accessibility** (`.claude/rules/accessibility.md`): WCAG 2.2 AA — don't regress on landmarks, headings, labels, contrast, keyboard, focus
- **Web standards** (`.claude/rules/web-standards.md`): semantic HTML, mobile-first responsive, progressive enhancement

### Guidelines:
- Preserve existing behavior — refactor structure, not functionality
- Update all import paths and references when moving/renaming files
- Remove dead code completely — no commented-out blocks or unused re-exports
- Keep changes minimal and focused on the stated goal

## Step 5: Verify

1. Run the TypeScript compiler: `npx tsc --noEmit` from `frontend/`
2. Launch the **ui-ux-reviewer** agent to screenshot all affected pages/components after changes
3. Compare against the baseline — flag any visual or behavioral regressions

## Step 6: Iterate

Address any regressions found before reporting the refactor as complete.
