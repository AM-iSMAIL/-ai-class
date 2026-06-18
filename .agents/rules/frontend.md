# Frontend & React Coding Rules

These rules apply when writing, modifying, or refactoring React components and style sheets inside `src/`.

## 1. Iconography Standards
* **Vector-Only Icons**: Always use Lucide React icons (`lucide-react`) for UI controls, state alerts, buttons, status indicators, and headers.
* **No Raw Emojis**: Do not embed raw emojis (e.g. `🔊`, `🎤`, `⚠`) inside structural HTML elements or button labels. All icons must be styleable and scalable via TailwindCSS/CSS variables.

## 2. React Performance Guidelines
* **Bundle Splitting**: Heavy components and routes/screens must be dynamically imported via `React.lazy` and rendered inside a `<Suspense>` wrapper to keep the initial page bundle lean.
* **Reference Stability**: Always wrap callback functions passed to child components or event listeners in `useCallback` to prevent unnecessary child re-renders.
* **Memoization**: Cache heavy derived properties using `useMemo`.
* **Clean Effects**: Always return clean-up functions in `useEffect` (e.g., unsubscribing from Firebase listeners, closing BroadcastChannels, resetting timers).

## 3. Styling & TailwindCSS v4
* **Consistent Themes**: Rely on theme variables (e.g. `var(--color-navy-950)`, `var(--color-accent-500)`) defined in `@theme` in `index.css`.
* **Glassmorphism**: Utilize the custom `.glass` and `.glass-light` classes for cards and panels.
