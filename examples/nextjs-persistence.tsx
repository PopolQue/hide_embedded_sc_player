'use client'

import dynamic from 'next/dynamic'
import { PLAYLISTS } from '../lib/data'

/**
 * Next.js Integration Example
 * 
 * Since the SCPlayer relies on browser-only APIs (localStorage, window.SC),
 * it must be imported dynamically with `ssr: false` when used in 
 * Next.js App Router layouts.
 */

const SCPlayer = dynamic(() => import('../lib/SCPlayer'), { 
  ssr: false,
  loading: () => <div style={{ height: '64px', background: '#111' }} />
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>

        {/* 
          Render the player at the root level of your layout.
          As long as the user navigates using Next.js <Link> components,
           this layout will NOT re-render, keeping the music playing.
        */}
        <SCPlayer 
          playlists={PLAYLISTS} 
          storageKey="my-festival-state"
          theme={{ accent: '#ff5500' }}
        />
      </body>
    </html>
  )
}
