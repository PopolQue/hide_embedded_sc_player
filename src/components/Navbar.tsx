import { useState } from 'react'
import { useContentNavigation } from '../hooks/useContentNavigation'
import './Navbar.css'

interface NavbarProps {
  activeLink?: string
}

export default function Navbar({ activeLink = 'news' }: NavbarProps) {
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const { navigate } = useContentNavigation()

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'festival', label: 'Festival' },
    { id: 'news', label: 'News' },
    { id: 'lineup', label: 'Lineup' },
    { id: 'tickets', label: 'Tickets' },
  ]

  return (
    <>
      <nav className={`navbar ${flyoutOpen ? 'flyoutOpen' : ''}`}>
        <div className="contentLeft">
          <a href="/" className="logo">
            <img 
              src="/raupe_kuh_2025.svg" 
              alt="Klein und Haarig Logo" 
              className={`logoIcon ${flyoutOpen ? 'logoFlyoutDark' : ''}`}
            />
          </a>
          <div className="navigation">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`/${link.id}`}
                className={`navLink ${activeLink === link.id ? 'active' : ''}`}
              >
                <span className="navLinkLabel">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="contentRight">
          <button 
            className="menuButton"
            onClick={() => setFlyoutOpen(!flyoutOpen)}
            aria-label="Menü öffnen"
          >
            <span className="menuIcon"></span>
          </button>
        </div>
      </nav>

      {flyoutOpen && (
        <div className="navbarFlyout" onClick={() => setFlyoutOpen(false)}>
          <div className="navigation" onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`/${link.id}`}
                className={`navLink ${activeLink === link.id ? 'active' : ''}`}
                onClick={() => {
                  setFlyoutOpen(false)
                  navigate(`/${link.id}`)
                }}
              >
                <span className="navLinkLabel">{link.label}</span>
              </a>
            ))}
          </div>
          <div className="contact">
            <p>Kontakt</p>
            <a href="mailto:info@kleinundhaarig.de">info@kleinundhaarig.de</a>
          </div>
        </div>
      )}
    </>
  )
}
