# @kleinundhaarig/sc-player

A **reusable, themeable SoundCloud player** for festivals, labels, and radio stations. Persistent playback across page navigation.

## Quick Start

### Option A — React Component (npm)

```bash
npm install @kleinundhaarig/sc-player
```

```tsx
import SCPlayer from '@kleinundhaarig/sc-player'
import '@kleinundhaarig/sc-player/dist/style.css'

// Load SoundCloud API in your HTML:
// <script src="https://w.soundcloud.com/player/api.js"></script>

function App() {
  return (
    <SCPlayer
      playlists={{
        '2025': {
          label: 'Festival 2025',
          playlistId: 'soundcloud:playlists:YOUR_ID',
          url: 'https://soundcloud.com/your-label/sets/2025',
          tracks: [
            {
              id: 123456789,
              title: 'Artist - Track Title',
              artist: 'Artist Name',
              duration: 3600000, // milliseconds
              artwork_url: 'https://i1.sndcdn.com/...',
              permalink_url: 'https://soundcloud.com/your-label/track'
            }
          ]
        }
      }}
      defaultPlaylist="2025"
      scEmbedUrl="https://w.soundcloud.com/player/?url=..."
    />
  )
}
```

### Option B — Drop-in Shell (no build)

1. Copy `shell.html` and `sc-player-standalone.js` to your server
2. Edit `PLAYER_CONFIG` in `shell.html` with your playlists & theme
3. Upload — done!

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://w.soundcloud.com/player/api.js"></script>
</head>
<body>
  <!-- Your site content -->
  <iframe id="content" src="/your-site.html"></iframe>

  <script>
    window.PLAYER_CONFIG = {
      defaultPlaylist: '2025',
      scEmbedUrl: 'https://w.soundcloud.com/player/?url=...',
      playlists: { /* your data */ },
      theme: { accent: '#ff0000' }
    }
  </script>
  <script src="sc-player-standalone.js"></script>
</body>
</html>
```

## Theming

Every color and dimension is customizable via CSS custom properties:

```tsx
<SCPlayer
  theme={{
    bg: '#000000',         // Player bar background
    border: '#333333',     // Border color
    text: '#ffffff',       // Primary text
    muted: '#888888',      // Secondary text (artist, duration)
    accent: '#ff0000',     // Play button, progress bar, active state
    accentHover: '#cc0000',// Play button hover
    activeBg: 'rgba(255,0,0,0.15)', // Active track highlight
    listBg: '#111111',     // Track list background
    barHeight: '72px',     // Player bar height
    borderRadius: '8px',   // Artwork corner radius
    fontFamily: 'Helvetica, sans-serif',
  }}
/>
```

### Default Theme

| Variable | Default |
|----------|---------|
| `bg` | `#1a1a24` |
| `border` | `#333842` |
| `text` | `#ffffffde` |
| `muted` | `#9ca3af` |
| `accent` | `#aa3bff` |
| `accentHover` | `#9a2bff` |
| `activeBg` | `rgba(170, 59, 255, 0.15)` |
| `listBg` | `#242430` |
| `barHeight` | `64px` |
| `borderRadius` | `4px` |
| `fontFamily` | `Inter, system-ui, sans-serif` |

### CSS Override

You can also override via CSS:

```css
.sc-player {
  --scp-accent: #00ff88;
  --scp-bg: #0a0a0a;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `playlists` | `Record<string, Playlist>` | *required* | Available playlists |
| `defaultPlaylist` | `string` | first key | Initial playlist |
| `scEmbedUrl` | `string` | *required* | SoundCloud iframe embed URL |
| `position` | `'bottom' \| 'top'` | `'bottom'` | Player bar position |
| `theme` | `ThemeConfig` | `{}` | Theme overrides |
| `showPlaylistSelect` | `boolean` | `true` | Show playlist dropdown |
| `showTrackList` | `boolean` | `true` | Show track list button |
| `showProgress` | `boolean` | `true` | Show progress bar |
| `showNavButtons` | `boolean` | `true` | Show prev/play/next |
| `autoplayOnSelect` | `boolean` | `true` | Auto-play on track click |
| `autoplayDelay` | `number` | `500` | Delay before autoplay (ms) |
| `className` | `string` | `''` | Extra CSS class |

## Playlist Format

```ts
interface Track {
  id: number              // SoundCloud track ID
  title: string           // Display title
  artist: string          // Display artist name
  duration: number        // Duration in milliseconds
  artwork_url?: string    // Cover image URL
  permalink_url: string   // SoundCloud track permalink
}

interface Playlist {
  label: string           // Display name (e.g. "2024")
  playlistId: string      // soundcloud:playlists:ID
  url: string             // Public SoundCloud playlist URL
  tracks: Track[]         // Full track list
}
```

## Development

```bash
npm install
npm run dev       # Start demo with hot reload
npm run build     # Build library (ESM + CJS + types)
npm run preview   # Preview built demo
```

## Publishing

```bash
npm version patch  # or minor / major
npm publish --access public
```

## Architecture

The player uses a **hidden SoundCloud iframe** controlled via the [Widget API](https://w.soundcloud.com/player/api.js). All track metadata is provided locally in config — no API calls needed at runtime.

The **shell pattern** wraps your site in two frames:
- **Content frame** — your festival website (navigable without reloading player)
- **Player bar** — fixed footer with persistent audio

This ensures audio continues uninterrupted during page navigation, checkout flows, and login redirects.
