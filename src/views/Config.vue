<template>
  <div class="container">
    <table v-if="list">
      <tr v-for="item in list" :key="item.name">
        <th class="th">{{ item.name }}</th>
        <td class="td">
          {{ item.status ? 'Yes' : 'No' }}
        </td>
      </tr>
    </table>
    <div v-else class="mt-4">No items</div>

    <button class="mt-4 btn" @click="updateList()">Update List</button>
    <button class="mt-2 btn" @click="refresh()">Refresh Cache</button>
    <button class="mt-2 btn" @click="unregister()">
      Unregister Service Worker
    </button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Registration } from '@/types';
import { DOCUMENT_ROOT, CACHE_NAMES_WITH_UNKNOWN } from '@/constants';
import ServiceWorkerMixin from '@/mixins/ServiceWorkerMixin';

interface CacheStatus {
  name: string;
  status: boolean;
}

const DEFAULT_CACHE_NAMES_LIST: Array<CacheStatus> = CACHE_NAMES_WITH_UNKNOWN.map(
  name => ({ name, status: false })
);

/**
 * For the given cache name, using Cache API to check
 * if the browser has corresponding cache.
 * @param {string} name - Cache name
 * @returns {Object}
 */
const run = (name: string) =>
  caches
    .has(name)
    .then((status: boolean) => {
      const str = status ? 'exists' : 'DOES NOT exist';
      console.log(`[Home] Cache ${str} for "${name}"`);
      return { name, status };
    })
    .catch(err => {
      throw err;
    });

export default Vue.extend({
  name: 'Config',
  mixins: [ServiceWorkerMixin],
  data() {
    return {
      list: DEFAULT_CACHE_NAMES_LIST,
    };
  },
  // App.vue provides '$_swRegistration' which is
  // 'ServiceWorkerRegistration'.
  // We need this for 'unregister' function.
  inject: ['$_swRegistration'],
  computed: {
    // This is a proxy for '$_swRegistration'.
    swRegistration() {
      return (this as any).$_swRegistration();
    },
  },
  methods: {
    /**
     * Deletes cache.
     */
    refresh() {
      console.log('[Config] ++++ refresh()');
      (this as any).$_ServiceWorkerMixin_sendMessage('REFRESH');
    },
    /**
     * Updates a list of cache.
     */
    updateList() {
      console.log('[Config] ++++ updateList()');
      if (!(this as any).$store.state.serviceWorkerReady) {
        console.warn('[Config] Not ready');
        return;
      }

      const promises = CACHE_NAMES_WITH_UNKNOWN.map(run);
      Promise.all(promises)
        .then(list => {
          (this as any).list = list;
        })
        .catch(err => {
          throw err;
        });
    },
    /**
     * Unregisters the current service worker,
     * and redirects to the app's top page.
     */
    unregister() {
      console.log('[Config] ++++ unregister()');

      if (!(this as any).$store.state.serviceWorkerReady) {
        console.warn('[Config] Not ready');
        return;
      }

      const reg = (this as any).swRegistration;

      if (!reg) {
        console.warn('[Config] No service worker registration');
        return;
      }

      if (!('unregister' in reg)) {
        console.warn('[Config] No "reg.unregister"');
        return;
      }

      console.log('[Config] ++++ unregister()');

      reg
        .unregister()
        .then(() => {
          console.log('[Config] unregister done.');
          // You could reload the same page
          // if you are at the top page:
          // ----------------------------------------------
          // window.location.reload('/');
          // ----------------------------------------------
          window.location.href = DOCUMENT_ROOT;
        })
        .catch((err: any) => {
          throw err;
        });
    },
  },
  mounted() {
    (this as any).updateList();
  },
});
</script>

<style scoped></style>
