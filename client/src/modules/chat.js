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
    SOCKET_NEW_USERNAME(state, message) {
      state.chat.push(message[0]);
    },
    SOCKET_LOGIN(state, data) {
      state.users = data[0].users;
      state.username = data[0].username;
      state.exists = false;
    },
    SOCKET_USER_EXISTS(state) {
      state.exists = true;
    },
    SOCKET_USER_JOINED(state, data) {
      state.users = data[0].users;
      state.chat.push(`Usuario ${data[0].username} ha entrado en la sala`);
    },
    SOCKET_USER_LEFT(state, data) {
      state.users = data[0].users;
      state.chat.push(`Usuario ${data[0].username} ha abandonado la sala`);
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
