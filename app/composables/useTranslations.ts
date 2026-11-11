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
    events: string
    contact: string
  }
  section: {
    aboutTitle: string
    releasesTitle: string
    videosTitle: string
    eventsTitle: string
    eventsSubtitle: string
    eventsEmpty: string
    contactTitle: string
  }
  tabs: {
    singles: string
    albums: string
    singlesEmpty: string
    albumsEmpty: string
    videos: string
    shorts: string
    videosEmpty: string
    shortsEmpty: string
  }
  contactForm: {
    intro: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    messageLabel: string
    messagePlaceholder: string
    submit: string
    hint: string
  }
  badges: {
    official: string
    latestDrops: string
    latestClips: string
    upcoming: string
  }
  labels: {
    when: string
    location: string
    links: string
    followers: string
  }
  links: {
    calendar: string
    live: string
    rsvp: string
    download: string
    link: string
    attachment: string
  }
  copy: {
    about: string[]
  }
  errors: {
    releases: string
    videos: string
    events: string
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
      events: 'Eventos',
      contact: 'Contacto'
    },
    section: {
      aboutTitle: 'Sobre mi',
      releasesTitle: 'Lanzamientos',
      videosTitle: 'Videos',
      eventsTitle: 'Próximos eventos',
      eventsSubtitle: 'Agenda pública del artista',
      eventsEmpty: 'No hay eventos próximos en este momento.',
      contactTitle: 'Contacto'
    },
    tabs: {
      singles: 'Singles',
      albums: 'Álbumes',
      singlesEmpty: 'Aún no hay singles disponibles.',
      albumsEmpty: 'Aún no hay álbumes disponibles.',
      videos: 'Videos',
      shorts: 'Shorts',
      videosEmpty: 'Aún no hay videos disponibles.',
      shortsEmpty: 'Aún no hay shorts disponibles.'
    },
    contactForm: {
      intro: '¿Quieres colaborar con Jhey Pi? Escríbenos un DM a {instagram} o email {email}.',
      nameLabel: 'Nombre',
      namePlaceholder: 'Tu nombre',
      emailLabel: 'Email',
      emailPlaceholder: 'tu@email.com',
      messageLabel: 'Mensaje',
      messagePlaceholder: 'Cuéntanos tu idea de colaboración',
      submit: 'Enviar correo',
      hint: 'Se abrirá tu aplicación de correo con el mensaje listo para enviar.'
    },
    badges: {
      official: 'Página oficial del artista',
      latestDrops: 'Últimos lanzamientos',
      latestClips: 'Últimos clips',
      upcoming: 'Próximamente'
    },
    labels: {
      when: 'Cuándo',
      location: 'Lugar',
      links: 'Enlaces',
      followers: 'seguidores'
    },
    links: {
      calendar: 'Agendar en calendario',
      live: 'Entrar en vivo',
      rsvp: 'Confirmar asistencia',
      download: 'Descargar info',
      link: 'Abrir enlace',
      attachment: 'Descargar archivo'
    },
    copy: {
      about: [
        'Jhey Pi es un cantante, compositor e intérprete venezolano de 17 años, radicado en Estados Unidos. Su trayectoria artística comenzó desde la infancia, destacándose en la música, la actuación y la televisión.',
        'Con más de un millón de seguidores orgánicos en redes sociales y un catálogo de más de 100 canciones publicadas, ha construido una carrera independiente caracterizada por su versatilidad, autenticidad y conexión con las nuevas generaciones.',
        'Su propuesta fusiona trap latino, pop urbano y sonidos contemporáneos.',
        'Durante 2026 fortaleció su proyección internacional con colaboraciones junto a Micro TDH en «Fer y Juan», Chino & Nacho en «GPT», Rummy Olivo, Sixto Rein y Neeus.',
        'Su canción «Trompeta», compuesta por él y grabada en su habitación en 2025, superó las 400.000 reproducciones en Spotify y recibió atención de Univision.',
        'Jhey Pi continúa consolidándose como una de las jóvenes promesas de la música urbana venezolana.'
      ]
    },
    errors: {
      releases: 'No se pudieron cargar los lanzamientos en este momento.',
      videos: 'No se pudieron cargar los videos en este momento.',
      events: 'No se pudieron cargar los eventos en este momento.'
    },
    status: {
      feedRefreshed: 'Última actualización:',
      loading: 'Cargando el feed más reciente…'
    }
  },
  en: {
    nav: {
      about: 'About',
      releases: 'Releases',
      videos: 'Videos',
      events: 'Events',
      contact: 'Contact'
    },
    section: {
      aboutTitle: 'About',
      releasesTitle: 'Releases',
      videosTitle: 'Videos',
      eventsTitle: 'Upcoming events',
      eventsSubtitle: 'Public artist calendar',
      eventsEmpty: 'No upcoming events right now.',
      contactTitle: 'Contact'
    },
    tabs: {
      singles: 'Singles',
      albums: 'Albums',
      singlesEmpty: 'No singles available yet.',
      albumsEmpty: 'No albums available yet.',
      videos: 'Videos',
      shorts: 'Shorts',
      videosEmpty: 'No videos available yet.',
      shortsEmpty: 'No shorts available yet.'
    },
    contactForm: {
      intro: 'Want to collaborate with Jhey Pi? Send us a DM at {instagram} or email {email}.',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@email.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Tell us about your collaboration idea',
      submit: 'Send email',
      hint: 'Your email app will open with the message ready to send.'
    },
    badges: {
      official: 'Official artist page',
      latestDrops: 'Latest drops',
      latestClips: 'Latest clips',
      upcoming: 'Upcoming'
    },
    labels: {
      when: 'When',
      location: 'Location',
      links: 'Links',
      followers: 'followers'
    },
    links: {
      calendar: 'Add to calendar',
      live: 'Join live',
      rsvp: 'RSVP',
      download: 'Download info',
      link: 'Open link',
      attachment: 'Download file'
    },
    copy: {
      about: [
        'Jhey Pi is a Venezuelan urban artist based in the United States who has built, entirely independently, a community of more than one million organic followers across digital platforms. His musical proposal blends melodic sensitivity, contemporary urban energy, and an authentic identity that connects with young Latin audiences inside and outside the United States.',
        'His single “Making LUV” marked a turning point in his international projection, surpassing 130,000 streams on Spotify and showing a standout response in Spain during its first weeks. The release showed solid metrics in saves, organic repeat listening, and audience retention—key indicators of real connection beyond one‑time consumption.',
        'The project has developed without the backing of a multinational label, under a structured independent model that integrates strategic release planning, digital platform optimization, and consistent brand building. Growth has been sustained, based on discipline, consistency, and an authentic community that actively responds to each release.',
        'Currently, Jhey Pi is in a stage of international expansion and consolidation, strengthening his musical and visual identity while projecting new collaborations and strategic alliances that amplify the reach of a project already validated organically.'
      ]
    },
    errors: {
      releases: 'Unable to load releases right now.',
      videos: 'Unable to load videos right now.',
      events: 'Unable to load events right now.'
    },
    status: {
      feedRefreshed: 'Last updated:',
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
