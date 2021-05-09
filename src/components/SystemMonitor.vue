<template>
  <div class="container ready-state-text">
    {{ serviceWorkerReady }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SystemMonitor',
  computed: {
    serviceWorkerReady() {
      const str = this.$store.state.serviceWorkerReady ? 'Ready' : 'Not Ready';
      return `Service Worker is ${str}`;
    },
  },
});
</script>

<style scoped>
.ready-state-text {
  color: #b3b3b3;
  font-size: 0.9rem;
}
</style>
