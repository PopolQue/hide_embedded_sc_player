// fetch-playlist-tracks.js
// Fetches tracks from SoundCloud playlist page
// Usage: node fetch-playlist-tracks.js

const PLAYLIST_URL = 'https://soundcloud.com/kleinundhaarig/sets/kuh2024'

async function fetchTracks() {
    // Try multiple proxies
    const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(PLAYLIST_URL)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(PLAYLIST_URL)}`,
    ]
    
    let html = null
    
    for (const proxyUrl of proxies) {
        try {
            console.log(`Trying: ${proxyUrl.substring(0, 40)}...`)
            const resp = await fetch(proxyUrl, { 
                signal: AbortSignal.timeout(10000),
                headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            
            if (resp.ok) {
                const text = await resp.text()
                if (text.includes('soundcloud') || text.includes('playlist')) {
                    html = text
                    console.log('  -> Success!')
                    break
                }
            }
            console.log('  -> Failed')
        } catch (e) {
            console.log(`  -> Error: ${e.message}`)
        }
    }
    
    if (!html) {
        console.error('All proxies failed')
        return
    }
    
    // Try different patterns
    const patterns = [
        [/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/, (d) => d.props?.pageProps?.data?.playlist],
        [/window\.__sc_hydration\s*=\s*(\[[\s\S]*?\]);/s, (d) => {
            const item = d.find?.(x => x.type === 'playlist' || x.type === 'playlistV2')
            return item?.props?.data?.playlist || item?.data?.playlist
        }],
    ]
    
    for (const [pattern, extractor] of patterns) {
        const match = html.match(pattern)
        if (match) {
            console.log(`Found pattern: ${pattern.toString().substring(0, 50)}`)
            try {
                const data = JSON.parse(match[1])
                console.log(`  Data type: ${Array.isArray(data) ? 'array' : typeof data}`)
                if (Array.isArray(data)) {
                    console.log(`  Array length: ${data.length}`)
                    console.log(`  Types: ${data.map(x => x.type).join(', ')}`)
                }
                
                const playlist = extractor(data)
                
                if (playlist?.tracks?.length) {
                    const tracks = playlist.tracks.map((t, i) => ({
                        id: t.id,
                        title: t.title || `Track ${i + 1}`,
                        artist: t.user?.username || '',
                        duration: t.duration || t.full_duration || 0,
                        artwork_url: t.artwork_url || null,
                    }))
                    
                    console.log(`\nFound ${tracks.length} tracks:`)
                    tracks.forEach((t, i) => {
                        const min = Math.floor(t.duration / 60000)
                        const sec = Math.floor((t.duration % 60000) / 1000)
                        console.log(`  ${i + 1}. ${t.artist} - ${t.title} (${min}:${String(sec).padStart(2, '0')})`)
                    })
                    
                    const fs = await import('fs')
                    fs.writeFileSync('./public/tracks-2024.json', JSON.stringify(tracks, null, 2))
                    console.log('\nSaved to ./public/tracks-2024.json')
                    return
                }
            } catch (e) {
                console.log(`  Parse error: ${e.message}`)
            }
        }
    }
    
    console.error('Could not extract tracks data')
    console.log('Tip: Open the playlist in browser, view page source, search for "tracks" and manually copy the data')
}

fetchTracks().catch(console.error)
