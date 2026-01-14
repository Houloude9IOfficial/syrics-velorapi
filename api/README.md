# Syrics API - Node.js Module

A standalone Node.js API module extracted from Syrics for fetching Spotify track information and synced lyrics.

## Features

- 🎵 Fetch Spotify track, album, and playlist information
- 📝 Get synced lyrics in LRC, SRT, or raw text format
- 🔍 Search for Spotify content
- 🎯 Parse Spotify URLs and URIs
- 💪 TypeScript support with full type definitions
- 🚀 Simple and easy to use

## Installation

### From this repository

```bash
cd api
npm install
npm run build
```

Then in your Node.js project:

```bash
npm install /path/to/syrics-velorapi/api
```

## Quick Start

```javascript
import { 
  setCredentials, 
  fetchTrack, 
  fetchLyrics, 
  formatLyrics 
} from 'syrics-api';

// Set your Spotify API credentials
setCredentials({
  clientId: 'your_spotify_client_id',
  clientSecret: 'your_spotify_client_secret'
});

// Fetch track information
const track = await fetchTrack('3n3Ppam7vgaVa1iaRUc9Lp'); // Mr. Brightside
console.log(track);

// Fetch lyrics
const lyrics = await fetchLyrics('3n3Ppam7vgaVa1iaRUc9Lp', 'lrc');
const formattedLyrics = formatLyrics(
  lyrics, 
  'lrc', 
  track.name, 
  track.duration, 
  track.artists.join(', '), 
  track.album
);
console.log(formattedLyrics);
```

## Getting Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Copy your **Client ID** and **Client Secret**

## API Reference

### Spotify API

#### `setCredentials(credentials)`

Set your Spotify API credentials (required before making any Spotify API calls).

```javascript
setCredentials({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret'
});
```

#### `fetchTrack(trackId)`

Fetch information about a Spotify track.

```javascript
const track = await fetchTrack('3n3Ppam7vgaVa1iaRUc9Lp');
// Returns: SpotifyTrack
```

#### `fetchAlbum(albumId)`

Fetch information about a Spotify album including all tracks.

```javascript
const album = await fetchAlbum('4LH4d3cOWNNsVw41Gqt2kv');
// Returns: SpotifyAlbum
```

#### `fetchPlaylist(playlistId)`

Fetch information about a Spotify playlist including all tracks.

```javascript
const playlist = await fetchPlaylist('37i9dQZF1DXcBWIGoYBM5M');
// Returns: SpotifyPlaylist
```

#### `searchSpotify(query)`

Search for tracks, albums, and playlists on Spotify.

```javascript
const results = await searchSpotify('The Killers');
// Returns: AutocompleteSuggestion[]
```

#### `parseSpotifyLink(link)`

Parse a Spotify URL or URI to extract the content type and ID.

```javascript
const parsed = parseSpotifyLink('https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp');
// Returns: { type: 'track', id: '3n3Ppam7vgaVa1iaRUc9Lp' }
```

#### `fetchSpotifyDataFromLink(link)`

Fetch Spotify data directly from a URL or URI.

```javascript
const data = await fetchSpotifyDataFromLink('spotify:track:3n3Ppam7vgaVa1iaRUc9Lp');
// Returns: SpotifyData
```

### Lyrics API

#### `fetchLyrics(trackId, format, apiBase?)`

Fetch lyrics for a Spotify track.

```javascript
const lyrics = await fetchLyrics('3n3Ppam7vgaVa1iaRUc9Lp', 'lrc');
// Returns: LyricsResponse

// Optional: Use a custom lyrics API endpoint
const lyrics = await fetchLyrics(
  '3n3Ppam7vgaVa1iaRUc9Lp', 
  'lrc', 
  'https://your-custom-api.com'
);
```

**Supported formats:**
- `'lrc'` - LRC format with timestamps
- `'srt'` - SubRip subtitle format
- `'raw'` - Plain text without timestamps

#### `formatLyrics(lyrics, format, trackName?, duration?, artist?, album?)`

Format lyrics data into a string.

```javascript
const formatted = formatLyrics(
  lyrics,
  'lrc',
  'Mr. Brightside',
  222075,
  'The Killers',
  'Hot Fuss'
);
```

#### `formatLyricsToLrc(lyrics, trackName?, duration?, artist?, album?)`

Format lyrics specifically to LRC format with metadata.

```javascript
const lrc = formatLyricsToLrc(lyrics, 'Song Name', 180000, 'Artist', 'Album');
```

#### `formatLyricsToSrt(lyrics)`

Format lyrics to SRT subtitle format.

```javascript
const srt = formatLyricsToSrt(lyrics);
```

#### `formatLyricsToRaw(lyrics)`

Format lyrics to raw text (no timestamps).

```javascript
const raw = formatLyricsToRaw(lyrics);
```

#### `getFileExtension(format)`

Get the appropriate file extension for a lyrics format.

```javascript
const ext = getFileExtension('lrc'); // Returns: 'lrc'
```

#### `generateFilename(formatTokens, trackNumber, trackName, artist, album, format, trackId?)`

Generate a filename for lyrics based on a format template.

```javascript
const filename = generateFilename(
  ['{artist}', ' - ', '{track_name}'],
  1,
  'Mr. Brightside',
  'The Killers',
  'Hot Fuss',
  'lrc'
);
// Returns: 'The Killers - Mr. Brightside.lrc'
```

**Available tokens:**
- `{track_number}` - Track number (padded with 0)
- `{track_name}` - Track name
- `{artist}` or `{track_artist}` - Artist name
- `{album}` or `{track_album}` - Album name
- `{track_id}` - Spotify track ID

## TypeScript Support

The module includes full TypeScript type definitions:

```typescript
import type { 
  SpotifyTrack, 
  SpotifyAlbum, 
  LyricsResponse 
} from 'syrics-api';
```

## Error Handling

The API provides custom error classes for better error handling:

```javascript
import { SpotifyApiError, LyricsApiError } from 'syrics-api';

try {
  const track = await fetchTrack('invalid_id');
} catch (error) {
  if (error instanceof SpotifyApiError) {
    console.error('Spotify API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.errorCode);
  }
}

try {
  const lyrics = await fetchLyrics('track_id', 'lrc');
} catch (error) {
  if (error instanceof LyricsApiError) {
    console.error('Lyrics API Error:', error.message);
    if (error.isRateLimited) {
      console.log('Rate limited, please wait...');
    }
    if (error.isNotAvailable) {
      console.log('Lyrics not available for this track');
    }
  }
}
```

## Complete Example

See the `examples/` directory for a complete working example.

```javascript
import { 
  setCredentials, 
  fetchSpotifyDataFromLink, 
  fetchLyrics, 
  formatLyrics 
} from 'syrics-api';
import { writeFileSync } from 'fs';

// Configure API credentials
setCredentials({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function downloadLyrics(spotifyUrl) {
  try {
    // Parse and fetch Spotify data
    const data = await fetchSpotifyDataFromLink(spotifyUrl);
    
    if (data.type === 'track') {
      const track = data.track;
      
      // Fetch lyrics
      const lyrics = await fetchLyrics(track.id, 'lrc');
      
      // Format lyrics with metadata
      const formatted = formatLyrics(
        lyrics,
        'lrc',
        track.name,
        track.duration,
        track.artists.join(', '),
        track.album
      );
      
      // Save to file
      const filename = `${track.artists[0]} - ${track.name}.lrc`;
      writeFileSync(filename, formatted);
      
      console.log(`Lyrics saved to: ${filename}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Usage
downloadLyrics('https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp');
```

## Requirements

- Node.js >= 18.0.0
- Spotify API credentials (Client ID and Client Secret)

## License

MIT

## Credits

- Original Syrics web application by [Akash R. Chandran](https://akashrchandran.in)
- API extracted and adapted for Node.js use
