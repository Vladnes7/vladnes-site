(function (root) {
  'use strict';
  const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
  const state = {
    pageEntry({ reduced, native, restored }) { return !reduced && !native && !restored; },
    letterTarget(pointerX, pointerY, letterX) {
      const x=clamp(pointerX), y=clamp(pointerY), center=clamp(letterX);
      const weight=Math.max(0, 1-Math.abs(x-center)/.45);
      if (!weight) return { x:0, y:0, rotate:0 };
      return { x:(x-.5)*16*weight, y:-(12+y*24)*weight, rotate:(x-.5)*4*weight };
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports=state;
  else root.MareaCoastal=state;
})(typeof window === 'undefined' ? {} : window);
