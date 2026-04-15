/**
 * Syncs canvas backing store to CSS size (devicePixelRatio-aware).
 * @param {HTMLCanvasElement} canvas
 * @returns {boolean} true if dimensions changed
 */
export function syncCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cw = Math.round(rect.width * dpr);
  const ch = Math.round(rect.height * dpr);
  if (canvas.width === cw && canvas.height === ch) return false;
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return true;
}
