/**
 * Syncs canvas backing store to CSS size using ResizeObserver to prevent layout thrashing.
 * Handles devicePixelRatio changes (e.g., moving between monitors).
 */
function getDpr() {
  return typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
}

const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver((entries) => {
  const dpr = getDpr();
  for (let entry of entries) {
    const canvas = entry.target;
    let width, height;
    if (entry.devicePixelContentBoxSize) {
      width = entry.devicePixelContentBoxSize[0].inlineSize;
      height = entry.devicePixelContentBoxSize[0].blockSize;
    } else if (entry.borderBoxSize) {
      width = entry.borderBoxSize[0].inlineSize * dpr;
      height = entry.borderBoxSize[0].blockSize * dpr;
    } else {
      width = entry.contentRect.width * dpr;
      height = entry.contentRect.height * dpr;
    }
    canvas._cachedWidth = Math.round(width);
    canvas._cachedHeight = Math.round(height);
  }
}) : null;

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {boolean} true if dimensions changed
 */
export function syncCanvas(canvas) {
  const dpr = getDpr();

  if (!canvas._isObserved && resizeObserver) {
    resizeObserver.observe(canvas);
    canvas._isObserved = true;
    const rect = canvas.getBoundingClientRect();
    canvas._cachedWidth = Math.round(rect.width * dpr);
    canvas._cachedHeight = Math.round(rect.height * dpr);
  }

  const cw = canvas._cachedWidth || Math.round(canvas.clientWidth * dpr) || 1;
  const ch = canvas._cachedHeight || Math.round(canvas.clientHeight * dpr) || 1;

  // Provide logical size properties to avoid layout thrashing in draw loops
  canvas._logicalWidth = cw / dpr;
  canvas._logicalHeight = ch / dpr;

  if (canvas.width === cw && canvas.height === ch) return false;
  
  canvas.width = cw;
  canvas.height = ch;
  
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return true;
}
