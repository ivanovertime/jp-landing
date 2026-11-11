type MatchableItem = {
  id: string
  provider: 'youtube' | 'spotify'
  type: string
  embedUrl: string
  aspectRatio?: string
  height?: string
  title?: string
  date?: string
}

/**
 * Filler tokens that never carry release identity. They are dropped from both
 * sides of a comparison so "Making LUV (Video Oficial)" reduces to "making luv".
 * "en vivo" is stripped as a phrase before tokenizing.
 */
const FILLER_TOKENS = new Set([
  'official',
  'video',
  'videos',
  'audio',
  'visualizer',
  'lyric',
  'lyrics',
  'clip',
  'estreno',
  'premiere',
  'premier',
  'oficial',
  'live',
  'vivo'
])

/**
 * Lowercase, strip diacritics, reduce to alphanumeric tokens and drop filler.
 *
 * Examples:
 * - "Making LUV (Video Oficial)" -> ["making", "luv"]
 * - "COÑO GIRLA" -> ["cono", "girla"]
 * - "Pirense. Jhey Pi + Indigo 457..." -> ["pirense", "jhey", "pi", ...]
 */
export function normalizeTitle(title: string): string[] {
  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/\ben\s+vivo\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

  if (!normalized) {
    return []
  }

  return normalized
    .split(/\s+/)
    .filter(token => token.length > 0 && !FILLER_TOKENS.has(token))
}

/**
 * Token-set overlap measured against the shorter title.
 * 1 means the shorter title is fully contained in the longer one.
 */
export function titleScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) {
    return 0
  }

  const aSet = new Set(a)
  const bSet = new Set(b)
  let intersection = 0

  for (const token of aSet) {
    if (bSet.has(token)) {
      intersection += 1
    }
  }

  return intersection / Math.min(aSet.size, bSet.size)
}

/**
 * Date proximity check. Spotify only exposes month precision for some
 * releases, so a year-month date gets a wider window.
 *
 * When one side is unparseable the only safe signal is a perfect title match,
 * which is why the caller passes its score.
 */
export function datesWithinWindow(releaseDate: string, videoDate: string, maxDays = 21, score = 1): boolean {
  const releaseTime = new Date(releaseDate).getTime()
  const videoTime = new Date(videoDate).getTime()
  const releaseInvalid = Number.isNaN(releaseTime)
  const videoInvalid = Number.isNaN(videoTime)

  if (releaseInvalid || videoInvalid) {
    return score === 1
  }

  const window = /^\d{4}-\d{2}$/.test(releaseDate) ? 45 : maxDays
  const diffDays = Math.abs(videoTime - releaseTime) / 86_400_000

  return diffDays <= window
}

/**
 * Pair Spotify releases with the YouTube video that promotes them.
 *
 * Matching examples (documented behaviour):
 * 1. Release "Making LUV" (2025-11-17) + video "Making LUV (Video Oficial)"
 *    (2025-11-19) -> tokens ["making","luv"] vs same, score 1, 2 days -> match.
 * 2. Release "Pirense" (2026-10, month precision) + video
 *    "Pirense. Jhey Pi + Indigo 457, Shaynin..." (2026-10-10) -> score 1,
 *    widened 45-day window -> match.
 * 3. Release "GPT" (2026-10-22) + video "Sapo - Jhey Pi (DU△LMA)"
 *    -> score 0 -> no match. Unrelated videos never hide themselves.
 * 4. Release "Location" (2026-11-09) + video "Location (Official Video)"
 *    from 2025-01-01 -> score 1 but 677 days apart -> no match.
 * 5. Release "COÑO GIRLA" + video "Cono Girla (Lyric Video)" -> diacritics and
 *    filler tokens normalize to an identical token set -> match.
 *
 * Releases are processed oldest first so the most recent video wins a tie, and
 * each video can back at most one release. Shorts never participate.
 */
export function matchReleasesToVideos(releases: MatchableItem[], videos: MatchableItem[]): Map<string, MatchableItem> {
  const candidates = videos.filter(video => video.type !== 'short')
  const usedVideoIds = new Set<string>()
  const matches = new Map<string, MatchableItem>()

  const orderedReleases = [...releases].sort((a, b) => {
    return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
  })

  for (const release of orderedReleases) {
    const releaseTokens = normalizeTitle(release.title || '')
    const releaseTime = new Date(release.date || 0).getTime()
    let best: { video: MatchableItem, score: number, dayDistance: number } | null = null

    for (const video of candidates) {
      if (usedVideoIds.has(video.id)) {
        continue
      }

      const score = titleScore(releaseTokens, normalizeTitle(video.title || ''))
      if (score < 0.7) {
        continue
      }

      if (!datesWithinWindow(release.date || '', video.date || '', 21, score)) {
        continue
      }

      const videoTime = new Date(video.date || 0).getTime()
      const dayDistance = Number.isNaN(releaseTime) || Number.isNaN(videoTime)
        ? Number.POSITIVE_INFINITY
        : Math.abs(videoTime - releaseTime)

      const isBetter = !best
        || score > best.score
        || (score === best.score && dayDistance < best.dayDistance)

      if (isBetter) {
        best = { video, score, dayDistance }
      }
    }

    if (best) {
      matches.set(release.id, best.video)
      usedVideoIds.add(best.video.id)
    }
  }

  return matches
}
