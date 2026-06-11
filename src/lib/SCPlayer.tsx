import React, { useRef, useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react'
import type { SCPlayerProps, SCWidget } from './types.ts'
import { usePlayer } from './PlayerContext.tsx'
import './SCPlayer.css'

import desktopLogo from './images/sc-logo-desktop.png'
import mobileLogo from './images/sc-logo-mobile.png'

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

function IconShuffle({ color }: { color?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill={color || "currentColor"} width="16" height="16" aria-hidden="true">
            <path d="M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.58L5.41,20L17.96,7.46L20,9.5V4H14.5M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z" />
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

function IconClose({ size = 16, color = "currentColor" }: { size?: number, color?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill={color} width={size} height={size} aria-hidden="true">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
    )
}

function IconChevronLeft({ size = 16, color = "currentColor" }: { size?: number, color?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill={color} width={size} height={size} aria-hidden="true">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
    )
}

function IconChevronRight({ size = 16, color = "currentColor" }: { size?: number, color?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill={color} width={size} height={size} aria-hidden="true">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
    )
}

function IconDropdown({ size = 16, color = "currentColor" }: { size?: number, color?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill={color} width={size} height={size} aria-hidden="true">
            <path d="M7 10l5 5 5-5z" />
        </svg>
    )
}

function IconBurgerMenu({ size = 16, color = "currentColor" }: { size?: number, color?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill={color} width={size} height={size} aria-hidden="true">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
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
export function SCPlayer({
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
    theme = {},
    className = '',
}: SCPlayerProps) {
    const {
        isPlaying, setIsPlaying,
        activePlaylistKey, setActivePlaylistKey,
        activeTrackIndex, setActiveTrackIndex,
        progress, setProgress,
        volume, setVolume
    } = usePlayer();

    const getPlaylistLabel = (label: string) => label.replace(/KuH/gi, '').trim();

    /** Reference to the hidden SoundCloud iframe required by the Widget API */
    const iframeRef = useRef<HTMLIFrameElement>(null)
    /** Reference to the initialized SoundCloud Widget instance */
    const widgetRef = useRef<SCWidget | null>(null)
    /** Timer used for polling playback progress from the widget */
    const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    /** Timer used for delaying duration updates to prevent progress bar flickering */
    const durationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Local State (non-playback state) ──────────────────────────────────
    /** Key identifying the playlist currently being browsed in the track list */
    const [browsingPlaylistKey, setBrowsingPlaylistKey] = useState(activePlaylistKey)
    /** Whether the volume slider is visible */
    const [showVolumeSlider, setShowVolumeSlider] = useState(false)
    /** Whether the track list slide-up panel is visible */
    const [showTracks, setShowTracks] = useState(false)
    /** Whether the playlist menu is visible */
    const [showPlaylists, setShowPlaylists] = useState(false)
    /** Whether the SoundCloud Widget API has successfully initialized */
    const [widgetReady, setWidgetReady] = useState(false)
    /** Whether an error occurred while loading the widget or tracks */
    const [widgetError, setWidgetError] = useState(false)
    /** Whether the external SoundCloud Widget script has been loaded into the DOM */
    const [scriptLoaded, setScriptLoaded] = useState(() => !!window.SC?.Widget)

    // Restore volume logic
    const lastVolumeRef = useRef(volume > 0 ? volume : 100)
    
    const playlistKeys = Object.keys(playlists)
    const volumeRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)
    const rowRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const browsingPlaylist = playlists[browsingPlaylistKey]
    const browsingTracks = browsingPlaylist?.tracks ?? []

    const activePlaylist = playlists[activePlaylistKey]
    const activeTracks = activePlaylist?.tracks ?? []
    const activeTrack = activeTracks[activeTrackIndex] ?? null

    const [duration, setDuration] = useState(() => {
        const pl = playlists[activePlaylistKey]
        const tr = pl?.tracks?.[activeTrackIndex]
        return tr?.duration ?? 0
    })

    useLayoutEffect(() => {
        const checkOverflow = () => {
            if (rowRef.current && innerRef.current) {
                setIsOverflowing(innerRef.current.scrollWidth > rowRef.current.clientWidth);
            }
        };
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [activeTrack, browsingPlaylistKey]);

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

    // Update browser tab title when playing
    useEffect(() => {
        const baseTitle = "Hidden SoundCloud Player"
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
                widgetRef.current.setVolume(volume)
            } catch (err) {
                console.error('Error setting volume:', err)
            }
        }
    }, [widgetReady, volume])

    // Resolve theme to CSS custom properties
    const cssVars = useMemo(() => {
        const vars: Record<string, string> = {}
        if (theme.bg) vars['--scp-bg'] = theme.bg
        if (theme.border) vars['--scp-border'] = theme.border
        if (theme.text) vars['--scp-text'] = theme.text
        if (theme.muted) vars['--scp-muted'] = theme.muted
        if (theme.accent) vars['--scp-accent'] = theme.accent
        if (theme.accentHover) vars['--scp-accent-hover'] = theme.accentHover
        if (theme.activeBg) vars['--scp-active-bg'] = theme.activeBg
        if (theme.listBg) vars['--scp-list-bg'] = theme.listBg
        if (theme.barHeight) vars['--scp-bar-h'] = theme.barHeight
        if (theme.borderRadius) vars['--scp-radius'] = theme.borderRadius
        if (theme.fontFamily) vars['--scp-font'] = theme.fontFamily
        return vars as React.CSSProperties
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

            // Always load the individual track URL to ensure single-track mode and correct duration scaling
            if (activeTrack?.permalink_url) {
                widget.load(activeTrack.permalink_url, { autoPlay: false })
            }

            widget.isPaused((paused) => setIsPlaying(!paused))
        }

        const handlePlay = () => {
            setIsPlaying(true)
        }
        const handlePause = () => setIsPlaying(false)

        const handleSoundChange = () => {
            widget.getCurrentSound((sound) => {
                if (sound) {
                    // Try to find the track in our local list to get its metadata
                    const idx = tracksRef.current.findIndex((t) => t.id === sound.id)
                    if (idx >= 0) {
                        const track = tracksRef.current[idx]
                        setActiveTrackIndex(idx)

                        if (durationTimeoutRef.current) clearTimeout(durationTimeoutRef.current)
                        durationTimeoutRef.current = setTimeout(() => {
                            // Prefer local duration if available, otherwise use widget duration
                            if (track.duration) {
                                setDuration(track.duration)
                            } else {
                                widget.getDuration((d) => setDuration(d))
                            }
                        }, 500)
                        return
                    }

                    if (durationTimeoutRef.current) clearTimeout(durationTimeoutRef.current)
                    durationTimeoutRef.current = setTimeout(() => {
                        // Fallback to widget duration
                        widget.getDuration((d) => setDuration(d))
                    }, 500)
                }
            })
        }

        const handleFinish = () => {
            // Call nextTrack
            // We use a delayed call to avoid widget state conflicts
            setTimeout(() => {
                nextTrack()
            }, 100)
        }

        const handleError = () => {
            setWidgetError(true)
        }

        const events = window.SC.Widget?.Events
        if (!events) return

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
                // Widget may already be destroyed — ignore
            }
        }
        // Only re-init when embed URL changes or script loads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedEmbedUrl, scriptLoaded])

    // Progress polling
    useEffect(() => {
        if (!widgetReady || !widgetRef.current || !isPlaying) {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current)
                progressTimerRef.current = null
            }
            return
        }

        progressTimerRef.current = setInterval(() => {
            if (isDraggingRef.current) return
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
    }, [widgetReady, isPlaying])

    useEffect(() => {
        return () => {
            if (durationTimeoutRef.current) {
                clearTimeout(durationTimeoutRef.current)
                durationTimeoutRef.current = null
            }
        }
    }, [])

    // Navigate to a specific track
    const navigateToTrack = useCallback(
        (index: number, playlistKeyOverride?: string) => {
            const targetPlaylistKey = playlistKeyOverride || browsingPlaylistKey
            const targetTracks = playlists[targetPlaylistKey]?.tracks ?? []
            const track = targetTracks[index]
            if (!track?.permalink_url || !widgetRef.current) return

            setActivePlaylistKey(targetPlaylistKey)
            setActiveTrackIndex(index)
            setProgress(0)

            if (durationTimeoutRef.current) clearTimeout(durationTimeoutRef.current)
            if (track.duration) {
                durationTimeoutRef.current = setTimeout(() => {
                    setDuration(track.duration!)
                }, 500)
            }

            try {
                widgetRef.current.load(track.permalink_url)
            } catch {
                // Widget error — graceful fallback
                return
            }

            if (autoplayOnSelect) {
                const attemptPlay = (retries: number) => {
                    setTimeout(() => {
                        try {
                            widgetRef.current?.play()
                        } catch {
                            if (retries > 0) {
                                attemptPlay(retries - 1)
                            } else {
                                setIsPlaying(false)
                            }
                        }
                    }, autoplayDelay * (4 - retries)) // Increasing delay per retry
                }
                attemptPlay(3)
            }
        },
        [browsingPlaylistKey, browsingTracks, autoplayOnSelect, autoplayDelay]
    )

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        if (!widgetRef.current) return
        try {
            if (isPlaying) {
                widgetRef.current.pause()
            } else {
                widgetRef.current.play()
            }
        } catch (err) {
            console.error('SCPlayer: Error toggling playback', err)
        }
    }, [isPlaying])

    // Previous track
    const prevTrack = useCallback(() => {
        const currentIndex = indexRef.current
        const currentPlaylistKey = activePlaylistKeyRef.current

        if (currentIndex > 0) {
            navigateToTrack(currentIndex - 1, currentPlaylistKey)
        } else {
            try {
                widgetRef.current?.prev()
            } catch {
                // Widget not ready
            }
        }
    }, [navigateToTrack])

    // Next track
    const nextTrack = useCallback(() => {
        const currentTracks = tracksRef.current
        const currentIndex = indexRef.current
        const currentPlaylistKey = activePlaylistKeyRef.current

        if (currentIndex < currentTracks.length - 1) {
            navigateToTrack(currentIndex + 1, currentPlaylistKey)
        } else {
            try {
                widgetRef.current?.next()
            } catch {
                // Widget not ready
            }
        }
    }, [navigateToTrack])

    // Play a random track from a random playlist
    const playRandomTrack = useCallback(() => {
        const keys = Object.keys(playlists)
        const randomPlaylistKey = keys[Math.floor(Math.random() * keys.length)]
        const randomPlaylist = playlists[randomPlaylistKey]
        const randomTracks = randomPlaylist?.tracks ?? []

        if (randomTracks.length > 0) {
            const randomIndex = Math.floor(Math.random() * randomTracks.length)
            navigateToTrack(randomIndex, randomPlaylistKey)
            setBrowsingPlaylistKey(randomPlaylistKey)
        }
    }, [playlists, navigateToTrack])

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
                allow="autoplay; encrypted-media"
                title="SoundCloud Player (hidden)"
                tabIndex={-1}
            />

            {/* Error state */}
            {widgetError && (
                <div className="sc-player__error" role="alert">
                    <span>SoundCloud player unavailable. Please reload the page.</span>
                    <button
                        type="button"
                        className="sc-player__error-close"
                        onClick={() => setWidgetError(false)}
                        aria-label="Close error message"
                    >
                        <IconClose size={16} />
                    </button>
                </div>
            )}

            {/* Player Bar */}
            <div className="sc-player__bar">
                <div className="sc-player__bar-desktop">
                    <div className="sc-player__bar-left">
                        {/* Track Info */}
                        <div className="sc-player__info">
                            <div className="sc-player__artwork">
                                {activeTrack ? (
                                    <a
                                        href={activeTrack.permalink_url}
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
                                {activeTrack ? (
                                    <a
                                        href={activeTrack.permalink_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sc-player__title"
                                        title="View on SoundCloud"
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
                    </div>

                    <div className="sc-player__bar-center">
                        {/* Controls */}
                        <div className="sc-player__controls">
                            {showNavButtons && (
                                <>
                                    <div className="sc-player__controls-side sc-player__controls-side--left">
                                        <button
                                            type="button"
                                            className="sc-player__btn"
                                            onClick={playRandomTrack}
                                            title="Play Random Track"
                                            aria-label="Play Random Track"
                                        >
                                            <IconShuffle />
                                        </button>
                                        <button
                                            type="button"
                                            className="sc-player__btn"
                                            onClick={prevTrack}
                                            disabled={activeTracks.length === 0}
                                            aria-label="Previous track"
                                        >
                                            <IconChevronLeft />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className="sc-player__btn scp-play-button"
                                        onClick={togglePlay}
                                        disabled={!widgetReady || activeTracks.length === 0}
                                        aria-label={isPlaying ? "Pause" : "Play"}
                                        style={{
                                            backgroundColor: 'var(--scp-accent)',
                                        } as React.CSSProperties}
                                    >
                                        {isPlaying ? <IconPause /> : <IconPlay />}
                                    </button>
                                    <div className="sc-player__controls-side sc-player__controls-side--right">
                                        <button
                                            type="button"
                                            className="sc-player__btn"
                                            onClick={nextTrack}
                                            disabled={activeTracks.length === 0}
                                            aria-label="Next track"
                                        >
                                            <IconChevronRight />
                                        </button>
                                        <div className="sc-player__volume" ref={volumeRef}>
                                            <button
                                                type="button"
                                                className="sc-player__btn"
                                                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                                                title="Volume"
                                                aria-label="Volume settings"
                                            >
                                                <IconVolume volume={volume} />
                                            </button>
                                            {showVolumeSlider && (
                                                <div className="sc-player__volume-popover">
                                                    <div className="sc-player__volume-slider-container">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            step="1"
                                                            value={volume}
                                                            onChange={(e) => {
                                                                const newVol = parseInt(e.target.value, 10)
                                                                setVolume(newVol)
                                                                if (newVol > 0) lastVolumeRef.current = newVol
                                                            }}
                                                            className="sc-player__volume-slider"
                                                            aria-label="Volume"
                                                            // @ts-ignore - non-standard attribute for vertical slider
                                                            orient="vertical"
                                                            style={{
                                                                background: `linear-gradient(to top, var(--scp-accent) ${volume}%, rgba(187, 187, 187, 0.1) ${volume}%)`
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="sc-player__volume-mute"
                                                        onClick={() => {
                                                            if (volume > 0) {
                                                                lastVolumeRef.current = volume
                                                                setVolume(0)
                                                            } else {
                                                                setVolume(lastVolumeRef.current)
                                                            }
                                                        }}
                                                        title={volume === 0 ? "Unmute" : "Mute"}
                                                        aria-label={volume === 0 ? "Unmute" : "Mute"}
                                                    >
                                                        <IconVolume volume={volume} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="sc-player__bar-right">
                        {/* Progress Bar */}
                        {showProgress && (
                            <div className="sc-player__progress-container">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 1}
                                    step="1"
                                    value={progress}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value)
                                        setProgress(val)
                                        widgetRef.current?.seekTo(val)
                                    }}
                                    onMouseDown={() => {
                                        isDraggingRef.current = true
                                    }}
                                    onMouseUp={() => {
                                        isDraggingRef.current = false
                                    }}
                                    onTouchStart={() => {
                                        isDraggingRef.current = true
                                    }}
                                    onTouchEnd={() => {
                                        isDraggingRef.current = false
                                    }}
                                    className="sc-player__progress-input"
                                    aria-label="Playback progress"
                                    style={{
                                        background: `linear-gradient(to right, var(--scp-accent) ${progressPct}%, rgba(187, 187, 187, 0.1) ${progressPct}%)`
                                    }}
                                />
                                <span className="sc-player__sr-only">
                                    {formatTime(progress)} of {formatTime(duration)}
                                </span>
                            </div>
                        )}

                        {/* Playlist Selection Toggle (Desktop) */}
                        {showPlaylistSelect && playlistKeys.length > 1 && (
                            <button
                                type="button"
                                className="sc-player__tracks-btn"
                                onClick={() => setShowPlaylists(!showPlaylists)}
                                aria-label="Toggle playlist menu"
                            >
                                <IconDropdown />
                                <span className="sc-player__tracks-count">{getPlaylistLabel(playlists[browsingPlaylistKey].label)}</span>
                            </button>
                        )}
                        {/* Track List Toggle */}
                        {showTrackList && browsingTracks.length > 0 && (
                            <button
                                type="button"
                                className="sc-player__tracks-btn"
                                onClick={() => setShowTracks((prev) => !prev)}
                                aria-label="Toggle track list"
                            >
                                <IconBurgerMenu />
                                <span className="sc-player__tracks-count">{browsingTracks.length}</span>
                            </button>
                        )}

                        {/* SoundCloud Logo */}
                        <a
                            href={scAccountUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sc-player__logo"
                            style={{ backgroundImage: `url(${desktopLogo})` }}
                            aria-label="Visit our SoundCloud"
                        ></a>
                    </div>
                </div>
                {/* End of sc-player__bar-desktop */}

                {/* Mobile Bar */}
                <div className="sc-player__bar-mobile">
                    {/* Progress Bar */}
                    {showProgress && (
                        <div className="sc-player__progress-container">
                            <input
                                type="range"
                                min="0"
                                max={duration || 1}
                                step="1"
                                value={progress}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value)
                                    setProgress(val)
                                    widgetRef.current?.seekTo(val)
                                }}
                                className="sc-player__progress-input"
                                aria-label="Playback progress"
                                style={{
                                    background: `linear-gradient(to right, var(--scp-accent) ${progressPct}%, rgba(187, 187, 187, 0.1) ${progressPct}%)`
                                }}
                            />
                        </div>
                    )}

                    {/* Middle Row: Title */}
                    <div className="sc-player__text-row" ref={rowRef}>
                        <div className={`sc-player__marquee-inner${isOverflowing ? ' is-overflowing' : ''}`} ref={innerRef}>
                            <div className="sc-player__title">
                                {activeTrack ? activeTrack.title : 'No track selected'}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="sc-player__bottom-row">
                        {/* 1. Left Group: Track Image | Logo | Random Button */}
                        <div className="sc-player__left-group">
                            <div className="sc-player__artwork">
                                {artworkUrl ? (
                                    <a href={activeTrack?.permalink_url || '#'} target="_blank" rel="noopener noreferrer"><img src={artworkUrl} alt="" /></a>
                                ) : <IconMusic />}
                            </div>
                            {/* Logo */}
                            <a 
                                href={scAccountUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="sc-player__logo sc-player__logo--mobile"
                                style={{ backgroundImage: `url(${mobileLogo})` }}
                            ></a>

                            <button type="button" className="sc-player__btn" onClick={playRandomTrack}><IconShuffle /></button>
                        </div>

                        {/* 4. Player Controls (Prev | Play/Pause | Next) */}
                        <div className="sc-player__controls-centered">
                            <div className="sc-player__btn--prev">
                                <button type="button" className="sc-player__btn" onClick={prevTrack} aria-label="Previous track"><IconChevronLeft /></button>
                            </div>
                            <div className="sc-player__btn--play">
                                <button
                                    type="button"
                                    className="sc-player__btn scp-play-button"
                                    onClick={togglePlay}
                                    style={{
                                        backgroundColor: 'var(--scp-accent)',
                                    } as React.CSSProperties}
                                >
                                    {isPlaying ? <IconPause /> : <IconPlay />}
                                </button>
                            </div>
                            <div className="sc-player__btn--next">
                                <button type="button" className="sc-player__btn" onClick={nextTrack} aria-label="Next track"><IconChevronRight /></button>
                            </div>
                        </div>

                        {/* 3. Right Group: Playlist Selection | Tracklist Menu */}
                        <div className="sc-player__right-group">
                            {showPlaylistSelect && playlistKeys.length > 1 && (
                                <button
                                    type="button"
                                    className="sc-player__tracks-btn"
                                    onClick={() => setShowPlaylists(!showPlaylists)}
                                    aria-label="Toggle playlist menu"
                                >
                                    <IconDropdown />
                                    <span className="sc-player__tracks-count">{getPlaylistLabel(playlists[browsingPlaylistKey].label)}</span>
                                </button>
                            )}

                            {showTrackList && (
                                <div className="sc-player__tracks-btn-mobile">
                                    <button
                                        type="button"
                                        className="sc-player__tracks-btn"
                                        onClick={() => setShowTracks(!showTracks)}
                                        aria-label="Toggle track list"
                                    >
                                        <IconBurgerMenu />
                                        <span className="sc-player__tracks-count">{browsingTracks.length}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showTrackList && (
                <div
                    id="sc-player-track-list"
                    className={`sc-player__tracks${showTracks ? ' sc-player__tracks--open' : ''}`}
                    role="list"
                    aria-label="Track list"
                >
                    {browsingTracks.map((track, i) => {
                        const isCurrentlyPlayingTrack = activeTrack?.id === track.id && activePlaylistKey === browsingPlaylistKey
                        return (
                            <button
                                key={`${track.id}-${i}`}
                                type="button"
                                className={`sc-player__track${isCurrentlyPlayingTrack ? ' active' : ''}`}
                                onClick={() => navigateToTrack(i)}
                                role="listitem"
                                aria-current={isCurrentlyPlayingTrack && isPlaying ? 'true' : undefined}
                            >
                                <span className="sc-player__track-num" aria-hidden="true">
                                    {i + 1}
                                </span>
                                <span className="sc-player__track-title">{track.title}</span>
                                {isCurrentlyPlayingTrack && isPlaying && (
                                    <span
                                        className="sc-player__playing"
                                        aria-label="Currently playing"
                                    >
                                        ♫
                                    </span>
                                )}
                                <span className="sc-player__track-dur">
                                    {formatTime(track.duration)}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Playlist Panel */}
            {showPlaylists && (
                <div
                    id="sc-player-playlist-menu"
                    className={`sc-player__playlists sc-player__tracks--open`}
                    role="list"
                    aria-label="Playlist menu"
                >
                    {playlistKeys.map((key) => (
                        <button
                            key={key}
                            type="button"
                            className={`sc-player__track${browsingPlaylistKey === key ? ' active' : ''}`}
                            onClick={() => {
                                setBrowsingPlaylistKey(key);
                                setShowPlaylists(false);
                            }}
                        >
                            <span className="sc-player__track-title" style={{ whiteSpace: 'normal', overflow: 'visible' }}>{playlists[key].label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SCPlayer
