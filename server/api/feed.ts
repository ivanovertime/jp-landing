type FeedItem = {
  id: string
  provider: 'youtube' | 'spotify'
  type: string
  embedUrl: string
  aspectRatio?: string
  height?: string
  title?: string
  date?: string
}

type FeedResponse = {
  updatedAt: string
  items: FeedItem[]
  artist?: SpotifyArtist
}

export default defineEventHandler(async (event): Promise<FeedResponse> => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')

  const config = useRuntimeConfig()
  const items: FeedItem[] = []

  const youtubeItems = await fetchYouTubeItems({
    channelUrl: config.youtubeChannelUrl,
    channelId: config.youtubeChannelId
  })
  items.push(...youtubeItems)

  const spotifyConfig = {
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    artistId: config.spotifyArtistId
  }

  const spotifyItems = await fetchSpotifyItems(spotifyConfig)
  items.push(...spotifyItems)

  const spotifyArtist = await fetchSpotifyArtist(spotifyConfig)

  const nowIso = new Date().toISOString()
  const normalizedItems = items
    .filter((item): item is FeedItem => Boolean(item && item.id && item.embedUrl))
    .map((item) => ({
      ...item,
      date: item.date || nowIso
    }))

  normalizedItems.sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0
    const bTime = b.date ? new Date(b.date).getTime() : 0
    return bTime - aTime
  })

  return {
    updatedAt: new Date().toISOString(),
    items: normalizedItems,
    artist: spotifyArtist || undefined
  }
})

type YouTubeConfig = {
  channelUrl: string
  channelId?: string
}

async function fetchYouTubeItems({ channelUrl, channelId }: YouTubeConfig): Promise<FeedItem[]> {
  try {
    const resolvedChannelId = channelId || await resolveYouTubeChannelId(channelUrl)
    if (!resolvedChannelId) {
      return []
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${resolvedChannelId}`
    const xml = await $fetch<string>(feedUrl, { responseType: 'text' })
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 4)

    return entries.map((match) => {
      const entry = match[1] ?? ''
      const videoId = extractXmlValue(entry, 'yt:videoId')
      const title = extractXmlValue(entry, 'title')
      const published = extractXmlValue(entry, 'published')

      return {
        id: `yt_${videoId}`,
        provider: 'youtube',
        type: 'video',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        aspectRatio: '16/9',
        title,
        date: published
      }
    })
  } catch {
    return []
  }
}

async function resolveYouTubeChannelId(channelUrl: string): Promise<string | null> {
  if (channelUrl.includes('/channel/')) {
    const match = channelUrl.match(/\/channel\/([^/?]+)/)
    return match?.[1] ?? null
  }

  try {
    const html = await fetchYouTubeHtml(channelUrl)
    const match = html.match(/"channelId":"(UC[^"]+)"/)
    if (match?.[1]) {
      return match[1]
    }

    const handleUrl = toYouTubeHandleUrl(channelUrl)
    if (handleUrl) {
      const handleHtml = await fetchYouTubeHtml(handleUrl)
      const handleMatch = handleHtml.match(/"channelId":"(UC[^"]+)"/)
      return handleMatch?.[1] ?? null
    }

    return null
  } catch {
    return null
  }
}

async function fetchYouTubeHtml(url: string): Promise<string> {
  return await $fetch<string>(url, {
    responseType: 'text',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9'
    }
  })
}

function toYouTubeHandleUrl(channelUrl: string): string | null {
  const match = channelUrl.match(/\/c\/([^/?]+)/) || channelUrl.match(/\/user\/([^/?]+)/)
  if (!match?.[1]) {
    return null
  }

  return `https://www.youtube.com/@${match[1]}`
}

function extractXmlValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return match?.[1]?.trim() ?? ''
}

type SpotifyConfig = {
  clientId: string
  clientSecret: string
  artistId: string
}

type SpotifyTokenResponse = {
  access_token: string
}

type SpotifyArtist = {
  id: string
  name: string
  url: string
  followers: number
  genres: string[]
  images: { url: string; width: number | null; height: number | null }[]
}

type SpotifyTopTracksResponse = {
  tracks: {
    id: string
    name: string
    album: {
      release_date: string
    }
  }[]
}

async function fetchSpotifyItems({ clientId, clientSecret, artistId }: SpotifyConfig): Promise<FeedItem[]> {
  if (!clientId || !clientSecret || !artistId) {
    return []
  }

  try {
    const token = await fetchSpotifyToken(clientId, clientSecret)
    const topTracks = await $fetch<SpotifyTopTracksResponse>(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return topTracks.tracks.slice(0, 3).map((track) => ({
      id: `sp_${track.id}`,
      provider: 'spotify',
      type: 'track',
      embedUrl: `https://open.spotify.com/embed/track/${track.id}`,
      height: '152px',
      title: track.name,
      date: track.album.release_date
    }))
  } catch {
    return []
  }
}

async function fetchSpotifyArtist({ clientId, clientSecret, artistId }: SpotifyConfig): Promise<SpotifyArtist | null> {
  if (!clientId || !clientSecret || !artistId) {
    return null
  }

  try {
    const token = await fetchSpotifyToken(clientId, clientSecret)
    const artist = await $fetch<{
      id: string
      name: string
      external_urls: { spotify: string }
      followers: { total: number }
      genres: string[]
      images: { url: string; width: number | null; height: number | null }[]
    }>(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      id: artist.id,
      name: artist.name,
      url: artist.external_urls.spotify,
      followers: artist.followers.total,
      genres: artist.genres,
      images: artist.images
    }
  } catch {
    return null
  }
}

async function fetchSpotifyToken(clientId: string, clientSecret: string): Promise<string> {
  const credentials = toBase64(`${clientId}:${clientSecret}`)
  const body = new URLSearchParams({ grant_type: 'client_credentials' })

  const response = await $fetch<SpotifyTokenResponse>('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  return response.access_token
}

function toBase64(value: string): string {
  const globalAny = globalThis as {
    btoa?: (input: string) => string
    Buffer?: { from: (input: string) => { toString: (encoding: string) => string } }
  }

  if (globalAny.btoa) {
    return globalAny.btoa(value)
  }

  if (globalAny.Buffer) {
    return globalAny.Buffer.from(value).toString('base64')
  }

  throw new Error('No base64 encoder available')
}
