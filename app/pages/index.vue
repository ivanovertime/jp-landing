<script setup lang="ts">
import type { ChangelogVersionProps } from '@nuxt/ui'
import { nextTick, onMounted } from 'vue'
import { Motion, easeOut } from 'motion-v'

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
  topTracks?: FeedItem[]
  channelDescription?: string
  artist?: {
    id: string
    name: string
    url: string
    followers: number
    genres: string[]
    images: { url: string, width: number | null, height: number | null }[]
  }
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
  links?: { type: 'calendar' | 'live' | 'rsvp' | 'download' | 'link' | 'attachment', url: string, title?: string }[]
}

type EventsResponse = {
  updatedAt: string
  items: EventItem[]
}

const { data: feed, pending, error, refresh: refreshFeed } = await useFetch<FeedResponse>('/api/feed', {
  key: 'feed',
  default: () => ({
    updatedAt: '',
    items: [],
    topTracks: [],
    channelDescription: '',
    artist: undefined
  })
})

const eventsEnabled = useRuntimeConfig().public.eventsEnabled === true

const { data: eventsFeed, pending: eventsPending, error: eventsError, refresh: refreshEvents } = await useFetch<EventsResponse>('/api/events', {
  key: 'events',
  immediate: eventsEnabled,
  default: () => ({
    updatedAt: '',
    items: []
  })
})

const items = computed(() => feed.value?.items ?? [])
const topTracks = computed(() => feed.value?.topTracks ?? [])

const artist = computed(() => feed.value?.artist ?? null)
const channelDescription = computed(() => feed.value?.channelDescription || '')
const events = computed(() => eventsFeed.value?.items ?? [])

const { locale, t, tArray } = useTranslations()
const aboutCopy = computed(() => tArray('copy.about'))

const followersCount = computed(() => {
  if (!Number.isFinite(artist.value?.followers)) {
    return ''
  }

  return new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'es-ES').format(artist.value!.followers)
})

const artistGenres = computed(() => (artist.value?.genres ?? [])
  .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1)))
const linkLabels = computed(() => ({
  calendar: t('links.calendar'),
  live: t('links.live'),
  rsvp: t('links.rsvp'),
  download: t('links.download'),
  link: t('links.link'),
  attachment: t('links.attachment')
}))

const linkIcons = {
  calendar: 'i-lucide-calendar',
  live: 'i-lucide-video',
  rsvp: 'i-lucide-clipboard-check',
  download: 'i-lucide-download',
  link: 'i-lucide-link',
  attachment: 'i-lucide-file-text'
} satisfies Record<NonNullable<EventItem['links']>[number]['type'], string>

const releases = computed(() => items.value.filter(item => item.provider === 'spotify'))
const shorts = computed(() => items.value.filter(item => item.provider === 'youtube' && item.type === 'short'))
const videos = computed(() => items.value.filter(item => item.provider === 'youtube' && item.type !== 'short'))

const singles = computed(() => releases.value.filter(item => item.type === 'single'))
const albums = computed(() => releases.value.filter(item => item.type !== 'single'))

const releasesTab = ref<'singles' | 'albums'>('singles')
const releaseTabs = computed(() => [
  { label: t('tabs.singles'), value: 'singles' },
  { label: t('tabs.albums'), value: 'albums' }
])
const activeReleases = computed(() => releasesTab.value === 'singles' ? singles.value : albums.value)

const videosTab = ref<'videos' | 'shorts'>('videos')
const videoTabs = computed(() => [
  { label: t('tabs.videos'), value: 'videos' },
  { label: t('tabs.shorts'), value: 'shorts' }
])
const activeVideos = computed(() => videosTab.value === 'shorts' ? shorts.value : videos.value)

const releasesPage = ref(1)
const videosPage = ref(1)
const releasesPerPage = 6
const videosPerPage = 6

const releasePageCount = computed(() => Math.max(1, Math.ceil(activeReleases.value.length / releasesPerPage)))
const videoPageCount = computed(() => Math.max(1, Math.ceil(activeVideos.value.length / videosPerPage)))

watchEffect(() => {
  if (releasesPage.value > releasePageCount.value) {
    releasesPage.value = releasePageCount.value
  }
})

watchEffect(() => {
  if (videosPage.value > videoPageCount.value) {
    videosPage.value = videoPageCount.value
  }
})

const pagedReleases = computed(() => {
  const start = (releasesPage.value - 1) * releasesPerPage
  return activeReleases.value.slice(start, start + releasesPerPage)
})

const pagedVideos = computed(() => {
  const start = (videosPage.value - 1) * videosPerPage
  return activeVideos.value.slice(start, start + videosPerPage)
})

const scrollToSectionById = async (sectionId: string) => {
  if (!import.meta.client) {
    return
  }

  await nextTick()

  requestAnimationFrame(() => {
    const section = document.getElementById(sectionId)
    if (!section) {
      return
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const handleReleasesPageUpdate = (page: number) => {
  releasesPage.value = page
  scrollToSectionById('section-releases')
}

const handleReleasesTabUpdate = (value: string | number) => {
  releasesTab.value = value === 'albums' ? 'albums' : 'singles'
  releasesPage.value = 1
}

const handleVideosTabUpdate = (value: string | number) => {
  videosTab.value = value === 'shorts' ? 'shorts' : 'videos'
  videosPage.value = 1
}

const handleVideosPageUpdate = (page: number) => {
  videosPage.value = page
  scrollToSectionById('section-videos')
}

const contactForm = reactive({
  name: '',
  email: '',
  message: ''
})

const sectionMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easeOut }
}

const contactIntro = computed(() => {
  const intro = t('contactForm.intro')
  const [beforeInstagram, rest = ''] = intro.split('{instagram}')
  const [betweenInstagramEmail, afterEmail = ''] = rest.split('{email}')

  return {
    beforeInstagram,
    betweenInstagramEmail,
    afterEmail
  }
})

const mailtoHref = computed(() => {
  const subject = 'Colaboración con Jhey Pi'
  const body = [
    `Nombre: ${contactForm.name || '-'}`,
    `Email: ${contactForm.email || '-'}`,
    '',
    contactForm.message || ''
  ].join('\n')

  return `mailto:jp10.manager@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})

const handleContactSubmit = () => {
  if (import.meta.client) {
    window.location.href = mailtoHref.value
  }
}

onMounted(() => {
  if (eventsEnabled) {
    refreshEvents()
  }
  refreshFeed()
})

type MediaVersion = ChangelogVersionProps & { item: FeedItem }

const releaseVersions = computed<MediaVersion[]>(() =>
  pagedReleases.value
    .filter((item): item is FeedItem => Boolean(item))
    .map(item => ({
      // title: item.title || 'Latest track',
      // description: `${item.provider} · ${item.type}`,
      date: item.date || feed.value?.updatedAt || new Date().toISOString(),
      // badge: 'Release',
      item,
      ui: {
        container: 'max-w-none'
      }
    }))
)

const videoVersions = computed<MediaVersion[]>(() =>
  pagedVideos.value
    .filter((item): item is FeedItem => Boolean(item))
    .map(item => ({
      // title: item.title || 'Latest video',
      // description: `${item.provider} · ${item.type}`,
      date: item.date || feed.value?.updatedAt || new Date().toISOString(),
      // badge: 'Video',
      item,
      ui: {
        container: 'max-w-none'
      }
    }))
)

type EventVersion = ChangelogVersionProps & { item: EventItem }

const eventVersions = computed<EventVersion[]>(() =>
  events.value
    .filter((item): item is EventItem => Boolean(item))
    .slice(0, 10)
    .map(item => ({
      title: '',
      description: '',
      date: item.start || eventsFeed.value?.updatedAt || new Date().toISOString(),
      item,
      ui: {
        container: 'max-w-none'
      }
    }))
)

const formatEventDateRange = (item: EventItem) => {
  if (!item.start) {
    return ''
  }

  const startDate = new Date(item.start)
  if (Number.isNaN(startDate.getTime())) {
    return item.start
  }

  if (item.allDay) {
    return startDate.toLocaleDateString()
  }

  const endDate = item.end ? new Date(item.end) : null
  if (!endDate || Number.isNaN(endDate.getTime())) {
    return startDate.toLocaleString()
  }

  return `${startDate.toLocaleString()} → ${endDate.toLocaleString()}`
}
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20 lg:gap-20">
    <Motion
      id="section-about"
      as="section"
      v-bind="sectionMotion"
      class="flex flex-col gap-8"
    >
      <div class="flex flex-col gap-6">
        <div class="flex flex-wrap items-center gap-6">
          <div class="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row-reverse sm:items-center sm:text-left">
            <div
              v-if="artist?.images?.[0]"
              class="h-64 w-64 overflow-hidden rounded-full ring-2 ring-primary/40 shadow-lg"
            >
              <img
                v-if="artist?.images?.[0]"
                :src="artist.images[0].url"
                :alt="artist.name"
                class="h-full w-full object-cover"
              >
            </div>
            <div class="flex flex-col items-center gap-4 sm:items-start">
              <UBadge
                color="primary"
                variant="subtle"
                class="w-fit"
              >
                {{ t('badges.official') }}
              </UBadge>
              <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
                {{ artist?.name || 'Jhey Pi' }}
              </h1>
              <div
                v-if="artist"
                class="flex flex-wrap items-center justify-center gap-2 sm:justify-start"
              >
                <span class="text-sm text-muted">
                  {{ followersCount }} {{ t('labels.followers') }}
                </span>
                <UBadge
                  v-for="genre in artistGenres"
                  :key="genre"
                  color="neutral"
                  variant="outline"
                  size="sm"
                >
                  {{ genre }}
                </UBadge>
              </div>
              <div class="max-w-2xl text-sm text-muted sm:text-base">
                <p
                  v-for="(paragraph, index) in aboutCopy"
                  :key="paragraph"
                  :class="{ 'mt-4': index > 0 }"
                >
                  {{ paragraph }}
                </p>
              </div>
              <div
                v-if="channelDescription"
                class="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted"
              >
                <h2 class="text-sm font-semibold">
                  {{ t('section.bioTitle') }}
                </h2>
                <p class="mt-2 whitespace-pre-line">
                  {{ channelDescription }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Motion>

    <Motion
      id="section-releases"
      as="section"
      v-bind="sectionMotion"
      class="flex flex-col gap-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">
            {{ t('section.releasesTitle') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('section.releasesSubtitle') }}
          </p>
        </div>
        <UBadge
          color="neutral"
          variant="subtle"
        >
          {{ t('badges.latestDrops') }}
        </UBadge>
      </div>

      <div
        v-if="error"
        class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
      >
        {{ t('errors.releases') }}
      </div>

      <div
        v-else
        class="flex flex-col gap-4"
      >
        <UTabs
          :items="releaseTabs"
          :model-value="releasesTab"
          :content="false"
          @update:model-value="handleReleasesTabUpdate"
        />

        <div
          v-if="activeReleases.length === 0"
          class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted"
        >
          {{ t(releasesTab === 'singles' ? 'tabs.singlesEmpty' : 'tabs.albumsEmpty') }}
        </div>

        <template v-else>
          <UChangelogVersions
            :key="`${releasesTab}-${releasesPage}`"
            :indicator-motion="{ damping: 26, restDelta: 0.001 }"
            :versions="releaseVersions"
          >
            <template #body="{ version }">
              <div class="mt-6">
                <EmbedFrame :item="version.item" />
              </div>
            </template>
          </UChangelogVersions>

          <div
            v-if="releasePageCount > 1"
            class="mt-6 flex justify-center"
          >
            <UPagination
              :page="releasesPage"
              :total="activeReleases.length"
              :items-per-page="releasesPerPage"
              size="sm"
              :ui="{ item: 'cursor-pointer', first: 'cursor-pointer', prev: 'cursor-pointer', next: 'cursor-pointer', last: 'cursor-pointer', ellipsis: 'cursor-pointer' }"
              @update:page="handleReleasesPageUpdate"
            />
          </div>
        </template>
      </div>
    </Motion>

    <Motion
      id="section-tracks"
      as="section"
      v-bind="sectionMotion"
      class="flex flex-col gap-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">
            {{ t('section.tracksTitle') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('section.tracksSubtitle') }}
          </p>
        </div>
        <UBadge
          color="neutral"
          variant="subtle"
        >
          {{ t('badges.mostPlayed') }}
        </UBadge>
      </div>

      <div
        v-if="error"
        class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
      >
        {{ t('errors.tracks') }}
      </div>

      <div
        v-else-if="topTracks.length === 0"
        class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted"
      >
        {{ t('section.tracksEmpty') }}
      </div>

      <div
        v-else
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <EmbedFrame
          v-for="track in topTracks.slice(0, 6)"
          :key="track.id"
          :item="track"
        />
      </div>
    </Motion>

    <Motion
      id="section-videos"
      as="section"
      v-bind="sectionMotion"
      class="flex flex-col gap-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">
            {{ t('section.videosTitle') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('section.videosSubtitle') }}
          </p>
        </div>
        <UBadge
          color="neutral"
          variant="subtle"
        >
          {{ t('badges.latestClips') }}
        </UBadge>
      </div>

      <div
        v-if="error"
        class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
      >
        {{ t('errors.videos') }}
      </div>

      <div
        v-else
        class="flex flex-col gap-4"
      >
        <UTabs
          :items="videoTabs"
          :model-value="videosTab"
          :content="false"
          @update:model-value="handleVideosTabUpdate"
        />

        <div
          v-if="activeVideos.length === 0"
          class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted"
        >
          {{ t(videosTab === 'shorts' ? 'tabs.shortsEmpty' : 'tabs.videosEmpty') }}
        </div>

        <template v-else>
          <UChangelogVersions
            :key="`${videosTab}-${videosPage}`"
            :indicator-motion="{ damping: 26, restDelta: 0.001 }"
            :versions="videoVersions"
          >
            <template #body="{ version }">
              <div class="mt-6">
                <EmbedFrame :item="version.item" />
              </div>
            </template>
          </UChangelogVersions>

          <div
            v-if="videoPageCount > 1"
            class="mt-6 flex justify-center"
          >
            <UPagination
              :page="videosPage"
              :total="activeVideos.length"
              :items-per-page="videosPerPage"
              size="sm"
              :ui="{ item: 'cursor-pointer', first: 'cursor-pointer', prev: 'cursor-pointer', next: 'cursor-pointer', last: 'cursor-pointer', ellipsis: 'cursor-pointer' }"
              @update:page="handleVideosPageUpdate"
            />
          </div>
        </template>
      </div>
    </Motion>

    <Motion
      v-if="eventsEnabled"
      id="section-events"
      as="section"
      v-bind="sectionMotion"
      class="flex flex-col gap-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">
            {{ t('section.eventsTitle') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('section.eventsSubtitle') }}
          </p>
        </div>
        <UBadge
          color="neutral"
          variant="subtle"
        >
          {{ t('badges.upcoming') }}
        </UBadge>
      </div>

      <div
        v-if="eventsError"
        class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
      >
        {{ t('errors.events') }}
      </div>

      <div v-else>
        <div
          v-if="eventsPending"
          class="text-sm text-muted"
        >
          {{ t('status.loading') }}
        </div>

        <div
          v-else-if="events.length === 0"
          class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted"
        >
          {{ t('section.eventsEmpty') }}
        </div>

        <UChangelogVersions
          v-else
          :indicator-motion="{ damping: 26, restDelta: 0.001 }"
          :versions="eventVersions"
        >
          <template #body="{ version }">
            <div class="relative z-10 mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-6">
              <div class="flex flex-col gap-4">
                <div class="space-y-1">
                  <h3 class="text-lg font-semibold">
                    {{ version.item.title }}
                  </h3>
                  <p
                    v-if="version.item.location"
                    class="text-sm text-muted"
                  >
                    {{ version.item.location }}
                  </p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    <span class="font-semibold text-muted">{{ t('labels.when') }}:</span>
                    {{ formatEventDateRange(version.item) }}
                  </p>
                </div>

                <p
                  v-if="version.item.description"
                  class="text-sm text-muted"
                >
                  {{ version.item.description }}
                </p>

                <div
                  v-if="version.item.links?.length"
                  class="flex flex-wrap items-center gap-2"
                >
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted">
                    {{ t('labels.links') }}
                  </span>
                  <UButton
                    v-for="link in version.item.links"
                    :key="link.url"
                    :to="link.url"
                    :icon="linkIcons[link.type]"
                    target="_blank"
                    rel="noreferrer"
                    size="xs"
                    variant="soft"
                    color="primary"
                    class="text-xs font-semibold"
                  >
                    {{ link.title || linkLabels[link.type] || link.url }}
                  </UButton>
                </div>
              </div>
            </div>
          </template>
        </UChangelogVersions>
      </div>
    </Motion>

    <Motion
      id="section-contact"
      as="section"
      v-bind="sectionMotion"
      class="flex flex-col gap-4"
    >
      <h2 class="text-2xl font-semibold">
        {{ t('section.contactTitle') }}
      </h2>
      <p class="max-w-3xl text-sm text-muted">
        {{ contactIntro.beforeInstagram }}
        <a
          href="https://instagram.com/mediaviarecords"
          target="_blank"
          rel="noreferrer"
          class="font-semibold text-primary hover:underline"
        >Mediavia Records</a>
        {{ contactIntro.betweenInstagramEmail }}
        <a
          href="mailto:jp10.manager@gmail.com"
          class="font-semibold text-primary hover:underline"
        >jp10.manager@gmail.com</a>
        {{ contactIntro.afterEmail }}
      </p>
      <UForm
        :state="contactForm"
        class="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2"
        @submit="handleContactSubmit"
      >
        <UFormField
          :label="t('contactForm.nameLabel')"
          class="text-sm"
        >
          <UInput
            v-model="contactForm.name"
            name="name"
            size="lg"
            :placeholder="t('contactForm.namePlaceholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="t('contactForm.emailLabel')"
          class="text-sm"
        >
          <UInput
            v-model="contactForm.email"
            name="email"
            type="email"
            size="lg"
            required
            :placeholder="t('contactForm.emailPlaceholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="t('contactForm.messageLabel')"
          class="text-sm sm:col-span-2"
        >
          <UTextarea
            v-model="contactForm.message"
            name="message"
            size="lg"
            :rows="4"
            required
            :placeholder="t('contactForm.messagePlaceholder')"
            class="w-full"
          />
        </UFormField>
        <div class="flex flex-wrap items-center gap-3 sm:col-span-2">
          <UButton
            type="submit"
            size="lg"
            color="primary"
            variant="solid"
            icon="i-heroicons-envelope"
            class="w-full sm:w-auto bg-gradient-to-r from-primary via-primary to-primary/80 shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-primary/50"
          >
            {{ t('contactForm.submit') }}
          </UButton>
          <span class="text-xs text-muted">
            {{ t('contactForm.hint') }}
          </span>
        </div>
      </UForm>
    </Motion>

    <div
      v-if="pending"
      class="text-sm text-muted"
    >
      {{ t('status.loading') }}
    </div>
  </main>
</template>
