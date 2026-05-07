# Development Style Guide

This document outlines the coding standards, naming conventions, and architectural patterns used in the SCPlayer project to ensure consistency across contributions.

---

## 1. CSS / Styling (BEM)

We use the **BEM (Block Element Modifier)** convention for all CSS classes to prevent naming collisions and ensure styles are scoped to the component.

- **Block:** `.sc-player`
- **Element:** `.sc-player__bar`, `.sc-player__title`
- **Modifier:** `.sc-player__btn--active`, `.sc-player--top`

### CSS Variables

Visual properties must always be mapped to CSS Custom Properties.

- Use the `--scp-` prefix for all project-specific variables.
- Always provide a fallback value: `color: var(--scp-text, #fff);`.

---

## 2. TypeScript Standards

- **Strict Typing:** Avoid `any` at all costs. Use `unknown` if the type is truly dynamic, or define a specific interface.
- **Interfaces vs. Types:** Use `interface` for public API definitions (like `Playlist`) and `type` for unions or internal aliases.
- **TSDoc:** Every public property in `types.ts` and major hooks/functions in the component must have TSDoc comments.

---

## 3. Component Architecture

### The "Hidden Widget" Pattern

The player UI never interacts with the SoundCloud API directly. It always communicates through a hidden `<iframe>` reference.
**Rule:** Never attempt to inject the SoundCloud player UI into the custom player bar. Use the Widget API to "remote control" the hidden instance.

### State Persistence

User state (track index, progress) is persisted via `localStorage`.
**Rule:** When adding new stateful features (like Volume), ensure they are integrated into the `persist` logic so they survive page reloads.

---

## 4. File Organization

- `src/lib/`: All logic related to the reusable library.
- `src/demo/`: Purely for demonstration and local testing.
- `standalone/`: The vanilla JS "build" of the library. **Do not edit these files directly;** they are generated or manually synced from the `lib` source.

---

## 5. Iconography

To keep the library dependency-free, all icons must be **Inline SVGs**.
Keep icons simple and ensure they inherit the current text color using `fill="currentColor"`.
