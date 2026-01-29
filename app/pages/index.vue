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

const socials = [
  {
    label: 'Spotify',
    icon: 'i-simple-icons-spotify',
    to: 'https://open.spotify.com/',
    target: '_blank'
  },
  {
    label: 'YouTube',
    icon: 'i-simple-icons-youtube',
    to: 'https://www.youtube.com/',
    target: '_blank'
  }
]
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-24 lg:gap-20">
    <section class="flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <UBadge color="primary" variant="subtle" class="w-fit">
          Musician timeline
        </UBadge>
        <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
          A living feed of releases, clips, and sessions.
        </h1>
        <p class="max-w-2xl text-base text-muted sm:text-lg">
          Follow the latest drops across Spotify and YouTube. Every entry is embedded
          so you can play, watch, and save without leaving the page.
        </p>
      </div>

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
    </section>

    <section class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Timeline</h2>
          <p class="text-sm text-muted">
            {{ updatedAt ? `Updated ${updatedAt}` : 'Updated hourly' }}
          </p>
        </div>
        <UBadge color="neutral" variant="subtle">
          One embed per moment
        </UBadge>
      </div>

      <div v-if="error" class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
        Unable to load the feed right now.
      </div>

      <div v-else class="grid gap-8 lg:grid-cols-2">
        <UCard
          v-for="item in items"
          :key="item.id"
          :ui="{
            body: 'flex flex-col gap-4',
            header: 'flex flex-col gap-1'
          }"
        >
          <template #header>
            <div class="text-xs font-semibold uppercase tracking-wide text-muted">
              {{ item.provider }} · {{ item.type }}
            </div>
            <div class="text-lg font-semibold text-highlighted">
              {{ item.title || 'Latest drop' }}
            </div>
            <div v-if="item.date" class="text-xs text-muted">
              {{ new Date(item.date).toLocaleDateString() }}
            </div>
          </template>

          <EmbedFrame :item="item" />
        </UCard>
      </div>

      <div v-if="pending" class="text-sm text-muted">
        Loading the latest feed…
      </div>
    </section>
  </main>
</template>
