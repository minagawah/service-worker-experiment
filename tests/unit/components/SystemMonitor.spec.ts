import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex, { Store } from 'vuex';

import SystemMonitor from '@/components/SystemMonitor.vue'

const localVue = createLocalVue()

localVue.use(Vuex)

interface State {
  serviceWorkerReady: boolean,
}

describe('SystemMonitor.vue', () => {
  let state;
  let store: Store<State>;

  beforeEach(() => {
    state = {
      serviceWorkerReady: true,
    };
    store = new Store({
      state,
    })
  })

  it('renders a ready status for service worker', () => {
    const wrapper = shallowMount(SystemMonitor, { store, localVue });
    expect(wrapper.text()).toMatch('Service Worker is Ready');
  });
});
