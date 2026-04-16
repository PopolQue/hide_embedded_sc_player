// ── SoundCloud Widget API types ──────────────────────────────────────

/** SoundCloud user metadata from Widget API */
export interface SCUser {
  username: string
}

/** SoundCloud sound object from Widget API */
export interface SCSound {
  id: number
  title: string
  user: SCUser
  artwork_url?: string | null
  duration?: number
  permalink_url?: string
}

/** Events emitted by the SoundCloud Widget */
export interface SCWidgetEvents {
  READY: string
  PLAY: string
  PAUSE: string
  PLAY_PROGRESS: string
  SOUND_CHANGE: string
  ERROR: string
  FINISH: string
}

/** SoundCloud Widget constructor and API */
export interface SCWidget {
  bind(event: string, callback: (data?: unknown) => void): void
  unbind(event?: string): void
  play(): void
  pause(): void
  toggle(): void
  next(): void
  prev(): void
  load(url: string, options?: { autoPlay?: boolean }): void
  seekTo(milliseconds: number): void
  getDuration(callback: (ms: number) => void): void
  getPosition(callback: (ms: number) => void): void
  getVolume(callback: (volume: number) => void): void
  setVolume(volume: number): void
  getCurrentSound(
    callback: (sound: SCSound | null) => void
  ): void
  isPaused(callback: (paused: boolean) => void): void
  getSounds(callback: (sounds: SCSound[]) => void): void
}

/** SoundCloud Widget API on window */
export interface SoundCloudAPI {
  Widget: {
    new (element: HTMLIFrameElement): SCWidget
    Events: SCWidgetEvents
  }
}

declare global {
  interface Window {
    SC?: SoundCloudAPI
  }
}

// ── Player domain types ──────────────────────────────────────────────

/** A single track in a playlist */
export interface Track {
  /** Unique SoundCloud track ID */
  id: number
  /** Display title (e.g. "Artist - Track Title") */
  title: string
  /** Display artist name */
  artist: string
  /** Duration in milliseconds */
  duration: number
  /** Cover art URL (high-res preferred) */
  artwork_url?: string | null
  /** SoundCloud track permalink URL (required for playback) */
  permalink_url: string
}

/** A collection of tracks (e.g. a year's releases) */
export interface Playlist {
  /** Display name shown in the playlist selector */
  label: string
  /** SoundCloud playlist ID (e.g. "soundcloud:playlists:123456") */
  playlistId: string
  /** Public SoundCloud playlist URL */
  url: string
  /** All tracks in this playlist */
  tracks: Track[]
}

/** Theme configuration for customizing the player appearance */
export interface ThemeConfig {
  /** Player bar background color. Default: `#1a1a24` */
  bg?: string
  /** Border color. Default: `#333842` */
  border?: string
  /** Primary text color. Default: `#ffffffde` */
  text?: string
  /** Muted/secondary text color. Default: `#9ca3af` */
  muted?: string
  /** Accent color (play button, progress bar, active state). Default: `#aa3bff` */
  accent?: string
  /** Accent hover color. Default: `#9a2bff` */
  accentHover?: string
  /** Active track highlight background. Default: `rgba(100, 100, 100, 0.15)` */
  activeBg?: string
  /** Track list dropdown background. Default: `#242430` */
  listBg?: string
  /** Player bar height. Default: `64px` */
  barHeight?: string
  /** Border radius for artwork and UI elements. Default: `4px` */
  borderRadius?: string
  /** Font family. Default: `Inter, system-ui, sans-serif` */
  fontFamily?: string
}

/** Core player configuration (shared between React and standalone) */
export interface PlayerConfig {
  /** Available playlists keyed by identifier */
  playlists: Record<string, Playlist>
  /** Initial playlist to load. Defaults to first key. */
  defaultPlaylist?: string
  /** SoundCloud iframe embed URL for the hidden widget */
  scEmbedUrl: string
  /** Player bar position. Default: `'bottom'` */
  position?: 'bottom' | 'top'
  /** Show playlist/playlist selector. Default: `true` */
  showPlaylistSelect?: boolean
  /** Show track list toggle button. Default: `true` */
  showTrackList?: boolean
  /** Show progress bar. Default: `true` */
  showProgress?: boolean
  /** Show prev/next navigation buttons. Default: `true` */
  showNavButtons?: boolean
  /** Auto-play when a track is selected. Default: `true` */
  autoplayOnSelect?: boolean
  /** Delay before auto-playing after track selection (ms). Default: `500` */
  autoplayDelay?: number
}

/** React component props — extends PlayerConfig with theme and className */
export interface SCPlayerProps extends PlayerConfig {
  /** Theme overrides (partial). CSS custom properties take precedence. */
  theme?: ThemeConfig
  /** Additional CSS class applied to the root element */
  className?: string
}
