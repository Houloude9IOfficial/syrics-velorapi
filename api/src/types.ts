/**
 * Type definitions for Syrics API
 */

export type SpotifyContentType = 'track' | 'album' | 'playlist';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumImage: string;
  duration: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: string[];
  image: string;
  releaseDate: string;
  totalTracks: number;
  label?: string;
  tracks: SpotifyTrack[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  owner: string;
  image: string;
  totalTracks: number;
  tracks: SpotifyTrack[];
}

export interface AutocompleteSuggestion {
  id: string;
  name: string;
  type: SpotifyContentType;
  subtitle: string;
  image?: string;
}

export type LyricsFormatType = 'lrc' | 'srt' | 'raw';

export interface LyricsLineLrc {
  timeTag: string;
  words: string;
}

export interface LyricsLineSrt {
  index: number;
  startTime: string;
  endTime: string;
  words: string;
}

export interface LyricsResponseLrc {
  error: boolean;
  message?: string;
  syncType?: 'LINE_SYNCED' | 'UNSYNCED';
  lines?: LyricsLineLrc[];
}

export interface LyricsResponseSrt {
  error: boolean;
  message?: string;
  syncType?: 'LINE_SYNCED' | 'UNSYNCED';
  lines?: LyricsLineSrt[];
}

export interface LyricsResponseRaw {
  error: boolean;
  message?: string;
  syncType?: 'LINE_SYNCED' | 'UNSYNCED';
  lines?: string;
}

export type LyricsResponse =
  | LyricsResponseLrc
  | LyricsResponseSrt
  | LyricsResponseRaw;

export interface SpotifyData {
  type: SpotifyContentType;
  track?: SpotifyTrack;
  album?: SpotifyAlbum;
  playlist?: SpotifyPlaylist;
}

export interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
}
