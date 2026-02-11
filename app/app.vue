<script setup lang="ts">
import { Motion, easeOut } from 'motion-v'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en',
    class: 'dark'
  }
})

const fallbackDescription = 'Official landing page for Jhey Pi — releases, videos, and updates in one place.'

const { locale, locales, t, tArray } = useTranslations()

const aboutCopy = computed(() => tArray('copy.about'))

const seoTitle = computed(() => (
  locale.value === 'en'
    ? 'Jhey Pi — Official Artist Timeline'
    : 'Jhey Pi — Línea de tiempo oficial'
))

const seoDescription = computed(() => {
  const [firstParagraph = ''] = aboutCopy.value
  const description = (firstParagraph || fallbackDescription)
    .replace(/\s+/g, ' ')
    .trim()

  return description.length > 160 ? `${description.slice(0, 157)}...` : description
})

const isMenuOpen = ref(false)

const headerMotion = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easeOut }
}

const footerMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easeOut }
}

const navLinks = computed(() => [
  { label: t('nav.about'), href: '#section-about' },
  { label: t('nav.releases'), href: '#section-releases' },
  { label: t('nav.videos'), href: '#section-videos' },
  { label: t('nav.contact'), href: '#section-contact' }
])

const setLocale = (value: string) => {
  locale.value = value as typeof locale.value
}

const socialLinks = [
  {
    label: 'Instagram',
    icon: 'i-simple-icons-instagram',
    to: 'https://www.instagram.com/jpoficial_10',
    target: '_blank'
  },
  {
    label: 'YouTube',
    icon: 'i-simple-icons-youtube',
    to: 'https://www.youtube.com/c/JpJheyPi/featured',
    target: '_blank'
  },
  {
    label: 'Facebook',
    icon: 'i-simple-icons-facebook',
    to: 'https://www.facebook.com/juanmanuelparrabu',
    target: '_blank'
  },
  {
    label: 'TikTok',
    icon: 'i-simple-icons-tiktok',
    to: 'https://www.tiktok.com/@jhey.pii',
    target: '_blank'
  },
  {
    label: 'Spotify',
    icon: 'i-simple-icons-spotify',
    to: 'https://open.spotify.com/artist/12TET0GvQuCAO3O1tfwrf4',
    target: '_blank'
  }
]

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: '/social-preview.png',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: '/social-preview.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background">
      <Motion
        as="header"
        v-bind="headerMotion"
        class="relative overflow-hidden border-b border-default"
      >
        <SkyBg class="absolute inset-0" />
        <div class="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center justify-between gap-4">
              <AppLogo
                size="56"
                class="w-auto text-highlighted"
              />
              <UButton
                icon="i-heroicons-bars-3"
                variant="ghost"
                color="neutral"
                size="sm"
                class="sm:hidden"
                :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
                @click="isMenuOpen = !isMenuOpen"
              />
            </div>
            <nav class="hidden flex-wrap items-center justify-center gap-4 text-sm font-semibold text-muted sm:flex">
              <a
                v-for="link in navLinks"
                :key="link.href"
                :href="link.href"
                class="transition hover:text-highlighted"
              >
                {{ link.label }}
              </a>
            </nav>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <UButton
                v-for="link in socialLinks"
                :key="link.label"
                :icon="link.icon"
                :to="link.to"
                :target="link.target"
                variant="link"
                color="neutral"
                size="sm"
                :aria-label="link.label"
                class="h-9 w-9"
              />
            </div>
          </div>
          <div
            v-if="isMenuOpen"
            class="mt-4 sm:hidden"
          >
            <UCard class="border border-white/10 bg-background/90">
              <div class="flex flex-col gap-2">
                <UButton
                  v-for="link in navLinks"
                  :key="link.href"
                  :to="link.href"
                  variant="ghost"
                  color="neutral"
                  class="justify-start"
                  @click="isMenuOpen = false"
                >
                  {{ link.label }}
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </Motion>

      <NuxtPage />

      <Motion
        as="footer"
        v-bind="footerMotion"
        class="border-t border-default bg-background/80"
      >
        <div
          class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6"
        >
          <div>
            © {{ new Date().getFullYear() }} {{ locale === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.' }}
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs uppercase tracking-wide text-muted">
              {{ locale === 'en' ? 'Language' : 'Idioma' }}
            </span>
            <ULocaleSelect
              :model-value="locale"
              :locales="locales"
              size="sm"
              class="min-w-[140px]"
              @update:model-value="setLocale"
            />
          </div>
        </div>
      </Motion>
    </div>
  </UApp>
</template>
