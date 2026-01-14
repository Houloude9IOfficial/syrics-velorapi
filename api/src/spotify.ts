/**
 * Spotify API Module for Node.js
 * Handles all Spotify API interactions using Client Credentials flow
 */

import {
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyPlaylist,
  AutocompleteSuggestion,
  SpotifyData,
  SpotifyContentType,
  SpotifyCredentials,
} from './types.js';

// Spotify API endpoints
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Cache for access token
let accessToken: string | null = null;
let tokenExpiry: number = 0;
let cachedCredentials: SpotifyCredentials | null = null;

/**
 * Error class for Spotify API errors
 */
export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'SpotifyApiError';
  }
}

/**
 * Set Spotify credentials for API access
 */
export const setCredentials = (credentials: SpotifyCredentials): void => {
  cachedCredentials = credentials;
  // Clear token cache when credentials change
  accessToken = null;
  tokenExpiry = 0;
};

/**
 * Get stored credentials
 */
const getCredentials = (): SpotifyCredentials => {
  if (!cachedCredentials) {
    throw new SpotifyApiError(
      'Spotify credentials not configured. Please call setCredentials() first.',
      401,
      'CREDENTIALS_MISSING'
    );
  }
  return cachedCredentials;
};

/**
 * Validate client credentials by attempting to authenticate
 */
export const validateClientCredentials = async (
  clientId: string,
  clientSecret: string
): Promise<boolean> => {
  const response = await fetch(SPOTIFY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as any;
    throw new SpotifyApiError(
      error.error_description ||
        'Invalid credentials. Please check your Client ID and Client Secret.',
      response.status,
      error.error
    );
  }

  return true;
};

/**
 * Get or refresh the access token using Client Credentials flow
 */
const getAccessToken = async (): Promise<string> => {
  // Return cached token if still valid (with 60s buffer)
  if (accessToken && Date.now() < tokenExpiry - 60000) {
    return accessToken;
  }

  const { clientId, clientSecret } = getCredentials();

  const response = await fetch(SPOTIFY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as any;
    throw new SpotifyApiError(
      error.error_description || 'Failed to authenticate with Spotify',
      response.status,
      error.error
    );
  }

  const data = (await response.json()) as any;
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return accessToken!;
};

/**
 * Clear the cached access token
 */
export const clearTokenCache = (): void => {
  accessToken = null;
  tokenExpiry = 0;
};

/**
 * Make an authenticated request to the Spotify API
 */
const spotifyFetch = async <T>(endpoint: string): Promise<T> => {
  const token = await getAccessToken();

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as any;

    if (response.status === 401) {
      // Token expired, clear cache and retry once
      accessToken = null;
      tokenExpiry = 0;
      const newToken = await getAccessToken();

      const retryResponse = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });

      if (!retryResponse.ok) {
        throw new SpotifyApiError(
          error.error?.message || 'Spotify API request failed',
          retryResponse.status,
          error.error?.status
        );
      }

      return (await retryResponse.json()) as T;
    }

    throw new SpotifyApiError(
      error.error?.message || 'Spotify API request failed',
      response.status,
      error.error?.status
    );
  }

  return (await response.json()) as T;
};

// Spotify API response types
interface SpotifyApiImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyApiArtist {
  id: string;
  name: string;
}

interface SpotifyApiTrack {
  id: string;
  name: string;
  artists: SpotifyApiArtist[];
  album: {
    id: string;
    name: string;
    images: SpotifyApiImage[];
  };
  duration_ms: number;
}

interface SpotifyApiAlbum {
  id: string;
  name: string;
  artists: SpotifyApiArtist[];
  images: SpotifyApiImage[];
  release_date: string;
  total_tracks: number;
  label: string;
  tracks: {
    items: SpotifyApiTrack[];
    next: string | null;
    total: number;
  };
}

interface SpotifyApiPlaylist {
  id: string;
  name: string;
  owner: {
    display_name: string;
  };
  images: SpotifyApiImage[];
  tracks: {
    items: Array<{
      track: SpotifyApiTrack | null;
    }>;
    next: string | null;
    total: number;
  };
}

interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyApiTrack[];
  };
  albums?: {
    items: SpotifyApiAlbum[];
  };
  playlists?: {
    items: SpotifyApiPlaylist[];
  };
}

/**
 * Get the best quality image from Spotify images array
 */
const getBestImage = (images: SpotifyApiImage[]): string => {
  if (!images || images.length === 0) return '';
  const sorted = [...images].sort((a, b) => (b.width || 0) - (a.width || 0));
  return sorted[0]?.url || '';
};

/**
 * Transform Spotify API track to our format
 */
const transformTrack = (
  track: SpotifyApiTrack,
  albumImage?: string
): SpotifyTrack => ({
  id: track.id,
  name: track.name,
  artists: track.artists.map((a) => a.name),
  album: track.album?.name || '',
  albumImage: albumImage || getBestImage(track.album?.images || []),
  duration: track.duration_ms,
});

/**
 * Transform Spotify API album to our format
 */
const transformAlbum = (album: SpotifyApiAlbum): SpotifyAlbum => ({
  id: album.id,
  name: album.name,
  artists: album.artists.map((a) => a.name),
  image: getBestImage(album.images),
  releaseDate: album.release_date,
  totalTracks: album.total_tracks,
  label: album.label,
  tracks: album.tracks.items.map((t) =>
    transformTrack(t, getBestImage(album.images))
  ),
});

/**
 * Transform Spotify API playlist to our format
 */
const transformPlaylist = (playlist: SpotifyApiPlaylist): SpotifyPlaylist => ({
  id: playlist.id,
  name: playlist.name,
  owner: playlist.owner.display_name,
  image: getBestImage(playlist.images),
  totalTracks: playlist.tracks.total,
  tracks: playlist.tracks.items
    .filter((item) => item.track !== null)
    .map((item) => transformTrack(item.track!)),
});

/**
 * Search Spotify for tracks, albums, and playlists
 */
export const searchSpotify = async (
  query: string
): Promise<AutocompleteSuggestion[]> => {
  if (!query.trim() || query.length < 2) return [];

  const encodedQuery = encodeURIComponent(query);
  const data = await spotifyFetch<SpotifySearchResponse>(
    `/search?q=${encodedQuery}&type=track,album,playlist&limit=5`
  );

  const suggestions: AutocompleteSuggestion[] = [];

  // Add tracks
  if (data.tracks?.items) {
    data.tracks.items.forEach((track) => {
      suggestions.push({
        id: track.id,
        name: track.name,
        type: 'track' as SpotifyContentType,
        subtitle: track.artists.map((a) => a.name).join(', '),
        image: getBestImage(track.album?.images || []),
      });
    });
  }

  // Add albums
  if (data.albums?.items) {
    data.albums.items.forEach((album) => {
      suggestions.push({
        id: album.id,
        name: album.name,
        type: 'album' as SpotifyContentType,
        subtitle: `${album.artists.map((a) => a.name).join(', ')} • ${
          album.release_date?.split('-')[0] || ''
        }`,
        image: getBestImage(album.images),
      });
    });
  }

  // Add playlists
  if (data.playlists?.items) {
    data.playlists.items.forEach((playlist) => {
      if (playlist) {
        suggestions.push({
          id: playlist.id,
          name: playlist.name,
          type: 'playlist' as SpotifyContentType,
          subtitle: `${playlist.tracks.total} songs • ${playlist.owner.display_name}`,
          image: getBestImage(playlist.images),
        });
      }
    });
  }

  return suggestions;
};

/**
 * Fetch a track by ID
 */
export const fetchTrack = async (id: string): Promise<SpotifyTrack> => {
  const data = await spotifyFetch<SpotifyApiTrack>(`/tracks/${id}`);
  return transformTrack(data);
};

/**
 * Fetch an album by ID with all tracks
 */
export const fetchAlbum = async (id: string): Promise<SpotifyAlbum> => {
  const data = await spotifyFetch<SpotifyApiAlbum>(`/albums/${id}`);
  const album = transformAlbum(data);

  // Fetch additional tracks if there are more than 50
  if (data.tracks.next) {
    let nextUrl = data.tracks.next;
    while (nextUrl) {
      const additionalTracks = await spotifyFetch<{
        items: SpotifyApiTrack[];
        next: string | null;
      }>(nextUrl.replace(SPOTIFY_API_BASE, ''));

      album.tracks.push(
        ...additionalTracks.items.map((t) => transformTrack(t, album.image))
      );
      nextUrl = additionalTracks.next || '';
    }
  }

  return album;
};

/**
 * Fetch a playlist by ID with all tracks
 */
export const fetchPlaylist = async (id: string): Promise<SpotifyPlaylist> => {
  const data = await spotifyFetch<SpotifyApiPlaylist>(`/playlists/${id}`);
  const playlist = transformPlaylist(data);

  // Fetch additional tracks if there are more than 100
  if (data.tracks.next) {
    let nextUrl = data.tracks.next;
    while (nextUrl) {
      const additionalTracks = await spotifyFetch<{
        items: Array<{ track: SpotifyApiTrack | null }>;
        next: string | null;
      }>(nextUrl.replace(SPOTIFY_API_BASE, ''));

      playlist.tracks.push(
        ...additionalTracks.items
          .filter((item) => item.track !== null)
          .map((item) => transformTrack(item.track!))
      );
      nextUrl = additionalTracks.next || '';
    }
  }

  return playlist;
};

/**
 * Parse a Spotify URL or URI to extract the type and ID
 */
export const parseSpotifyLink = (
  input: string
): { type: SpotifyContentType; id: string } | null => {
  // Handle Spotify URIs (spotify:track:xxx, spotify:album:xxx, spotify:playlist:xxx)
  const uriMatch = input.match(/spotify:(track|album|playlist):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    return {
      type: uriMatch[1] as SpotifyContentType,
      id: uriMatch[2],
    };
  }

  // Handle Spotify URLs (https://open.spotify.com/track/xxx, etc.)
  const urlMatch = input.match(
    /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/
  );
  if (urlMatch) {
    return {
      type: urlMatch[1] as SpotifyContentType,
      id: urlMatch[2],
    };
  }

  return null;
};

/**
 * Fetch Spotify data based on type and ID
 */
export const fetchSpotifyData = async (
  id: string,
  type: SpotifyContentType
): Promise<SpotifyData> => {
  switch (type) {
    case 'track': {
      const track = await fetchTrack(id);
      return { type: 'track', track };
    }
    case 'album': {
      const album = await fetchAlbum(id);
      return { type: 'album', album };
    }
    case 'playlist': {
      const playlist = await fetchPlaylist(id);
      return { type: 'playlist', playlist };
    }
    default:
      throw new SpotifyApiError('Invalid content type', 400, 'INVALID_TYPE');
  }
};

/**
 * Fetch Spotify data from a URL or URI
 */
export const fetchSpotifyDataFromLink = async (
  link: string
): Promise<SpotifyData> => {
  const parsed = parseSpotifyLink(link);

  if (!parsed) {
    throw new SpotifyApiError(
      'Invalid Spotify link. Please use a valid Spotify URL or URI.',
      400,
      'INVALID_LINK'
    );
  }

  return fetchSpotifyData(parsed.id, parsed.type);
};
