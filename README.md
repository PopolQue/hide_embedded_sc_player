# Hide Embedded SC Player

A **reusable, themeable SoundCloud player** for festivals, labels, and radio stations.
Persistent playback across page navigation via a hidden iframe controlled by the Widget API.

This is a research project for [Bunte Platte e.V.](https://www.bunte-platte.de), the organisation behind [Klein und Haarig Festival](https://www.kleinundhaarig.de).

## Repository Structure

- `src/lib/`: Core React component and library logic.
  - `playlists.json`: **Centralized playlist data.** Edit this file to update tracks.
- `standalone/`: Vanilla JS / "No-build" version for easy implementation into any website.
- `docs/`: Live demo files.

## Quick Start

### 1. Update Playlist Data

Edit `src/lib/playlists.json`. This file is the single source of truth for both the React and Standalone versions.

To update the Standalone version after editing the JSON, you can run:

```bash
echo "window.PLAYER_PLAYLISTS = " > standalone/playlists.js && cat src/lib/playlists.json >> standalone/playlists.js
```

### 2. Implementation

#### React Component

Import the player and provide the centralized data:

```tsx
import SCPlayer from './lib/SCPlayer'
import { PLAYLISTS } from './lib/data'
import './lib/SCPlayer.css'

// Load SoundCloud API in your HTML:
// <script src="https://w.soundcloud.com/player/api.js"></script>

function App() {
  return (
    <SCPlayer
      playlists={PLAYLISTS}
      defaultPlaylist="2025"
      scEmbedUrl="https://w.soundcloud.com/player/?url=..."
      scAccountUrl="https://soundcloud.com/kleinundhaarig"
    />
  )
}
```

#### Drop-in Shell (No Build)

The `standalone/` directory contains everything you need to wrap an existing site with a persistent player:

1. Copy `standalone/shell.html`, `standalone/sc-player-standalone.js`, and `standalone/playlists.js` to your server.
2. Edit `PLAYER_CONFIG` in `shell.html` to point to your website (change the `iframe` src).
3. Done!

## Theming

Colors and dimensions are customizable via the `theme` prop or CSS custom properties:

```tsx
<SCPlayer
  theme={{
    bg: '#111316',
    accent: '#aa3bff',
    // ...
  }}
/>
```

### Default Theme Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `--scp-bg` | `#1d1d1d` | Player bar background |
| `--scp-accent` | `#1a1a1a` | Progress bar and active highlights |
| `--scp-bar-h` | `64px` | Height of the player bar |

## Development

```bash
npm install
npm run dev       # Start demo with hot reload
npm run build     # Build library
npm run build:demo # Build demo for production
```

## Architecture

The player uses a **hidden SoundCloud iframe** controlled via the [Widget API](https://developers.soundcloud.com/docs/api/html5-widget).
All track metadata is provided locally in `playlists.json` — no API calls needed at runtime.

The **shell pattern** wraps your site in two frames:

- **Content frame** — your actual website (navigable without reloading player)
- **Player bar** — fixed footer with persistent audio
