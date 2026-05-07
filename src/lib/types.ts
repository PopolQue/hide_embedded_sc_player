// ── SoundCloud Widget API types ──────────────────────────────────────

/**
 * SoundCloud user metadata returned by the Widget API.
 */
export type SCUser = {
  /** The display name of the user/artist */
  username: string
}

/**
 * SoundCloud sound object containing metadata for a single track.
 */
export type SCSound = {
  /** Unique numeric ID of the track */
  id: number
  /** The track title */
  title: string
  /** The artist/user who uploaded the track */
  user: SCUser
  /** URL to the track artwork (various sizes available) */
  artwork_url?: string | null
  /** Total duration in milliseconds */
  duration?: number
  /** Public permalink URL of the track */
  permalink_url?: string
}

/**
 * Events emitted by the SoundCloud Widget API.
 * @see https://developers.soundcloud.com/docs/api/html5-widget#events
 */
export type SCWidgetEvents = {
  /** Fired when the widget has loaded its assets and is ready for interaction */
  READY: string
  /** Fired when playback starts */
  PLAY: string
  /** Fired when playback is paused */
  PAUSE: string
  /** Fired periodically during playback to indicate current position */
  PLAY_PROGRESS: string
  /** Fired when the current sound changes (e.g. next track or new load) */
  SOUND_CHANGE: string
  /** Fired when an error occurs within the widget */
  ERROR: string
  /** Fired when the current sound finishes playing */
  FINISH: string
}

/**
 * Interface for the SoundCloud Widget controller.
 * @see https://developers.soundcloud.com/docs/api/html5-widget#methods
 */
export type SCWidget = {
  /** Bind a listener to a widget event */
  bind(event: string, callback: (data?: unknown) => void): void
  /** Unbind listeners from a widget event */
  unbind(event?: string): void
  /** Start playback */
  play(): void
  /** Pause playback */
  pause(): void
  /** Toggle between play and pause states */
  toggle(): void
  /** Skip to the next track in the current playlist */
  next(): void
  /** Skip to the previous track in the current playlist */
  prev(): void
  /** Load a new SoundCloud URL into the widget */
  load(url: string, options?: { autoPlay?: boolean }): void
  /** Seek to a specific position in milliseconds */
  seekTo(milliseconds: number): void
  /** Retrieve the total duration of the current sound */
  getDuration(callback: (ms: number) => void): void
  /** Retrieve the current playback position in milliseconds */
  getPosition(callback: (ms: number) => void): void
  /** Retrieve the current volume (0.0 to 1.0) */
  getVolume(callback: (volume: number) => void): void
  /** Set the widget volume (0.0 to 1.0) */
  setVolume(volume: number): void
  /** Retrieve the metadata for the current sound */
  getCurrentSound(
    callback: (sound: SCSound | null) => void
  ): void
  /** Check if the player is currently paused */
  isPaused(callback: (paused: boolean) => void): void
  /** Retrieve an array of all sounds in the current playlist */
  getSounds(callback: (sounds: SCSound[]) => void): void
}

/**
 * The global SoundCloud API object injected by `api.js`.
 */
export type SoundCloudAPI = {
  Widget: {
    /** Constructor for a new Widget instance */
    new (element: HTMLIFrameElement): SCWidget
    /** Constant map of available widget events */
    Events: SCWidgetEvents
  }
}

declare global {
  interface Window {
    /** The SoundCloud Widget API global instance */
    SC?: SoundCloudAPI
  }
}

// ── Player domain types ──────────────────────────────────────────────

/**
 * Data structure for a single track within the SCPlayer system.
 * This is used for local metadata rendering and navigation.
 */
export type Track = {
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
  /** SoundCloud track permalink URL (required for playback commands) */
  permalink_url: string
}

/**
 * A collection of tracks with metadata for a specific grouping (e.g. "2024 Releases").
 */
export type Playlist = {
  /** Human-readable name shown in the playlist selector */
  label: string
  /** SoundCloud playlist ID (e.g. "soundcloud:playlists:123456") */
  playlistId: string
  /** Public URL to the SoundCloud playlist page */
  url: string
  /** Array of track metadata objects */
  tracks: Track[]
}

/**
 * Configuration for the player's visual appearance.
 * All properties are optional and fallback to project defaults.
 */
export type ThemeConfig = {
  /** Background color of the main player bar. Default: `#1a1a24` */
  bg?: string
  /** Color of borders and dividers. Default: `#333842` */
  border?: string
  /** Primary text color (Title). Default: `#ffffffde` */
  text?: string
  /** Secondary/muted text color (Artist, Duration). Default: `#9ca3af` */
  muted?: string
  /** Brand/accent color used for progress, play button, and active states. Default: `#aa3bff` */
  accent?: string
  /** Hover state color for the accent elements. Default: `#9a2bff` */
  accentHover?: string
  /** Background highlight color for the currently playing track in the list. Default: `#64646426` */
  activeBg?: string
  /** Background color for the track list slide-up panel. Default: `#242430` */
  listBg?: string
  /** Height of the player bar. Default: `64px` */
  barHeight?: string
  /** Border radius for artwork and UI controls. Default: `4px` */
  borderRadius?: string
  /** Font family stack. Default: `Inter, system-ui, sans-serif` */
  fontFamily?: string
}

/**
 * Core functional configuration for the SCPlayer.
 * These settings control behavior, persistence, and feature visibility.
 */
export type PlayerConfig = {
  /** Map of available playlists, keyed by a unique identifier */
  playlists: Record<string, Playlist>
  /** Key of the playlist to load on mount. Defaults to the first key in `playlists`. */
  defaultPlaylist?: string
  /** 
   * Explicit URL for the hidden SoundCloud iframe. 
   * If omitted, the player generates a valid URL from the `defaultPlaylist` ID.
   */
  scEmbedUrl?: string
  /** Link to the SoundCloud profile page. Default: `https://soundcloud.com` */
  scAccountUrl?: string
  /** Fixed position of the player bar on the screen. Default: `'bottom'` */
  position?: 'bottom' | 'top'
  /** Toggle visibility of the playlist selector dropdown. Default: `true` */
  showPlaylistSelect?: boolean
  /** Toggle visibility of the track list toggle button. Default: `true` */
  showTrackList?: boolean
  /** Toggle visibility of the top progress/seek bar. Default: `true` */
  showProgress?: boolean
  /** Toggle visibility of the Play/Prev/Next controls. Default: `true` */
  showNavButtons?: boolean
  /** Whether to start playback immediately when a track is manually selected. Default: `true` */
  autoplayOnSelect?: boolean
  /** Delay in milliseconds before triggering autoplay (to allow widget load). Default: `500` */
  autoplayDelay?: number
  /** Whether to save/restore play state (playlist, index, progress) to localStorage. Default: `true` */
  persist?: boolean
  /** Custom key used for localStorage persistence. Default: `'scp-state'` */
  storageKey?: string
}

/**
 * Props for the SCPlayer React component.
 */
export type SCPlayerProps = PlayerConfig & {
  /** Custom theme overrides. */
  theme?: ThemeConfig
  /** Optional CSS class applied to the root player container. */
  className?: string
}
