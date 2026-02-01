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
          <nav class="flex flex-wrap items-center gap-4 text-sm font-semibold text-muted">
            <a href="#section-releases" class="transition hover:text-highlighted">Releases</a>
            <a href="#section-videos" class="transition hover:text-highlighted">Videos</a>
            <a href="#section-about" class="transition hover:text-highlighted">About</a>
            <a href="#section-contact" class="transition hover:text-highlighted">Contact</a>
          </nav>
          <!-- <UColorModeButton /> -->
        </div>
      </header>

      <NuxtPage />
    </div>
  </UApp>
</template>
