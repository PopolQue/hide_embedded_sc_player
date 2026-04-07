import { useRef, useState, useEffect, useCallback } from 'react'
import type { SCSound, SCWidget } from '../types/sc-widget'
import './CustomPlayer.css'

// Global SC object from soundcloud.com/player/api.js
declare const SC: {
  Widget: {
    new (iframe: HTMLIFrameElement): SCWidget
    Events: {
      READY: string
      PLAY: string
      PAUSE: string
      PLAY_PROGRESS: string
      FINISH: string
      ERROR: string
      SOUND_CHANGE: string
    }
  }
}

interface CustomPlayerProps {
  playlistUrl: string
}

export default function CustomPlayer({ playlistUrl }: CustomPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<SCWidget | null>(null)
  const [widgetReady, setWidgetReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracks, setTracks] = useState<SCSound[]>([])
  const [currentTrack, setCurrentTrack] = useState<SCSound | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isLoading, setIsLoading] = useState(true)
  
  // Refs für Track-Navigation
  const targetTrackIndex = useRef<number | null>(null)
  const isNavigating = useRef(false)
  const currentTrackIndexRef = useRef(0)
  const navigateToTrackRef = useRef<((index: number) => void) | null>(null)

  // Helper: Einzelnen Track-Schritt machen
  navigateToTrackRef.current = (index: number) => {
    if (!widgetRef.current) return
    
    const currentIndex = currentTrackIndexRef.current
    const diff = index - currentIndex
    
    if (diff === 0) {
      // Schon am Ziel
      isNavigating.current = false
      targetTrackIndex.current = null
      widgetRef.current.play()
      return
    }
    
    if (diff > 0) {
      widgetRef.current.next()
    } else {
      widgetRef.current.prev()
    }
  }

  // Widget initialisieren
  useEffect(() => {
    if (!iframeRef.current || !window.SC?.Widget) return

    const widget = new window.SC.Widget(iframeRef.current)
    widgetRef.current = widget

    // Event Listener
    widget.bind(SC.Widget.Events.READY, () => {
      setWidgetReady(true)
      setIsLoading(false)
      
      // Track-Liste laden
      widget.getSounds((sounds: SCSound[]) => {
        setTracks(sounds)
        if (sounds.length > 0) {
          setCurrentTrack(sounds[0])
          setCurrentTrackIndex(0)
        }
      })

      // Duration laden
      widget.getDuration((dur: number) => {
        setDuration(dur)
      })
    })

    widget.bind(SC.Widget.Events.PLAY, () => {
      setIsPlaying(true)
    })

    widget.bind(SC.Widget.Events.PAUSE, () => {
      setIsPlaying(false)
    })

    widget.bind(SC.Widget.Events.PLAY_PROGRESS, (data: unknown) => {
      const progressData = data as { loadedProgress?: number; currentPosition?: number }
      if (progressData.currentPosition !== undefined) {
        setProgress(progressData.currentPosition)
      }
    })

    widget.bind(SC.Widget.Events.FINISH, () => {
      // Zum nächsten Track springen
      widget.next()
    })

    widget.bind(SC.Widget.Events.SOUND_CHANGE, () => {
      // Track-Wechsel erkannt - Daten aktualisieren
      widget.getSounds((sounds: SCSound[]) => {
        setTracks(sounds)
        widget.getCurrentSound((sound: SCSound | null) => {
          if (sound) {
            setCurrentTrack(sound)
            const index = sounds.findIndex(s => s.id === sound.id)
            setCurrentTrackIndex(index >= 0 ? index : 0)
            widget.getDuration((dur: number) => {
              setDuration(dur)
            })
            
            // Wenn wir navigieren, prüfe ob wir am Ziel sind
            if (isNavigating.current && targetTrackIndex.current !== null) {
              if (index === targetTrackIndex.current) {
                // Ziel erreicht
                isNavigating.current = false
                targetTrackIndex.current = null
                widget.play()
              } else {
                // Weiter navigieren
                navigateToTrackRef.current?.(targetTrackIndex.current)
              }
            }
          }
        })
      })
      widget.getPosition((pos: number) => {
        setProgress(pos)
      })
    })

    return () => {
      widget.unbind(SC.Widget.Events.READY)
      widget.unbind(SC.Widget.Events.PLAY)
      widget.unbind(SC.Widget.Events.PAUSE)
      widget.unbind(SC.Widget.Events.PLAY_PROGRESS)
      widget.unbind(SC.Widget.Events.FINISH)
      widget.unbind(SC.Widget.Events.SOUND_CHANGE)
    }
  }, [])

  // Progress Interval
  useEffect(() => {
    if (!widgetReady || !widgetRef.current) return

    const interval = setInterval(() => {
      widgetRef.current?.getPosition((pos: number) => {
        setProgress(pos)
      })
      widgetRef.current?.getDuration((dur: number) => {
        setDuration(dur)
      })
    }, 500)

    return () => clearInterval(interval)
  }, [widgetReady])

  // currentTrackIndexRef synchron halten
  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex
  }, [currentTrackIndex])

  const togglePlay = useCallback(() => {
    if (!widgetRef.current) return
    widgetRef.current.toggle()
  }, [])

  const nextTrack = useCallback(() => {
    if (!widgetRef.current) return
    widgetRef.current.next()
    widgetRef.current.getSounds((sounds: SCSound[]) => {
      widgetRef.current?.getCurrentSound((sound: SCSound | null) => {
        if (sound) {
          const index = sounds.findIndex(s => s.id === sound.id)
          setCurrentTrack(sound)
          setCurrentTrackIndex(index >= 0 ? index : 0)
        }
      })
    })
  }, [])

  const prevTrack = useCallback(() => {
    if (!widgetRef.current) return
    widgetRef.current.prev()
    widgetRef.current.getSounds((sounds: SCSound[]) => {
      widgetRef.current?.getCurrentSound((sound: SCSound | null) => {
        if (sound) {
          const index = sounds.findIndex(s => s.id === sound.id)
          setCurrentTrack(sound)
          setCurrentTrackIndex(index >= 0 ? index : 0)
        }
      })
    })
  }, [])

  const seekTo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setProgress(value)
    widgetRef.current?.seekTo(value)
  }, [])

  const changeVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setVolume(value)
    widgetRef.current?.setVolume(value)
  }, [])

  const playTrack = useCallback((index: number) => {
    if (!widgetRef.current) return

    if (index === currentTrackIndexRef.current) {
      // Gleicher Track, einfach abspielen
      widgetRef.current.play()
      return
    }

    // Navigation starten
    targetTrackIndex.current = index
    isNavigating.current = true
    
    // Ersten Schritt auslösen
    navigateToTrackRef.current?.(index)
  }, [])

  const formatTime = (ms: number) => {
    if (!ms || isNaN(ms) || ms <= 0) return '0:00'
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="customPlayer">
      {/* Versteckter iframe */}
      <iframe
        ref={iframeRef}
        className="hiddenPlayer"
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={playlistUrl}
      ></iframe>

      {isLoading && (
        <div className="playerLoading">
          <div className="spinner"></div>
          <p>Player wird geladen...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Current Track Info */}
          <div className="trackInfo">
            {currentTrack?.artwork_url ? (
              <img 
                src={currentTrack.artwork_url.replace('-large', '-t500x500')} 
                alt="Artwork" 
                className="trackArtwork"
              />
            ) : (
              <div className="trackArtwork placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            )}
            <div className="trackDetails">
              <h3 className="trackTitle">{currentTrack?.title || 'Unbekannter Track'}</h3>
              <p className="trackArtist">{currentTrack?.user?.username || ''}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="controls">
            <button className="controlButton" onClick={prevTrack} aria-label="Vorheriger Track">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <button 
              className="controlButton playPause" 
              onClick={togglePlay} 
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                {isPlaying ? (
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                ) : (
                  <path d="M8 5v14l11-7z"/>
                )}
              </svg>
            </button>
            
            <button className="controlButton" onClick={nextTrack} aria-label="Nächster Track">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="progressBar">
            <span className="time">{formatTime(progress)}</span>
            <input
              type="range"
              className="progressSlider"
              min={0}
              max={duration || 1}
              value={progress}
              onChange={seekTo}
              aria-label="Fortschritt"
            />
            <span className="time">{formatTime(duration)}</span>
          </div>

          {/* Volume */}
          <div className="volumeControl">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <input
              type="range"
              className="volumeSlider"
              min={0}
              max={100}
              value={volume}
              onChange={changeVolume}
              aria-label="Lautstärke"
            />
          </div>

          {/* Track List */}
          {tracks.length > 0 && (
            <div className="trackList">
              <h3 className="trackListTitle">Playlist ({tracks.length} Tracks)</h3>
              <ul>
                {tracks.map((track, index) => (
                  <li
                    key={track.id || `track-${index}`}
                    className={`trackListItem ${index === currentTrackIndex ? 'active' : ''}`}
                    onClick={() => playTrack(index)}
                  >
                    <span className="trackNumber">{index + 1}</span>
                    <div className="trackListInfo">
                      <p className="trackListTitle">{track.title || `Track ${index + 1}`}</p>
                      <p className="trackListDuration">{formatTime(track.duration)}</p>
                    </div>
                    {index === currentTrackIndex && isPlaying && (
                      <div className="playingIndicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
