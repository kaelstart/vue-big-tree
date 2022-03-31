import Vue from "vue";
import App from "./App.vue";
import VueLargerTree from "vue-larger-tree";
import "vue-larger-tree/dist/index.css";
import "element-ui/lib/theme-chalk/index.css";
Vue.config.productionTip = false;
Vue.use(VueLargerTree);
new Vue({
  render: (h) => h(App),
}).$mount("#app");
