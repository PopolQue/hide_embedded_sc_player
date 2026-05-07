# Guide: Adding & Updating Tracks

This guide is for artists, label managers, and festival organizers who need to update the music in the player without touching the code.

---

## 1. Prerequisites

You will need:

- The **SoundCloud URLs** for your tracks or playlists.
- The **Numeric ID** of your SoundCloud playlist.

### How to find a Playlist ID

1. Go to your playlist on SoundCloud.
2. Click **Share** > **Embed**.
3. Look for the code snippet. The ID is the number after `/playlists/` in the `api.soundcloud.com` URL.

---

## 2. Updating `playlists.json`

All track data lives in `src/lib/playlists.json`. Open this file and follow this structure:

```json
{
  "2024": {
    "label": "2024 Releases",
    "playlistId": "1839382410",
    "url": "https://soundcloud.com/your-profile/sets/2024",
    "tracks": [
      {
        "id": 12345678,
        "title": "Artist Name - Song Title",
        "artist": "Artist Name",
        "duration": 185000,
        "artwork_url": "https://i1.sndcdn.com/artworks-xxx-t500x500.jpg",
        "permalink_url": "https://soundcloud.com/artist/song-title"
      }
    ]
  }
}
```

### Important Fields

- **`id`**: Numeric track ID (found via "Share" > "Embed" on the individual track).
- **`duration`**: Length of the song in milliseconds (e.g., 3 minutes = 180,000ms).
- **`artwork_url`**: Use the high-res version ending in `-t500x500.jpg`.

---

## 3. Syncing for the Web (Standalone Version)

If your website uses the "Standalone" or "Shell" version (the non-React version), you must sync the data after editing the JSON file.

### Steps

1. Open your terminal in the project root.
2. Run this command:

   ```bash
   node -e "const fs = require('fs'); const data = fs.readFileSync('src/lib/playlists.json', 'utf8'); fs.writeFileSync('standalone/playlists.js', 'window.PLAYER_PLAYLISTS = ' + data);"
   ```

3. Upload the newly updated `standalone/playlists.js` to your web server.

---

## Common Mistakes

- **Missing Commas:** JSON is strict. Ensure every item in a list has a comma except the last one.
- **Wrong ID:** Using the user ID instead of the track/playlist ID will cause the player to be blank.
- **Private Tracks:** If a track is private, it **will not play** unless you include the "Secret Token" in the `permalink_url` (e.g., `.../song-title/s-xxxxxx`).
