# Claude instructions for this project

## Language

- All code comments, variable names, function names, type names, and any other text within source code must be written in **English**.
- UI strings (visible to the user in the browser) are an exception — they live in `src/strings.ts` and may be in any language.
- Documentation files (README, etc.) must also be in **English**.

## Functions

Prefer arrow function expressions over traditional function declarations:

```tsx
// Preferred
export const MyComponent = (): React.ReactElement => { ... };

// Avoid
export function MyComponent(): React.ReactElement { ... }
```

### Unit guidelines

| Unit  | Use for                                                 |
| ----- | ------------------------------------------------------- |
| `rem` | Spacing, padding, margin, gap, font-size, border-radius |
| `px`  | Borders (`1px`), box-shadows, fixed icon sizes (`24px`) |
| `%`   | Responsive widths, aspect ratios                        |

# Architecture Rules

All generated code must meet production-grade
standards. No POC patterns, no shortcuts, no monoliths.

---

## 1. Directory Structure

### Structural rules — apply these when creating, editing, or refactoring

```
src/
  main.tsx
  AppProviders.tsx
  app/
    core/           # shared infrastructure consumed by multiple features
    features/       # one subdirectory per product domain
    components/     # shared UI only — no feature-specific logic
    pages/          # page shells and routing entry points
    routing/
    services/
    theme/
    utils/
```

**Inside every feature** (`src/app/features/<Feature>/`):

| Folder        | Contains                                                               |
| ------------- | ---------------------------------------------------------------------- |
| `components/` | React components used by this feature only                             |
| `hooks/`      | Feature-scoped hooks                                                   |
| `types/`      | Type definitions split by concern (`fooData.ts`, `fooView.ts`)         |
| `constants/`  | Named constants split by concern (`fooDimensions.ts`, `fooOptions.ts`) |
| `utils/`      | Pure utility functions                                                 |
| `actions/`    | Registry class, action map, handler factories (where applicable)       |
| `workers/`    | Web workers (where applicable)                                         |
| `index.ts`    | **Only file** allowed to re-export — consumer-facing API only          |

**Inside `core/`:** same subdirectory pattern (`hooks/`, `stores/`, `services/`, `types/`, etc.), one `index.ts` at root.

**Component placement:** every component lives in its own directory named after it, containing exactly `ComponentName.tsx` + `ComponentName.module.css`. No component file sits loose alongside unrelated files.

**Sub-tree components:** if a component is only used inside one parent component's render tree, place it in a `components/` subdirectory of that parent's directory — not at the feature's top-level `components/`.

**When adding or refactoring:**

- Value, type, or utility used in more than one place → move it to the appropriate shared layer (`core/` or `app/components/`)
- Subdirectory growing beyond ~5 files of the same kind → split by concern, do not collapse into a monolith
- Never place a new file in a directory if it doesn't clearly belong — create the correct directory instead

---

## 2. Barrel File Rules

**Allowed `index.ts` files:**

- Feature root: `src/app/features/<Feature>/index.ts`
- Core root: `src/app/core/index.ts`
- Shared components root: `src/app/components/index.ts`

**Banned everywhere else** — no `index.ts` inside any subdirectory (`hooks/`, `types/`, `components/SomeComponent/`, `actions/`, etc.).

**Import style — always direct paths:**

```ts
// CORRECT
import { OrderCard } from '../components/OrderCard/OrderCard';
import { useCardViewMode } from '../hooks/useCardViewMode';

// WRONG — barrel inside a subdirectory
import { OrderCard } from '../components/OrderCard';
import { useCardViewMode } from '../hooks';
```

External consumers import from the feature root only:

```ts
import { Cards, SemaphoreOption } from 'app/features/OrderCards';
```

---

## 3. Single Responsibility

- One component per file. One hook per file. One concern per file.
- Name files after what they contain: `useCardColumnWidth.ts`, `cardData.ts`, `semaphoreChange.ts`.
- **No monolithic files** — `types.ts`, `constants.ts`, `utils.ts`, `helpers.ts` are banned by name. A file named after a category instead of a concern is a god file waiting to happen. Split by concern from the start:
  - `types/cardData.ts`, `types/cardView.ts`, `types/cardMatrix.ts` — not `types/types.ts`
  - `constants/cardDimensions.ts`, `constants/semaphoreOptions.ts`, `constants/limits.ts` — not `constants/constants.ts`
  - `utils/formatDate.ts`, `utils/statusColors.ts` — not `utils/utils.ts`
- A hook owns exactly one concern. Split when a hook has more than ~2 responsibilities.
- Components render UI — they do not own business logic. Complex derivations belong in hooks.
- No god components. If a component renders meaningfully different subtrees under a condition, split into separate components.
- If a file exceeds ~350 lines it is almost certainly doing too much.

---

## 4. DRY — Generic, Reusable, Extensible

This codebase is complex enough that the same patterns recur across features. Do not re-implement them — generalise them.

**Write generic when the concept recurs:**

- If a class, hook, or utility encapsulates a pattern that another feature could need, make it generic from the start. Parameterise the varying part via generics, props, or arguments — do not hardcode feature-specific assumptions into shared infrastructure.
- If a hook or utility only works for one feature's specific data shape, it belongs in that feature. If the underlying behaviour (debouncing, subscribing, measuring, registering) is reusable, extract the behaviour to `core/` and let each feature supply its own types and config.
- Shared type utilities (discriminated union helpers, mapped types, derived param types) belong in `core/types/` — not duplicated per feature.

**Shared vs. feature-local decision:**

- Used in one feature → feature-local.
- Used or likely to be used in more than one feature → `core/` or `app/components/`.
- UI with no feature logic → `app/components/`.

**Composition over duplication:**

- Do not copy-paste a hook with minor differences — parameterise the difference.
- Do not copy-paste a component with different labels — accept the label as a prop.
- Do not duplicate type shapes — derive with `Pick`, `Omit`, `keyof`, mapped types.

---

## 5. Constants — No Hardcoded Values

**Every magic value must be a named constant.** No bare numbers, strings, or booleans inline in logic.

```ts
// WRONG
const width = dayCount * 120 + 40
if (count > 500) { ... }
setTimeout(fn, 250)

// CORRECT
/** Width in pixels allocated per day column in the graph canvas. */
const DAY_COLUMN_WIDTH_PX = 120

/** Fixed left gutter width reserved for row labels. */
const ROW_LABEL_GUTTER_PX = 40

/** Orders above this count collapse the section by default to avoid mount cost. */
const EXPANDED_MAX_ORDERS = 500

/** Debounce delay in ms for resize events fed into useSyncExternalStore. */
const RESIZE_DEBOUNCE_MS = 250
```

**Rules:**

- Constants live in a `constants/` directory, split by concern (`dimensions.ts`, `timings.ts`, `limits.ts`).
- Every constant must have a JSDoc comment. If the value's purpose is not fully self-evident from the name, the comment must explain the reasoning (e.g. why that number, what breaks if it changes).
- Module-level constants only — never declare a project constant inside a function body.
- `Object.freeze` readonly option arrays and shared reference data to prevent accidental mutation.

---

## 6. React Hook Rules

### `useMemo`

- Must be **pure** — zero side effects.
- In Strict Mode, React runs `useMemo` twice and may discard the cached value at any time.
- Any registration, subscription, mutation, or I/O inside `useMemo` is a bug.

```ts
// WRONG — side effect inside useMemo
useMemo(
  () => CardActions.register('semaphoreChange', createHandler(patchSemaphore)),
  [patchSemaphore],
);

// CORRECT — registration is a side effect, belongs in useEffect
useEffect(() => {
  CardActions.register(
    'semaphoreChange',
    createSemaphoreChangeHandler(patchSemaphore),
  );
}, [patchSemaphore]);
```

### `useEffect`

- Do NOT use for derived state — calculate during render; use `useMemo` only for expensive computations or when referential stability matters.
- Do NOT use for external readable state subscriptions where the component needs a reactive snapshot — use `useSyncExternalStore`.
- Use for genuine side effects: DOM mutations, registry registrations, timers, imperative APIs, analytics, manual integrations.

### `useSyncExternalStore`

- Correct primitive for subscribing to external browser state (resize, scroll, matchMedia).
- The `subscribe` callback **must own the full listener lifecycle** — add on entry, return a cleanup that removes:

```ts
// CORRECT — subscribe owns the listener, ref-counted across instances
const subscribers = new Set<() => void>();

const notify = () => subscribers.forEach((cb) => cb());

const subscribe = (cb: () => void) => {
  const shouldAttach = subscribers.size === 0;
  subscribers.add(cb); // add before attaching to avoid edge-case with synchronous notify
  if (shouldAttach) window.addEventListener('resize', notify);
  return () => {
    subscribers.delete(cb);
    if (subscribers.size > 0) return;
    window.removeEventListener('resize', notify);
  };
};

// WRONG — module-scope permanent listener, never removed
window.addEventListener('resize', debouncedNotify); // at module scope, outside subscribe
```

For SSR safety always supply the third `getServerSnapshot` argument:

```ts
const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

### `useCallback` / memoization

- Wrap all callbacks passed to virtualizer options (`getItemKey`, `rangeExtractor`, `estimateSize`) in `useCallback`.
- Never pass inline arrow functions as props to `React.memo` components — defeats memoization.
- Primitive props at memo boundaries wherever possible.

---

## 7. Data Shapes — Descriptors, Not Functions

`useMemo` that builds card/item data must contain **zero function references**.
Closures captured in memoized data defeat memo on every consumer and cause handler identity bugs.

```ts
// WRONG — function in memoized data
type CardItem = {
  label: string;
  onSelect: (value: string) => void; // ← breaks all downstream memo
};

// CORRECT — serializable descriptor; row components dispatch via registry
type SemaphoreRowDescriptor = {
  _type: 'semaphoreRow';
  key: string;
  titleKey: string; // i18n key — NOT a pre-translated string
  currentValue: string | null;
  options: readonly SemaphoreOption[] | null;
  orderId: string | number;
  jobId: number;
  isViewOnly: boolean;
};
```

- All descriptor union members use a `_type` string discriminant.
- `titleKey` / `labelKey` fields hold i18n keys — row components call `t(titleKey)` at render time. No `t()` calls in the hot data-building loop.
- `useMemo` dependency arrays contain only primitives and stable refs — zero handler deps.
- Module-level constants for any value that does not vary per item (option arrays, divider objects, etc.).

---

## 8. Action Dispatch — Registry Pattern

Row components dispatch actions via a typed module-singleton registry.
No prop drilling. No React context lookup. No Zustand actions store.

```
actions/
  <Feature>Actions.ts   # ActionsRegistry<TActionMap> instantiated with feature's map
  actionMap.ts          # TActionMap — action keys mapped to param types
  handlers/
    <action>.ts         # XxxParams type + createXxxHandler pure factory
```

Each handler file exports exactly:

1. `XxxParams` — the param type for that action
2. `createXxxHandler(mutate)` — a pure factory function; no hooks, fully unit-testable

`actionMap.ts` maps action keys to param types — one line per action. Adding an action = one line here; the compiler drives all callsites.

```ts
FeatureActions.dispatch('actionKey', { ...params });
```

Direct module import — no hook, no context, no re-render caused by this call.

The `ActionsRegistry` class lives in `core/` and must be **generic** (`ActionsRegistry<TActionMap>`) so any feature can instantiate it with its own action map without re-implementing the registry logic.

---

## 9. Styling

These rules are **performance requirements, not style preferences**. `sx`, `styled()` with dynamic props, and inline `style` objects all allocate new objects and/or trigger style recalculation on every render. In hot-path render trees — virtualized cards, graphs, tooltips, menus — where re-renders are frequent and per-item, this overhead accumulates into visible jank on old hardware. Apply these rules strictly in any component that lives inside a hot path.

- **CSS Modules only** — one `.module.css` per component, co-located in the component's directory.
- **Zero `sx` prop** — banned everywhere, including MUI components.
- **Zero `styled()` with dynamic props** — no runtime style generation in the render path.
- **Zero inline `style` objects in JSX** — the only exception is virtualization geometry (`transform`, `height`, `top`, `left`, `width` on absolutely positioned virtual rows; these are runtime values that cannot be CSS Modules).
- State-driven styles via data attributes — not conditional class arrays:
  ```tsx
  <div
    data-selected={isSelected}
    data-compact={isCompact}
    data-cancelled={isCancelled}
    data-filtered-out={isFilteredOut}
  >
  ```
  CSS targets `[data-selected="true"]` — clean, zero JS overhead for style switching.
- MUI `Typography` is acceptable. MUI layout components (`Box`, `Stack`, `Grid`) are banned in all hot-path render trees (cards, graphs, tooltips, menus).

---

## 10. TypeScript

- **`strict: true`** in tsconfig — non-negotiable.
- **No `any`** — not in type definitions, not in casts, not in generics. Use `unknown` + narrowing.
- **No unsupported type assertions** — the `ActionsRegistry` Map cast is the one documented exception (TypeScript `Map` cannot track key↔value type correlation natively).
- All discriminated unions use a `_type` string literal discriminant — not optional-property discrimination.
- No `!` non-null assertions in render or hook code. Use optional chaining or early returns.
- Derive types — do not duplicate: `keyof CardActionMap`, `CardActionParams<K>`, etc.

---

## 11. Performance — Algorithmic Complexity and GC Pressure

### Algorithmic complexity

**No O(n²) data processing in any hot path.**

```ts
// WRONG — O(orders × columns), fails at 10k orders
order_columns.findIndex((col) => col.orderIds.includes(order.id));

// CORRECT — O(n) pre-pass Map, then O(1) lookup
const colIndex = new Map<string | number, number>();
data.order_columns.forEach((col, i) =>
  col.orderIds.forEach((id) => colIndex.set(id, i)),
);
// ... in loop: colIndex.get(order.id) ?? -1
```

### GC pressure — zero allocations in hot paths

Every object, array, or closure created inside a per-item loop is a heap allocation. On old hardware with 10k items this accumulates into GC pauses and jank.

```ts
// WRONG — allocations per item
items.map((item) => ({ ...item, label: t(item.labelKey) }));
options.filter((o) => !o.disabled).map((o) => o.value);

// CORRECT — pre-declare result array once, push field-by-field, no spread
const result: Descriptor[] = [];
for (const item of items) {
  result.push({ _type: 'row', key: item.id, titleKey: item.labelKey });
}
```

Rules:

- Pre-declare result arrays **before** the loop — never allocate inside a loop body.
- Zero spreads (`...`) inside loops. Build objects field by field.
- Zero intermediate arrays — no `.filter()` then `.map()`, no chained transforms. Use a single `for...of` with `if` guards and `push`.
- Module-level constants for any value that does not vary per item. Never construct option arrays, config objects, or frozen shapes inside a loop or inside a `useMemo` data-build.
- No closures created inside loops — closures capture their enclosing scope and pin references that prevent GC.
- Prefer numeric IDs as Map keys over string concatenation when an ID is available.

---

## 12. Virtualization (TanStack Virtual)

Package: `@tanstack/react-virtual` — if not yet installed, add to `package.json` first.

**Key constraints:**

- `data-index` and `ref={virtualizer.measureElement}` must be co-located on the **same** wrapper `div` — never split across a component boundary.
- `getItemKey` returns a stable domain ID — **never** array index for dynamic lists. Wrapped in `useCallback`.
- `estimateSize` constants represent **item height only** — the virtualizer's `gap` option is additive. Including gap in the estimate double-counts it.
- `scrollMargin` = `getBoundingClientRect().top + window.scrollY` — **not** `offsetTop` (wrong when an intermediate `position: relative` ancestor exists).
- `minHeight` on the outer container = `maxCount * estimateSize + Math.max(0, maxCount - 1) * GAP_PX` — prevents page-height jumps when tall columns unmount. Must use the same constants as the inner virtualizers.
- Default TanStack range extractor does NOT return `[]` when the container is below the viewport. Use a custom `rangeExtractor` that returns `[]` when `scrollMargin > window.scrollY + window.innerHeight`, then delegates to `defaultRangeExtractor`.
- Overscan: horizontal `2`, vertical `3`.
- Both compact and full modes require dynamic measurement (`measureElement` + ResizeObserver) — heights are never structurally fixed.

---

## 13. Component Design

- All components in virtualized trees: `React.memo` with primitive props at the boundary.
- `display: false` filtering belongs at data generation time — never mount a component that immediately returns `null`.
- `React.lazy` for heavy feature subtrees and all dialog components.
- `ref` forwarding for virtualization targets: the wrapper `div` (not the inner component) holds `data-index` + `ref={measureElement}`. The component may additionally forward a ref for other purposes but must not be the measurement target.
- `getItemKey` must be stable — use `useCallback`. Any key instability causes ResizeObserver to lose track of the correct element.
- Add `data-testid` to every meaningful interactive element and display container that automated tests need to target. Use stable, descriptive IDs tied to domain identity (e.g. `data-testid="order-card--{orderId}"`), not positional or generated values.

---

## 14. Module and Import Discipline

- Features do not import directly from other features — cross-feature dependencies go through `core` or are passed as props/context.
- `src/app/components/` contains shared UI only — no feature-specific logic, no feature-specific types.
- `core/` exports shared infrastructure: types, stores, services, hooks, utilities needed by multiple features.
- Circular imports are forbidden. A circular import means the abstraction boundary is wrong — restructure.

---

## 15. What is Explicitly Banned

| Pattern                                                           | Reason                                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `index.ts` inside any subdirectory                                | Barrel sprawl; obscures dependencies; breaks tree-shaking clarity             |
| Hardcoded magic values inline in logic                            | Every value must be a named constant with JSDoc                               |
| `useEffect` for derived state                                     | `useMemo` is the correct primitive                                            |
| `useEffect` for external subscriptions                            | `useSyncExternalStore` is the correct primitive                               |
| Side effects inside `useMemo`                                     | Runs twice in Strict Mode; cache can be discarded at any time                 |
| Module-scope `addEventListener` never removed                     | Memory leak; breaks `useSyncExternalStore` subscribe contract                 |
| `any` type                                                        | TypeScript strict mode is non-negotiable                                      |
| `sx` prop anywhere                                                | Runtime style in render path; banned project-wide                             |
| `styled()` with dynamic props                                     | Same reason as `sx`                                                           |
| Functions / closures in `useMemo`-built data                      | Defeats memo on all consumers; causes handler identity bugs                   |
| Handler deps in `useMemo` dep arrays                              | Causes matrix rebuild on every mutation                                       |
| O(n²) algorithms in data hooks                                    | Fails at 10k orders                                                           |
| Object / array allocations inside hot loops                       | GC pressure on old hardware                                                   |
| Spreads (`...`) inside loops                                      | Hidden allocation                                                             |
| Intermediate arrays in hot paths (`.filter().map()`)              | Double allocation, double iteration                                           |
| Closures created inside hot loops                                 | Pins scope references, prevents GC                                            |
| Copy-pasting code with minor variation instead of generalising    | Violates DRY; future changes require double edits                             |
| God hooks with 5+ unrelated responsibilities                      | Untestable, unmaintainable                                                    |
| `types.ts`, `constants.ts`, `utils.ts`, `helpers.ts` as filenames | Category name ≠ concern name; breaks code splitting; always rename by concern |
| `offsetTop` for virtualizer `scrollMargin`                        | Wrong when intermediate `position: relative` ancestor exists                  |
| `getItemKey` returning array index for dynamic lists              | Breaks ResizeObserver identity on reorder / column change                     |
| Gap value included in `estimateSize` constant                     | Virtualizer `gap` option is additive — double-counts                          |
| Inline arrow functions as props to `memo` components              | Defeats memoization on every parent render                                    |
| Conditional `null` returns in mounted components                  | Mount cost paid with no render benefit; filter at data layer                  |
| Hardcoded user-visible strings in JSX or logic                    | All copy must go through `t('namespace:key')` — add keys to the locale files  |

---

## 16. i18n — No Hardcoded User-Visible Strings

This project uses `react-i18next`. Translation namespaces are typed via `src/i18next.d.ts` — the TypeScript compiler will catch unknown keys.

- **Every user-visible string must go through `t()`** — no string literals in JSX or error messages.
- Call `useTranslation()` in the component; call `t('namespace:key')` at render time.
- **Never pre-translate in a data-building hook or `useMemo`** — pass the key, let the component call `t(key)`. This is why descriptor fields are named `titleKey`/`labelKey` (see §7).
- Interpolated values use the `t()` options object: `t('dynamics:delay_live_behind', { delay: 5 })` — never string concatenation.
- New strings: add the key to the appropriate file under `src/app/i18n/locales/en/` (one file per domain — `order_cards.ts`, `errors.ts`, `buttons.ts`, etc.). Do not append unrelated keys to an existing namespace file.
- Namespaces are the filename without extension: `t('confirm_dialog:delete_item')`, `t('errors:generic')`, `t('buttons:save')`.

```tsx
// WRONG — hardcoded string
<Button>Save changes</Button>
enqueueSnackbar('Something went wrong')

// CORRECT
const { t } = useTranslation()
<Button>{t('buttons:save_changes')}</Button>
enqueueSnackbar(t('errors:generic'))
```

---

## 18. Code Formatting

### Blank lines before `return`

Every `return` statement **must be preceded by a blank line** unless it is the only statement in the function body.

```ts
// WRONG
data.hash = timestamp.toString();
return data;

// WRONG
const Icon = action.icon;
const label = t(action.labelKey);
return (

// CORRECT
data.hash = timestamp.toString();

return data;

// CORRECT
const Icon = action.icon;
const label = t(action.labelKey);

return (
```

### Separation between declarations

Use a single blank line to visually separate groups of related declarations. The ordering within a function or component body is:

1. Hooks (`useTranslation`, `useCallback`, `useMemo`, `useRef`, etc.)
2. Derived constants and local variables
3. Handler / callback definitions
4. Early-return guards
5. `return` statement (always preceded by a blank line)

Unrelated declarations within the same group must also be separated by a blank line.

```ts
// WRONG — all declarations crammed together
const { t } = useTranslation()
const Icon = action.icon
const label = t(action.labelKey)
const handleClick = useCallback(() => dispatch(action), [action])
return <Button onClick={handleClick}>{label}</Button>

// CORRECT
const { t } = useTranslation()

const Icon = action.icon
const label = t(action.labelKey)

const handleClick = useCallback(() => dispatch(action), [action])

return <Button onClick={handleClick}>{label}</Button>
```

---

## 17. Code Review Checklist

Before marking any implementation complete:

- [ ] No new `index.ts` barrel inside a subdirectory
- [ ] Every new hook has exactly one concern; no hook exceeds ~2 responsibilities
- [ ] No `useEffect` for derived state or external subscriptions
- [ ] No side effects inside `useMemo`
- [ ] All module-scope resize/scroll listeners are ref-counted and fully removable
- [ ] `useMemo` dep arrays contain only primitives and stable refs — zero handler deps
- [ ] No allocations (object/array/closure) inside hot loops; no spreads; no chained `.filter().map()`
- [ ] No hardcoded magic values — all values are named constants with JSDoc
- [ ] Recurring concept → shared/generic abstraction in `core/`, not copy-pasted per feature
- [ ] All components in virtualized trees are `React.memo` with primitive props
- [ ] `data-index` and `ref={measureElement}` are on the exact same DOM element
- [ ] `estimateSize` constant does not include gap value
- [ ] `minHeight` formula: `maxCount * estimate + (maxCount - 1) * gapPx`
- [ ] All descriptor types use `_type` discriminant; `titleKey` holds i18n key (not translated string); zero closures
- [ ] New action: `XxxParams` type + `createXxxHandler` factory in `actions/handlers/`; one line in `actionMap.ts`
- [ ] New types in a focused `types/<concern>.ts` file — not `types.ts`, not appended to an existing unrelated file
- [ ] New constants in a focused `constants/<concern>.ts` file — not `constants.ts`
- [ ] Styling: CSS Modules + data attributes; zero `sx`; inline styles only for virtualizer geometry
- [ ] TypeScript strict: no `any`, no unsupported `!` assertions, all union members discriminated
- [ ] `scrollMargin` computed via `getBoundingClientRect().top + window.scrollY`
- [ ] `getItemKey` returns stable domain ID and is wrapped in `useCallback`
- [ ] `data-testid` added to all meaningful interactive elements and display containers targeted by automated tests
- [ ] No hardcoded user-visible strings — all copy goes through `t('namespace:key')`
- [ ] Every `return` is preceded by a blank line (unless it is the sole statement); declarations are grouped and separated by blank lines
- [ ] Changelog entry added in `docs/changelog/<version>.md` — one bullet per user-visible change, linked to the Jira ticket
