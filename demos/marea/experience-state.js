(function (root) {
  'use strict';
  function tideState(progress, reduced = false) {
    const p = reduced ? 1 : Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
    return { edge: 1.12 - p * 1.3, textOpacity: Math.max(0, 1 - p * 3) };
  }
  function wrapIndex(index, length) {
    return length > 0 ? ((index % length) + length) % length : 0;
  }
  function tideLayout(stageHeight, viewportHeight) {
    const distance = Math.max(320, viewportHeight) * 1.2;
    return { distance, height: Math.max(320, stageHeight) + distance };
  }
  const api = { tideState, tideLayout, wrapIndex };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MareaState = api;
})(typeof window !== 'undefined' ? window : this);
