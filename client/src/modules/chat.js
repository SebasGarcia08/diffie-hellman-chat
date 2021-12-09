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
    diffieHellmanObject: {},
    secret_key: null,
    public_key: null
  },
  // emit actions to nodejs from our app
  actions: {
    socket_new_message: ({ rootState }, data) => {
      rootState.io.emit("newMessage", data);
    },
    socket_login: ({ rootState }, username) => {
      rootState.io.emit("login", username);
    },
    socket_diffieHellman: ({ rootState, commit }, { dstUser, srcUser }) => {
      // Sender
      const diffieHellmanObject = createDiffieHellman(256);
      const public_key = diffieHellmanObject.generateKeys("hex"); // This key should be transferred to the other party
      let prime = diffieHellmanObject.getPrime("hex");
      let generator = diffieHellmanObject.getGenerator("hex");

      let data = {
        diffieHellmanObject: diffieHellmanObject,
        dstUser: dstUser
      };
      commit("SET_DIFFIEHELLMAN", data);

      let data_to_send = {
        public_key: public_key,
        prime: prime,
        generator: generator,
        dstUser: dstUser,
        srcUser: srcUser
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
    SOCKET_GENERATE_SECRET_KEY_RECEIVER(state, data) {
      // Receiver
      const diffieHellmanObject = createDiffieHellman(
        data["prime"],
        "hex",
        data["generator"],
        "hex"
      );
      const public_key = diffieHellmanObject.generateKeys("hex"); // This key should be transferred to the other party
      // console.log("public_key_receiver: " + public_key);
      // console.log("public_key_data: ");
      // console.log(data["public_key"].toString("hex"));

      const secret_key = diffieHellmanObject.computeSecret(
        data["public_key"].toString("hex"),
        "hex"
      ); // Bobs does this

      state.diffieHellmanObject[data["srcUser"]] = diffieHellmanObject;
      state.secret_key = secret_key;
      state.public_key = data["public_key"].toString("hex");

      let data_to_send = { public_key: data["public_key"].toString("hex") };

      // TODO: Send to Socket
    },
    SOCKET_GENERATE_SECRET_KEY_SENDER(state, data) {
      const secret_key = state.diffieHellmanObject.computeSecret(
        data["public_key"],
        "hex"
      );

      state.secret_key = secret_key;
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
