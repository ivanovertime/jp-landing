type LocaleCode = 'es' | 'en'

type UiLocale = {
  code: LocaleCode
  name: string
  dir: 'ltr' | 'rtl'
  messages: Messages
}

type Messages = {
  nav: {
    about: string
    releases: string
    videos: string
    contact: string
  }
  section: {
    aboutTitle: string
    releasesTitle: string
    releasesSubtitle: string
    videosTitle: string
    videosSubtitle: string
    contactTitle: string
  }
  badges: {
    official: string
    latestDrops: string
    latestClips: string
  }
  copy: {
    about: string[]
  }
  errors: {
    releases: string
    videos: string
  }
  status: {
    feedRefreshed: string
    loading: string
  }
}

const messages: Record<LocaleCode, Messages> = {
  es: {
    nav: {
      about: 'Sobre mi',
      releases: 'Lanzamientos',
      videos: 'Videos',
      contact: 'Contacto'
    },
    section: {
      aboutTitle: 'Sobre mi',
      releasesTitle: 'Lanzamientos',
      releasesSubtitle: 'Embeds de Spotify · Actualizado cada hora',
      videosTitle: 'Videos',
      videosSubtitle: 'Embeds de YouTube · Actualizado cada hora',
      contactTitle: 'Contacto'
    },
    badges: {
      official: 'Página oficial del artista',
      latestDrops: 'Últimos lanzamientos',
      latestClips: 'Últimos clips'
    },
    copy: {
      about: [
        'Jhey Pi es un artista urbano emergente venezolano basado en EE.UU., con más de 1 millón de seguidores orgánicos en sus redes sociales y un sonido melódico que conecta con audiencias jóvenes latinas.',
        'Su más reciente lanzamiento “Making LUV” está mostrando momentum notable: más de 10.000 streams solo en España en los primeros 15 días, guardados altos y repetición orgánica.',
        'Con influencias de Duki, Milo J y la nueva ola latina, Jhey Pi mezcla trap suave, vibra callejera elegante y letras con identidad propia.',
        'Todo su crecimiento ha sido sin disquera, impulsado por estrategia, contenido y comunidad real.'
      ]
    },
    errors: {
      releases: 'No se pudieron cargar los lanzamientos en este momento.',
      videos: 'No se pudieron cargar los videos en este momento.'
    },
    status: {
      feedRefreshed: 'Feed actualizado:',
      loading: 'Cargando el feed más reciente…'
    }
  },
  en: {
    nav: {
      about: 'About',
      releases: 'Releases',
      videos: 'Videos',
      contact: 'Contact'
    },
    section: {
      aboutTitle: 'About',
      releasesTitle: 'Releases',
      releasesSubtitle: 'Spotify embeds · Updated hourly',
      videosTitle: 'Videos',
      videosSubtitle: 'YouTube embeds · Updated hourly',
      contactTitle: 'Contact'
    },
    badges: {
      official: 'Official artist page',
      latestDrops: 'Latest drops',
      latestClips: 'Latest clips'
    },
    copy: {
      about: [
        'Jhey Pi is an emerging Venezuelan urban artist based in the U.S., with more than 1 million organic followers on social media and a melodic sound that connects with young Latin audiences.',
        'His most recent release “Making LUV” is showing notable momentum: more than 10,000 streams in Spain in the first 15 days, high saves, and organic repeat listening.',
        'With influences from Duki, Milo J, and the new Latin wave, Jhey Pi blends soft trap, an elegant street vibe, and lyrics with his own identity.',
        'All of his growth has been without a label, driven by strategy, content, and a real community.'
      ]
    },
    errors: {
      releases: 'Unable to load releases right now.',
      videos: 'Unable to load videos right now.'
    },
    status: {
      feedRefreshed: 'Feed refreshed:',
      loading: 'Loading the latest feed…'
    }
  }
}

export function useTranslations() {
  const locale = useState<LocaleCode>('locale', () => 'es')
  const locales: UiLocale[] = [
    { code: 'es', name: 'Español', dir: 'ltr', messages: messages.es },
    { code: 'en', name: 'English', dir: 'ltr', messages: messages.en }
  ]

  const current = computed(() => messages[locale.value] || messages.es)

  function resolvePath(path: string): unknown {
    const parts = path.split('.')
    let value: unknown = current.value
    for (const part of parts) {
      if (!value || typeof value !== 'object' || !(part in value)) {
        return undefined
      }
      value = (value as Record<string, unknown>)[part]
    }
    return value
  }

  function t(path: string): string {
    const value = resolvePath(path)
    return typeof value === 'string' ? value : ''
  }

  function tArray(path: string): string[] {
    const value = resolvePath(path)
    return Array.isArray(value) ? value : []
  }

  return { locale, locales, t, tArray }
}
