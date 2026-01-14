
![syrics image](https://ik.imagekit.io/gyzvlawdz/Projects/syrics/Black_Modern_Business_Logo__600___500_px___2240___1260_px__cYRO9HGTQ.png)
<div align="center">
A web application to download synced spotify lyrics in LRC format.
</div>

***

# Live Deployment
You can find site live deployed at https://syrics-web.vercel.app/

***

# Node.js API Module

Looking to use Syrics in your Node.js server? We've extracted the core API functionality into a standalone module!

📦 **The API module is located in the [`/api`](./api) directory.**

## Quick Start

```javascript
import { setCredentials, fetchTrack, fetchLyrics } from 'syrics-api';

// Set your Spotify credentials
setCredentials({
  clientId: 'your_spotify_client_id',
  clientSecret: 'your_spotify_client_secret'
});

// Fetch track info and lyrics
const track = await fetchTrack('3n3Ppam7vgaVa1iaRUc9Lp');
const lyrics = await fetchLyrics(track.id, 'lrc');
```

## Features

- 🎵 Fetch Spotify track, album, and playlist information
- 📝 Get synced lyrics in LRC, SRT, or raw text format
- 🔍 Search for Spotify content
- 🎯 Parse Spotify URLs and URIs
- 💪 Full TypeScript support
- 🚀 Simple and easy to use

## Installation & Documentation

See the [API README](./api/README.md) for complete documentation, examples, and installation instructions.

***

# Web Application Example
![msedge_jVd1HDSu2S](https://user-images.githubusercontent.com/78685510/218275201-2398b823-5228-4a11-abb8-a615ec6a14e1.gif)

# Credits
• [Me](https://akashrchandran.in)
  -> For everything.
