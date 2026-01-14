/**
 * Complete example of using the Syrics API in a Node.js application
 * 
 * This example demonstrates:
 * - Setting up credentials
 * - Fetching track information
 * - Fetching lyrics in different formats
 * - Saving lyrics to files
 * - Error handling
 * 
 * Usage:
 *   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=xxx node example.js
 */

import { writeFileSync } from 'fs';
import {
  setCredentials,
  fetchTrack,
  fetchAlbum,
  fetchPlaylist,
  fetchSpotifyDataFromLink,
  fetchLyrics,
  formatLyrics,
  generateFilename,
  SpotifyApiError,
  LyricsApiError,
} from '../dist/index.js';

// Get credentials from environment variables
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Error: Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables');
  console.error('');
  console.error('Usage:');
  console.error('  SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=xxx node example.js');
  process.exit(1);
}

// Configure the API with credentials
setCredentials({
  clientId,
  clientSecret,
});

/**
 * Example 1: Fetch a single track and its lyrics
 */
async function example1() {
  console.log('\n=== Example 1: Fetch Track and Lyrics ===\n');
  
  try {
    // Fetch track information
    const trackId = '3n3Ppam7vgaVa1iaRUc9Lp'; // The Killers - Mr. Brightside
    const track = await fetchTrack(trackId);
    
    console.log('Track Information:');
    console.log(`  Name: ${track.name}`);
    console.log(`  Artist: ${track.artists.join(', ')}`);
    console.log(`  Album: ${track.album}`);
    console.log(`  Duration: ${Math.floor(track.duration / 1000)}s`);
    console.log('');
    
    // Fetch lyrics in LRC format
    const lyrics = await fetchLyrics(trackId, 'lrc');
    
    console.log('Lyrics Information:');
    console.log(`  Sync Type: ${lyrics.syncType}`);
    console.log(`  Lines: ${lyrics.lines?.length || 0}`);
    console.log('');
    
    // Format and save lyrics
    const formatted = formatLyrics(
      lyrics,
      'lrc',
      track.name,
      track.duration,
      track.artists.join(', '),
      track.album
    );
    
    const filename = generateFilename(
      ['{artist}', ' - ', '{track_name}'],
      1,
      track.name,
      track.artists[0],
      track.album,
      'lrc'
    );
    
    writeFileSync(filename, formatted);
    console.log(`✓ Lyrics saved to: ${filename}`);
    
  } catch (error) {
    if (error instanceof LyricsApiError) {
      if (error.isNotAvailable) {
        console.error('✗ Lyrics not available for this track');
      } else if (error.isRateLimited) {
        console.error('✗ Rate limited. Please wait before trying again.');
      } else {
        console.error(`✗ Lyrics Error: ${error.message}`);
      }
    } else if (error instanceof SpotifyApiError) {
      console.error(`✗ Spotify Error: ${error.message}`);
    } else {
      console.error(`✗ Error: ${error.message}`);
    }
  }
}

/**
 * Example 2: Parse a Spotify URL and fetch data
 */
async function example2() {
  console.log('\n=== Example 2: Parse Spotify URL ===\n');
  
  try {
    const spotifyUrl = 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b'; // Blinding Lights
    
    const data = await fetchSpotifyDataFromLink(spotifyUrl);
    
    if (data.type === 'track' && data.track) {
      console.log('✓ Successfully parsed track URL');
      console.log(`  ${data.track.artists[0]} - ${data.track.name}`);
    }
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
}

/**
 * Example 3: Fetch an album with all tracks
 */
async function example3() {
  console.log('\n=== Example 3: Fetch Album ===\n');
  
  try {
    const albumId = '4LH4d3cOWNNsVw41Gqt2kv'; // The Killers - Hot Fuss
    const album = await fetchAlbum(albumId);
    
    console.log('Album Information:');
    console.log(`  Name: ${album.name}`);
    console.log(`  Artist: ${album.artists.join(', ')}`);
    console.log(`  Release Date: ${album.releaseDate}`);
    console.log(`  Total Tracks: ${album.totalTracks}`);
    console.log('');
    console.log('Tracks:');
    
    album.tracks.slice(0, 5).forEach((track, index) => {
      console.log(`  ${index + 1}. ${track.name}`);
    });
    
    if (album.tracks.length > 5) {
      console.log(`  ... and ${album.tracks.length - 5} more`);
    }
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
}

/**
 * Example 4: Fetch playlist
 */
async function example4() {
  console.log('\n=== Example 4: Fetch Playlist ===\n');
  
  try {
    const playlistId = '37i9dQZF1DXcBWIGoYBM5M'; // Today's Top Hits
    const playlist = await fetchPlaylist(playlistId);
    
    console.log('Playlist Information:');
    console.log(`  Name: ${playlist.name}`);
    console.log(`  Owner: ${playlist.owner}`);
    console.log(`  Total Tracks: ${playlist.totalTracks}`);
    console.log('');
    console.log('First 5 tracks:');
    
    playlist.tracks.slice(0, 5).forEach((track, index) => {
      console.log(`  ${index + 1}. ${track.artists.join(', ')} - ${track.name}`);
    });
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
}

/**
 * Example 5: Different lyrics formats
 */
async function example5() {
  console.log('\n=== Example 5: Different Lyrics Formats ===\n');
  
  try {
    const trackId = '3n3Ppam7vgaVa1iaRUc9Lp';
    
    // Fetch in LRC format
    console.log('Fetching LRC format...');
    const lrcLyrics = await fetchLyrics(trackId, 'lrc');
    const lrcFormatted = formatLyrics(lrcLyrics, 'lrc');
    writeFileSync('example-lrc.lrc', lrcFormatted);
    console.log('✓ Saved: example-lrc.lrc');
    
    // Fetch in SRT format
    console.log('Fetching SRT format...');
    const srtLyrics = await fetchLyrics(trackId, 'srt');
    const srtFormatted = formatLyrics(srtLyrics, 'srt');
    writeFileSync('example-srt.srt', srtFormatted);
    console.log('✓ Saved: example-srt.srt');
    
    // Fetch in raw format
    console.log('Fetching raw format...');
    const rawLyrics = await fetchLyrics(trackId, 'raw');
    const rawFormatted = formatLyrics(rawLyrics, 'raw');
    writeFileSync('example-raw.txt', rawFormatted);
    console.log('✓ Saved: example-raw.txt');
    
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
}

/**
 * Run all examples
 */
async function main() {
  console.log('Syrics API Examples');
  console.log('==================');
  
  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  
  console.log('\n✓ All examples completed!\n');
}

main().catch(console.error);
