# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fans — mostly arriving from social media to find the artist's music, videos and links — and industry & press (labels, managers, venues, journalists) evaluating the artist or looking to book or collaborate.

## Product Purpose

The official landing page for Jhey Pi: one hub where the bio, releases, videos, shorts and events live, always current, with contact always reachable. Success means visitors either consume content (stream, watch, follow) or reach out (booking/collaboration), and the site keeps itself fresh without manual edits.

## Positioning

The artist's own official page whose content is pulled, not pasted: bio comes from the YouTube channel About (client-editable), releases and artist stats from Spotify, videos and shorts from the YouTube RSS, events from a public Google Calendar. A neighboring fan page or bio-link aggregator could not truthfully claim the same live, first-party pipeline.

## Operating Context

- The client edits the bio in YouTube Studio; it flows to the site automatically (SSR per request, plus client-side feed refresh).
- Bilingual Spanish (default) / English, with a visible language switcher.
- Deployed on Cloudflare Pages from the `trunk` branch (Nuxt 4 + Nuxt UI v4, Nitro preset cloudflare-pages).
- Events section is feature-flagged (`EVENTS_ENABLED`, default off) pending a Google Calendar API key fix.

## Capabilities and Constraints

- Spotify via client-credentials Web API (requires the app-owner account to have Premium); releases split into singles/albums tabs; top tracks and artist profile fetched; Spotify currently returns 22 singles + 2 albums + artist profile.
- YouTube via free RSS (latest 15 uploads; 11 videos + 4 shorts) plus a Data API v3 key for the channel bio; videos split into Videos/Shorts tabs.
- YouTube videos are matched to Spotify releases (UTF-8-aware title normalization, ±21-day window, one video per release) and shown stacked under the release; matched videos are excluded from the Videos tab.
- Google Calendar API for events (currently 403 due to referrer restriction; section hidden by flag).
- Contact is a mailto form to jp10.manager@gmail.com.
- `DEBUG_SECRET` gates the `/api/events?debug=1` introspection; debug responses are no-store and the API key is redacted.
- Bio replaces the static about copy when present, with per-language fallbacks (es fallback = current bio text, en = English static copy).

## Brand Commitments

- Dark stone background with gold primary color (JP yellow logo `public/JP_yellow.svg`); favicon `public/favicon.ico`; social preview `public/social-preview.png`.
- Artist name: Jhey Pi. Spanish-first voice; English available.
- Social profiles: Instagram jpoficial_10, YouTube c/JpJheyPi, Facebook juanmanuelparrabu, TikTok @jhey.pii, Spotify artist 12TET0GvQuCAO3O1tfwrf4.

## Evidence on Hand

- Real bio text (YouTube About, Spanish, 6 paragraphs — see `app/composables/useTranslations.ts` es `copy.about`).
- Real catalog data via the live APIs (Spotify artist + releases, YouTube uploads).
- JP_yellow.svg logo and derived social-preview.png.
- Absences that must not be fabricated: no press kit, testimonials, or third-party reviews on hand.

## Product Principles

1. Always current — content is pulled from the artist's own accounts, not pasted by a webmaster.
2. Content first, contact always reachable.
3. The artist's own voice — Spanish-first, honestly bilingual.
4. Independent credibility — the page reflects a self-made career, not a label's polish.

## Accessibility & Inclusion

Bilingual ES/EN via a visible switcher; Spanish is the default. No further product-specific requirements established.
