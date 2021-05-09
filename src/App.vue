<template>
  <div id="app">
    <div>
      <router-link to="/">Home</router-link> |
      <router-link to="/config">Config</router-link>
      <SystemMonitor class="mt-2" />
    </div>

    <router-view class="mt-4" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { Registration } from '@/types'; // '@' is an alias for '/src'
import { DOCUMENT_ROOT } from '@/constants';
import SystemMonitor from '@/components/SystemMonitor.vue';

export default Vue.extend({
  name: 'App',
  data() {
    return {
      reg: null as Registration,
    };
  },
  // Once the worker is registered, we want 'ServiceWorkerRegistration'
  // available to all child components. By setting a provider here,
  // children can access it via '$_swRegistration' function.
  provide() {
    return {
      // https://github.com/vuejs/vue/issues/7017#issuecomment-480906691
      // https://github.com/vuejs/vue/issues/11759#issuecomment-803795815
      $_swRegistration: () => (this as any).$_reg,
    };
  },
  computed: {
    // This is a proxy for 'data.reg'.
    $_reg() {
      return (this as any).reg;
    },
  },
  components: {
    SystemMonitor,
  },
  mounted() {
    // We need to first register the worker.
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(`${DOCUMENT_ROOT}service-worker.js`)
          .then(reg => {
            this.registerListeners(reg);
          })
          .catch(err => {
            console.error('[App] Failed to register service worker');
          });
      });
    }
  },
  methods: {
    registerListeners(reg: Registration) {
      if (!reg) {
        throw new Error('No service worker registration...');
      }
      console.log('[App] Service worker is registered');

      this.reg = reg;

      if (this.reg.waiting) {
        console.log('[App] :::: WAITING');
        // ----------------------------------------------
        // TODO:
        // Not sure if we need to handle this
        // when worker is at 'waiting' state...
        // When we need one, maybe we want to show a modal?
        // ----------------------------------------------
        // reg.waiting.postMessage('SKIP_WAITING')
      }

      this.reg.addEventListener('updatefound', () => {
        console.log('[App] :::: UPDATEFOUND');
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[App] :::: CONTROLLERCHANGE');
        // ----------------------------------------------
        // TODO:
        // We could forciblly reload the page
        // when user has multiple browser tabs open.
        // ----------------------------------------------
        // window.location.reload();
      });

      // Worker is either at 'waiting' or 'activated' state.
      navigator.serviceWorker.ready
        .then((_reg: Registration) => {
          if (!_reg) {
            throw new Error('No service worker registration...');
          }
          console.log('[App] Service worker is ready');

          this.$store.dispatch('set_service_worker_ready', true);
        })
        .catch(err => {
          throw err;
        });

      navigator.serviceWorker.addEventListener(
        'message',
        (event: MessageEvent) => {
          const { data = {} } = event;

          console.log('[App] :::: MESSAGE --> ', data);

          // Bellow is just for a demonstration.
          // Once the worker is activated, the worker will send
          // an arbitrary message 'CLIENT_MESSAGE_ALLOWED'.
          // Here, we are receiving the message.
          if (data.type === 'CLIENT_MESSAGE_ALLOWED') {
            console.log('[App] "self.clients.claim" is done!');
            this.$store.dispatch('set_client_message_allowed', true);
          }

          // When receiving a random greeting message,
          // set the message to the shared state.
          if (data.type === 'GREETING_MESSAGE') {
            console.log('[App] data.message: ', data.message);
            if (data.message) {
              this.$store.dispatch('set_greeting', data.message);
            }
          }

          if (data.type === 'REFRESH_COMPLETE') {
            window.location.reload();
          }
        }
      );
    },
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.mt-2 {
  margin-top: 0.4rem;
}

.mt-4 {
  margin-top: 1rem;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

table {
  display: inline-table;
  border-collapse: collapse;
  border-spacing: 1px;
  background-color: #fff;
}

tr {
  text-align: left;
}

th,
td {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e2e2;
}

th {
  background-color: #42b983;
  color: #fff;
}

.btn {
  padding: 0.8rem 1rem;
  border-radius: 1.8rem;
  border: 0px;
  background-color: #35495e;
  color: #f5faff;
  font-weight: bold;
  font-size: 1.1rem;
}
</style>
