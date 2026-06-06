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

## Styling

### Decision tree

Follow this order to determine the styling approach:

| Condition | Approach |
|-----------|----------|
| Dynamic/calculated value (e.g., `top: HEADER_HEIGHT + 10`) | `sx` prop |
| MUI native prop (`height`, `mt`, `px`) | Inline prop |
| Static CSS | CSS Module class |
| State-dependent style | Conditional `className` |
| MUI nested selectors | `:global()` in CSS Module |

### Unit guidelines

| Unit | Use for |
|------|---------|
| `rem` | Spacing, padding, margin, gap, font-size, border-radius |
| `px` | Borders (`1px`), box-shadows, fixed icon sizes (`24px`) |
| `%` | Responsive widths, aspect ratios |

### Style file location

Styles must live in a dedicated styles file outside the component file (e.g., `ComponentName.styles.ts` or `ComponentName.module.css`). Do not define static style objects inline in JSX.
