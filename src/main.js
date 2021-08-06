import Vue from "vue";

import "normalize.css/normalize.css"; // A modern alternative to CSS resets

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from "element-ui/lib/locale/lang/en"; // lang i18n

import "@/styles/index.scss"; // global css

import App from "./App";
import store from "./store";
import router from "./router";

import "@/icons"; // icon
import "@/permission"; // permission control

import * as API from "@/api/product/index";
import CategorySelector from "@/components/CategorySelector";
Vue.component("CategorySelector", CategorySelector);
// API就是下面这个对象
// {
//   trademark:{},
// attr:{}
// spu:{}
// sku:{}
// }

// this.$API.trademark.delete

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === "production") {
  const { mockXHR } = require("../mock");
  mockXHR();
}

// set ElementUI lang to EN
Vue.use(ElementUI, { locale });
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false;
Vue.prototype.$API = API; //API是包含了attr spu sku trademark所有的接口请求函数对象

new Vue({
  el: "#app",
  router,
  store,
  render: h => h(App)
});
