<script setup lang="ts">
import type { ChangelogVersionProps } from '@nuxt/ui'
import { Motion } from 'motion-v'

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
    images: { url: string, width: number | null, height: number | null }[]
  }
}

const { data: feed, pending, error } = await useFetch<FeedResponse>('/api/feed', {
  key: 'feed',
  default: () => ({
    updatedAt: '',
    items: [],
    artist: undefined
  })
})

const items = computed(() => feed.value?.items ?? [])
const updatedAt = computed(() => {
  if (!feed.value?.updatedAt) {
    return null
  }

  return new Date(feed.value.updatedAt).toLocaleString()
})

const artist = computed(() => feed.value?.artist ?? null)

const { t, tArray } = useTranslations()
const aboutCopy = computed(() => tArray('copy.about'))

const releases = computed(() => items.value.filter(item => item.provider === 'spotify'))
const videos = computed(() => items.value.filter(item => item.provider === 'youtube'))

const releasesPage = ref(1)
const videosPage = ref(1)
const releasesPerPage = 6
const videosPerPage = 6

const releasePageCount = computed(() => Math.max(1, Math.ceil(releases.value.length / releasesPerPage)))
const videoPageCount = computed(() => Math.max(1, Math.ceil(videos.value.length / videosPerPage)))

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
  return releases.value.slice(start, start + releasesPerPage)
})

const pagedVideos = computed(() => {
  const start = (videosPage.value - 1) * videosPerPage
  return videos.value.slice(start, start + videosPerPage)
})

const contactForm = reactive({
  name: '',
  email: '',
  message: ''
})

const sectionMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

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
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20 lg:gap-20">
    <Motion as="section" id="section-about" v-bind="sectionMotion" class="flex flex-col gap-8">
      <div class="flex flex-col gap-6">
        <div class="flex flex-wrap items-center gap-6">
          <div class="flex w-full flex-col items-start gap-5 sm:w-auto sm:flex-row-reverse sm:items-center">
            <div class="h-64 w-64 overflow-hidden rounded-full ring-2 ring-primary/40 shadow-lg">
              <img v-if="artist?.images?.[0]" :src="artist.images[0].url" :alt="artist.name"
                class="h-full w-full object-cover">
            </div>
            <div class="flex flex-col gap-4">
              <UBadge color="primary" variant="subtle" class="w-fit">
                {{ t('badges.official') }}
              </UBadge>
              <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
                {{ artist?.name || 'Jhey Pi' }}
              </h1>
              <div class="max-w-2xl text-sm text-muted sm:text-base">
                <p v-for="(paragraph, index) in aboutCopy" :key="paragraph" :class="{ 'mt-4': index > 0 }">
                  {{ paragraph }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Motion>

    <Motion as="section" id="section-releases" v-bind="sectionMotion" class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">
            {{ t('section.releasesTitle') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('section.releasesSubtitle') }}
          </p>
        </div>
        <UBadge color="neutral" variant="subtle">
          {{ t('badges.latestDrops') }}
        </UBadge>
      </div>

      <div v-if="error" class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
        {{ t('errors.releases') }}
      </div>

      <div v-else>
        <UChangelogVersions :key="releasesPage" :indicator-motion="{ damping: 26, restDelta: 0.001 }"
          :versions="releaseVersions">
          <template #body="{ version }">
            <div class="mt-6">
              <EmbedFrame :item="version.item" />
            </div>
          </template>
        </UChangelogVersions>

        <div v-if="releasePageCount > 1" class="mt-6 flex justify-center">
          <UPagination :page="releasesPage" :total="releases.length" :items-per-page="releasesPerPage" size="sm"
            :ui="{ item: 'cursor-pointer', first: 'cursor-pointer', prev: 'cursor-pointer', next: 'cursor-pointer', last: 'cursor-pointer', ellipsis: 'cursor-pointer' }"
            @update:page="releasesPage = $event" />
        </div>
      </div>
    </Motion>

    <Motion as="section" id="section-videos" v-bind="sectionMotion" class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">
            {{ t('section.videosTitle') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('section.videosSubtitle') }}
          </p>
        </div>
        <UBadge color="neutral" variant="subtle">
          {{ t('badges.latestClips') }}
        </UBadge>
      </div>

      <div v-if="error" class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
        {{ t('errors.videos') }}
      </div>

      <div v-else>
        <UChangelogVersions :key="videosPage" :indicator-motion="{ damping: 26, restDelta: 0.001 }"
          :versions="videoVersions">
          <template #body="{ version }">
            <div class="mt-6">
              <EmbedFrame :item="version.item" />
            </div>
          </template>
        </UChangelogVersions>

        <div v-if="videoPageCount > 1" class="mt-6 flex justify-center">
          <UPagination :page="videosPage" :total="videos.length" :items-per-page="videosPerPage" size="sm"
            :ui="{ item: 'cursor-pointer', first: 'cursor-pointer', prev: 'cursor-pointer', next: 'cursor-pointer', last: 'cursor-pointer', ellipsis: 'cursor-pointer' }"
            @update:page="videosPage = $event" />
        </div>
      </div>
    </Motion>

    <div v-if="updatedAt" class="text-xs text-muted">
      {{ t('status.feedRefreshed') }} {{ updatedAt }}
    </div>

    <Motion as="section" id="section-contact" v-bind="sectionMotion" class="flex flex-col gap-4">
      <h2 class="text-2xl font-semibold">
        {{ t('section.contactTitle') }}
      </h2>
      <p class="max-w-3xl text-sm text-muted">
        {{ t('contactForm.intro').split('{instagram}')[0] }}
        <a href="https://instagram.com/mediaviarecords" target="_blank" rel="noreferrer"
          class="font-semibold text-primary hover:underline">Mediavia Records</a>
        {{ t('contactForm.intro').split('{instagram}')[1].split('{email}')[0] }}
        <a href="mailto:jp10.manager@gmail.com"
          class="font-semibold text-primary hover:underline">jp10.manager@gmail.com</a>
        {{ t('contactForm.intro').split('{email}')[1] }}
      </p>
      <UForm :state="contactForm" class="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2"
        @submit="handleContactSubmit">
        <UFormField :label="t('contactForm.nameLabel')" class="text-sm">
          <UInput v-model="contactForm.name" name="name" size="lg" :placeholder="t('contactForm.namePlaceholder')"
            class="w-full" />
        </UFormField>
        <UFormField :label="t('contactForm.emailLabel')" class="text-sm">
          <UInput v-model="contactForm.email" name="email" type="email" size="lg" required
            :placeholder="t('contactForm.emailPlaceholder')" class="w-full" />
        </UFormField>
        <UFormField :label="t('contactForm.messageLabel')" class="text-sm sm:col-span-2">
          <UTextarea v-model="contactForm.message" name="message" size="lg" :rows="4" required
            :placeholder="t('contactForm.messagePlaceholder')" class="w-full" />
        </UFormField>
        <div class="flex flex-wrap items-center gap-3 sm:col-span-2">
          <UButton type="submit" size="lg" color="primary" variant="solid" icon="i-heroicons-envelope"
            class="w-full sm:w-auto bg-gradient-to-r from-primary via-primary to-primary/80 shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-primary/50">
            {{ t('contactForm.submit') }}
          </UButton>
          <span class="text-xs text-muted">
            {{ t('contactForm.hint') }}
          </span>
        </div>
      </UForm>
      <!-- <div class="flex flex-wrap gap-3">
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
      </div> -->
    </Motion>

    <div v-if="pending" class="text-sm text-muted">
      {{ t('status.loading') }}
    </div>
  </main>
</template>
