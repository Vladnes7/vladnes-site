(function () {
  'use strict';
  const normalize = text => String(text || '').trim().toLocaleLowerCase('ru').replace(/ё/g,'е');
  function matches(item, { category = 'all', term = '' } = {}, favourites = []) {
    const categoryMatch = category === 'all' || category === item.category || category === 'saved' && favourites.includes(item.id);
    return categoryMatch && normalize(`${item.name} ${item.ingredients}`).includes(normalize(term));
  }
  function visibleItems(items, options = {}, favourites = []) {
    return items.filter(item => matches(item, options, favourites));
  }
  function neighbour(ids, current, direction) {
    if (!ids.length) return null;
    const index = Math.max(0, ids.indexOf(current));
    return ids[(index + (direction < 0 ? -1 : 1) + ids.length) % ids.length];
  }
  function tableState(progress) {
    const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
    return { inset: 12 * (1-p), scale: 1.05 - p*.05 };
  }
  const selectionCurrent = (ids, current) => ids.includes(current) ? current : ids[0] || null;
  window.MareaCarte = { matches, visibleItems, neighbour, tableState, selectionCurrent };
})();
