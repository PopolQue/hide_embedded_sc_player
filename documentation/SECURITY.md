# Security & Privacy

Security is a primary concern when using the "Shell Architecture" because it relies on iframes and cross-window communication.

---

## 1. Content Security Policy (CSP)

If your site uses CSP headers, you must allow the SoundCloud domains for the player to function.

### Required Directives

```http
Content-Security-Policy: 
  frame-src 'self' https://w.soundcloud.com https://api.soundcloud.com;
  script-src 'self' https://w.soundcloud.com;
  connect-src 'self' https://api-v2.soundcloud.com;
```

---

## 2. Iframe Security (Frame Ancestors)

To prevent "Clickjacking," many sites use the `X-Frame-Options` header. However, for the **Shell** to work, your inner website must allow being framed by the shell's domain.

### Recommended Approach

Instead of `X-Frame-Options: SAMEORIGIN` (which blocks everything), use the modern `frame-ancestors` directive:

```http
Content-Security-Policy: frame-ancestors 'self' https://your-shell-domain.com;
```

---

## 3. Data Privacy

- **Local Storage:** The player uses `localStorage` to persist play state (current track, position). No personally identifiable information (PII) is stored.
- **Third-Party Tracking:** SoundCloud may use cookies and tracking within their widget iframe. We recommend including a note in your Privacy Policy if you use this player.
- **No Backend:** This library is purely client-side. It never sends your data to any server other than SoundCloud's official API.

---

## 4. Private Tracks & Tokens

If you are using private SoundCloud tracks, your `playlists.json` will contain URLs with "Secret Tokens" (e.g., `.../s-xxxxxx`).

- **Caution:** These tokens are visible in the source code of your site.
- **Best Practice:** Only use private tracks that you are comfortable with being "discoverable" by technically savvy users.
