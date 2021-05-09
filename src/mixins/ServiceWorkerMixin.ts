const ServiceWorkerMixin = {
  methods: {
    $_ServiceWorkerMixin_sendMessage(type: String) {
      if (!(this as any).$store.state.serviceWorkerReady) {
        console.log('[ServiceWorkerMixin] Service worker is not ready...');
        return;
      }
      console.log('[ServiceWorkerMixin] postMessage: ', type);

      navigator.serviceWorker?.controller?.postMessage({ type });
    },
  },
};

export default ServiceWorkerMixin;
