import SCPlayer from '../lib/SCPlayer'

/**
 * Custom Icons Example
 * 
 * The SCPlayer is designed to be lean, but you can easily swap out
 * the internal icons by wrapping the component or modifying the 
 * SVG paths in the source.
 * 
 * If you want to use an external library like Lucide or FontAwesome:
 */

// 1. In your project, you would modify SCPlayer.tsx directly 
//    or pass them as children if the component supported it.
// 2. Currently, the most efficient way is to replace the 
//    internal SVG functions:

/*
function IconPlay() {
  return <LucidePlay size={20} />
}
*/

export default function CustomApp() {
  return (
    <SCPlayer
      playlists={{}} // Your data
      theme={{
        // Use the theme object to match your icon library's colors
        accent: '#3b82f6',
        borderRadius: '999px' // Circular artwork to match modern styles
      }}
    />
  )
}
