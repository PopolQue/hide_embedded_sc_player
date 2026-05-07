# Theming Reference

The SCPlayer is built with a **CSS-First** philosophy. Every visual aspect is controlled by CSS Custom Properties (Variables), making it extremely easy to brand.

---

## 1. Core Variables

Apply these to the `.sc-player` class or a parent container.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `--scp-bg` | Main background color of the player bar | `#1a1a24` |
| `--scp-border` | Color of borders and dividers | `#333842` |
| `--scp-text` | Primary text color (Title) | `#ffffffde` |
| `--scp-muted` | Secondary text color (Artist, Duration) | `#9ca3af` |
| `--scp-accent` | Brand color (Play button, progress, active) | `#1a1a1a` |
| `--scp-accent-hover` | Hover state for the accent color | `#000000` |
| `--scp-active-bg` | Background of the currently playing track in list | `rgba(52, 52, 52, 0.15)` |
| `--scp-list-bg` | Background of the track list panel | `#101010` |
| `--scp-bar-h` | Height of the player bar | `64px` |
| `--scp-radius` | Border radius for artwork and buttons | `4px` |
| `--scp-font` | Font family stack | `Inter, system-ui, ...` |

---

## 2. Usage Examples

### Via the React Component

The `theme` prop automatically maps keys to these variables.

```tsx
<SCPlayer 
  theme={{
    bg: '#000',
    accent: '#ff5500',
    barHeight: '80px'
  }}
/>
```

### Via Global CSS

Perfect for the Standalone or Shell versions.

```css
:root {
  --scp-bg: #f8f9fa;
  --scp-text: #212529;
  --scp-accent: #007bff;
  --scp-radius: 12px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --scp-bg: #1a1a1a;
    --scp-text: #eee;
  }
}
```

---

## 3. Advanced Customization

### Shadowing & Glow

You can add depth to the player bar:

```css
.sc-player__bar {
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.2);
}
```

### Progress Bar Styling

The progress bar uses standard HTML div elements:

```css
.sc-player__progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.sc-player__progress-fill {
  background: linear-gradient(90deg, #ff5500, #ff8800);
}
```

---

## 4. UI Components

- **`.sc-player__info`**: The left section (Artwork + Text).
- **`.sc-player__controls`**: The center section (Buttons + Dropdown).
- **`.sc-player__progress`**: The seek bar (top of the player).
- **`.sc-player__tracks`**: The slide-up track list panel.
