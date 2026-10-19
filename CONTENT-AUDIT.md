# CONTENT-AUDIT · S.D. Praga

Cada frase o dato visible (o leído por buscadores / lectores de pantalla) y su fuente.
Fuentes: **chat** = dicho por el cliente · **img:X** = leído en la imagen X · **brief** = texto fijado en el encargo · **UI** = etiqueta funcional sin afirmaciones · **PENDIENTE** = no se publica hasta que el cliente lo dé.

Todo el texto vive en `src/content.ts` y `src/site.config.ts` (cada cadena lleva su fuente en un comentario).

## Datos publicados

| Dónde | Texto / dato | Fuente |
|---|---|---|
| Global | Nombre «S.D. Praga» | chat + img:escudo (el escudo dice «S.D. PRAGA») |
| Hero, Familia, pie, meta | Lema «Más que un equipo, una familia.» | img:equipo (impreso en la ilustración) |
| Hero | «Club de fútbol para niños.» | chat |
| Historia 01 | «El equipo nace de la inquietud de crear un club basado en valores: trabajo en equipo, sin individualidades.» | chat (cita casi literal) |
| Historia 01 | «Aquí nadie juega solo.» | chat (paráfrasis de «no hay individualidades»; ver pregunta 9) |
| Historia 02 | «S.D. Praga lo fundan los hermanos Mateo y José Luis Mazo: uno como entrenador, el otro como presidente.» | chat (frase literal del cliente, 19-10-2026; no asigna quién es quién) |
| Historia 02 | Foto img2 (recorte caras + copa) con pie «Mateo y José Luis» | img:img2 + chat (el cliente confirma que son ellos y pide el pie solo con nombres de pila) |
| Historia 03 | «Esfuerzo, confianza y diversión. Juntos suman sentimiento de equipo.» | chat (valores = sentimiento de equipo) |
| Historia 04 | «Somos un club recién nacido. Lo que venga lo escribimos juntos.» | chat («recién empezado») + brief |
| Valores | ESFUERZO + CONFIANZA + DIVERSIÓN = SENTIMIENTO DE EQUIPO | chat |
| Familia | Ilustración del equipo (equipo.jpeg), sin retoques | img:equipo |
| Patrocinadores | Título «Patrocinadores» | cliente (sustituye al provisional «Los que nos ayudan a jugar») |
| Patrocinadores | Logo de Aguero (alt «Aguero») | img:aguero (el logo dice AGUERO®; ver pregunta 5) |
| Patrocinadores | Logo de Dupla Logistics (alt «Dupla Logistics») | img:dupla |
| Patrocinadores | Logo de Travion IT Distribution (alt «Travion IT Distribution») | img:travion |
| Contacto | «Próximamente» | cliente (estado honesto: no hay datos aún) |
| Pie | «© 2026 S.D. Praga» | brief (año de compilación) |
| Escudo, favicon, OG | Escudo vectorizado sin rediseñar | img:escudo (comparación por superposición: 0 % de diferencia interior, `.claude/qa/escudo-report.json`) |

## Interfaz (sin afirmaciones)

«Historia», «Valores», «Familia», «Patrocinadores», «Contacto», «Nuestra historia», «Nuestros valores», «Conoce nuestra historia», «Ver nuestros valores», «Saltar al contenido», «Menú», «Cerrar», números de capítulo 01–04, operadores «+ =».
Solo aparecen si se rellenan en `site.config.ts`: «Llamar», «Escribir», «WhatsApp», «Instagram».

## Textos alternativos

| Imagen | Alt | Fuente |
|---|---|---|
| Escudo (hero) | Escudo de S.D. Praga: banda azul con el nombre, franjas verticales rojas y blancas, un balón y una estrella roja. | img:escudo |
| img2 | Mateo y José Luis Mazo sonríen abrazados sujetando una copa en un pabellón deportivo. | img:img2 + chat (no dice quién es quién) |
| equipo.jpeg | Ilustración del equipo S.D. Praga: adultos con sudaderas azul marino y niños con la equipación azul y roja, junto al nombre del club, el escudo y el lema «Más que un equipo, una familia». | img:equipo (sin cifras ni nombres) |
| Logos | Nombre del patrocinador (no hay texto visible al lado) | img:aguero / img:dupla / img:travion |
| Escudos del menú y pie | `alt=""` (decorativos, el enlace lleva texto) | — |
| OG | Escudo de S.D. Praga sobre fondo azul con franjas rojas y blancas. | img:escudo |
| img1 (oculta) | Portada de recuerdo enmarcada, con el titular «SD Praga impone su ley en La Mina» y una foto de niños celebrando con una copa. | img:img1 · solo si `showMoments` |

## SEO / datos estructurados

- `<title>` «S.D. Praga · Club de fútbol para niños» (brief/chat).
- Meta description: nombre + «club de fútbol para niños fundado por los hermanos Mazo y basado en valores: esfuerzo, confianza y diversión» + lema (chat + img:equipo).
- JSON-LD `SportsOrganization`: `name`, `sport: Fútbol`, `slogan` (lema), `logo`, `founder` = dos `Person`: Mateo Mazo y José Luis Mazo (chat), sin rol. **Sin** dirección, teléfono, email, fecha de fundación ni URL hasta que el cliente los dé (se añaden solos desde `site.config.ts`).

## Retirado o no publicado (sin fuente o pendiente de permiso)

| Contenido | Estado | Motivo |
|---|---|---|
| Portada img1 («SD Praga impone su ley en La Mina», 3-1, «campeón», «Líderes invictos») | Construida pero **oculta** (`showMoments: false`) | Mezcla un diario real (AS) con contenido personalizado; casi seguro es un regalo/montaje. Además muestra niños reconocibles. Si se activa, siempre con la etiqueta «Portada de recuerdo», nunca como prensa ni título. |
| Fecha de fundación, localidad, pabellón, horarios, categorías, edades, nº de jugadores, palmarés, resultados | No publicado | Sin fuente |
| Quién de los dos es presidente y quién entrenador | No publicado | PENDIENTE (`site.config.ts > founders.president/coach`) |
| Teléfono, email, Instagram, WhatsApp, dominio | No publicado | No existen todavía |
| Descripciones de patrocinadores | No publicado | Solo nombre + logo (brief) |
| Enlaces de patrocinadores | No publicado | Sin URL del cliente |
| Nombre del torneo de img2 (texto de la copa) | No publicado | No se lee ni se inventa |
| Fecha de img2 (31/05/2026) | Recortada | Sello de cámara, no es un dato del club |
