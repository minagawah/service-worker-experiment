import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

import { DOCUMENT_ROOT } from '@/constants';
import Home from '@/views/Home.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/config',
    name: 'Config',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "config" */ '../views/Config.vue'),
  },
];

export const router = new VueRouter({
  mode: 'history',
  // base: process.env.BASE_URL,
  base: DOCUMENT_ROOT,
  routes,
});
