import Vue from 'vue'
import { Store } from 'vuex';
import Router, { RouteConfig } from 'vue-router';

interface ContextOptions {
  name?: string;
  version?: string;
  element?: string;
  component?: Vue;
  scope?: string;
  prefix?: string;
  modules?: object;
  plugins?: object;
  routes?: RouteConfig[];
}

interface Context extends Vue, ContextOptions {
  store?: Store<any>;
  router?: Router;
  Vue?: Vue;
  vm: Vue;
  mounted: boolean;
}
