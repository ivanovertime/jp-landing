<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Musician Timeline'
const description = 'A living landing page that connects Spotify and YouTube into one immersive timeline.'

const socialLinks = [
  {
    label: 'Instagram',
    icon: 'i-simple-icons-instagram',
    to: 'https://www.instagram.com/',
    target: '_blank'
  },
  {
    label: 'YouTube',
    icon: 'i-simple-icons-youtube',
    to: 'https://www.youtube.com/c/JpJheyPi/',
    target: '_blank'
  },
  {
    label: 'Facebook',
    icon: 'i-simple-icons-facebook',
    to: 'https://www.facebook.com/',
    target: '_blank'
  },
  {
    label: 'X',
    icon: 'i-simple-icons-x',
    to: 'https://x.com/',
    target: '_blank'
  },
  {
    label: 'TikTok',
    icon: 'i-simple-icons-tiktok',
    to: 'https://www.tiktok.com/',
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
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/social-preview.png',
  twitterImage: '/social-preview.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-background">
      <header class="relative overflow-hidden border-b border-default">
        <SkyBg class="absolute inset-0" />
        <div class="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <AppLogo size="56" class="w-auto text-highlighted" />
          <nav class="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-muted">
            <a href="#section-about" class="transition hover:text-highlighted">About</a>
            <a href="#section-releases" class="transition hover:text-highlighted">Releases</a>
            <a href="#section-videos" class="transition hover:text-highlighted">Videos</a>
            <a href="#section-contact" class="transition hover:text-highlighted">Contact</a>
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
      </header>

      <NuxtPage />
    </div>
  </UApp>
</template>
