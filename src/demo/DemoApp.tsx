import SCPlayer from '../lib/SCPlayer'
import { PLAYLISTS } from '../lib/data'
import { PlayerProvider } from '../lib/PlayerContext'

export default function DemoApp() {
  return (
    <PlayerProvider>
      <SCPlayer
        playlists={PLAYLISTS}
        defaultPlaylist="2024"
        scEmbedUrl="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A1839382410&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true"
        position="bottom"
      />
    </PlayerProvider>
  )
}
