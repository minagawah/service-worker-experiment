import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    serviceWorkerReady: false,
    clientMessageAllowed: false,
    greeting: '',
  },
  mutations: {
    SET_SERVICE_WORKER_READY(state, status = false) {
      state.serviceWorkerReady = status;
    },
    SET_CLIENT_MESSAGE_ALLOWED(state, allow = false) {
      state.clientMessageAllowed = allow;
    },
    SET_GREETING(state, greeting = '') {
      state.greeting = greeting;
    },
  },
  actions: {
    set_service_worker_ready({ commit }, status: boolean) {
      commit('SET_SERVICE_WORKER_READY', status);
    },
    set_client_message_allowed({ commit }, allow: boolean) {
      commit('SET_CLIENT_MESSAGE_ALLOWED', allow);
    },
    set_greeting({ commit }, greeting: string) {
      commit('SET_GREETING', greeting);
    },
  },
  modules: {},
});
