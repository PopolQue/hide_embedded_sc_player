/**
 * @kleinundhaarig/sc-player
 *
 * A reusable, themeable SoundCloud player component for React.
 *
 * @example
 * ```tsx
 * import SCPlayer from '@kleinundhaarig/sc-player'
 * import '@kleinundhaarig/sc-player/style.css'
 *
 * function App() {
 *   return <SCPlayer playlists={myPlaylists} scEmbedUrl={embedUrl} />
 * }
 * ```
 */

import { SCPlayer } from './SCPlayer.tsx'
export { SCPlayer }
export default SCPlayer
export { PLAYLISTS } from './data.ts'

export type {
    Track,
    Playlist,
    ThemeConfig,
    PlayerConfig,
    SCPlayerProps,
    SCWidget,
    SCSound,
    SCUser,
    SCWidgetEvents,
    SoundCloudAPI,
} from './types.ts'
