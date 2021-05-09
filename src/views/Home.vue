<template>
  <div class="container">
    <img src="../assets/logo.png" alt="logo" />

    <table class="mt-4">
      <tr>
        <td>
          <span v-if="greeting"> {{ greeting }}</span>
          <span v-else>zup</span>
        </td>
      </tr>
    </table>

    <button class="mt-2 btn" @click="getGreeting()">Update Greeting</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ServiceWorkerMixin from '@/mixins/ServiceWorkerMixin';

export default Vue.extend({
  name: 'Home',
  mixins: [ServiceWorkerMixin],
  computed: {
    isReady() {
      // Note: we also need to wait till the client is allowed to send messages.
      return (
        this.$store.state.serviceWorkerReady &&
        this.$store.state.clientMessageAllowed
      );
    },
    greeting() {
      return this.$store.state.greeting;
    },
  },
  methods: {
    getGreeting() {
      console.log('[Home] ++++ getGreeting()');
      (this as any).$_ServiceWorkerMixin_sendMessage('GET_GREETING');
    },
  },
  watch: {
    isReady(newValue) {
      if (newValue === true) {
        (this as any).getGreeting();
      }
    },
  },
});
</script>

<style scoped></style>
