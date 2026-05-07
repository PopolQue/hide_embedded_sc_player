# Performance & Optimization

The SCPlayer is built for high-performance festival and label sites. This guide explains how it impacts your site's performance and how to optimize it.

---

## 1. Bundle Size & Impact

The library is designed to be **Zero Dependency**.

- **React Component:** ~15kB (gzipped), primarily due to the React logic and inline SVGs.
- **Standalone JS:** ~10kB (gzipped).
- **CSS:** ~2kB (gzipped).

Because the icons are inline SVGs, there are no extra HTTP requests for font files or image assets.

---

## 2. Resource Loading Strategy

### The Hidden Iframe

The player uses a "Hidden Iframe" to host the SoundCloud Widget.

- **Lazy Loading:** In the [Shell Implementation](./INTEGRATION_SHELL.md), the iframe uses `loading="lazy"`. This ensures the main site content is prioritized.
- **Async API Loading:** The SoundCloud Widget API (`api.js`) is injected asynchronously only when the component mounts.

### Impact on Lighthouse Scores

- **LCP (Largest Contentful Paint):** The player is usually a small bar at the bottom and rarely triggers LCP.
- **FID (First Input Delay):** The widget runs in its own iframe process, meaning it doesn't block your site's main thread during playback.
- **CLS (Cumulative Layout Shift):** Since the player is `fixed` to the top or bottom, it does not cause layout shifts. **Note:** Ensure you add padding to your `body` to reserve space for the bar.

---

## 3. Optimization Tips

### Preconnect to SoundCloud

Help the browser resolve the SoundCloud API faster by adding these to your `<head>`:

```html
<link rel="preconnect" href="https://w.soundcloud.com">
<link rel="preconnect" href="https://api.soundcloud.com">
```

### Local Metadata Caching

The player's greatest performance feature is **Local Metadata**.

- **Standard Embeds:** Must fetch track titles and artwork from SoundCloud's API on every load, causing a "flash of unstyled content."
- **SCPlayer:** Renders titles and artwork instantly from your `playlists.json`. Always keep your local metadata updated for the best UX.

---

## 4. Bandwidth Considerations

The audio stream itself is handled by SoundCloud's global CDN. The player does not consume your server's bandwidth, making it ideal for high-traffic event days.
