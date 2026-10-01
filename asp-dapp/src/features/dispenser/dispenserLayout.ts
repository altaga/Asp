/** Dispenser SVG geometry: a 2 × 5 shelf window, side control panel, pickup tray. */
export const MACHINE_VIEW = { w: 320, h: 440 };
export const TRAY = { x: 160, y: 384 };
export const BUTTON = { x: 253, y: 244 };

const COLS = [84, 164];
export const ROW_TOP = 90;
export const ROW_H = 44;
export const ROWS = 5;
export const WINDOW_SLOTS = ROWS * COLS.length;

/** Where the i-th visible slot sits (0-based, filled left→right, top→bottom). */
export function slotCenter(i: number) {
  return { x: COLS[i % 2], y: ROW_TOP + Math.floor(i / 2) * ROW_H + 16 };
}

/** First edition shown in the window: the page of 10 that holds `next` (runs longer than 10 page through). */
export function windowStart(next: number) {
  return Math.floor((Math.max(next, 1) - 1) / WINDOW_SLOTS) * WINDOW_SLOTS + 1;
}

export const FALL_MS = 1300;
