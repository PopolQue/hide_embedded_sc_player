# Privacy & GDPR Compliance

Using the SCPlayer involves loading third-party content from SoundCloud. This guide helps you navigate privacy requirements like GDPR (Europe) and CCPA (California).

---

## 1. What Data is Collected?

### By the SCPlayer Library

The SCPlayer itself is **privacy-first**:

- No tracking pixels.
- No analytics scripts.
- **Local Storage:** We use `localStorage` only to store functional state (which track was playing and at what second). This is usually considered "strictly necessary" for the service and may not require consent under GDPR.

### By SoundCloud (The Widget)

When the player loads, it communicates with SoundCloud's servers. SoundCloud may:

- Collect IP addresses.
- Set tracking cookies within their `w.soundcloud.com` iframe.
- Track playback statistics for the artist.

---

## 2. GDPR Compliance Strategy

To be fully compliant, we recommend the following:

### A. Privacy Policy Update

Add a section to your privacy policy stating that you use the SoundCloud Widget API.
*Draft text:* "We use a SoundCloud player to provide audio content. When you play a track, SoundCloud may collect your IP address and use cookies. For more info, see the [SoundCloud Privacy Policy](https://soundcloud.com/pages/privacy)."

### B. Cookie Consent Integration

If your site has a "Cookie Banner," you can prevent the player from loading until the user accepts "Marketing" or "Functional" cookies.

**React Example:**

```tsx
{hasUserConsented && <SCPlayer playlists={data} />}
```

### C. The "Two-Click" Solution

Instead of loading the player automatically, show a placeholder image with a "Load Player & Accept Cookies" button. This ensures no third-party data is exchanged until the user takes action.

---

## 3. Data Processing Agreement (DPA)

As a developer, you do not need a separate DPA with SoundCloud to use their public widget API, as the relationship is between the end-user and SoundCloud. However, if you are a festival processing thousands of users, consult your legal team regarding your specific jurisdiction.
