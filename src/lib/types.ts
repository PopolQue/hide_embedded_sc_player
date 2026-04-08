export interface Track {
  id: number
  title: string
  artist: string
  duration: number
  artwork_url?: string | null
  permalink_url: string
}

export interface Playlist {
  label: string
  playlistId: string
  url: string
  tracks: Track[]
}

export interface ThemeConfig {
  /** Background color of player bar */
  bg?: string
  /** Border color */
  border?: string
  /** Primary text color */
  text?: string
  /** Muted/secondary text color */
  muted?: string
  /** Accent color (play button, progress bar, active state) */
  accent?: string
  /** Accent hover color */
  accentHover?: string
  /** Active/highlight background */
  activeBg?: string
  /** Track list background */
  listBg?: string
  /** Player bar height */
  barHeight?: string
  /** Border radius for artwork */
  borderRadius?: string
  /** Font family */
  fontFamily?: string
}

export interface PlayerConfig {
  /** Available playlists */
  playlists: Record<string, Playlist>
  /** Default playlist key */
  defaultPlaylist?: string
  /** SoundCloud iframe embed URL */
  scEmbedUrl: string
  /** Player bar position */
  position?: 'bottom' | 'top'
  /** Show year/playlist selector */
  showPlaylistSelect?: boolean
  /** Show track list button */
  showTrackList?: boolean
  /** Show progress bar */
  showProgress?: boolean
  /** Show prev/next buttons */
  showNavButtons?: boolean
  /** Auto-play on track select */
  autoplayOnSelect?: boolean
  /** Delay before autoplay (ms) */
  autoplayDelay?: number
}

export interface SCPlayerProps extends PlayerConfig {
  /** Custom theme overrides */
  theme?: ThemeConfig
  /** Additional CSS class */
  className?: string
  /** Custom CSS (inline) */
  style?: React.CSSProperties
}
