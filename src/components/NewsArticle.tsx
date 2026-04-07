import CustomPlayer from './CustomPlayer'
import './NewsArticle.css'

export default function NewsArticle() {
  const soundcloudPlaylistUrl = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A1839382410&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false'

  return (
    <section className="newsArticle">
      <div className="newsArticleContent">
        <div className="newsHeader">
          <p className="newsCategory">Recordings</p>
          <h1 className="newsTitle">Recordings from KUH24</h1>
          <p className="newsDate">April 2025</p>
        </div>
        <div className="newsBody">
          <p className="newsText">
            Die Aufzeichnungen vom Klein und Haarig Festival 2024 sind jetzt verfügbar. 
            Alle Sets könnt ihr euch hier anhören.
          </p>
          
          <CustomPlayer playlistUrl={soundcloudPlaylistUrl} />
        </div>
      </div>
    </section>
  )
}
