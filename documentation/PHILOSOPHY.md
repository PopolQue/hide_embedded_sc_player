# Project Philosophy

The SCPlayer is guided by a specific set of principles that define its development and its future.

---

## 1. Persistence is Paramount

The #1 goal of this project is to provide a "never-stop" audio bridge. If a feature compromises the reliability of the audio persistence, it will not be added.

## 2. Minimalism by Default

The core player should be invisible until it's needed. We prefer a clean, 64px bar that provides essential controls without cluttering the user's viewport.

## 3. Developer Autonomy

We provide the logic and the "bridge," but we want you to own the look. Every visual element should be easily replaceable or stylable via standard CSS.

## 4. Privacy & Performance First

The library should have a "negative footprint." It should not track users, and it should not slow down the host website.

---

## Non-Goals

To maintain focus, the following features are explicitly **out of scope**:

- **Audio Hosting:** We are a wrapper for SoundCloud, not a file host.
- **Social Features:** No comments, likes, or user profiles within the player UI.
- **General Purpose Video:** This is an audio-first player.
- **Complex Playlists:** We do not intend to build a full Spotify-like library management system. We support fixed, curated festival/label playlists.
