/**
 * Todo el texto visible de la web. Cada cadena lleva su fuente:
 *   [chat]   = dicho por el cliente en el chat
 *   [img:X]  = leído en la imagen X
 *   [nav]    = texto funcional de interfaz (etiquetas, botones), sin afirmaciones
 * Prohibido añadir hechos sin fuente. Ver CONTENT-AUDIT.md.
 */
import { siteConfig } from './site.config';

const { names, president, coach } = siteConfig.founders;

/** "Mateo y José Luis" (solo nombres de pila) y "Mateo y José Luis Mazo". */
const foundersGiven = names.length ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : '';
const foundersNames = foundersGiven ? `${foundersGiven} Mazo` : '';

/** Con roles si el cliente los confirma; si no, sin asignar quién es quién. */
const foundersSentence =
  president && coach
    ? `S.D. Praga lo fundan los hermanos Mazo: ${president}, presidente, y ${coach}, entrenador.` // [chat] + roles
    : foundersNames
      ? `S.D. Praga lo fundan los hermanos ${foundersNames}: uno como entrenador, el otro como presidente.` // [chat] frase literal del cliente
      : 'S.D. Praga lo fundan los hermanos Mazo: uno como presidente, el otro como entrenador.'; // [chat]

export const content = {
  name: 'S.D. Praga', // [chat] + [img:escudo]
  nameShort: 'S.D.', // [img:escudo]
  nameLong: 'PRAGA', // [img:escudo]
  motto: 'Más que un equipo, una familia.', // [img:equipo]
  tagline: 'Club de fútbol para niños.', // [chat]

  meta: {
    title: 'S.D. Praga · Club de fútbol para niños', // [chat]
    description:
      'S.D. Praga es un club de fútbol para niños fundado por los hermanos Mazo y basado en valores: esfuerzo, confianza y diversión. Más que un equipo, una familia.', // [chat] + [img:equipo]
  },

  nav: [
    { href: '#historia', label: 'Historia' }, // [nav]
    { href: '#valores', label: 'Valores' }, // [nav]
    { href: '#familia', label: 'Familia' }, // [nav]
    { href: '#patrocinadores', label: 'Patrocinadores' }, // [nav] (pedido por el cliente)
    { href: '#contacto', label: 'Contacto' }, // [nav]
  ],

  hero: {
    ctaPrimary: { href: '#historia', label: 'Conoce nuestra historia' }, // [nav]
    ctaSecondary: { href: '#contacto', label: 'Contacto' }, // [nav]
    teamAlt:
      'Ilustración del equipo de S.D. Praga: adultos con sudaderas azul marino y niños con la equipación azul y roja.', // [img:equipo]
  },

  story: {
    title: 'Nuestra historia', // [nav]
    chapters: [
      {
        id: 'inquietud',
        number: '01',
        title: 'La inquietud', // [chat] (brief)
        text: 'El equipo nace de la inquietud de crear un club basado en valores: trabajo en equipo, sin individualidades.', // [chat]
        punch: 'Aquí nadie juega solo.', // [chat] paráfrasis de "no hay individualidades"
      },
      {
        id: 'mazo',
        number: '02',
        title: 'Los hermanos Mazo', // [chat]
        text: foundersSentence,
        // [chat] el cliente confirma que son ellos; no se dice quién es quién en la foto
        caption: foundersGiven || 'Los hermanos Mazo', // [chat] solo nombres de pila en la foto
        photoAlt: foundersNames
          ? `${foundersNames} sonríen abrazados sujetando una copa en un pabellón deportivo.`
          : 'Dos hombres sonríen abrazados sujetando una copa en un pabellón deportivo.', // [img:img2]
      },
      {
        id: 'une',
        number: '03',
        title: 'Lo que nos une', // [chat] (brief)
        text: 'Esfuerzo, confianza y diversión. Juntos suman sentimiento de equipo.', // [chat]
        link: { href: '#valores', label: 'Ver nuestros valores' }, // [nav]
      },
      {
        id: 'empezar',
        number: '04',
        title: 'Acabamos de empezar', // [chat] "recién empezado"
        text: 'Somos un club recién nacido. Lo que venga lo escribimos juntos.', // [chat]
      },
    ],
  },

  values: {
    title: 'Nuestros valores', // [nav]
    words: ['Esfuerzo', 'Confianza', 'Diversión'], // [chat]
    result: 'Sentimiento de equipo', // [chat]
  },

  family: {
    title: 'Más que un equipo, una familia.', // [img:equipo]
    imageAlt:
      'Ilustración del equipo S.D. Praga: adultos con sudaderas azul marino y niños con la equipación azul y roja, junto al nombre del club, el escudo y el lema «Más que un equipo, una familia».', // [img:equipo]
  },

  moments: {
    title: 'Momentos', // [nav]
    label: 'Portada de recuerdo', // [brief] etiqueta fija obligatoria
    imageAlt:
      'Portada de recuerdo enmarcada, con el titular «SD Praga impone su ley en La Mina» y una foto de niños celebrando con una copa.', // [img:img1]
  },

  sponsors: {
    title: 'Patrocinadores', // [cliente] más serio que el provisional del brief
    list: [
      { id: 'aguero', name: 'Aguero', image: 'logo-aguero', blend: true }, // [img:aguero] (el logo dice AGUERO®)
      { id: 'dupla', name: 'Dupla Logistics', image: 'logo-dupla', blend: true }, // [img:dupla]
      { id: 'travion', name: 'Travion IT Distribution', image: 'logo-travion', blend: false }, // [img:travion]
    ],
  },

  contact: {
    title: 'Contacto', // [nav]
    soon: 'Próximamente', // [cliente] estado honesto mientras no hay datos
    call: 'Llamar', // [nav]
    write: 'Escribir', // [nav]
    whatsapp: 'WhatsApp', // [nav]
    instagram: 'Instagram', // [nav]
  },

  footer: {
    copyright: `© ${new Date().getFullYear()} S.D. Praga`, // [brief]
  },

  ui: {
    skip: 'Saltar al contenido', // [nav]
    menu: 'Menú', // [nav]
    close: 'Cerrar', // [nav]
    tilt: 'Inclinar el escudo con el móvil', // [nav]
  },
} as const;
