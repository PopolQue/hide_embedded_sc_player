import { useEffect } from 'react'

/**
 * Hook für Navigation im Content-Frame
 * Sendet postMessage an die Shell statt window.location zu ändern
 */
export function useContentNavigation() {
  useEffect(() => {
    // Alle internen Links abfangen
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (!link) return
      
      const href = link.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('#') || link.target === '_blank') {
        return
      }

      e.preventDefault()
      
      // Shell benachrichtigen
      window.parent.postMessage({
        type: 'NAVIGATE',
        url: href
      }, '*')
    }

    document.addEventListener('click', handleClick, true)
    
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  // Navigation-Funktion für programmatische Navigation
  const navigate = (url: string) => {
    window.parent.postMessage({
      type: 'NAVIGATE',
      url
    }, '*')
  }

  return { navigate }
}
