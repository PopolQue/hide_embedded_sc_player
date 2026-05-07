# Design Decisions

This document records the architectural choices and technical trade-offs made during the development of SCPlayer.

---

## 1. Why the "Shell" (Iframe) Architecture?

- **Decision:** Use a parent window with an iframe for content instead of a standard SPA or persistent audio API.
- **Trade-off:** Complexity in URL synchronization vs. guaranteed persistence.
- **Reasoning:** In 2024, the only 100% reliable way to keep audio playing across page loads on any website (including non-SPAs like WordPress) is to prevent the window from ever reloading. This pattern is battle-tested by radio stations and festivals.

---

## 2. Why Local Metadata?

- **Decision:** Bundle track titles, artists, and artwork in `playlists.json` instead of fetching them via the SoundCloud API.
- **Trade-off:** Manual maintenance vs. Instant UI rendering.
- **Reasoning:** SoundCloud's API can be slow or rate-limited. By caching metadata locally, the player UI feels instantaneous ("zero latency"). It also makes track titles indexable by search engines on the static page.

---

## 3. Why Inline SVGs?

- **Decision:** Embed all icons as SVG strings directly in the React/JS source.
- **Trade-off:** Slightly larger JS bundle vs. zero external dependencies.
- **Reasoning:** We wanted the library to be "drop-in." Requiring users to host an icon font or manage image assets would increase friction. Inline SVGs are also perfectly sharp at any scale and easily styled via CSS.

---

## 4. Why CSS Variables for Theming?

- **Decision:** Use CSS Custom Properties (`--scp-bg`) instead of a JS-in-CSS solution.
- **Trade-off:** IE11 compatibility (lost) vs. Performance and flexibility.
- **Reasoning:** CSS variables allow developers to override the player's look without re-compiling the library. It also allows for easy "Dark Mode" implementation via standard CSS media queries.

---

## 5. Why no internal "Volume" slider?

- **Decision:** Expose volume via the API but omit a default slider in the UI.
- **Reasoning:** On mobile, OS-level volume controls are superior and expected. On desktop, we chose to keep the player bar minimal (64px) to maximize content space. Volume control remains available via the `RECIPES.md` snippets.
