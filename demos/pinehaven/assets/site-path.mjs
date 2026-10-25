// Resolve URLs for localhost and a GitHub Pages repository subdirectory.
export function normalizeBasePath(value = '/') {
  const segments = String(value).split('/').filter(Boolean);
  if (segments.some(part => !/^[\w.-]+$/.test(part) || part === '.' || part === '..')) {
    throw new Error('Base path must contain only URL path segments');
  }
  return segments.length ? `/${segments.join('/')}/` : '/';
}
const defaultBase = typeof document === 'undefined'
  ? '/'
  : normalizeBasePath(new URL('../', import.meta.url).pathname);
export function sitePath(path, base = defaultBase) {
  const prefix = normalizeBasePath(base);
  if (!path.startsWith('/') || path.startsWith('//') || prefix === '/' || path.startsWith(prefix)) return path;
  return prefix + path.slice(1);
}
