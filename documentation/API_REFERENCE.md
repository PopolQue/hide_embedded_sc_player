# Component API (Deep Reference)

This document provides a low-level reference for developers who want to fully customize or extend the SCPlayer beyond basic theming.

---

## 1. CSS Class Architecture

The player uses a strict BEM structure. You can override these classes in your global stylesheet for deep customization.

| Class Name | Description |
| :--- | :--- |
| `.sc-player` | The root container (contains the iframe and bar). |
| `.sc-player--top` | Modifier when the player is pinned to the top. |
| `.sc-player__bar` | The main horizontal control bar. |
| `.sc-player__info` | Container for artwork and track text. |
| `.sc-player__artwork` | The 1:1 artwork container. |
| `.sc-player__text` | Container for Title and Artist links. |
| `.sc-player__controls` | Container for Play/Prev/Next and Selector. |
| `.sc-player__progress` | The seek bar container (the clickable area). |
| `.sc-player__progress-fill` | The moving part of the progress bar. |
| `.sc-player__tracks` | The slide-up track list panel. |
| `.sc-player__track` | Individual track button in the list. |
| `.sc-player__track.active` | State for the currently playing track. |

---

## 2. Data Attributes

We use standard data attributes for state-based styling:

- `[data-playing="true"]`: Applied to the root when audio is active.
- `[data-ready="true"]`: Applied when the SoundCloud API has initialized.

---

## 3. React Props (Internal types)

See `src/lib/types.ts` for the full TypeScript definitions. Key internal interfaces include:

### `Track`

```typescript
{
  id: number;
  title: string;
  artist: string;
  duration: number;
  artwork_url?: string;
  permalink_url: string;
}
```

### `Playlist`

```typescript
{
  label: string;
  playlistId: string;
  url: string;
  tracks: Track[];
}
```
