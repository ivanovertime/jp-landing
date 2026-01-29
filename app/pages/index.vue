<script setup lang="ts">
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
  artist?: {
    id: string
    name: string
    url: string
    followers: number
    genres: string[]
    images: { url: string; width: number | null; height: number | null }[]
  }
}

const { data: feed, pending, error } = await useFetch<FeedResponse>('/api/feed', {
  key: 'feed'
})

const items = computed(() => feed.value?.items ?? [])
const updatedAt = computed(() => {
  if (!feed.value?.updatedAt) {
    return null
  }

  return new Date(feed.value.updatedAt).toLocaleString()
})

const artist = computed(() => feed.value?.artist ?? null)

const releases = computed(() => items.value.filter(item => item.provider === 'spotify'))
const videos = computed(() => items.value.filter(item => item.provider === 'youtube'))

const socials = computed(() => [
  {
    label: 'Spotify',
    icon: 'i-simple-icons-spotify',
    to: artist.value?.url || 'https://open.spotify.com/artist/12TET0GvQuCAO3O1tfwrf4',
    target: '_blank'
  },
  {
    label: 'YouTube',
    icon: 'i-simple-icons-youtube',
    to: 'https://www.youtube.com/c/JpJheyPi/',
    target: '_blank'
  }
])
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20 lg:gap-20">
    <section class="flex flex-col gap-8">
      <div class="flex flex-col gap-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-col gap-3">
            <UBadge color="primary" variant="subtle" class="w-fit">
              Official artist page
            </UBadge>
            <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
              {{ artist?.name || 'Jhey Pi' }}
            </h1>
            <p class="max-w-2xl text-base text-muted sm:text-lg">
              Music, videos, and releases in one place. Stream the latest tracks and watch new drops
              without leaving the page.
            </p>
          </div>

          <UCard
            v-if="artist"
            class="w-full max-w-sm"
            :ui="{ body: 'flex flex-col gap-3' }"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="artist.images?.[0]"
                :src="artist.images[0].url"
                :alt="artist.name"
                class="h-14 w-14 rounded-full object-cover"
              >
              <div>
                <div class="text-sm font-semibold text-highlighted">Spotify</div>
                <div class="text-xs text-muted">{{ artist.followers.toLocaleString() }} followers</div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="genre in artist.genres"
                :key="genre"
                color="neutral"
                variant="subtle"
              >
                {{ genre }}
              </UBadge>
            </div>
          </UCard>
        </div>

        <nav class="flex flex-wrap gap-4 text-sm font-semibold text-muted">
          <a href="#section-releases" class="hover:text-highlighted">Releases</a>
          <a href="#section-videos" class="hover:text-highlighted">Videos</a>
          <a href="#section-about" class="hover:text-highlighted">About</a>
          <a href="#section-contact" class="hover:text-highlighted">Contact</a>
        </nav>

        <div class="flex flex-wrap gap-3">
          <UButton
            v-for="social in socials"
            :key="social.label"
            :icon="social.icon"
            :to="social.to"
            :target="social.target"
            variant="outline"
            size="lg"
          >
            {{ social.label }}
          </UButton>
        </div>
      </div>
    </section>

    <section id="section-releases" class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Releases</h2>
          <p class="text-sm text-muted">Spotify embeds · Updated hourly</p>
        </div>
        <UBadge color="neutral" variant="subtle">Latest drops</UBadge>
      </div>

      <div v-if="error" class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
        Unable to load releases right now.
      </div>

      <div v-else class="grid gap-8 lg:grid-cols-2">
        <UCard
          v-for="item in releases"
          :key="item.id"
          :ui="{ body: 'flex flex-col gap-4', header: 'flex flex-col gap-1' }"
        >
          <template #header>
            <div class="text-xs font-semibold uppercase tracking-wide text-muted">
              {{ item.provider }} · {{ item.type }}
            </div>
            <div class="text-lg font-semibold text-highlighted">
              {{ item.title || 'Latest track' }}
            </div>
            <div v-if="item.date" class="text-xs text-muted">
              {{ new Date(item.date).toLocaleDateString() }}
            </div>
          </template>

          <EmbedFrame :item="item" />
        </UCard>
      </div>
    </section>

    <section id="section-videos" class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Videos</h2>
          <p class="text-sm text-muted">YouTube embeds · Updated hourly</p>
        </div>
        <UBadge color="neutral" variant="subtle">Latest clips</UBadge>
      </div>

      <div v-if="error" class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
        Unable to load videos right now.
      </div>

      <div v-else class="grid gap-8 lg:grid-cols-2">
        <UCard
          v-for="item in videos"
          :key="item.id"
          :ui="{ body: 'flex flex-col gap-4', header: 'flex flex-col gap-1' }"
        >
          <template #header>
            <div class="text-xs font-semibold uppercase tracking-wide text-muted">
              {{ item.provider }} · {{ item.type }}
            </div>
            <div class="text-lg font-semibold text-highlighted">
              {{ item.title || 'Latest video' }}
            </div>
            <div v-if="item.date" class="text-xs text-muted">
              {{ new Date(item.date).toLocaleDateString() }}
            </div>
          </template>

          <EmbedFrame :item="item" />
        </UCard>
      </div>
    </section>

    <section id="section-about" class="flex flex-col gap-4">
      <h2 class="text-2xl font-semibold">About</h2>
      <p class="max-w-3xl text-sm text-muted sm:text-base">
        {{ artist?.name || 'Jhey Pi' }} blends melodic storytelling with modern Latin rhythms. This page
        brings together official Spotify and YouTube releases, updated automatically every hour.
      </p>
      <div v-if="updatedAt" class="text-xs text-muted">
        Feed refreshed: {{ updatedAt }}
      </div>
    </section>

    <section id="section-contact" class="flex flex-col gap-4">
      <h2 class="text-2xl font-semibold">Contact</h2>
      <div class="flex flex-wrap gap-3">
        <UButton
          v-for="social in socials"
          :key="social.label"
          :icon="social.icon"
          :to="social.to"
          :target="social.target"
          size="lg"
        >
          {{ social.label }}
        </UButton>
      </div>
    </section>

    <div v-if="pending" class="text-sm text-muted">
      Loading the latest feed…
    </div>
  </main>
</template>
