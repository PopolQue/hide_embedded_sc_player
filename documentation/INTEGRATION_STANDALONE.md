# Standalone Script Guide

The Standalone version is a lightweight, zero-dependency (vanilla JS) version of the player. Use this for single-page sites or simple integrations where a full React build is not needed.

---

## Quick Start

### 1. Include the Assets

Add the player's CSS and JS to your HTML file:

```html
<head>
  <!-- Player Styles -->
  <link rel="stylesheet" href="sc-player.css">
  
  <!-- SoundCloud API (Required) -->
  <script src="https://w.soundcloud.com/player/api.js"></script>
  
  <!-- Your Playlist Data -->
  <script src="playlists.js"></script>
</head>

<body>
  <!-- Your content -->
  
  <!-- Player Script (at the bottom) -->
  <script src="sc-player-standalone.js"></script>
</body>
```

### 2. Configuration

The standalone script looks for a global `window.PLAYER_CONFIG` object. Define this **before** including `sc-player-standalone.js`:

```html
<script>
  window.PLAYER_CONFIG = {
    theme: {
      bg: '#111316',
      accent: '#ff5500',
    },
    playlists: window.PLAYER_PLAYLISTS, // Loaded from playlists.js
    defaultPlaylist: '2024',
    position: 'bottom'
  };
</script>
<script src="sc-player-standalone.js"></script>
```

---

## Customizing the HTML

The player automatically creates its own container and injects it into the `<body>`.

### Positioning

You can choose between `top` or `bottom` fixed positioning:

```javascript
window.PLAYER_CONFIG = {
  position: 'top', // Bar will be fixed to the top of the viewport
  // ...
};
```

### Layout Adjustments

Since the player is `fixed`, it might overlap your site's content. You should add padding to your `body` tag to compensate for the player's height:

```css
body {
  /* Match the barHeight from your config (default 64px) */
  padding-bottom: 64px; 
}
```

---

## Data Structure

The `playlists.js` file should define a global object like this:

```javascript
window.PLAYER_PLAYLISTS = {
  "2024": {
    "label": "2024 Releases",
    "playlistId": "1839382410",
    "tracks": [
      {
        "id": 12345,
        "title": "Song Title",
        "artist": "Artist Name",
        "duration": 180000,
        "permalink_url": "https://soundcloud.com/..."
      }
    ]
  }
};
```

---

## Persistence Note

**Note:** In this "Standalone" mode (without the Shell/Iframe), the player will **reset/stop** whenever the user navigates to a new page or refreshes.

If you need the music to persist across page loads on a multi-page site, use the [Shell Implementation](./INTEGRATION_SHELL.md).
