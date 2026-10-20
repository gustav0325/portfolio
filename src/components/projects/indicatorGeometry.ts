// Geometria do indicador lateral nos frames 13:11, 35:244 e 35:273 (79×358),
// em px do Figma. Compartilhada pelo componente e pela animação.
export const SLOT_CENTERS = [17.5, 181.5, 345.5]; // centro vertical de cada bolinha
export const CENTER_X = 17.5;
export const ACTIVE_SIZE = 35;
export const IDLE_SIZE = 25;
const TRACK_GAP = 8; // distância entre a bolinha e o trilho

/** Valor em px do Figma como medida CSS na escala da seção. */
export const px = (value: number) => `calc(${value} * var(--u))`;

/**
 * Trilho entre a bolinha i e a seguinte quando `activeIndex` está ativo: a
 * bolinha ativa é maior, então o trilho encolhe do lado dela.
 */
export function indicatorTrack(i: number, activeIndex: number) {
  const radius = (j: number) => (j === activeIndex ? ACTIVE_SIZE : IDLE_SIZE) / 2;
  const top = SLOT_CENTERS[i] + radius(i) + TRACK_GAP;
  const bottom = SLOT_CENTERS[i + 1] - radius(i + 1) - TRACK_GAP;
  return { top, height: bottom - top };
}

/**
 * Preenchimento do trecho i: clamp(avanço − i, 0, 1), com avanço = posição do
 * projeto ativo + 0,5 — no Figma, o trecho seguinte ao ativo aparece pela
 * metade (estado 1 → 0,5; estado 2 → 1,5; estado 3 → 2).
 */
export const indicatorFill = (i: number, position: number) =>
  Math.min(Math.max(position + 0.5 - i, 0), 1);
