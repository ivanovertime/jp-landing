// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'

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

  vite: {
    plugins: [
      {
        name: 'nuxt-assets-root-guard',
        configureServer(server) {
          server.middlewares.use('/_nuxt', (req, res, next) => {
            if (!req.url || req.url === '/' || req.url === '') {
              res.statusCode = 204
              res.end()
              return
            }

            next()
          })
        }
      }
    ]
  },

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
      youtubeChannelId: env.YOUTUBE_CHANNEL_ID || '',
      maxYoutubeItems: env.MAX_YOUTUBE_ITEMS || '24',
      maxSpotifyItems: env.MAX_SPOTIFY_ITEMS || '24'
    }
  })(),

  routeRules: isProd
    ? {
        '/': { prerender: true, isr: 3600 },
        '/api/feed': { cache: { maxAge: 3600, staleMaxAge: 600 } }
      }
    : {},

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
