import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { SCPlayerProps, Track } from './types'
import './SCPlayer.css'

// ── SC Widget types ──────────────────────────────────────────────
declare global {
  interface Window {
    SC: {
      Widget: new (el: HTMLIFrameElement) => SCWidget
      Widget: { Events: Record<string, string> }
    }
  }
}

interface SCWidget {
  bind(event: string, cb: (data?: unknown) => void): void
  unbind(event: string): void
  play(): void
  pause(): void
  toggle(): void
  next(): void
  prev(): void
  load(url: string): void
  seekTo(ms: number): void
  getDuration(cb: (ms: number) => void): void
  getPosition(cb: (ms: number) => void): void
  getVolume(cb: (v: number) => void): void
  setVolume(v: number): void
  getCurrentSound(cb: (s: { id: number; title: string; user: { username: string }; artwork_url?: string } | null) => void): void
  isPaused(cb: (p: boolean) => void): void
}

// ── Helpers ──────────────────────────────────────────────────────
const formatTime = (ms: number): string => {
  if (!ms || isNaN(ms) || ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const defaultTheme = {
  bg: '#1a1a24',
  border: '#333842',
  text: '#ffffffde',
  muted: '#9ca3af',
  accent: '#aa3bff',
  accentHover: '#9a2bff',
  activeBg: 'rgba(170, 59, 255, 0.15)',
  listBg: '#242430',
  barHeight: '64px',
  borderRadius: '4px',
  fontFamily: 'Inter, system-ui, sans-serif',
}

// ── Component ────────────────────────────────────────────────────
export default function SCPlayer({
  playlists,
  defaultPlaylist,
  scEmbedUrl,
  position = 'bottom',
  showPlaylistSelect = true,
  showTrackList = true,
  showProgress = true,
  showNavButtons = true,
  autoplayOnSelect = true,
  autoplayDelay = 500,
  theme = {},
  className = '',
}: SCPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<SCWidget | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [playlistKey, setPlaylistKey] = useState(defaultPlaylist || Object.keys(playlists)[0])
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showTracks, setShowTracks] = useState(false)
  const [widgetReady, setWidgetReady] = useState(false)

  const currentPlaylist = playlists[playlistKey]
  const allTracks = currentPlaylist?.tracks || []
  const currentTrack = allTracks[currentTrackIndex] || null

  // Resolve theme
  const cssVars = useMemo(() => {
    const t = { ...defaultTheme, ...theme }
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

  // Init widget
  useEffect(() => {
    if (!iframeRef.current || !window.SC?.Widget) return
    widgetRef.current = new window.SC.Widget(iframeRef.current)
    const w = widgetRef.current

    w.bind(window.SC.Widget.Events.READY, () => {
      setWidgetReady(true)
      w.isPaused((p) => setIsPlaying(!p))
    })
    w.bind(window.SC.Widget.Events.PLAY, () => setIsPlaying(true))
    w.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false))
    w.bind(window.SC.Widget.Events.SOUND_CHANGE, () => {
      w.getCurrentSound((sound) => {
        if (sound) {
          const idx = allTracks.findIndex(s => s.id === sound.id)
          if (idx >= 0) setCurrentTrackIndex(idx)
          w.getDuration((d) => setDuration(d))
        }
      })
    })
  }, [scEmbedUrl])

  // Progress polling
  useEffect(() => {
    if (!widgetReady || !widgetRef.current) return
    const interval = setInterval(() => {
      widgetRef.current?.getPosition((p) => setProgress(p))
    }, 500)
    return () => clearInterval(interval)
  }, [widgetReady])

  // Reset on playlist change
  useEffect(() => {
    setCurrentTrackIndex(0)
    setProgress(0)
    if (allTracks[0]) setDuration(allTracks[0].duration)
  }, [playlistKey, allTracks])

  const navigateToTrack = useCallback((index: number) => {
    const track = allTracks[index]
    if (!track?.permalink_url || !widgetRef.current) return
    setCurrentTrackIndex(index)
    widgetRef.current.load(track.permalink_url)
    setShowTracks(false)
    if (autoplayOnSelect) {
      setTimeout(() => widgetRef.current?.play(), autoplayDelay)
    }
  }, [allTracks, autoplayOnSelect, autoplayDelay])

  const togglePlay = useCallback(() => widgetRef.current?.toggle(), [])

  const prevTrack = useCallback(() => {
    if (currentTrackIndex > 0) navigateToTrack(currentTrackIndex - 1)
    else widgetRef.current?.prev()
  }, [currentTrackIndex, navigateToTrack])

  const nextTrack = useCallback(() => {
    if (currentTrackIndex < allTracks.length - 1) navigateToTrack(currentTrackIndex + 1)
    else widgetRef.current?.next()
  }, [currentTrackIndex, allTracks.length, navigateToTrack])

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    widgetRef.current?.seekTo(duration * pct)
  }, [duration])

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0

  const playlistKeys = Object.keys(playlists)

  return (
    <div
      className={`sc-player sc-player--${position} ${className}`}
      style={cssVars}
    >
      {/* Hidden SoundCloud iframe */}
      <iframe
        ref={iframeRef}
        className="sc-player__iframe"
        src={scEmbedUrl}
        allow="autoplay"
        title="SoundCloud Player"
      />

      {/* Player Bar */}
      <div className="sc-player__bar">
        {/* Track Info */}
        <div className="sc-player__info">
          <div className="sc-player__artwork">
            {currentTrack?.artwork_url ? (
              <img src={currentTrack.artwork_url} alt="" />
            ) : (
              <div className="sc-player__artwork-placeholder">♪</div>
            )}
          </div>
          <div className="sc-player__text">
            <div className="sc-player__title">
              {currentTrack?.title || 'Loading...'}
            </div>
            <div className="sc-player__artist">
              {currentTrack?.artist || ''}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="sc-player__controls">
          {showNavButtons && (
            <>
              <button className="sc-player__btn sc-player__btn--prev" onClick={prevTrack} aria-label="Previous">
                ‹‹
              </button>
              <button className="sc-player__btn sc-player__btn--play" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <button className="sc-player__btn sc-player__btn--next" onClick={nextTrack} aria-label="Next">
                ››
              </button>
            </>
          )}

          {showPlaylistSelect && playlistKeys.length > 1 && (
            <select
              className="sc-player__select"
              value={playlistKey}
              onChange={(e) => setPlaylistKey(e.target.value)}
              aria-label="Select playlist"
            >
              {playlistKeys.map((key) => (
                <option key={key} value={key}>{playlists[key].label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="sc-player__progress" onClick={seek} role="slider" aria-label="Seek" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={duration}>
            <div className="sc-player__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        {/* Track List Toggle */}
        {showTrackList && allTracks.length > 0 && (
          <button
            className="sc-player__tracks-btn"
            onClick={() => setShowTracks(!showTracks)}
            aria-label="Toggle track list"
            aria-expanded={showTracks}
          >
            ☰ {allTracks.length}
          </button>
        )}
      </div>

      {/* Track List Dropdown */}
      {showTracks && showTrackList && (
        <div className="sc-player__tracks" role="list" aria-label="Track list">
          {allTracks.map((track, i) => (
            <button
              key={track.id}
              className={`sc-player__track ${i === currentTrackIndex ? 'active' : ''}`}
              onClick={() => navigateToTrack(i)}
              role="listitem"
            >
              <span className="sc-player__track-num">{i + 1}</span>
              <span className="sc-player__track-title">{track.title}</span>
              <span className="sc-player__track-dur">{formatTime(track.duration)}</span>
              {i === currentTrackIndex && isPlaying && (
                <span className="sc-player__playing" aria-label="Now playing">♫</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
