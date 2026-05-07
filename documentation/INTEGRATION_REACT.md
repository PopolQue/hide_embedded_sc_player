# React Integration Guide

For modern web applications built with React, the player is available as a fully-typed, customizable component.

---

## Installation

Since this is a local library, you can import the `SCPlayer` component directly from the `src/lib` directory or build it as a package.

### 1. Requirements

Ensure your project has the following peer dependencies installed:

- `react` >= 18.0.0
- `react-dom` >= 18.0.0

### 2. Basic Usage

```tsx
import { SCPlayer } from './path/to/lib';
import playlists from './path/to/playlists.json';

function App() {
  return (
    <div className="app">
      {/* Your site content */}
      <main>...</main>

      {/* The Player */}
      <SCPlayer 
        playlists={playlists}
        defaultPlaylist="2024"
        position="bottom"
        theme={{
          bg: '#1a1a24',
          accent: '#aa3bff'
        }}
      />
    </div>
  );
}
```

---

## Component Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `playlists` | `Record<string, Playlist>` | **Required** | The track data (see `types.ts`). |
| `defaultPlaylist` | `string` | First key | The ID of the playlist to load initially. |
| `position` | `'top' \| 'bottom'` | `'bottom'` | Fixed position of the bar. |
| `theme` | `ThemeConfig` | `{}` | CSS overrides for colors and spacing. |
| `persist` | `boolean` | `true` | Save play state to `localStorage`. |
| `showProgress` | `boolean` | `true` | Show/hide the seek bar. |
| `autoplayOnSelect` | `boolean` | `true` | Play immediately when a track is clicked. |

---

## Theming

The component uses **CSS Custom Properties** (Variables). You can customize the look either via the `theme` prop or by overriding the CSS variables in your own stylesheet:

### Via Prop

```tsx
<SCPlayer 
  theme={{
    bg: '#000000',
    accent: '#00ff00',
    fontFamily: 'monospace'
  }}
/>
```

### Via CSS

```css
/* Your global.css */
.sc-player {
  --scp-bg: #000000;
  --scp-accent: #00ff00;
  --scp-radius: 0px;
}
```

---

## Best Practices for Persistence

In a standard React SPA (Single Page Application) using `react-router`, the `SCPlayer` should be placed **outside** your `<Routes>` or `<Outlet />` component:

```tsx
// App.tsx
<BrowserRouter>
  <SCPlayer playlists={data} /> {/* Stays mounted during navigation */}
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>
```

This ensures that the player component **never unmounts**, allowing the music to continue playing seamlessly as the user navigates between views.

---

## Advanced Patterns

### Custom Navigation Trigger

You can control the player from outside the component by using standard DOM events or by lifting state. However, the simplest way to trigger a track change from a different component is via the SoundCloud Widget API if you have a reference to the hidden iframe.

### Integration with Next.js (App Router)

Since SCPlayer uses browser APIs (`localStorage`, `window`), it must be rendered as a **Client Component**. If importing into a Server Component (like `layout.tsx`), use a dynamic import:

```tsx
'use client'
import dynamic from 'next/dynamic'

// Disable SSR for the player component
const SCPlayer = dynamic(() => import('./components/SCPlayer'), { ssr: false })

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        {/* Render outside of main content for persistence */}
        <SCPlayer playlists={data} />
      </body>
    </html>
  )
}
```

### Handling "Dark Mode"

The player automatically inherits colors if you use variables. You can sync the player's theme with your site's dark mode easily:

```css
/* Example using data-theme or class-based dark mode */
:root { 
  --scp-bg: #ffffff; 
  --scp-text: #1a1a1a;
}

[data-theme='dark'], .dark { 
  --scp-bg: #111316; 
  --scp-text: #ffffffde;
}
```
