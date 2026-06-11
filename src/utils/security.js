const FALLBACK_BASE_URL = 'https://jespadas.github.io';
const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const SAFE_ICON_TOKEN = /^(fa[bsr]?|fas|fab|far|fa-[a-z0-9-]+)$/i;

export function getSafeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  try {
    const url = new URL(value.trim(), FALLBACK_BASE_URL);

    if (!SAFE_URL_PROTOCOLS.has(url.protocol)) {
      return null;
    }

    return url.protocol === 'mailto:' ? value.trim() : url.href;
  } catch {
    return null;
  }
}

export function getSafeIconClass(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const tokens = value.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0 || tokens.some((token) => !SAFE_ICON_TOKEN.test(token))) {
    return null;
  }

  const hasStylePrefix = tokens.some((token) =>
    ['fas', 'fab', 'far'].includes(token.toLowerCase())
  );

  return hasStylePrefix ? tokens.join(' ') : ['fab', ...tokens].join(' ');
}

export function getAccessibleIconLabel(iconClass) {
  return iconClass
    .split(/\s+/)
    .filter((token) => token.startsWith('fa-'))
    .map((token) => token.replace(/^fa-/, ''))
    .join(' ')
    .trim();
}

export function isExternalUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value, FALLBACK_BASE_URL);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
