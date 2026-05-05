# Hide Embedded SC Player

A professional-grade, persistent SoundCloud audio player designed for music festivals, labels, and radio stations. This library provides an uninterrupted audio bridge that maintains playback across page transitions.

Developed for [Bunte Platte e.V.](https://www.bunte-platte.de) and the [Klein und Haarig Festival](https://www.kleinundhaarig.de).

---

## Features

- **Uninterrupted Playback:** Audio remains persistent during navigation via a shell-based iframe architecture.
- **Dual Implementation:** Available as a React component or a zero-dependency standalone script.
- **URL Synchronization:** Built-in hash-based routing (`/#/sub-page`) ensures deep-linking and browser history support.
- **Theming System:** Fully customizable via CSS Custom Properties (Variables) or configuration objects.
- **Performance Optimized:** Zero runtime dependencies; utilizes the SoundCloud Widget API and local metadata caching.

---

## Implementation Paths

### 1. Standalone Shell (Non-React Environments)

The standalone version is designed for integration into any existing site architecture (e.g., WordPress, static sites, or custom CMS).

1. **Configure:** Update `window.PLAYER_CONFIG` in `standalone/shell.html` with your site's `initialContentUrl`.
2. **Deploy:** Upload the contents of the `standalone/` directory to your web server.
3. **Route:** Direct your primary domain or entry point to `shell.html`.

### 2. React Component

For modern web applications. The component automatically handles API loading and configuration.

```tsx
import SCPlayer from './lib/SCPlayer'
import { PLAYLISTS } from './lib/data'
import './lib/SCPlayer.css'

function App() {
  return (
    <SCPlayer
      playlists={PLAYLISTS}
      scAccountUrl="https://soundcloud.com/your-profile"
    />
  )
}
```

---

## Configuration

| Property | Default | Description |
| :--- | :--- | :--- |
| `bg` | `#1a1a24` | Player bar background color |
| `accent` | `#1a1a1a` | High-contrast color for controls and progress |
| `text` | `#d1d1d1` | Primary typography color |
| `barHeight` | `64px` | Fixed height of the player interface |
| `position` | `bottom` | Vertical alignment: `top` or `bottom` |
| `syncUrl` | `true` | Enable/disable browser URL hash synchronization |

---

## Project Structure

- `src/lib/`: Core React component logic and TypeScript definitions.
- `standalone/`: Production-ready vanilla JS implementation and shell container.
- `playlists.json`: Centralized data store for all track metadata.
- `TECHNICAL.md`: Comprehensive architectural documentation and API details.

---

## License

MIT © [PopolQue](https://github.com/PopolQue) / [Bunte Platte e.V.](https://www.bunte-platte.de)
