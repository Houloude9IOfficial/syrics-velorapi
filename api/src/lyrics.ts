/**
 * Lyrics API Module for Node.js
 * Provides functions to fetch and format Spotify lyrics
 */

import {
  LyricsFormatType,
  LyricsResponse,
  LyricsResponseLrc,
  LyricsResponseSrt,
  LyricsResponseRaw,
} from './types.js';

// Constants
const DEFAULT_LYRICS_API_BASE = 'https://syrics-api.vercel.app';
const RATE_LIMIT_WAIT_TIME_SECONDS = 30;

export class LyricsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRateLimited: boolean = false,
    public isNotAvailable: boolean = false
  ) {
    super(message);
    this.name = 'LyricsApiError';
  }
}

/**
 * Fetch lyrics for a Spotify track
 * @param trackId - Spotify track ID
 * @param format - Lyrics format (lrc, srt, or raw)
 * @param apiBase - Base URL for the lyrics API (defaults to https://syrics-api.vercel.app)
 * @returns Promise with lyrics data
 */
export const fetchLyrics = async (
  trackId: string,
  format: LyricsFormatType = 'lrc',
  apiBase: string = DEFAULT_LYRICS_API_BASE
): Promise<LyricsResponse> => {
  const url = `${apiBase}/?trackid=${trackId}&format=${format}`;

  const response = await fetch(url);
  
  if (response.status === 429) {
    throw new LyricsApiError(
      `Rate limited. Please wait ${RATE_LIMIT_WAIT_TIME_SECONDS} seconds.`,
      429,
      true,
      false
    );
  }
  
  if (response.status === 404) {
    throw new LyricsApiError(
      'Lyrics not available on Spotify',
      404,
      false,
      true
    );
  }
  
  let data: LyricsResponse;
  try {
    data = (await response.json()) as LyricsResponse;
  } catch {
    throw new LyricsApiError(
      `Failed to fetch lyrics: ${response.statusText}`,
      response.status,
      false,
      false
    );
  }
  
  if (data.error) {
    throw new LyricsApiError(
      data.message || 'Failed to fetch lyrics',
      response.status,
      false,
      false
    );
  }
  
  return data;
};

/**
 * Format lyrics to LRC format
 */
export const formatLyricsToLrc = (
  lyrics: LyricsResponseLrc,
  trackName?: string,
  duration?: number,
  artist?: string,
  album?: string
): string => {
  const lines: string[] = [];

  if (trackName) lines.push(`[ti:${trackName}]`);
  if (artist) lines.push(`[ar:${artist}]`);
  if (album) lines.push(`[al:${album}]`);
  if (duration)
    lines.push(
      `[length:${Math.floor(duration / 60000)}:${Math.floor(
        (duration % 60000) / 1000
      )
        .toString()
        .padStart(2, '0')}]`
    );
  lines.push('');

  if (lyrics.lines && Array.isArray(lyrics.lines)) {
    for (const line of lyrics.lines) {
      if (line.timeTag) {
        lines.push(`[${line.timeTag}]${line.words}`);
      } else {
        lines.push(line.words);
      }
    }
  }

  return lines.join('\n');
};

/**
 * Format lyrics to SRT format
 */
export const formatLyricsToSrt = (lyrics: LyricsResponseSrt): string => {
  const lines: string[] = [];

  if (lyrics.lines && Array.isArray(lyrics.lines)) {
    for (const line of lyrics.lines) {
      lines.push(`${line.index}`);
      lines.push(`${line.startTime} --> ${line.endTime}`);
      lines.push(line.words);
      lines.push('');
    }
  }

  return lines.join('\n');
};

/**
 * Format lyrics to raw text format
 */
export const formatLyricsToRaw = (lyrics: LyricsResponseRaw): string => {
  return lyrics.lines || '';
};

/**
 * Format lyrics based on the specified format
 */
export const formatLyrics = (
  lyrics: LyricsResponse,
  format: LyricsFormatType,
  trackName?: string,
  duration?: number,
  artist?: string,
  album?: string
): string => {
  switch (format) {
    case 'srt':
      return formatLyricsToSrt(lyrics as LyricsResponseSrt);
    case 'raw':
      return formatLyricsToRaw(lyrics as LyricsResponseRaw);
    default:
      return formatLyricsToLrc(
        lyrics as LyricsResponseLrc,
        trackName,
        duration,
        artist,
        album
      );
  }
};

/**
 * Get file extension for the given format
 */
export const getFileExtension = (format: LyricsFormatType): string => {
  switch (format) {
    case 'raw':
      return 'txt';
    case 'lrc':
      return 'lrc';
    case 'srt':
      return 'srt';
    default:
      return 'lrc';
  }
};

/**
 * Generate a filename for lyrics
 */
export const generateFilename = (
  formatTokens: string[],
  trackNumber: number,
  trackName: string,
  artist: string,
  album: string,
  format: LyricsFormatType,
  trackId?: string
): string => {
  const sanitize = (str: string): string => {
    return str.replace(/[<>:"/\\|?*]/g, '_').trim();
  };

  const parts = formatTokens.map((token) => {
    switch (token) {
      case '{track_number}':
        return trackNumber.toString().padStart(2, '0');
      case '{track_name}':
        return sanitize(trackName);
      case '{track_artist}':
      case '{artist}':
        return sanitize(artist);
      case '{track_album}':
      case '{album}':
        return sanitize(album);
      case '{track_id}':
        return trackId || '';
      default:
        return token;
    }
  });

  const extension = getFileExtension(format);
  return `${parts.join('')}.${extension}`;
};
