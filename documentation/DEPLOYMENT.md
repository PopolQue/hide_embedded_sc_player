# Deployment Guide

This guide covers how to deploy the SCPlayer to various hosting environments.

---

## 1. Hosting the Standalone Shell

Since the "Shell" architecture relies on a single `shell.html` file that contains an `<iframe>`, it works perfectly on static hosting providers.

### Netlify / Vercel / GitHub Pages

1. Ensure your `shell.html` is the entry point (or rename it to `index.html`).
2. **Important:** Because the shell uses URL hashes (`/#/about`) for navigation, your inner website needs to handle these correctly.
3. If using **Netlify**, you may need a `_redirects` file if you want to use clean URLs without the hash:

   ```text
   /*  /index.html  200
   ```

---

## 2. React Application Deployment

If you are using the `SCPlayer` as a component within a React app (e.g., Vite, Next.js):

### Vite (Default)

1. Run `npm run build`.
2. Deploy the `dist/` folder to your provider.
3. Ensure the player component is rendered in your main `App.tsx` outside of the router's `<Routes>` to maintain persistence.

---

## 3. Security Headers (Crucial)

To allow the shell to embed your website, you must ensure your server doesn't block iframing.

### Nginx Configuration

```nginx
# Allow your shell domain to embed the site
add_header Content-Security-Policy "frame-ancestors 'self' https://your-shell-domain.com";
```

### Apache Configuration

```apache
Header set Content-Security-Policy "frame-ancestors 'self' https://your-shell-domain.com"
```

---

## 4. Performance Tips

- **CDN:** Serve the `sc-player-standalone.js` and `sc-player.css` via a CDN for faster global loading.
- **Lazy Loading:** The shell uses `<iframe loading="lazy">` to ensure the player UI loads and starts its audio bridge before the main content frame consumes resources.
