type EventLink = {
  label: string
  url: string
}

type EventItem = {
  id: string
  title: string
  description?: string
  location?: string
  start: string
  end?: string
  allDay?: boolean
  htmlLink?: string
  links?: EventLink[]
}

type EventsResponse = {
  updatedAt: string
  items: EventItem[]
  debug?: {
    hasApiKey: boolean
    hasCalendarId: boolean
    calendarId?: string
    url?: string
    responseItems?: number
    normalizedItems?: number
    errorStatus?: number
    errorData?: unknown
  }
}

type GoogleCalendarEvent = {
  id: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  hangoutLink?: string
  attachments?: { fileUrl?: string, title?: string, mimeType?: string }[]
  start?: { dateTime?: string, date?: string }
  end?: { dateTime?: string, date?: string }
  conferenceData?: {
    entryPoints?: { entryPointType?: string, uri?: string }[]
  }
}

type GoogleCalendarResponse = {
  items?: GoogleCalendarEvent[]
}

export default defineEventHandler(async (event): Promise<EventsResponse> => {
  if (import.meta.dev) {
    setHeader(event, 'Cache-Control', 'no-store')
  } else {
    setHeader(event, 'Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600')
  }

  const config = useRuntimeConfig()
  const nowIso = new Date().toISOString()
  const query = getQuery(event)
  const debugEnabled = query.debug === '1' || query.debug === 'true'

  if (!config.googleCalendarApiKey || !config.googleCalendarId) {
    return {
      updatedAt: nowIso,
      items: [],
      debug: debugEnabled
        ? {
            hasApiKey: Boolean(config.googleCalendarApiKey),
            hasCalendarId: Boolean(config.googleCalendarId),
            calendarId: config.googleCalendarId || undefined
          }
        : undefined
    }
  }

  const rawLimit = Number(query.limit ?? 10)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 10) : 10

  const calendarId = encodeURIComponent(config.googleCalendarId)
  const params = new URLSearchParams({
    key: config.googleCalendarApiKey,
    timeMin: nowIso,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(limit),
    supportsAttachments: 'true',
    fields: 'items(id,summary,description,location,htmlLink,hangoutLink,attachments,start,end,conferenceData)'
  })

  if (config.googleCalendarTimeZone) {
    params.set('timeZone', config.googleCalendarTimeZone)
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`

  try {
    const response = await $fetch<GoogleCalendarResponse>(url)
    const items = (response.items || [])
      .filter((item): item is GoogleCalendarEvent => Boolean(item && item.id && (item.start?.dateTime || item.start?.date)))
      .map<EventItem>((item) => {
        const startRaw = item.start?.dateTime || item.start?.date || nowIso
        const endRaw = item.end?.dateTime || item.end?.date
        const allDay = Boolean(item.start?.date && !item.start?.dateTime)

        return {
          id: item.id,
          title: item.summary?.trim() || 'Event',
          description: normalizeDescription(item.description),
          location: item.location?.trim(),
          start: startRaw,
          end: endRaw,
          allDay,
          htmlLink: item.htmlLink,
          links: buildLinks(item)
        }
      })

    return {
      updatedAt: nowIso,
      items,
      debug: debugEnabled
        ? {
            hasApiKey: Boolean(config.googleCalendarApiKey),
            hasCalendarId: Boolean(config.googleCalendarId),
            calendarId: config.googleCalendarId,
            url,
            responseItems: response.items?.length ?? 0,
            normalizedItems: items.length
          }
        : undefined
    }
  } catch (error) {
    return {
      updatedAt: nowIso,
      items: [],
      debug: debugEnabled
        ? {
            hasApiKey: Boolean(config.googleCalendarApiKey),
            hasCalendarId: Boolean(config.googleCalendarId),
            calendarId: config.googleCalendarId || undefined,
            url,
            errorStatus: (error as { response?: { status?: number } })?.response?.status,
            errorData: (error as { data?: unknown })?.data
          }
        : undefined
    }
  }
})

function stripHtml(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  const text = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text || undefined
}

function normalizeDescription(value?: string): string | undefined {
  const text = stripHtml(value)
  if (!text) {
    return undefined
  }

  let cleaned = text
  const urls = extractUrls(value)
  for (const url of urls) {
    cleaned = cleaned.replaceAll(url, ' ')
  }

  cleaned = cleaned
    .replace(/\b(forms\.gle|drive\.google\.com|docs\.google\.com)\/[^\s<>"]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned || undefined
}

function buildLinks(item: GoogleCalendarEvent): EventLink[] | undefined {
  const links: EventLink[] = []
  const seen = new Set<string>()

  const pushLink = (label: string, url?: string) => {
    if (!url || seen.has(url)) {
      return
    }
    seen.add(url)
    links.push({ label, url })
  }

  pushLink('Google Calendar', item.htmlLink)
  pushLink('Google Meet', item.hangoutLink)

  extractUrls(item.description).forEach((url) => {
    const label = toLinkLabel(url)
    pushLink(label, url)
  })

  item.conferenceData?.entryPoints?.forEach((entry) => {
    if (!entry?.uri) {
      return
    }
    const label = entry.entryPointType
      ? entry.entryPointType.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
      : 'Conference'
    pushLink(label, entry.uri)
  })

  item.attachments?.forEach((attachment) => {
    if (!attachment?.fileUrl) {
      return
    }
    const label = attachment.title?.trim() || toLinkLabel(attachment.fileUrl)
    pushLink(label, attachment.fileUrl)
  })

  return links.length ? links : undefined
}

function extractUrls(value?: string): string[] {
  if (!value) {
    return []
  }

  const matches = value.match(/https?:\/\/[^\s<>"]+/g)
  const googleMatches = value.match(/\b(?:forms\.gle|drive\.google\.com|docs\.google\.com)\/[^\s<>"]+/gi)
  const combined = [...(matches ?? []), ...(googleMatches ?? [])]
  if (combined.length === 0) {
    return []
  }

  const seen = new Set<string>()
  const urls: string[] = []

  for (const match of combined) {
    const cleaned = match.replace(/[)\]},.]+$/g, '')
    if (seen.has(cleaned)) {
      continue
    }
    seen.add(cleaned)
    urls.push(cleaned)
  }

  return urls
}

function toLinkLabel(url: string): string {
  if (url.includes('forms.gle') || url.includes('docs.google.com/forms')) {
    return 'Google Form'
  }
  if (url.includes('drive.google.com')) {
    return 'Google Drive'
  }

  try {
    const parsed = new URL(url)
    return parsed.hostname.replace('www.', '')
  } catch {
    return 'Link'
  }
}
