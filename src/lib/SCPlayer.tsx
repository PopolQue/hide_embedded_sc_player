import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { SCPlayerProps, SCWidget } from './types'
import scLogo from './assets/sc-logo.png'
import './SCPlayer.css'

// ── Helpers ──────────────────────────────────────────────────────────

/** Format milliseconds to human-readable time string (e.g. "3:45" or "1:02:30") */
function formatTime(ms: number): string {
  if (!ms || Number.isNaN(ms) || ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Default theme values — matches CSS custom property defaults */
const DEFAULT_THEME = {
  bg: '#1d1d1d',
  border: '#505050',
  text: '#e7e7e7de',
  muted: '#9ca3af',
  accent: '#1a1a1a',
  accentHover: '#000000',
  activeBg: 'rgba(52, 52, 52, 0.15)',
  listBg: '#101010',
  barHeight: '64px',
  borderRadius: '4px',
  fontFamily: 'Inter, system-ui, sans-serif',
} as const

// ── SVG Icons (inline, no external dependencies) ─────────────────────

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function IconPause() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function IconPrev() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  )
}

function IconNext() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}

function IconMusic() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────────

/**
 * The primary entry point for the SoundCloud Player library.
 * This component manages the hidden SoundCloud Widget iframe and provides a
 * custom, themeable UI for controlling playback.
 * 
 * @param props - Configuration and theme options for the player.
 */
export default function SCPlayer({
  playlists,
  defaultPlaylist,
  scEmbedUrl,
  scAccountUrl = 'https://soundcloud.com/kleinundhaarig',
  position = 'bottom',
  showPlaylistSelect = true,
  showTrackList = true,
  showProgress = true,
  showNavButtons = true,
  autoplayOnSelect = true,
  autoplayDelay = 500,
  persist = true,
  storageKey = 'scp-state',
  theme = {},
  className = '',
}: SCPlayerProps) {
  /** Reference to the hidden SoundCloud iframe required by the Widget API */
  const iframeRef = useRef<HTMLIFrameElement>(null)
  /** Reference to the initialized SoundCloud Widget instance */
  const widgetRef = useRef<SCWidget | null>(null)
  /** Timer used for polling playback progress from the widget */
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** 
   * Retrieves the persisted player state from localStorage.
   * Runs only during initialization to restore the user's last session.
   */
  const getInitialState = useCallback(() => {
    if (!persist) return null
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }, [persist, storageKey])

  const initialState = getInitialState()

  // ── State ──────────────────────────────────────────────────────────

  /** Whether audio is currently playing */
  const [isPlaying, setIsPlaying] = useState(false)
  /** Zero-based index of the current track within the active playlist */
  const [currentTrackIndex, setCurrentTrackIndex] = useState(
    initialState?.index ?? 0
  )
  /** Key identifying the currently active playlist */
  const [playlistKey, setPlaylistKey] = useState(() => {
    if (initialState?.playlist && playlists[initialState.playlist]) {
      return initialState.playlist
    }
    return defaultPlaylist || Object.keys(playlists)[0]
  })
  /** Current playback position in milliseconds */
  const [progress, setProgress] = useState(initialState?.progress ?? 0)
  /** Total duration of the current track in milliseconds */
  const [duration, setDuration] = useState(0)
  /** Whether the track list slide-up panel is visible */
  const [showTracks, setShowTracks] = useState(false)
  /** Whether the SoundCloud Widget API has successfully initialized */
  const [widgetReady, setWidgetReady] = useState(false)
  /** Whether an error occurred while loading the widget or tracks */
  const [widgetError, setWidgetError] = useState(false)
  /** Whether the external SoundCloud Widget script has been loaded into the DOM */
  const [scriptLoaded, setScriptLoaded] = useState(() => !!window.SC?.Widget)

  const playlistKeys = Object.keys(playlists)

  // 1. Resolve SoundCloud Embed URL
  const resolvedEmbedUrl = useMemo(() => {
    if (scEmbedUrl) return scEmbedUrl

    const firstKey = defaultPlaylist || playlistKeys[0]
    const pl = playlists[firstKey]
    if (!pl?.playlistId) return ''

    // Extract numeric ID from "soundcloud:playlists:123456" or just use the ID
    const idMatch = pl.playlistId.match(/\d+$/)
    const numericId = idMatch ? idMatch[0] : pl.playlistId

    return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${numericId}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true`
  }, [scEmbedUrl, defaultPlaylist, playlistKeys, playlists])

  // 2. Automate SoundCloud API Script Injection
  useEffect(() => {
    if (window.SC?.Widget) {
      setScriptLoaded(true)
      return
    }

    const scriptId = 'sc-widget-api-script'
    if (document.getElementById(scriptId)) return

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setWidgetError(true)
    document.head.appendChild(script)
  }, [])

  const currentPlaylist = playlists[playlistKey]
  const allTracks = currentPlaylist?.tracks ?? []
  const currentTrack = allTracks[currentTrackIndex] ?? null

  // Save state to storage
  useEffect(() => {
    if (!persist) return
    const state = {
      playlist: playlistKey,
      index: currentTrackIndex,
      progress: progress,
    }
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [playlistKey, currentTrackIndex, progress, persist, storageKey])

  // Resolve theme to CSS custom properties
  const cssVars = useMemo<React.CSSProperties>(() => {
    const t = { ...DEFAULT_THEME, ...theme }
    return {
      '--scp-bg': t.bg,
      '--scp-border': t.border,
      '--scp-text': t.text,
      '--scp-muted': t.muted,
      '--scp-accent': t.accent,
      '--scp-accent-hover': t.accentHover,
      '--scp-active-bg': t.activeBg,
      '--scp-list-bg': t.listBg,
      '--scp-bar-h': t.barHeight,
      '--scp-radius': t.borderRadius,
      '--scp-font': t.fontFamily,
    } as React.CSSProperties
  }, [theme])

  // 3. Initialize SoundCloud widget
  useEffect(() => {
    if (!scriptLoaded || !iframeRef.current || !window.SC?.Widget) {
      return
    }

    setWidgetError(false)
    try {
      widgetRef.current = new window.SC.Widget(iframeRef.current)
    } catch {
      setWidgetError(true)
      return
    }

    const widget = widgetRef.current

    // Event handlers
    const handleReady = () => {
      setWidgetReady(true)

      // If we have a persisted track/progress, load it
      if (initialState && currentTrack?.permalink_url) {
        widget.load(currentTrack.permalink_url, { autoPlay: false })
        if (initialState.progress > 0) {
          widget.seekTo(initialState.progress)
        }
      }

      widget.isPaused((paused) => setIsPlaying(!paused))
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    const handleSoundChange = () => {
      widget.getCurrentSound((sound) => {
        if (sound) {
          // Find the track in our local metadata to keep UI in sync
          const idx = allTracks.findIndex((t) => t.id === sound.id)
          if (idx >= 0) {
            setCurrentTrackIndex(idx)
            // Prioritize local duration metadata if available to avoid widget bugs
            if (allTracks[idx].duration) {
              setDuration(allTracks[idx].duration)
              return
            }
          }
          // Fallback to widget duration if local metadata is missing
          widget.getDuration((d) => setDuration(d))
        }
      })
    }

    const handleError = () => {
      setWidgetError(true)
    }

    const events = window.SC.Widget.Events
    widget.bind(events.READY, handleReady)
    widget.bind(events.PLAY, handlePlay)
    widget.bind(events.PAUSE, handlePause)
    widget.bind(events.SOUND_CHANGE, handleSoundChange)
    widget.bind(events.ERROR, handleError)

    return () => {
      try {
        widget.unbind(events.READY)
        widget.unbind(events.PLAY)
        widget.unbind(events.PAUSE)
        widget.unbind(events.SOUND_CHANGE)
        widget.unbind(events.ERROR)
      } catch {
        // Widget may already be destroyed — ignore
      }
    }
    // Re-bind when tracks or embed URL changes to avoid stale closures
  }, [resolvedEmbedUrl, scriptLoaded, allTracks])

  // Progress polling
  useEffect(() => {
    if (!widgetReady || !widgetRef.current) return

    progressTimerRef.current = setInterval(() => {
      widgetRef.current?.getPosition((pos) => {
        setProgress(pos)
      })
    }, 500)

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [widgetReady])

  // Sync duration with current track metadata
  useEffect(() => {
    if (currentTrack?.duration) {
      setDuration(currentTrack.duration)
    }
  }, [currentTrack])

  // Update state when playlist changes
  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      if (currentTrack) {
        setDuration(currentTrack.duration ?? 0)
      }
      return
    }

    // When playlistKey changes, reset to track 0
    setCurrentTrackIndex(0)
    setProgress(0)
    setShowTracks(false)
    if (allTracks[0]) {
      setDuration(allTracks[0].duration ?? 0)
    }
  }, [playlistKey])

  // Navigate to a specific track
  const navigateToTrack = useCallback(
    (index: number) => {
      const track = allTracks[index]
      if (!track?.permalink_url || !widgetRef.current) return

      setCurrentTrackIndex(index)
      if (track.duration) setDuration(track.duration)

      try {
        widgetRef.current.load(track.permalink_url)
      } catch {
        // Widget error — graceful fallback
        return
      }

      setShowTracks(false)

      if (autoplayOnSelect) {
        setTimeout(() => {
          try {
            widgetRef.current?.play()
          } catch {
            // Widget may not be ready yet — ignore
          }
        }, autoplayDelay)
      }
    },
    [allTracks, autoplayOnSelect, autoplayDelay]
  )

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    try {
      widgetRef.current?.toggle()
    } catch {
      // Widget not ready
    }
  }, [])

  // Previous track
  const prevTrack = useCallback(() => {
    if (currentTrackIndex > 0) {
      navigateToTrack(currentTrackIndex - 1)
    } else {
      try {
        widgetRef.current?.prev()
      } catch {
        // Widget not ready
      }
    }
  }, [currentTrackIndex, navigateToTrack])

  // Next track
  const nextTrack = useCallback(() => {
    if (currentTrackIndex < allTracks.length - 1) {
      navigateToTrack(currentTrackIndex + 1)
    } else {
      try {
        widgetRef.current?.next()
      } catch {
        // Widget not ready
      }
    }
  }, [currentTrackIndex, allTracks.length, navigateToTrack])

  // Seek within current track
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!widgetRef.current || !duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      try {
        widgetRef.current.seekTo(duration * pct)
      } catch {
        // Widget not ready
      }
    },
    [duration]
  )

  // Playlist change handler
  const handlePlaylistChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPlaylistKey(e.target.value)
      setProgress(0)
    },
    []
  )

  // Computed values
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0
  const artworkUrl = currentTrack?.artwork_url
    ? currentTrack.artwork_url.replace('-large', '-t500x500')
    : null

  return (
    <div
      className={`sc-player sc-player--${position}${className ? ` ${className}` : ''}`}
      style={cssVars}
      role="region"
      aria-label="SoundCloud Player"
    >
      {/* Hidden SoundCloud iframe */}
      <iframe
        ref={iframeRef}
        className="sc-player__iframe"
        src={resolvedEmbedUrl}
        allow="autoplay"
        title="SoundCloud Player (hidden)"
        tabIndex={-1}
      />

      {/* Error state */}
      {widgetError && (
        <div className="sc-player__error" role="alert">
          <span>SoundCloud player unavailable. Please reload the page.</span>
          <button
            className="sc-player__error-close"
            onClick={() => setWidgetError(false)}
            aria-label="Close error message"
          >
            <IconClose />
          </button>
        </div>
      )}

      {/* Player Bar */}
      <div className="sc-player__bar">
        {/* Track Info */}
        <div className="sc-player__info">
          <div className="sc-player__artwork">
            {currentTrack ? (
              <a
                href={currentTrack.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                title="View on SoundCloud"
              >
                {artworkUrl ? (
                  <img
                    src={artworkUrl}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const placeholder = target.nextElementSibling
                      if (placeholder instanceof HTMLElement)
                        placeholder.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className="sc-player__artwork-placeholder"
                  style={artworkUrl ? { display: 'none' } : undefined}
                >
                  <IconMusic />
                </div>
              </a>
            ) : (
              <div className="sc-player__artwork-placeholder">
                <IconMusic />
              </div>
            )}
          </div>
          <div className="sc-player__text">
            {currentTrack ? (
              <a
                href={currentTrack.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                className="sc-player__title"
                title="View on SoundCloud"
              >
                {currentTrack.title}
              </a>
            ) : (
              <div className="sc-player__title">No track selected</div>
            )}
            <div className="sc-player__artist">
              {currentTrack ? (
                <a
                  href={currentPlaylist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View ${currentPlaylist.label} on SoundCloud`}
                >
                  {currentTrack.artist}
                </a>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="sc-player__controls">
          {showNavButtons && (
            <>
              <button
                className="sc-player__btn sc-player__btn--prev"
                onClick={prevTrack}
                aria-label="Previous track"
                disabled={allTracks.length === 0}
              >
                <IconPrev />
              </button>
              <button
                className="sc-player__btn sc-player__btn--play"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                disabled={!widgetReady || allTracks.length === 0}
              >
                {isPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <button
                className="sc-player__btn sc-player__btn--next"
                onClick={nextTrack}
                aria-label="Next track"
                disabled={allTracks.length === 0}
              >
                <IconNext />
              </button>
            </>
          )}

          {showPlaylistSelect && playlistKeys.length > 1 && (
            <select
              className="sc-player__select"
              value={playlistKey}
              onChange={handlePlaylistChange}
              aria-label="Select playlist"
            >
              {playlistKeys.map((key) => (
                <option key={key} value={key}>
                  {playlists[key].label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div
            className="sc-player__progress"
            onClick={handleSeek}
            role="slider"
            aria-label="Playback progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={Math.max(duration, 1)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (!widgetRef.current || !duration) return
              const step = duration * 0.02 // 2% steps
              if (e.key === 'ArrowRight') {
                widgetRef.current.seekTo(Math.min(duration, progress + step))
              } else if (e.key === 'ArrowLeft') {
                widgetRef.current.seekTo(Math.max(0, progress - step))
              }
            }}
          >
            <div
              className="sc-player__progress-fill"
              style={{ width: `${progressPct}%` }}
              aria-hidden="true"
            />
            <span className="sc-player__sr-only">
              {formatTime(progress)} of {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Track List Toggle */}
        {showTrackList && allTracks.length > 0 && (
          <button
            className="sc-player__tracks-btn"
            onClick={() => setShowTracks((prev) => !prev)}
            aria-label={showTracks ? 'Hide track list' : 'Show track list'}
            aria-expanded={showTracks}
            aria-controls="sc-player-track-list"
          >
            <span className="sc-player__tracks-btn-icon" aria-hidden="true">
              {showTracks ? <IconClose /> : '☰'}
            </span>
            <span className="sc-player__tracks-count">{allTracks.length}</span>
          </button>
        )}

        {/* SoundCloud Logo */}
        <a
          href={scAccountUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sc-player__logo"
          aria-label="Visit our SoundCloud"
        >
          <img src={scLogo} alt="SoundCloud" />
        </a>
      </div>

      {/* Track List Panel */}
      {showTrackList && (
        <div
          id="sc-player-track-list"
          className={`sc-player__tracks${showTracks ? ' sc-player__tracks--open' : ''}`}
          role="list"
          aria-label="Track list"
        >
          {allTracks.map((track, i) => {
            const isActive = i === currentTrackIndex
            return (
              <button
                key={`${track.id}-${i}`}
                className={`sc-player__track${isActive ? ' active' : ''}`}
                onClick={() => navigateToTrack(i)}
                role="listitem"
                aria-current={isActive && isPlaying ? 'true' : undefined}
              >
                <span className="sc-player__track-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="sc-player__track-title">{track.title}</span>
                <span className="sc-player__track-dur">
                  {formatTime(track.duration)}
                </span>
                {isActive && isPlaying && (
                  <span
                    className="sc-player__playing"
                    aria-label="Currently playing"
                  >
                    ♫
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
