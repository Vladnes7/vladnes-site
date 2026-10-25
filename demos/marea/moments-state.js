(function (root) {
  'use strict';
  const clamp = value => Math.max(0, Math.min(1, value));
  const state = {
    scrollProgress(top, sceneHeight, stageHeight) {
      return clamp(-top / Math.max(1, sceneHeight - stageHeight));
    },
    cinematicState(progress, photoReady, nightFocused) {
      const p = clamp(Number(progress) || 0);
      const reveal = nightFocused && !photoReady ? 1 : photoReady ? clamp((p - .12) / .76) : 0;
      const exit = photoReady ? clamp((p - .88) / .12) : 0;
      return { reveal, dayCut: reveal, nightCut: 1 - reveal, scale: 1 - .05 * exit, bottom: 8 * exit };
    },
    nearestSlide(position, offsets, maximum) {
      if (!offsets.length) return 0;
      if (maximum > 0 && position >= maximum - 2) return offsets.length - 1;
      return offsets.reduce((best, value, index) => Math.abs(value - position) < Math.abs(offsets[best] - position) ? index : best, 0);
    },
    moveIndex(index, direction, count) { return Math.max(0, Math.min(count - 1, index + direction)); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = state;
  else root.MareaMoments = state;
})(typeof window === 'undefined' ? {} : window);
