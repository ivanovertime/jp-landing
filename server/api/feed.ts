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
  channelDescription: string
}

export default defineEventHandler(async (event): Promise<FeedResponse> => {
  if (import.meta.dev) {
    setHeader(event, 'Cache-Control', 'no-store')
  } else {
    setHeader(event, 'Cache-Control', 'public, max-age=0, must-revalidate, s-maxage=3600, stale-while-revalidate=600')
  }

  const config = useRuntimeConfig()
  const items: FeedItem[] = []
  const query = getQuery(event)
  const maxYoutubeItems = Number(query.youtubeLimit || config.maxYoutubeItems || 24)
  const maxSpotifyItems = Number(query.spotifyLimit || config.maxSpotifyItems || 24)

  const { items: youtubeItems, channelId: youtubeChannelId } = await fetchYouTubeItems({
    channelUrl: config.youtubeChannelUrl,
    channelId: config.youtubeChannelId,
    limit: maxYoutubeItems
  })
  items.push(...youtubeItems)

  const spotifyConfig = {
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    artistId: config.spotifyArtistId
  }

  const spotifyItems = await fetchSpotifyItems(spotifyConfig, maxSpotifyItems)
  items.push(...spotifyItems)

  const spotifyArtist = await fetchSpotifyArtist(spotifyConfig)
  const channelDescription = await fetchYouTubeChannelDescription(config.youtubeApiKey, youtubeChannelId)

  const nowIso = new Date().toISOString()
  const normalizedItems = items
    .filter((item): item is FeedItem => Boolean(item && item.id && item.embedUrl))
    .map(item => ({
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
    artist: spotifyArtist || undefined,
    channelDescription
  }
})

type YouTubeConfig = {
  channelUrl: string
  channelId?: string
  limit?: number
}

async function fetchYouTubeItems({ channelUrl, channelId, limit = 24 }: YouTubeConfig): Promise<{ items: FeedItem[], channelId: string | null }> {
  try {
    const resolvedChannelId = channelId || await resolveYouTubeChannelId(channelUrl)
    if (!resolvedChannelId) {
      return { items: [], channelId: null }
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${resolvedChannelId}`
    const xml = await $fetch<string>(feedUrl, { responseType: 'text' })
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit)

    const items = entries.map<FeedItem>((match) => {
      const entry = match[1] ?? ''
      const videoId = extractXmlValue(entry, 'yt:videoId')
      const title = extractXmlValue(entry, 'title')
      const published = extractXmlValue(entry, 'published')
      const isShort = entry.includes('href="https://www.youtube.com/shorts/')

      return {
        id: `yt_${videoId}`,
        provider: 'youtube',
        type: isShort ? 'short' : 'video',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        aspectRatio: isShort ? '9/16' : '16/9',
        title,
        date: published
      }
    })

    return { items, channelId: resolvedChannelId }
  } catch {
    return { items: [], channelId: null }
  }
}

async function fetchYouTubeChannelDescription(apiKey: string, channelId: string | null): Promise<string> {
  if (!apiKey || !channelId) {
    return ''
  }

  try {
    const response = await $fetch<{ items?: { snippet?: { description?: string } }[] }>(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`
    )

    return response.items?.[0]?.snippet?.description?.trim() || ''
  } catch {
    return ''
  }
}

async function resolveYouTubeChannelId(channelUrl: string): Promise<string | null> {
  if (channelUrl.includes('/channel/')) {
    const match = channelUrl.match(/\/channel\/([^/?]+)/)
    return match?.[1] ?? null
  }

  try {
    const html = await fetchYouTubeHtml(channelUrl)
    const match = html.match(/"channelId":"(UC[^"]+)"/) || html.match(/"externalId":"(UC[^"]+)"/)
    if (match?.[1]) {
      return match[1]
    }

    const handleUrl = toYouTubeHandleUrl(channelUrl)
    if (handleUrl) {
      const handleHtml = await fetchYouTubeHtml(handleUrl)
      const handleMatch = handleHtml.match(/"channelId":"(UC[^"]+)"/) || handleHtml.match(/"externalId":"(UC[^"]+)"/)
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
  expires_in: number
}

type SpotifyArtist = {
  id: string
  name: string
  url: string
  followers: number
  genres: string[]
  images: { url: string, width: number | null, height: number | null }[]
}

type SpotifyAlbumsResponse = {
  items: {
    id: string
    name: string
    release_date: string
    album_type: string
  }[]
  next: string | null
}

async function fetchSpotifyItems({ clientId, clientSecret, artistId }: SpotifyConfig, limit = 24): Promise<FeedItem[]> {
  if (!clientId || !clientSecret || !artistId) {
    return []
  }

  try {
    const token = await fetchSpotifyToken(clientId, clientSecret)
    const releases: FeedItem[] = []
    let offset = 0
    const pageSize = 20

    while (releases.length < limit) {
      const albums = await $fetch<SpotifyAlbumsResponse>(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=${pageSize}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      releases.push(
        ...albums.items.map<FeedItem>(album => ({
          id: `sp_${album.id}`,
          provider: 'spotify',
          type: album.album_type || 'album',
          embedUrl: `https://open.spotify.com/embed/album/${album.id}`,
          height: '152px',
          title: album.name,
          date: album.release_date
        }))
      )

      if (!albums.next || albums.items.length === 0) {
        break
      }

      offset += pageSize
    }

    return releases.slice(0, limit)
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
      images: { url: string, width: number | null, height: number | null }[]
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

let cachedToken: { value: string, expiresAt: number } | null = null

async function fetchSpotifyToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }

  const credentials = toBase64(`${clientId}:${clientSecret}`)
  const body = new URLSearchParams({ grant_type: 'client_credentials' })

  const response = await $fetch<SpotifyTokenResponse>('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  cachedToken = {
    value: response.access_token,
    expiresAt: Date.now() + response.expires_in * 1000 - 60000
  }

  return cachedToken.value
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
