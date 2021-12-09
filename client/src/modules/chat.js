const chatModule = {
  state: {
    conversations: {}, // messages
    users: [],
    username: null,
    exists: false
  },
  // emit actions to nodejs from our app
  actions: {
    socket_new_message: ({ rootState }, data) => {
      rootState.io.emit("newMessage", data);
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
    SOCKET_NEW_MESSAGE(state, { message, srcUser, dstUser }) {
      console.log(state.conversations);
      if (!state.conversations[srcUser]) {
        state.conversations[srcUser] = {};
      }
      if (!state.conversations[srcUser][dstUser]) {
        state.conversations[srcUser][dstUser] = [];
      }
      state.conversations[srcUser][dstUser].push(message);
    },
    SOCKET_OPEN_CHAT(state, { message, srcUser, dstUser }) {
      if (!state.conversations[srcUser]) {
        state.conversations[srcUser] = {};
      }
      if (!state.conversations[srcUser][dstUser]) {
        state.conversations[srcUser][dstUser] = [];
      }
      state.conversations[srcUser][dstUser].push(message);
    },
    SOCKET_LOGIN(state, data) {
      state.users = data.users;
      state.username = data.username;
      state.exists = false;
    },
    SOCKET_USER_EXISTS(state) {
      state.exists = true;
    },
    SOCKET_USER_JOINED(state, data) {
      state.users = data.users;
      //state.chat.push(`Usuario ${data.username} ha entrado en la sala`);
    },
    SOCKET_USER_LEFT(state, data) {
      state.users = data.users;
      //state.chat.push(`Usuario ${data.username} ha abandonado la sala`);
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
    },
    conversations(state) {
      return state.conversations;
    }
  }
};

export default chatModule;
