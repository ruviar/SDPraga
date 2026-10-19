/**
 * Configuración del sitio. Cambiar un dato aquí NUNCA implica tocar componentes.
 * Todo lo vacío se oculta o muestra un estado honesto ("Próximamente").
 * Ver CONTENT-AUDIT.md y la lista de preguntas pendientes en README.md.
 */
export const siteConfig = {
  /** Dominio público, p. ej. 'https://sdpraga.es'. PENDIENTE (pregunta 6). Vacío = sin canonical ni og:url. */
  url: '',

  contact: {
    /** Teléfono en formato internacional, p. ej. '+34600000000'. PENDIENTE. */
    phone: '',
    /** Correo, p. ej. 'hola@sdpraga.es'. PENDIENTE. */
    email: '',
    /** Número para WhatsApp (solo dígitos con prefijo, p. ej. '34600000000'). Vacío = se usa `phone`. */
    whatsapp: '',
  },

  social: {
    /** Usuario de Instagram sin @. PENDIENTE. */
    instagram: '',
  },

  /** Hermanos Mazo. Nombres dados por el cliente (19-10-2026).
   *  Rol de cada uno PENDIENTE (pregunta 1): mientras esté vacío se dice
   *  "uno como presidente, el otro como entrenador" sin asignarlo. */
  founders: {
    names: ['Mateo', 'José Luis'],
    president: '', // nombre de pila del presidente, cuando se confirme
    coach: '', // nombre de pila del entrenador, cuando se confirme
  },

  /** img2 en el capítulo "Los hermanos Mazo" (el cliente confirma que son ellos). */
  showFoundersPhoto: true,

  /** Sección "Momentos" (portada de recuerdo, img1). Solo con permiso explícito (preguntas 3 y 4). */
  showMoments: false,

  /** Enlace de cada colaborador (solo si el cliente lo da, pregunta 5). */
  sponsorUrls: {
    aguero: '',
    dupla: '',
    travion: '',
  },
} as const;

export type SiteConfig = typeof siteConfig;
