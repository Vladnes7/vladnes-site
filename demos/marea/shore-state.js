(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MareaShore = api;
})(typeof window === 'object' ? window : globalThis, function() {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function journeyPosition(top, inset, width, height, trackWidth) {
    const travel = Math.max(0, trackWidth - width);
    const progress = travel ? clamp((inset - top) / travel, 0, 1) : 0;
    return { travel, progress, x: progress ? -clamp(inset - top, 0, travel) : 0 };
  }
  function frameScroll(start, index, width, travel) {
    return start + clamp(index * width, 0, travel);
  }
  return { journeyPosition, frameScroll };
});
