# Migration Guide

This guide helps you transition between different versions of the SCPlayer and provides patterns for migrating from other player solutions.

---

## Migrating from v0.x to v1.x (Upcoming)

*Note: The project is currently in early development. Breaking changes will be documented here.*

### 1. Data Structure Changes

If you were using a flat array for tracks, you must now nest them within a `Playlist` object:

**Old:**

```json
[ { "id": 1, "title": "Track 1" } ]
```

**New:**

```json
{
  "2024": {
    "label": "2024",
    "tracks": [ { "id": 1, "title": "Track 1" } ]
  }
}
```

---

## Migrating from Standard SoundCloud Embeds

If you are moving from a standard SoundCloud `<iframe>` to SCPlayer:

1. **Extract your Playlist ID:** Look at your current embed code for `api.soundcloud.com/playlists/123456`. The `123456` is your ID.
2. **Use the Shell:** Instead of pasting the embed code on every page, set up the [Shell Implementation](./INTEGRATION_SHELL.md).
3. **Keep Playback Constant:** The primary benefit of this migration is that your users will no longer experience audio cuts when they click a link on your site.

---

## Moving from React to Standalone (or vice-versa)

The player is designed to be data-compatible. Your `playlists.json` file works in both versions.

- **To Standalone:** Use the sync script mentioned in [TECHNICAL.md](./TECHNICAL.md) to generate `playlists.js`.
- **To React:** Import the JSON directly into your component.
