// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  dir: {
    public: '../public'
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    highlight: {
      langs: ['diff', 'ts', 'vue', 'css']
    },
    remarkPlugins: {
      'remark-github': {
        options: {
          repository: 'nuxt-ui-templates/changelog'
        }
      }
    }
  },

  ui: {
    theme: {
      defaultVariants: {
        color: 'neutral'
      }
    }
  },

  runtimeConfig: (() => {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

    return {
      spotifyClientId: env.SPOTIFY_CLIENT_ID || '',
      spotifyClientSecret: env.SPOTIFY_CLIENT_SECRET || '',
      spotifyArtistId: env.SPOTIFY_ARTIST_ID || '12TET0GvQuCAO3O1tfwrf4',
      youtubeChannelUrl: env.YOUTUBE_CHANNEL_URL || 'https://www.youtube.com/c/JpJheyPi',
      youtubeChannelId: env.YOUTUBE_CHANNEL_ID || ''
    }
  })(),

  routeRules: {
    '/': { prerender: true, isr: 3600 },
    '/api/feed': { cache: { maxAge: 3600, staleMaxAge: 600 } }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
