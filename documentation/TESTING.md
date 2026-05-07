# Testing Strategy

Ensuring the SCPlayer works reliably across different devices and SoundCloud API states is critical. This guide outlines how we test the project and how you can test your integration.

---

## 1. Local Development Testing

We use the `src/demo` application for manual regression testing.

1. Run `npm run dev`.
2. Verify:
   - [ ] Play/Pause toggles correctly.
   - [ ] Progress bar updates every 500ms.
   - [ ] Seeking works on click.
   - [ ] Playlist switching resets the track index.
   - [ ] Persistence: Refresh the page; playback should resume from the saved position.

---

## 2. Unit Testing Pattern (Planned)

We recommend using **Vitest** and **React Testing Library**. Because the SoundCloud Widget API is external, you must mock `window.SC`.

### Mocking the Widget API

```javascript
// Example mock for Vitest
const mockWidget = {
  bind: vi.fn(),
  play: vi.fn(),
  load: vi.fn(),
};

window.SC = {
  Widget: vi.fn(() => mockWidget),
  Widget.Events: { READY: 'ready', PLAY: 'play' }
};
```

---

## 3. End-to-End (E2E) Testing

For the **Shell Architecture**, we recommend **Playwright**. E2E tests are the only way to verify that URL hash synchronization works across the iframe boundary.

### Test Case: URL Sync

1. Navigate to `shell.html`.
2. Click a link inside the iframe to `/lineup`.
3. Expect the parent URL to contain `#/lineup`.
4. Reload the page.
5. Expect the iframe to still be on the `/lineup` page.

---

## 4. Manual Browser Matrix

Before every release, we manually verify the player in:

- [ ] **Desktop:** Chrome, Safari, Firefox, Edge.
- [ ] **iOS:** Safari (Mobile).
- [ ] **Android:** Chrome (Mobile).

---

## 5. Mocking Data

Use the `playlists.json` file to test different scenarios:

- Empty playlists.
- Tracks with missing artwork.
- Very long track titles (to test text-overflow).
- Private tracks with/without secret tokens.
