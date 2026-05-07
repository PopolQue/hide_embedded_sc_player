# Troubleshooting & FAQ

Common issues and solutions when integrating the Hide Embedded SC Player.

---

## 1. "Refused to display '...' in a frame because it set 'X-Frame-Options' to 'sameorigin'."

**Issue:** Your website doesn't appear inside the `shell.html` iframe.
**Solution:** This is a security header set by your server (or CMS like WordPress/Squarespace).

- **Custom Servers:** Change the `X-Frame-Options` header to `ALLOW-FROM ...` or remove it. Better yet, use `Content-Security-Policy: frame-ancestors 'self' yourdomain.com`.
- **WordPress:** Some security plugins (like Wordfence or iThemes) block iframing. Check their settings.
- **Shopify/Wix:** These platforms often block iframing by default for security. You may need to use the "Standalone Script" method instead of the "Shell" method if you cannot change these headers.

## 2. Audio doesn't start automatically

**Issue:** The `autoplay` setting doesn't seem to work.
**Solution:** Most modern browsers (Chrome, Safari, Firefox) have strict **Autoplay Policies**.

- Audio cannot play automatically until the user has interacted with the document (clicked, tapped, etc.).
- **Workaround:** The player is designed to wait for a user gesture. Ensure your "Play" button is prominent.

## 3. Metadata (Titles/Artists) is wrong or missing

**Issue:** The player shows the wrong track info.
**Solution:** The player uses **Local Metadata** for speed and SEO.

1. Update `src/lib/playlists.json`.
2. If using the Standalone version, you **must** sync this to `standalone/playlists.js`.
3. Run the sync command:

   ```bash
   node -e "const fs = require('fs'); const data = fs.readFileSync('src/lib/playlists.json', 'utf8'); fs.writeFileSync('standalone/playlists.js', 'window.PLAYER_PLAYLISTS = ' + data);"
   ```

## 4. SoundCloud Widget is blank or doesn't load

**Issue:** The player UI shows up, but no music plays.
**Solution:**

- Check if you have an AdBlocker enabled. Some filters block the SoundCloud API (`w.soundcloud.com`).
- Ensure the `scEmbedUrl` or `playlistId` you provided is valid and public on SoundCloud. Private playlists require a "Secret Token" in the URL.

## 5. CSS Styles are clashing

**Issue:** The player looks weird on my site.
**Solution:** The player uses isolated class names prefixed with `sc-player__`. However, global CSS resets in your project might affect it.

- Use the [Theming Guide](./THEMING.md) to override specific variables.
- If needed, increase specificity in your CSS: `body .sc-player { ... }`.

---

## FAQ

### Can I use this with private SoundCloud tracks?

Yes, but you must use the full `permalink_url` including the secret token (e.g., `.../s-xxxxxx`) in your `playlists.json`.

### Does this work on mobile?

Yes, the player is fully responsive. However, note that mobile browsers are even stricter with autoplay and often require a direct tap on the Play button to start the audio context.

### Will this affect my SEO?

If you use the **Shell** method, your main URL will be `yoursite.com/shell.html`. To keep your SEO intact, ensure your actual site pages have proper canonical tags pointing to their original URLs. Search engines will index the content inside the iframe normally.
