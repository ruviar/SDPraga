// Botones: estado de pulsado (solo cambia el color, sin movimiento) y vibración corta en táctil.

const press = (el: HTMLElement) => {
  el.dataset.pressed = '';
};
const release = (el: HTMLElement) => {
  delete el.dataset.pressed;
};

export function initButtons() {
  document.querySelectorAll<HTMLElement>('[data-btn]').forEach((el) => {
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      press(el);
      if (e.pointerType === 'touch') navigator.vibrate?.(8);
    });
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(t, () => release(el));
    el.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) press(el);
    });
    el.addEventListener('keyup', () => release(el));
    el.addEventListener('blur', () => release(el));
  });
}
