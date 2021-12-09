import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import Vuex from "vuex";

// Socket Connection
import VueSocketIO from "vue-socket.io";
import VueSocketio from "vue-socket.io";
import SocketIO from "socket.io-client";

import chatModule from "./modules/chat";

import { BootstrapVue, IconsPlugin } from "bootstrap-vue";

// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    io: {}
  },
  mutations: {
    setSocket: (state, socket) => {
      console.log(socket);
      state.io = socket;
      console.log("socket set");
    }
  },
  modules: {
    chatModule
  }
});

/* Establish socket connection */
const socketConnection = SocketIO("http://localhost:5000");

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: socketConnection,
    vuex: {
      store,
      actionPrefix: "SOCKET_",
      mutationPrefix: "SOCKET_"
    }
  })
);

new Vue({
  el: "#app",
  store,
  router,
  beforeCreate() {
    store.commit("setSocket", this.$socket);
  },
  render: h => h(App)
});
