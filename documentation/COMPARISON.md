# Comparison: Why SCPlayer?

There are many ways to add audio to a website. This document explains why SCPlayer's "Shell Architecture" is the superior choice for professional music platforms.

---

## 1. Feature Comparison

| Feature | Standard Embed | Custom Player (Standard) | SCPlayer (Shell) |
| :--- | :---: | :---: | :---: |
| **Persistence** | ❌ Cuts on Click | ❌ Cuts on Click | ✅ Uninterrupted |
| **Custom UI** | ❌ SoundCloud Brand | ✅ Full Control | ✅ Full Control |
| **SEO Friendly** | ⚠️ Moderate | ✅ High | ✅ High |
| **Mobile Ready** | ✅ Yes | ✅ Yes | ✅ Yes |
| **UX Polish** | ❌ Jarring | ❌ Jarring | ✅ Premium |

---

## 2. The "Persistence Gap"

In a standard website, clicking a link (e.g., "Lineup" or "Contact") triggers a full page reload. This destroys the current audio context.

For a music festival or label, this is a **UX failure**. It discourages exploration because users don't want to stop the music they just started.

**SCPlayer solves this** by using a permanent parent window. The user navigates *inside* the site, while the music stays active in the wrapper.

---

## 3. SCPlayer vs. Other Libraries

### vs. Standard SoundCloud Widget

- **Widget:** Forces the user to look at the SoundCloud logo, comments, and related tracks.
- **SCPlayer:** Provides a minimal, branded experience that keeps users on *your* site, not SoundCloud's.

### vs. Spotify/Apple Music Embeds

- **Spotify:** Often requires users to log in to hear more than 30 seconds.
- **SCPlayer:** SoundCloud allows full, free playback of tracks, making it much more accessible for public discovery.

### vs. Native `<audio>` tags

- **Native:** Requires you to host your own files, manage bandwidth, and handle complex metadata fetching.
- **SCPlayer:** Leverages SoundCloud's world-class hosting and CDN while giving you a custom interface.
