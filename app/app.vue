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
        <div class="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <AppLogo class="h-6 w-auto text-highlighted" />
          <UColorModeButton />
        </div>
      </header>

      <NuxtPage />
    </div>
  </UApp>
</template>
