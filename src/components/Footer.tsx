import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerContent">
        <div className="footerSection">
          <h3 className="footerTitle">Klein und Haarig</h3>
          <p className="footerText">
            Ein Festival von Bunte Platte e.V.
          </p>
        </div>
        
        <div className="footerSection">
          <h3 className="footerTitle">Links</h3>
          <ul className="footerLinks">
            <li><a href="/about">About</a></li>
            <li><a href="/festival">Festival</a></li>
            <li><a href="/news">News</a></li>
            <li><a href="/contact">Kontakt</a></li>
          </ul>
        </div>
        
        <div className="footerSection">
          <h3 className="footerTitle">Social</h3>
          <ul className="footerLinks">
            <li><a href="https://instagram.com/kleinundhaarig" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://soundcloud.com/kleinundhaarig" target="_blank" rel="noopener noreferrer">SoundCloud</a></li>
            <li><a href="https://facebook.com/kleinundhaarig" target="_blank" rel="noopener noreferrer">Facebook</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footerBottom">
        <p>&copy; {new Date().getFullYear()} Bunte Platte e.V. Alle Rechte vorbehalten.</p>
        <div className="footerBottomLinks">
          <a href="/impressum">Impressum</a>
          <a href="/datenschutz">Datenschutz</a>
        </div>
      </div>
    </footer>
  )
}
