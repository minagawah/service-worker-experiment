import { skipWaiting, clientsClaim, setCacheNameDetails } from 'workbox-core';

import {
  registerRoute,
  setCatchHandler,
  NavigationRoute,
} from 'workbox-routing';

import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
  NetworkOnly,
} from 'workbox-strategies';

import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';

import {
  CACHE_KEY,
  CACHE_VERSION,
  CACHE_OFFLINE,
  CACHE_NAMES,
  GREETING_MESSAGES,
} from './constants';

// This is why I hate TypeScript...
declare global {
  interface Window {
    // TS2339: Property '__WB_MANIFEST' does not exist on type 'Window & typeof globalThis'.
    __WB_MANIFEST: any;
    skipWaiting: Function;
    clients: { claim: Function; matchAll: Function };
  }
}

/**
 * Returns the first one out of 'self.clients'.
 * @returns {Client}
 */
const getClient = async () => {
  const [client]: Array<Client> = (await self.clients.matchAll()) || [];
  return client;
};

const DEBUG = location.hostname === 'localhost';

// ----------------------------------------------
// CACHED ROUTES
// ----------------------------------------------
// Workbox provides handy ways to intercept 'fetch'.
// You can easily configure behaviors per route.

const expirationPlugins: { [key: string]: ExpirationPlugin } = {};

expirationPlugins['documents'] = new ExpirationPlugin({
  maxAgeSeconds: 60 * 60 * 24 * 60, // 60 Days
  maxEntries: 50,
  purgeOnQuotaError: true,
});

expirationPlugins['images'] = new ExpirationPlugin({
  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
  maxEntries: 50,
});

expirationPlugins['google-font'] = new ExpirationPlugin({
  maxAgeSeconds: 24 * 60 * 60 * 365, // 1 year
  maxEntries: 30,
  purgeOnQuotaError: true,
});

// https://github.com/GoogleChrome/workbox/issues/2681#issuecomment-735803302
const manifest = self.__WB_MANIFEST;

if (DEBUG) {
  console.log('[worker] precacheAddRoute');
  manifest.forEach(({ url }: any, i: number) => {
    console.log(`[worker]  __WB_MANIFEST[${i}]: ${url}`);
  });
}

cleanupOutdatedCaches();

setCacheNameDetails({
  prefix: CACHE_KEY,
  suffix: CACHE_VERSION,
});

// Run 'precacheAndRoute' first, and 'addRoute' later
// so that 'addRoute' overwrites 'precacheAndRoute'.
precacheAndRoute(manifest);

const defaultRouteHandler = createHandlerBoundToURL(
  `${DEBUG ? '/' : '/mina/sw/'}index.html`
);

const defaultNavigationRoute = new NavigationRoute(defaultRouteHandler, {
  // allowlist: [],
  // denylist: [],
});

registerRoute(defaultNavigationRoute);

// Offline
// When catching routing errors.
setCatchHandler(async ({ event }) => {
  // if (event.request.destination === 'document') {
  //   return matchPrecache(CACHE_OFFLINE);
  // }
  return Response.error();
});

// Google Webfonts ---> "Cache Frist"
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: CACHE_NAMES['google-font'],
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      expirationPlugins['google-font'],
    ],
  })
);

// Google Webfont Styles ---> "Stale While Revalidate"
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES['google-font-styles'],
  })
);

// Pages (newly navigated pages) ---> "Network First"
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: CACHE_NAMES['pages'],
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200], // Cache only for status 200.
      }),
    ],
  })
);

// Auth ---> "Network Only"
registerRoute(
  ({ url }) => url.pathname.startsWith('/auth/'),
  new NetworkOnly()
);

// JS, CSS, and Workers ---> "Stale While Revalidate"
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES['assets'],
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200], // Cache only for status 200.
      }),
    ],
  })
);

// Documents ---> "Cache First Strategy"
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES['documents'],
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200], // Cache only for status 200.
      }),
      expirationPlugins['documents'],
    ],
  })
);

// Images ---> "Cache First Strategy"
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES['images'],
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200], // Cache only for status 200.
      }),
      expirationPlugins['images'],
    ],
  })
);

// ----------------------------------------------
// INSTALLATION + MESSAGING
// ----------------------------------------------

self.addEventListener('install', ((event: ExtendableEvent) => {
  console.log('[worker] :::: INSTALLED');
  // ----------------------------------------------
  // TODO:
  // We could forciblly 'skipWaiting'
  // to avoid problems relate to browser refresh.
  // But, this could also become problematic
  // for it may create inconsistency between
  // the current version and the previous one...
  // ----------------------------------------------
  // event.waitUntil(self.skipWaiting());
}) as EventListener);

self.addEventListener('activate', ((event: ExtendableEvent) => {
  console.log('[worker] :::: ACTIVATED');

  // We want to allow all pages to send messages to the worker.
  // So, running 'clients.claim()'.
  // Bellow is just for a demonstration sending a message
  // to the client when 'client.claim()' is done.
  self.clients
    .claim()
    .then(getClient)
    .then((client: Client) => {
      client.postMessage({ type: 'CLIENT_MESSAGE_ALLOWED' });
    });
}) as EventListener);

// Define behaviors when receiving messages from the clients.
self.addEventListener('message', async (event: MessageEvent) => {
  const { data = {} } = event;
  const client = await getClient();

  console.log('[worker] :::: MESSAGE');
  console.log('[worker] data.type: ', data.type);

  if (data.type && client) {
    // ----------------------------------------------
    // TODO:
    // (See: App.vue)
    // Not sure if we needed when using 'InjectManifest'...
    // https://developers.google.com/web/tools/workbox/guides/advanced-recipes
    // ----------------------------------------------
    if (data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }

    if (data.type === 'CLIENTS_CLAIM') {
      self.clients.claim();
    }

    // When received REFRESH, deleting all the cache
    // and replying using Clients API to notify the client
    // received the message from for the fact
    // that the job has completed.
    if (data.type === 'REFRESH') {
      const replyToClient = (): void =>
        client.postMessage({ type: 'REFRESH_COMPLETE' });

      Promise.all([
        expirationPlugins['documents'].deleteCacheAndMetadata(),
        expirationPlugins['images'].deleteCacheAndMetadata(),
      ])
        .then(() => replyToClient())
        .catch(() => replyToClient());
    }

    // Replying using Clients API with a new message
    // to the same client just received the message from.
    if (data.type === 'GET_GREETING') {
      // Randomly choose a message from the list.
      const message =
        GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
      client.postMessage({ type: 'GREETING_MESSAGE', message });
    }
  }
});
