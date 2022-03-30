import Vue from "vue";
import App from "./App.vue";
import VueGigTree from "vue-big-tree";
import "vue-big-tree/dist/index.css";
import "element-ui/lib/theme-chalk/index.css";
Vue.config.productionTip = false;
Vue.use(VueGigTree);
new Vue({
  render: (h) => h(App),
}).$mount("#app");
