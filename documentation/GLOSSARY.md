# Glossary & Concepts

This glossary defines the specific terms and architectural patterns used in the SCPlayer project.

---

## Core Concepts

### Shell Architecture (The Shell)

A design pattern where a "Shell" page (`shell.html`) contains the audio player and an `<iframe>` for the main website content. This allows the audio to persist while the iframe navigates to different pages.

### Audio Bridge

The script responsible for synchronizing the state between the parent window (The Shell) and the child window (Your Website).

### Hash-based Sync

A routing technique where the parent window's URL hash (`/#/about`) is synchronized with the iframe's internal path (`/about`). This ensures that browser "Back" and "Forward" buttons work as expected and sub-pages can be bookmarked.

### Local Metadata

Track information (Title, Artist, Duration, Artwork) that is stored locally in `playlists.json` instead of being fetched from the SoundCloud API at runtime. This results in instant UI updates and better SEO.

---

## Technical Terms

### SC Widget API

The official JavaScript library from SoundCloud (`api.js`) used to control the hidden player via commands (play, pause, seek) and listen for events.

### Persistent State

The ability of the player to "remember" the user's progress even after a full page refresh, achieved via `localStorage`.

### Deep Linking

The ability to link directly to a specific sub-page within the shell (e.g., `yoursite.com/#/tickets`) and have the internal iframe load that specific page automatically.
