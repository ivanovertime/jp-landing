# JP Landing

Official landing site for Jhey Pi. Built with Nuxt 4 + Nuxt UI, pulling the latest YouTube videos and Spotify releases into a single feed.

## Features

- Spotify releases and artist profile via Spotify API
- YouTube latest videos via channel feed
- Auto-sorted, paginated feed with embeds
- Bilingual copy (ES/EN)
- ISR caching for the feed endpoint

## Requirements

- Node.js 18+
- pnpm (recommended)

## Setup

Install dependencies:

```bash
pnpm install
```

Create a `.env` file (or set env vars in your host):

```bash
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_ARTIST_ID=12TET0GvQuCAO3O1tfwrf4
YOUTUBE_CHANNEL_URL=https://www.youtube.com/c/JpJheyPi
YOUTUBE_CHANNEL_ID=
MAX_YOUTUBE_ITEMS=24
MAX_SPOTIFY_ITEMS=24
```

Notes:

- `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are required to load Spotify releases and artist info.
- `SPOTIFY_ARTIST_ID` defaults to Jhey Pi if omitted.
- Set `YOUTUBE_CHANNEL_ID` to avoid resolving it from the channel URL at runtime.

## Development

Run the dev server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build for production:

```bash
pnpm build
```

Preview locally:

```bash
pnpm preview
```

## Project Notes

- App source lives in `app/` with Nuxt `srcDir` set accordingly.
- Feed endpoint is in `server/api/feed.ts` and caches for 1 hour in production.
- UI copy and locale strings live in `app/composables/useTranslations.ts`.
