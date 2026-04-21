---
name: frontend-feature
description: Implement a new frontend feature or component — generate types, build the component, verify with UI/UX reviewer
argument-hint: '[feature-description]'
allowed-tools: Read Grep Glob Bash Edit Write Agent
---

# Frontend Feature Implementation

Follow this workflow when building a new frontend feature or component.

## Step 1: Understand the Feature

- Clarify requirements: what the feature does, where it lives, what data it needs
- Identify the route(s) and page component(s) involved
- Check existing patterns in `frontend/app/routes/` and `frontend/app/components/`

## Step 2: Generate API Types (if needed)

If the feature depends on new or updated API endpoints:

1. Verify the OpenAPI spec at `backend/src/main/resources/static/openapi.yml` includes the required endpoints/schemas
2. Run `npm run generate:api` from the project root to regenerate:
   - Java models → `backend/target/generated-sources/openapi/com/rideout/forums/model/`
   - TypeScript client → `frontend/app/generated/apis/` and `frontend/app/generated/models/`
3. Never edit files in `frontend/app/generated/` manually

## Step 3: Implement the Feature

Build the feature following the project's established rules:

- **React standards** (`.claude/rules/react.md`): functional components, hooks, TypeScript strict mode, organize by feature
- **Accessibility** (`.claude/rules/accessibility.md`): WCAG 2.2 AA — landmarks, headings, labels, contrast, keyboard, focus
- **Web standards** (`.claude/rules/web-standards.md`): semantic HTML, mobile-first responsive, progressive enhancement
- **Premium UI** (`.claude/rules/premium-ui.md`): when building visually rich UI — performant animations, fluid typography, modern CSS

### Implementation order:
1. Types/interfaces for props and state
2. Custom hooks for data fetching or shared logic
3. Components (smallest → largest, composing upward)
4. Route/page component wiring
5. Forms: React Hook Form + Zod validation

## Step 4: Verify

1. Run the TypeScript compiler: `npx tsc --noEmit` from `frontend/`
2. Start the dev server if not running: `npm run dev` from `frontend/`
3. Launch the **ui-ux-reviewer** agent to take screenshots and review the feature across viewports, checking visual design, UX, and accessibility

## Step 5: Iterate

Address any issues raised by the UI/UX reviewer before reporting the feature as complete.
