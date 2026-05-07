# Hide Embedded SC Player

A professional-grade, persistent SoundCloud audio player designed for music festivals, labels, and radio stations. This library provides a high-level abstraction over the **official SoundCloud Widget API**, offering an uninterrupted audio bridge that maintains playback across page transitions.

Developed for [Bunte Platte e.V.](https://www.bunte-platte.de) and the [Klein und Haarig Festival](https://www.kleinundhaarig.de).

---

## Powered by the SoundCloud Widget API

The SCPlayer is not a standalone audio engine; it is a **sophisticated controller** for the official SoundCloud iframe widget.

- **Full Compatibility:** We use the `https://w.soundcloud.com/player/api.js` library to send commands and listen to events.
- **Deep Integration:** By leveraging the `READY`, `PLAY`, `PAUSE`, and `FINISH` events, we sync our custom UI state perfectly with SoundCloud's backend.
- **Remote Control:** Our "Shell Architecture" allows you to control a hidden SoundCloud instance from a completely different window context (the parent shell).

> **Learn More:** See [📐 Architecture & Sync](./documentation/TECHNICAL.md) for a deep dive into the API bridge.

---

## Documentation Hub

Choose your path based on your role and technical stack.

### Getting Started

- **[Shell Implementation](./documentation/INTEGRATION_SHELL.md)** — Best for WordPress, Shopify, or static sites.
- **[React Component](./documentation/INTEGRATION_REACT.md)** — Best for modern SPAs and App Router projects.
- **[Standalone Script](./documentation/INTEGRATION_STANDALONE.md)** — Best for simple vanilla JS integrations.

### Technical Deep-Dives

- **[Architecture & Sync](./documentation/TECHNICAL.md)** — Sequence diagrams and state logic.
- **[API Reference](./documentation/API_REFERENCE.md)** — Deep dive into CSS classes and props.
- **[Theming Reference](./documentation/THEMING.md)** — Every CSS variable documented.
- **[Security & Privacy](./documentation/SECURITY.md)** — CSP, iframes, and data safety.
- **[Accessibility (a11y)](./documentation/ACCESSIBILITY.md)** — Keyboard and screen reader support.
- **[Performance & Optimization](./documentation/PERFORMANCE.md)** — Lighthouse and bandwidth tips.
- **[Browser Support](./documentation/BROWSER_SUPPORT.md)** — Compatibility matrix.

### Customization & Content

- **[Artist Guide: Adding Tracks](./documentation/GUIDE_ADDING_TRACKS.md)** — Non-technical content update guide.
- **[Internationalization (i18n)](./documentation/I18N.md)** — Translating the player UI.
- **[Comparison Analysis](./documentation/COMPARISON.md)** — Why SCPlayer vs standard embeds.
- **[Recipes & Snippets](./documentation/RECIPES.md)** — Common code patterns.
- **[Examples Gallery](./examples/)** — Next.js, WordPress, and Custom Icons.

### Community & Maintenance

- **[Troubleshooting & FAQ](./documentation/TROUBLESHOOTING.md)** — Common fixes.
- **[Privacy & GDPR](./documentation/PRIVACY_GDPR.md)** — Cookie compliance.
- **[Testing Strategy](./documentation/TESTING.md)** — How to verify your implementation.
- **[Design Decisions](./documentation/DESIGN_DECISIONS.md)** — The "Why" behind the architecture.
- **[Project Philosophy](./documentation/PHILOSOPHY.md)** — Vision and non-goals.
- **[Project Roadmap](./documentation/ROADMAP.md)** — Future plans.
- **[Contributing Guide](./documentation/CONTRIBUTING.md)** — Standards & code of conduct.
- **[Changelog](./documentation/CHANGELOG.md)** — Release history.
- **[Master Index](./documentation/SUMMARY.md)** — All 27 modules in one place.

---

## Configuration

| Property | Default | Description |
| :--- | :--- | :--- |
| `bg` | `#1a1a24` | Player bar background color |
| `accent` | `#1a1a1a` | High-contrast color for controls and progress |
| `text` | `#d1d1d1` | Primary typography color |
| `barHeight` | `64px` | Fixed height of the player interface |
| `position` | `bottom` | Vertical alignment: `top` or `bottom` |
| `syncUrl` | `true` | Enable/disable browser URL hash synchronization |

---

## License

MIT © [PopolQue](https://github.com/PopolQue) / [Bunte Platte e.V.](https://www.bunte-platte.de). See the [LICENSE](./LICENSE) file for details.
