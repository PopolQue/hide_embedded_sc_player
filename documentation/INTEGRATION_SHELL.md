# Shell Implementation Guide (Universal Persistence)

The **Shell Architecture** is the recommended way to integrate the SoundCloud Player into existing websites (WordPress, Squarespace, Wix, Shopify, or custom static sites) where you want the music to **never stop** when a user clicks a link.

---

## How it Works

Instead of adding the player *to* your site, you wrap your site *inside* the player's shell.

1. The `shell.html` file becomes your new entry point (e.g., `yoursite.com/player`).
2. Your actual website is loaded inside a full-screen `<iframe>`.
3. When users navigate, only the iframe reloads. The parent window (the shell) stays active, keeping the audio playing.
4. The shell automatically synchronizes the browser's URL hash with the iframe's path (e.g., `yoursite.com/#/about` loads `/about` in the iframe).

---

## Quick Start

### 1. Prepare the Assets

Copy the following files from the `standalone/` directory to your web server:

- `shell.html`
- `sc-player-standalone.js`
- `sc-player.css`
- `playlists.js`
- `assets/` folder (containing logos/icons)

### 2. Configure Your Site URL

Open `shell.html` and find the `<iframe>` tag at the bottom. Change the `src` to your actual website URL:

```html
<!-- shell.html -->
<iframe id="content" src="https://your-actual-website.com" title="Main content"></iframe>
```

### 3. Customize the Player

Modify the `window.PLAYER_CONFIG` object in `shell.html` to match your brand:

```javascript
window.PLAYER_CONFIG = {
  theme: {
    bg: '#111316',        // Background color
    accent: '#ff5500',    // Brand color (Play button, progress)
    text: '#ffffff',      // Text color
    barHeight: '64px',    // Height of the player bar
  },
  defaultPlaylist: '2024',
  scAccountUrl: 'https://soundcloud.com/your-profile',
}
```

---

## 🛠 Advanced Configuration

### URL Synchronization

The shell includes a built-in script that handles "Deep Linking".

- If a user visits `yoursite.com/shell.html#/contact`, the shell will automatically tell the iframe to navigate to `/contact`.
- This ensures that users can share links to specific sub-pages even though they are technically "inside" the shell.

### Tracking Metadata

To change the songs shown in the player, edit `playlists.js`. This file contains an array of tracks with their IDs, titles, and artists.

> **Tip:** You can generate this file automatically from the React library's `playlists.json` using the maintenance script mentioned in [TECHNICAL.md](./TECHNICAL.md).

---

## Important Considerations

1. **X-Frame-Options:** Ensure your main website allows being embedded in an iframe. If you see a "Connection Refused" error, you may need to adjust your server headers (e.g., set `X-Frame-Options` to `SAMEORIGIN` or remove it).
2. **SEO:** The shell itself is a single page. For SEO, search engines will still index your actual website (`your-actual-website.com`). The shell is primarily a **functional wrapper** for your users.
3. **Analytics:** Ensure your analytics (Google Analytics, etc.) are installed on the *inner* website. They will track page views normally as the user navigates inside the iframe.
