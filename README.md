# Klein und Haarig — Custom SoundCloud Player

A research project for **Bunte Platte e.V.**, the organisation behind **Klein und Haarig Festival**.

## Goal

Embed SoundCloud playlists in a custom user interface on [kleinundhaarig.de](https://www.kleinundhaarig.de).

## Architecture

The site uses a **persistent shell** pattern:

```
index.html (Shell)
├── Content Frame → Landing page / sub-pages
└── Player Bar (fixed footer)
    └── Hidden SoundCloud iframe (controlled via Widget API)
```

The SoundCloud player runs in a hidden iframe at the bottom of the page and **persists across navigation**. The custom UI controls it via the [SoundCloud Widget API](https://w.soundcloud.com/player/api.js).

## Features

- **Custom Player UI** — Play/pause, prev/next, progress bar, volume
- **Track Explorer** — Full playlist track list with active track highlighting
- **Year Selector** — Switch between different festival years (2024, 2025, ...)
- **Persistent Playback** — Audio continues playing when navigating between pages
- **Track Metadata** — Title, artist, cover art, duration (hh:mm:ss) — stored locally in config
- **Year/Playlist Config** — Add new years by adding entries to the `playlists` config object

## Adding a New Year / Playlist

Edit the `playlists` object in `index.html`:

```js
const playlists = {
    '2025': {
        label: 'KUH25',
        playlistId: 'soundcloud:playlists:2158762997',
        url: 'https://soundcloud.com/kleinundhaarig/sets/kuh-2025',
        tracks: [
            {
                id: 1234567890,           // SoundCloud track ID (number)
                title: 'Artist Name',
                artist: 'KuH Festival',
                duration: 3600000,       // Duration in milliseconds
                artwork_url: 'https://i1.sndcdn.com/artworks-...',
                permalink_url: 'https://soundcloud.com/...'
            }
            // ... more tracks
        ]
    }
}
```

Also add the corresponding `<option>` to the year selector dropdown:

```html
<select id="year-select" class="year-select">
    <option value="2025|soundcloud:playlists:2158762997">KUH25</option>
    <option value="2024|soundcloud:playlists:1839382410">KUH24</option>
</select>
```

And update `currentPlaylistId` to the default playlist.

## Development

```bash
npm install
npm run dev      # Start dev server (opens /)
npm run build    # Production build
```

## Tech Stack

- **Vite** — Build tool and dev server
- **SoundCloud Widget API** — Controls the hidden iframe player
- **Vanilla JS + HTML** in the shell (no framework needed for the player)
- **React** (optional) — Available for content pages loaded in the content frame

## Test Playlist

2024 Recordings: https://on.soundcloud.com/JY8GKBvhtRcLK9yeyi

2025 Recordings: https://on.soundcloud.com/D7IZuRXrefqeMqO582
