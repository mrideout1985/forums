---
paths:
  - "frontend/**/*.{ts,tsx}"
---

# React Development Standards

## Component Architecture

### Container / Presentational Pattern
A component should either **fetch/manage data** or **render UI** — not both. When in doubt, split it.

**Presentational components:**
- Receive all data and callbacks via props — no direct API calls, no store access
- Are stateless or contain only local UI state (e.g. hover, open/closed)
- Are reusable, composable, and easy to test in isolation
- Live in `components/`

**Container components:**
- Own the data-fetching, business logic, and state
- Pass derived data and handlers down as props to presentational components
- Live in `pages/` or alongside the feature they serve

### Single Responsibility
Each component does one thing. If you're scrolling past three screens of JSX, it's two components.

### Composition Over Configuration
Prefer building flexible UIs via **children and slot props** rather than ever-growing prop APIs.

```tsx
// ❌ Configuration hell
<Modal title="..." footer="..." icon="..." closable showOverlay ... />

// ✅ Composition
<Modal>
  <Modal.Header>
    <h2>Title</h2>
  </Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button>Confirm</Button>
  </Modal.Footer>
</Modal>
```

### Colocation
Keep related files together. A component's styles, tests, and types live next to it.

---

## Hooks

### Custom Hooks for Logic Reuse
Extract stateful logic into `use*` hooks. Hooks should be focused and composable. Shared hooks live in `hooks/`.

### Rules of Hooks
- Never call hooks conditionally or inside loops
- Always specify `useEffect` dependency arrays — no suppression comments without a written justification
- Implement cleanup functions to prevent memory leaks

### Avoid Overusing `useEffect`
`useEffect` is for **synchronising with external systems**, not for deriving state or handling events.

```tsx
// ❌ Deriving state in an effect
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Derive inline
const fullName = `${firstName} ${lastName}`;
```

---

## State Management

### Colocate State as Low as Possible
State lives as close to where it's needed as possible. Lift only when siblings genuinely need to share it.

| Scope | Tool |
|---|---|
| Local UI state | `useState` / `useReducer` |
| Complex local logic | `useReducer` |
| Shared cross-component | Context or Zustand slice |
| Server state | React Query / SWR |

### Avoid Context for High-Frequency Updates
Context re-renders all consumers on every update. Use it for low-frequency values (theme, locale, auth). For everything else, use a proper state manager.

---

## TypeScript

### No `any`
`any` defeats the purpose of TypeScript. Use `unknown` and narrow, or model the type properly.

### Props Are Explicit Types, Not Inlined
```tsx
// ❌
const Button = ({ label, onClick }: { label: string; onClick: () => void }) => ...

// ✅
type ButtonProps = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
};

const Button = ({ label, onClick, variant = 'primary' }: ButtonProps) => ...
```

### Discriminated Unions for UI States
```tsx
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

---

## Forms
- React Hook Form + Zod for form handling and validation

---

## Performance

### Memoisation Is Opt-In, Not Default
Only reach for `React.memo`, `useMemo`, and `useCallback` when there is a **measured performance problem**.

When memoisation is appropriate:
- `React.memo` — component re-renders frequently with the same props
- `useMemo` — genuinely expensive computation (not just a `.filter()`)
- `useCallback` — stable reference required for a dependency array or `React.memo` child

### Code Splitting
Lazy-load routes and heavy components with `React.lazy` + `Suspense`.

### Key Prop Discipline
Never use array index as a key for lists that can reorder or change. Use a stable unique identifier.

```tsx
// ❌
items.map((item, i) => <Card key={i} {...item} />)

// ✅
items.map((item) => <Card key={item.id} {...item} />)
```

---

## Error Handling

### Error Boundaries
Wrap feature subtrees in Error Boundaries to prevent a single failure from crashing the entire page.

### Never Swallow Errors Silently
```tsx
// ❌
try {
  await saveUser(data);
} catch (_) {}

// ✅
try {
  await saveUser(data);
} catch (err) {
  logger.error('Failed to save user', err);
  setError('Could not save. Please try again.');
}
```

---

## File & Folder Conventions

```
frontend/app/
  components/     ← Shared, reusable presentational components
  hooks/          ← Shared custom hooks
  pages/          ← Page components (extracted from routes)
  routes/         ← File-based route definitions
  providers/      ← Context providers
  lib/            ← API clients and utilities
  validation/     ← Zod schemas
  generated/      ← OpenAPI-generated types — never edit manually
```

- **One component per file.** The file name matches the component name.
- **`index.ts` barrel files** expose the public API of a folder — never re-export everything blindly.

---

## Code Quality Guardrails

- Components over **200 lines** — consider splitting
- Props interfaces over **10 props** — consider composition or splitting concerns
- No inline object/array literals in JSX that cause unnecessary re-renders
- Avoid deeply nested ternaries in JSX — extract into a variable or sub-component
- PascalCase for components, camelCase for functions/variables
