/**
 * Syrics API - Main entry point
 * Export all public APIs for use in Node.js applications
 */

// Export Spotify API
export {
  setCredentials,
  clearTokenCache,
  validateClientCredentials,
  searchSpotify,
  fetchTrack,
  fetchAlbum,
  fetchPlaylist,
  parseSpotifyLink,
  fetchSpotifyData,
  fetchSpotifyDataFromLink,
  SpotifyApiError,
} from './spotify.js';

// Export Lyrics API
export {
  fetchLyrics,
  formatLyrics,
  formatLyricsToLrc,
  formatLyricsToSrt,
  formatLyricsToRaw,
  getFileExtension,
  generateFilename,
  LyricsApiError,
} from './lyrics.js';

// Export all types
export type {
  SpotifyContentType,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyPlaylist,
  AutocompleteSuggestion,
  LyricsFormatType,
  LyricsLineLrc,
  LyricsLineSrt,
  LyricsResponseLrc,
  LyricsResponseSrt,
  LyricsResponseRaw,
  LyricsResponse,
  SpotifyData,
  SpotifyCredentials,
} from './types.js';
