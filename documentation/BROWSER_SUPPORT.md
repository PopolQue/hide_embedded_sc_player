# Browser Support Matrix

The SCPlayer is built using modern web standards (Flexbox, CSS Variables, ES Modules). We aim for broad compatibility while maintaining a tiny footprint.

---

## 1. Supported Browsers

| Browser | Minimum Version | Notes |
| :--- | :--- | :--- |
| **Google Chrome** | 61+ | Full support. |
| **Apple Safari** | 11+ | Full support (Mobile & Desktop). |
| **Mozilla Firefox** | 60+ | Full support. |
| **Microsoft Edge** | 79+ (Chromium) | Full support. |
| **Opera** | 48+ | Full support. |

---

## 2. Modern Features Used

If you need to support older browsers (like Internet Explorer 11), you will need to provide polyfills for:

- **CSS Custom Properties:** Used for all theming.
- **Intersection Observer:** (Internal SoundCloud Widget dependency).
- **Flexbox:** Used for all layouts.
- **`localStorage`:** Used for persistence.

---

## 3. Mobile Quirks

### iOS Safari

- **Autoplay:** iOS strictly forbids audio from starting without a user gesture. The player will wait for a click.
- **Background Play:** In some cases, iOS may pause the iframe audio if the browser is minimized.

### Android Chrome

- **Media Session API:** Android provides a native notification for audio. The SoundCloud Widget API attempts to hook into this automatically, but reliability varies by device.

---

## 4. Known Limitations

- **Internet Explorer:** Not supported. The SoundCloud Widget API itself has dropped support for IE, and our CSS Variables will not work without a heavy polyfill.
- **Mini-Browsers:** Browsers inside apps (like the Instagram or Facebook "In-App Browser") may have restrictive iframe policies that block the "Shell" architecture. We recommend testing your festival site specifically inside these apps.
