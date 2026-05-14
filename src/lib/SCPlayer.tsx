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

function IconVolume({ volume }: { volume: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
      {volume === 0 ? (
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      ) : (
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      )}
    </svg>
  )
}

function IconShuffle({ color }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color || "currentColor"} width="16" height="16" aria-hidden="true">
      <path d="M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.58L5.41,20L17.96,7.46L20,9.5V4H14.5M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z" />
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
  /** Timer used for delaying duration updates to prevent progress bar flickering */
  const durationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** 
   * Retrieves the persisted player state from localStorage.
   * Runs only during initialization to restore the user's last session.
   */
  const getInitialState = useCallback(() => {
    if (!persist) return null
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return null

      const state = JSON.parse(saved)
      const EXPIRATION_TIME = 12 * 60 * 60 * 1000 // 12 hours

      if (state.ts && Date.now() - state.ts > EXPIRATION_TIME) {
        return null
      }

      return state
    } catch {
      return null
    }
  }, [persist, storageKey])

  const initialState = useMemo(() => getInitialState(), [getInitialState])

  // ── State ──────────────────────────────────────────────────────────

  /** Whether audio is currently playing */
  const [isPlaying, setIsPlaying] = useState(false)
  /** Whether tracks should be played in random order */
  const [isShuffle, setIsShuffle] = useState(false)

  /** Key identifying the playlist currently being browsed in the track list */
  const [browsingPlaylistKey, setBrowsingPlaylistKey] = useState(() => {
    if (initialState?.playlist && playlists[initialState.playlist]) {
      return initialState.playlist
    }

    // Pick a random playlist if no valid state
    const keys = Object.keys(playlists)
    return keys[Math.floor(Math.random() * keys.length)]
  })

  /** Key identifying the playlist that contains the currently playing track */
  const [activePlaylistKey, setActivePlaylistKey] = useState(browsingPlaylistKey)

  /** Zero-based index of the track currently playing within the active playlist */
  const [activeTrackIndex, setActiveTrackIndex] = useState(() => {
    if (initialState?.index !== undefined && initialState.index !== null) {
      return initialState.index
    }

    // Pick a random track from the selected playlist
    const tracks = playlists[activePlaylistKey]?.tracks || []
    return tracks.length > 0 ? Math.floor(Math.random() * tracks.length) : 0
  })

  /** Current playback position in milliseconds */
  const [progress, setProgress] = useState(initialState?.progress ?? 0)
  /** Total duration of the current track in milliseconds */
  const [duration, setDuration] = useState(() => {
    const pl = playlists[activePlaylistKey]
    const tr = pl?.tracks?.[activeTrackIndex]
    return tr?.duration ?? 0
  })
  /** Current player volume (0 to 100) */
  const [volume, setVolume] = useState(() => {
    if (initialState?.volume !== undefined) return initialState.volume
    return 100
  })
  /** Store last non-zero volume for unmuting */
  const lastVolumeRef = useRef(volume > 0 ? volume : 100)
  /** Whether the volume slider is visible */
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  /** Whether the track list slide-up panel is visible */
  const [showTracks, setShowTracks] = useState(false)
  /** Whether the SoundCloud Widget API has successfully initialized */
  const [widgetReady, setWidgetReady] = useState(false)
  /** Whether the user is currently dragging the progress slider */
  const [isDragging, setIsDragging] = useState(false)
  /** Whether an error occurred while loading the widget or tracks */
  const [widgetError, setWidgetError] = useState(false)
  /** Whether the external SoundCloud Widget script has been loaded into the DOM */
  const [scriptLoaded, setScriptLoaded] = useState(() => !!window.SC?.Widget)

  const playlistKeys = Object.keys(playlists)
  const volumeRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  // Close volume slider when clicking outside
  useEffect(() => {
    if (!showVolumeSlider) return

    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showVolumeSlider])

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

  const browsingPlaylist = playlists[browsingPlaylistKey]
  const browsingTracks = browsingPlaylist?.tracks ?? []

  const activePlaylist = playlists[activePlaylistKey]
  const activeTracks = activePlaylist?.tracks ?? []
  const activeTrack = activeTracks[activeTrackIndex] ?? null

  // Refs for event handlers to avoid stale closures
  const tracksRef = useRef(activeTracks)
  const indexRef = useRef(activeTrackIndex)
  const activePlaylistKeyRef = useRef(activePlaylistKey)

  useEffect(() => {
    tracksRef.current = activeTracks
  }, [activeTracks])

  useEffect(() => {
    indexRef.current = activeTrackIndex
  }, [activeTrackIndex])

  useEffect(() => {
    activePlaylistKeyRef.current = activePlaylistKey
  }, [activePlaylistKey])

  // Save state to storage
  useEffect(() => {
    if (!persist) return
    const state = {
      playlist: activePlaylistKey,
      index: activeTrackIndex,
      progress: progress,
      volume: volume,
      ts: Date.now(),
    }
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [activePlaylistKey, activeTrackIndex, progress, volume, persist, storageKey])

  // Update browser tab title when playing
  useEffect(() => {
    const baseTitle = "Klein und Haarig"
    if (isPlaying && activeTrack) {
      document.title = `▶ ${activeTrack.title} | ${baseTitle}`
    } else {
      document.title = baseTitle
    }

    return () => {
      document.title = baseTitle
    }
  }, [isPlaying, activeTrack])

  // Sync volume with widget
  useEffect(() => {
    if (widgetReady && widgetRef.current) {
      try {
        widgetRef.current.setVolume(volume / 100)
      } catch (err) {
        console.error('Error setting volume:', err)
      }
    }
  }, [widgetReady, volume])

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
      if (initialState && activeTrack?.permalink_url) {
        widget.load(activeTrack.permalink_url, { autoPlay: false })
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
          const tracks = tracksRef.current
          const idx = tracks.findIndex((t) => t.id === sound.id)
          if (idx >= 0) {
            setActiveTrackIndex(idx)
            // Prioritize local duration metadata if available
            if (tracks[idx].duration) {
              setDuration(tracks[idx].duration)
              return
            }
          }
          // Fallback to widget duration
          widget.getDuration((d) => setDuration(d))
        }
      })
    }

    const handleFinish = () => {
      const tracks = tracksRef.current
      const idx = indexRef.current
      if (idx < tracks.length - 1) {
        const nextIdx = idx + 1
        const track = tracks[nextIdx]
        if (track?.permalink_url) {
          setActiveTrackIndex(nextIdx)
          if (track.duration) setDuration(track.duration)
          widget.load(track.permalink_url, { autoPlay: true })
        }
      }
    }

    const handleError = () => {
      setWidgetError(true)
    }

    const events = window.SC.Widget.Events
    widget.bind(events.READY, handleReady)
    widget.bind(events.PLAY, handlePlay)
    widget.bind(events.PAUSE, handlePause)
    widget.bind(events.SOUND_CHANGE, handleSoundChange)
    widget.bind(events.FINISH, handleFinish)
    widget.bind(events.ERROR, handleError)

    return () => {
      try {
        widget.unbind(events.READY)
        widget.unbind(events.PLAY)
        widget.unbind(events.PAUSE)
        widget.unbind(events.SOUND_CHANGE)
        widget.unbind(events.FINISH)
        widget.unbind(events.ERROR)
      } catch {
        // Widget may already be destroyed
      }
    }
  }, [resolvedEmbedUrl, scriptLoaded, initialState])

  // Progress polling
  useEffect(() => {
    if (!widgetReady || !widgetRef.current) return

    progressTimerRef.current = setInterval(() => {
      widgetRef.current?.getPosition((pos) => {
        if (!isDraggingRef.current) {
          setProgress(pos)
        }
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
    if (activeTrack?.duration) {
      setDuration(activeTrack.duration)
    }
  }, [activeTrack])

  // Navigate to a specific track
  const navigateToTrack = useCallback(
    (index: number) => {
      const track = browsingTracks[index]
      if (!track?.permalink_url || !widgetRef.current) return

      setActivePlaylistKey(browsingPlaylistKey)
      setActiveTrackIndex(index)
      if (track.duration) setDuration(track.duration)

      try {
        widgetRef.current.load(track.permalink_url, {
          autoPlay: autoplayOnSelect
        })
      } catch {
        return
      }

      setShowTracks(false)
    },
    [browsingTracks, browsingPlaylistKey, autoplayOnSelect]
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
    if (activeTrackIndex > 0) {
      const prevIdx = activeTrackIndex - 1
      const track = activeTracks[prevIdx]
      if (!track?.permalink_url || !widgetRef.current) return

      setActiveTrackIndex(prevIdx)
      if (track.duration) setDuration(track.duration)
      try {
        widgetRef.current.load(track.permalink_url, { autoPlay: true })
      } catch {}
    } else {
      try {
        widgetRef.current?.prev()
      } catch {
        // Widget not ready
      }
    }
  }, [activeTrackIndex, activeTracks])

  // Next track
  const nextTrack = useCallback(() => {
    let nextIdx = activeTrackIndex + 1

    if (isShuffle && activeTracks.length > 1) {
      // Pick a random index that isn't the current one
      nextIdx = Math.floor(Math.random() * activeTracks.length)
      if (nextIdx === activeTrackIndex) {
        nextIdx = (nextIdx + 1) % activeTracks.length
      }
    }

    if (nextIdx < activeTracks.length) {
      const track = activeTracks[nextIdx]
      if (!track?.permalink_url || !widgetRef.current) return

      setActiveTrackIndex(nextIdx)
      if (track.duration) setDuration(track.duration)
      try {
        widgetRef.current.load(track.permalink_url, { autoPlay: true })
      } catch {}
    } else {
      try {
        widgetRef.current?.next()
      } catch {
        // Widget not ready
      }
    }
  }, [activeTrackIndex, activeTracks, isShuffle])

  // Seek within current track
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!widgetRef.current || !duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const targetPos = duration * pct

      setProgress(targetPos)
      if (!isDraggingRef.current) {
        try {
          widgetRef.current.seekTo(targetPos)
        } catch {}
      }
    },
    [duration]
  )

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true
    setIsDragging(true)
    handleSeek(e)
  }, [handleSeek])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !duration) return
      // We need a ref to the progress bar element to get its rect
      const progressBar = document.querySelector('.sc-player__progress')
      if (!progressBar) return
      const rect = progressBar.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      setProgress(duration * pct)
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingRef.current && widgetRef.current && duration) {
        const progressBar = document.querySelector('.sc-player__progress')
        if (progressBar) {
          const rect = progressBar.getBoundingClientRect()
          const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          widgetRef.current.seekTo(duration * pct)
        }
      }
      isDraggingRef.current = false
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, duration])

  // Playlist change handler
  const handlePlaylistChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBrowsingPlaylistKey(e.target.value)
    },
    []
  )

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      lastVolumeRef.current = volume
      setVolume(0)
    } else {
      setVolume(lastVolumeRef.current)
    }
  }, [volume])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value))
  }, [])

  // Computed values
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0
  const artworkUrl = activeTrack?.artwork_url
    ? activeTrack.artwork_url.replace('-large', '-t500x500')
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
            {activeTrack ? (
              <a
                href={activeTrack.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                title={`View "${activeTrack.title}" on SoundCloud`}
              >
                {artworkUrl ? (
                  <img
                    src={artworkUrl}
                    alt={activeTrack.title}
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
            {activeTrack ? (
              <a
                href={activeTrack.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                className="sc-player__title"
                title={`View "${activeTrack.title}" on SoundCloud`}
              >
                {activeTrack.title}
              </a>
            ) : (
              <div className="sc-player__title">No track selected</div>
            )}
            <div className="sc-player__artist">
              {activeTrack ? (
                <a
                  href={activePlaylist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View ${activePlaylist.label} on SoundCloud`}
                >
                  {activeTrack.artist}
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
                disabled={activeTracks.length === 0}
              >
                <IconPrev />
              </button>
              <button
                className="sc-player__btn sc-player__btn--play"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                disabled={!widgetReady || activeTracks.length === 0}
              >
                {isPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <button
                className="sc-player__btn sc-player__btn--next"
                onClick={nextTrack}
                aria-label="Next track"
                disabled={activeTracks.length === 0}
              >
                <IconNext />
              </button>
              <button
                className={`sc-player__btn sc-player__btn--shuffle${isShuffle ? ' sc-player__btn--active' : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
                aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
                aria-pressed={isShuffle}
              >
                <IconShuffle />
              </button>
            </>
          )}

          {showPlaylistSelect && playlistKeys.length > 1 && (
            <select
              className="sc-player__select"
              value={browsingPlaylistKey}
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

          {/* Volume Control */}
          <div className="sc-player__volume" ref={volumeRef}>
            <button
              className="sc-player__btn sc-player__btn--volume"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              onContextMenu={(e) => {
                e.preventDefault()
                toggleMute()
              }}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
              <IconVolume volume={volume} />
            </button>
            {showVolumeSlider && (
              <div className="sc-player__volume-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                />
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div
            className="sc-player__progress"
            onMouseDown={handleMouseDown}
            onTouchStart={(e) => {
              isDraggingRef.current = true
              setIsDragging(true)
              handleSeek(e)
            }}
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
            <div
              className="sc-player__progress-handle"
              style={{ left: `${progressPct}%` }}
              aria-hidden="true"
            />
            <span className="sc-player__sr-only">
              {formatTime(progress)} of {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Track List Toggle */}
        {showTrackList && browsingTracks.length > 0 && (
          <button
            className="sc-player__tracks-btn"
            onClick={() => setShowTracks((prev) => !prev)}
            aria-label={showTracks ? 'Hide track list' : 'Show track list'}
            aria-expanded={showTracks}
            aria-controls="sc-player-track-list"
          >
            <span className="sc-player__tracks-btn-icon" aria-hidden="true">
              {showTracks ? (
                <IconClose />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
              )}
            </span>
            <span className="sc-player__tracks-count">{browsingTracks.length}</span>
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
        <ul
          id="sc-player-track-list"
          className={`sc-player__tracks${showTracks ? ' sc-player__tracks--open' : ''}`}
          aria-label="Track list"
        >
          {browsingTracks.map((track, i) => {
            const isActive = browsingPlaylistKey === activePlaylistKey && i === activeTrackIndex
            return (
              <li key={`${track.id}-${i}`} className="sc-player__track-item">
                <button
                  className={`sc-player__track${isActive ? ' active' : ''}`}
                  onClick={() => navigateToTrack(i)}
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
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
