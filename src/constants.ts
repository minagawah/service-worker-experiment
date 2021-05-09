export const DOCUMENT_ROOT =
  process.env.NODE_ENV === 'production' ? '/mina/sw/' : '/';

export const CACHE_KEY = 'obi-wan';
export const CACHE_VERSION = 'v1';
export const CACHE_OFFLINE = `${DOCUMENT_ROOT}offline.html`;

export const CACHE_NAMES = [
  'google-font',
  'google-font-styles',
  'pages',
  'assets',
  'documents',
  'images',
].reduce((acc: any, key: string) => {
  acc[key] = `${CACHE_KEY}-${key}-${CACHE_VERSION}`;
  return acc;
}, {});

export const CACHE_NAMES_WITH_UNKNOWN = Object.keys(CACHE_NAMES).concat(
  'out-of-this-world'
);

export const GREETING_MESSAGES = [
  'How was your day?',
  'You look awesome today!',
  'Be nice to your bro',
  'Pay your bills',
  'Have a glass of beer',
];
