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
      latestClips: 'Últimos clips'
    },
    copy: {
      about: [
        'Jhey Pi es un artista urbano venezolano radicado en Estados Unidos que ha construido, de manera completamente independiente, una comunidad que supera el millón de seguidores orgánicos en plataformas digitales. Su propuesta musical combina sensibilidad melódica, energía urbana contemporánea y una identidad auténtica que conecta con audiencias jóvenes latinas dentro y fuera de Estados Unidos.',
        'Su sencillo “Making LUV” marcó un punto de consolidación en su proyección internacional, superando las 130.000 reproducciones en Spotify y mostrando una respuesta destacada en España durante sus primeras semanas. El lanzamiento evidenció métricas sólidas de guardados, repetición orgánica y retención de audiencia, indicadores clave de conexión real más allá del consumo puntual.',
        'El proyecto se ha desarrollado sin respaldo de una disquera multinacional, bajo un modelo independiente estructurado que integra planificación estratégica de lanzamientos, optimización de plataformas digitales y construcción constante de marca. El crecimiento ha sido sostenido, basado en disciplina, consistencia y una comunidad auténtica que responde activamente a cada estreno.',
        'Actualmente, Jhey Pi se encuentra en una etapa de expansión y consolidación internacional, fortaleciendo su identidad musical y visual mientras proyecta nuevas colaboraciones y alianzas estratégicas que potencien el alcance de un proyecto ya validado de forma orgánica.'
      ]
    },
    errors: {
      releases: 'No se pudieron cargar los lanzamientos en este momento.',
      videos: 'No se pudieron cargar los videos en este momento.'
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
      latestClips: 'Latest clips'
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
      videos: 'Unable to load videos right now.'
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
