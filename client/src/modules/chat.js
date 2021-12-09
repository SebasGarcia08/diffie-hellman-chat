const {
  createDiffieHellman,
  scrypt,
  randomFill,
  createCipheriv,
  scryptSync,
  createDecipheriv,
  createCipher,
  createHash
} = require("crypto");

const chatModule = {
  state: {
    conversations: {}, // messages
    users: [],
    username: null,
    exists: false,
    diffieHellmanObject: {}
  },
  // emit actions to nodejs from our app
  actions: {
    socket_new_message: ({ rootState }, data) => {
      rootState.io.emit("newMessage", data);
    },
    socket_login: ({ rootState }, username) => {
      rootState.io.emit("login", username);
    },
    socket_diffieHellman: ({ rootState, commit }, dstUser) => {
      const diffieHellmanObject = createDiffieHellman(256);
      const public_key = diffieHellmanObject.generateKeys("hex"); // This key should be transferred to the other party
      let prime = diffieHellmanObject.getPrime("hex");
      let generator = diffieHellmanObject.getGenerator("hex");

      console.log("prime: " + prime);

      let data = {
        diffieHellmanObject: diffieHellmanObject,
        dstUser: dstUser
      };
      commit("SET_DIFFIEHELLMAN", data);

      let data_to_send = {
        public_key: public_key,
        prime: prime,
        generator: generator,
        dstUser: dstUser
      };
      rootState.io.emit("exchange", data_to_send);
    }
  },
  // this mutations will be executed by nodejs, they should start by SOCKET_
  mutations: {
    SET_USERNAME(state, username) {
      state.username = username;
    },
    SET_DIFFIEHELLMAN(state, { dstUser, diffieHellmanObject }) {
      state.diffieHellmanObject[dstUser] = diffieHellmanObject;
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
