# Sistema visual y decisiones · S.D. Praga

## Dirección (contrato)
- **Tesis**: la página se lee como el escudo de arriba abajo: banda azul → línea negra → franjas rojas → marino de las sudaderas. Nada de plantilla: cada sección tiene su propio ritmo.
- **Mundo**: colores del equipo como fondo (nunca blanco), malla de camiseta como textura, pista de fútbol sala a escala real como motivo, franjas del escudo como divisor, botones planos (sin sombra ni movimiento).
- **Primera pantalla**: fondo = ilustración del equipo (solo personas) difuminada, en multiply sobre el azul y con velo marino, empezando bajo la barra. «S.D.» (oro) + «PRAGA» gigante (crema) abajo-izquierda, lema con pincel rojo, subtítulo, CTA «Conoce nuestra historia» (crema) + «Contacto» (rojo). Escritorio: escudo suelto (sin recuadro) a la derecha, centrado en su columna.
- **Movimiento**: solo vertical. Intro de franjas ≤660 ms (1.ª visita). Historia = pila sticky de páginas. Valores = palabras que caen/suben y se igualan en ancho (eje wdth). Familia = cortina de franjas. Todo degradable con reduced-motion.

## Tokens (`src/styles/global.css`)
azul-escudo #074D88 · azul-camiseta #0A35BC · marino #08122B · rojo #CB302C · rojo-osc (rojo + 18 % negro) · crema #FDFAF5 · cian #50C4F5 · oro #F2B21B. Definidos en OKLCH; contraste en `.claude/qa/contrast.md`.
Tipos: Anybody (display, ejes wdth 50–150 / wght) · Instrument Sans (texto). Radios: 14 px controles/tarjetas, 22 px páginas de Historia, 3 px papel.

## Mapa de secciones
| Sección | Fondo | Mecanismo |
|---|---|---|
| Cabecera (todas) | marino, escudo sobresaliente por encima de las 7 franjas | ≥1024: enlaces con subrayado rojo; <1024: hamburguesa + panel a pantalla completa |
| Hero | ilustración del equipo difuminada + velo marino | CSS: intro, «PRAGA» wdth 58→100, pincel |
| Historia | 4 bandas: marino · azul escudo · amarillo pabellón · rojo (línea negra encima) | texto izq./dcha. alterno (≥768); revelados verticales |
| Valores | degradado marino → azul → camiseta (cambia al bajar) | título grande; ≥1024: sticky 300svh, las palabras aparecen una a una; móvil: estático |
| Familia | franjas rojo / rojo oscuro, línea negra arriba | lámina crema con multiply, cortina de franjas |
| Patrocinadores | azul escudo + malla | banda blanca a todo el ancho, logos en fila sin recuadros |
| Contacto + pie | marino, pista en cian, franjas arriba | título que sube, pista que se dibuja |

## Registro de decisiones (19-10-2026)
1. Brief inicial: Historia en scroll horizontal con pin. **Cambiado** a pila vertical: el cliente no quiere animaciones horizontales en el scroll. También se quitaron el estiramiento de «PRAGA»/«CONTACTO» ligado al scroll y la cinta (marquee) de patrocinadores.
2. Fondos crema → **colores del equipo** (degradados + textura de malla): el cliente encontraba el blanco aburrido. Familia conserva una lámina crema porque el multiply de equipo.jpeg lo necesita.
3. Escudo 3D flotante con inclinación al cursor y giroscopio → **escudo estático en recuadro con sombra**: petición del cliente. Referencia estética: webs de clubes profesionales (fcbarcelona.com) → cabecera de club a todo el ancho con el escudo sobresaliendo y franjas del club debajo, etiquetas en mayúsculas condensadas.
4. Rendimiento: GSAP/Lenis se cargan con la primera interacción; secciones bajo el pliegue con `content-visibility: auto` (+ ResizeObserver que refresca ScrollTrigger). El menú móvil vive en `boot.ts` para funcionar desde el primer toque.
5. Activos: escudo vectorizado por capas de color (potrace) y validado por superposición; img1 corregida con homografía 4 puntos (marco); Travion venía con fondo negro (alfa perdido) y se recupera el alfa por canal dominante; Aguero se recorta por caja de tinta (tenía líneas de marco casi invisibles).
10. Ronda 6 del cliente: hero con la ilustración del equipo de fondo (difuminada, bajo la barra) y escudo sin recuadro, más centrado y más arriba; Historia en 4 bandas de color alternas (la 3 en amarillo pabellón para no encadenar azules); Valores con título grande y palabras que aparecen al bajar, sin flotar antes; fundadores «Mateo y José Luis Mazo» (pie de foto solo con nombres; roles sin asignar). `#historia` pasa a `content-visibility: auto` (TBT).
9. Ronda 5 del cliente (móvil): navbar arriba en lugar del dock inferior; el escudo del hero pasa a ser fondo oscurecido bajo el nombre (sin recuadro ni bloque previo); Valores sin animación en móvil. Corregido además el salto de anclas: el destino se calcula con `scrollY` real (Lenis podía ir un fotograma por detrás) y el margen de la barra se aplica una sola vez (scroll-margin-top).
8. Ronda 4 del cliente: fuera el botón «Sonido de botones» y el clic sonoro (Web Audio).
7. Ronda 3 del cliente: botones planos, sin canto ni sombra de profundidad y sin moverse al pasar el cursor (ni magnetismo ni hundimiento); el estado se indica solo con el color.
6. Ronda 2 del cliente: fuera el marcador de partido; el escudo de la cabecera pasa por encima de las franjas; «Aquí nadie juega solo.» alineado a la izquierda bajo el texto; capítulo 03 sin el cuadrado de franjas y con tamaños limitados por el alto; Valores centrado, más pequeño y con margen; la ilustración de Familia cabe entera en pantalla; «Colaboradores» → «Patrocinadores» en banda blanca; contacto «Próximamente».
