# Accessibility (a11y)

The SCPlayer is designed to be inclusive and accessible to all users, following WCAG 2.1 guidelines where possible.

---

## 1. Keyboard Navigation

The player is fully navigable via keyboard.

| Key | Action |
| :--- | :--- |
| `Tab` | Move focus between controls (Play, Next, Prev, Playlist Select). |
| `Space` / `Enter` | Activate buttons (Toggle Play/Pause, Select Track). |
| `Left / Right Arrows` | Seek backward/forward by 2% (when progress bar is focused). |
| `Esc` | Close the track list panel if it's open. |

---

## 2. ARIA Roles & Labels

- **Region:** The entire player is wrapped in a `<div role="region" aria-label="SoundCloud Player">`.
- **Live Regions:** The track title and artist updates are announced to screen readers when they change.
- **Slider:** The progress bar uses `role="slider"` with updated `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.
- **State:** Buttons use `aria-pressed` or `aria-label` to indicate their current state (e.g., "Play" vs "Pause").

---

## 3. Visual Accessibility

- **Contrast:** Default themes are designed to meet AA contrast ratios (4.5:1) for text.
- **Focus States:** Every interactive element has a clear `:focus-visible` ring.
- **No Content Loss:** If artwork fails to load or is hidden, text labels and icons remain functional.

---

## 4. Best Practices for Integrators

If you customize the theme, ensure your `bg` and `text` colors maintain high contrast. You can use tools like the [Adobe Contrast Checker](https://color.adobe.com/create/color-contrast-analyzer) to verify your brand colors.
