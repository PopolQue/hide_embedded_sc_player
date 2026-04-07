/// <reference types="vite/client" />

interface SCWidget {
  bind(eventName: string, callback: (data?: unknown) => void): void
  unbind(eventName: string): void
  play(): void
  pause(): void
  toggle(): void
  next(): void
  prev(): void
  seekTo(milliseconds: number): void
  getSoundId(callback: (id: number) => void): void
  getCurrentSound(callback: (sound: SCSound | null) => void): void
  getSounds(callback: (sounds: SCSound[]) => void): void
  getDuration(callback: (duration: number) => void): void
  getPosition(callback: (position: number) => void): void
  getVolume(callback: (volume: number) => void): void
  setVolume(volume: number): void
  isPaused(callback: (paused: boolean) => void): void
}

interface SCSound {
  id: number
  title: string
  user: {
    username: string
  }
  duration: number
  artwork_url?: string
  permalink_url: string
}

interface SCWidgetStatic {
  new (iframeOrElement: HTMLIFrameElement | HTMLElement): SCWidget
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

interface SC {
  Widget: SCWidgetStatic
}

declare global {
  interface Window {
    SC: SC
  }
}

export type { SCWidget, SCSound }

