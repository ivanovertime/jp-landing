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

const props = defineProps<{
  item: FeedItem
}>()

const wrapperStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.item.aspectRatio) {
    style.aspectRatio = props.item.aspectRatio
  }

  if (props.item.height) {
    if (props.item.provider !== 'spotify') {
      style.height = props.item.height
    }
  }

  return style
})

const iframeAllow = computed(() => {
  if (props.item.provider === 'spotify') {
    return 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
  }

  return 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
})
</script>

<template>
  <div class="rounded-2xl border border-default bg-default/60 shadow-sm">
    <div
      class="w-full overflow-hidden rounded-2xl bg-black/10"
      :class="{ 'embed-spotify': item.provider === 'spotify' }"
      :style="wrapperStyle"
    >
      <iframe
        class="h-full w-full"
        :src="item.embedUrl"
        loading="lazy"
        frameborder="0"
        allowfullscreen
        :allow="iframeAllow"
        referrerpolicy="strict-origin-when-cross-origin"
      />
    </div>

    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <div class="text-xs font-medium uppercase tracking-wide text-muted">
        {{ item.provider }} · {{ item.type }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.embed-spotify {
  height: clamp(152px, 9vw, 200px);
}

@media (min-width: 1440px) {
  .embed-spotify {
    height: clamp(152px, 4.5vw, 200px);
  }
}
</style>
