const chatModule = {
  state: {
    chat: [], // messages
    users: [],
    username: null,
    exists: false
  },
  // emit actions to nodejs from our app
  actions: {
    socket_new_message: ({ rootState }, message) => {
      rootState.io.emit("newMessage", message);
    },
    socket_login: ({ rootState }, username) => {
      rootState.io.emit("login", username);
    }
  },
  // this mutations will be executed by nodejs, they should start by SOCKET_
  mutations: {
    SET_USERNAME(state, username) {
      state.username = username;
    },
    SOCKET_NEW_MESSAGE(state, message) {
      state.chat.push(message);
    },
    SOCKET_LOGIN(state, data) {
      console.log("Mut login");
      console.log(data);
      state.users = data.users;
      state.username = data.username;
      state.exists = false;
    },
    SOCKET_USER_EXISTS(state) {
      state.exists = true;
    },
    SOCKET_USER_JOINED(state, data) {
      console.log("Mut user joined");
      console.log(data);
      state.users = data.users;
      state.chat.push(`Usuario ${data.username} ha entrado en la sala`);
    },
    SOCKET_USER_LEFT(state, data) {
      console.log("Mut user left");
      console.log(data);
      state.users = data.users;
      state.chat.push(`Usuario ${data.username} ha abandonado la sala`);
    }
  },
  getters: {
    chat(state) {
      return state.chat;
    },
    username(state) {
      return state.username;
    },
    users(state) {
      return state.users;
    },
    exists(state) {
      return state.exists;
    }
  }
};

export default chatModule;
