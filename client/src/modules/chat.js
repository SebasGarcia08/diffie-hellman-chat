import { type } from "os";

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
    public_key: null,
    exchange: false
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
      const juan_public_key = diffieHellmanObject
        .generateKeys("hex")
        .toString("hex"); // Juan This key should be transferred to the other party
      let prime = diffieHellmanObject.getPrime("hex");
      let generator = diffieHellmanObject.getGenerator("hex");

      // console.log("Juan prime: " + prime);
      // console.log("Juan prime type: " + typeof prime);
      // console.log("Juan generator: " + generator);
      // console.log("Juan generator type: " + typeof generator);
      // console.log("Juan public_key: " + juan_public_key);
      // console.log("Juan public_key type: " + typeof juan_public_key);

      // console.log("Juan public_key 1: ");
      // console.log(typeof juan_public_key);
      // console.log(juan_public_key);

      let data = {
        diffieHellmanObject: diffieHellmanObject,
        dstUser: dstUser,
        public_key: juan_public_key
      };
      commit("SET_DIFFIEHELLMAN_AND_PUBLIC_KEY", data);

      let data_to_send = {
        public_key: juan_public_key,
        prime: prime,
        generator: generator,
        dstUser: dstUser,
        srcUser: srcUser
      };
      rootState.io.emit("exchange_sender", data_to_send);
    },
    socket_send_public_key: ({ rootState }, data) => {
      rootState.io.emit("exchange_receiver", data);
    }
  },
  // this mutations will be executed by nodejs, they should start by SOCKET_
  mutations: {
    SET_USERNAME(state, username) {
      state.username = username;
    },
    SET_DIFFIEHELLMAN_AND_PUBLIC_KEY(
      state,
      { dstUser, diffieHellmanObject, public_key }
    ) {
      state.diffieHellmanObject[dstUser] = diffieHellmanObject;
      state.public_key = public_key;
    },
    SOCKET_GENERATE_SECRET_KEY_RECEIVER(state, data) {
      // console.log("Sara prime: " + data["prime"]);
      // console.log("Sara prime type: " + typeof data["prime"]);
      // console.log("Sara generator: " + data["generator"]);
      // console.log("Sara generator type: " + typeof data["generator"]);
      // console.log("Sara public_key received: " + data["public_key"]);
      // console.log(
      //   "Sara public_key received type: " + typeof data["public_key"]
      // );

      // Receiver
      const diffieHellmanObject = createDiffieHellman(
        data["prime"],
        "hex",
        data["generator"],
        "hex"
      );

      const sara_public_key = diffieHellmanObject
        .generateKeys("hex")
        .toString("hex"); // This key should be transferred to the other party
      // console.log("public_key_receiver: " + public_key);
      // console.log("public_key_data: ");
      // console.log(data["public_key"].toString("hex"));

      // console.log("Sara public key: " + sara_public_key);
      // console.log("Sara public key type: " + typeof sara_public_key);

      console.log(
        "Sara diffObj prime: " + diffieHellmanObject.getPrime().toString("hex")
      );
      console.log(
        "Sara diffObj generator: " +
          diffieHellmanObject.getGenerator().toString("hex")
      );

      const sara_secret_key = diffieHellmanObject
        .computeSecret(data["public_key"], "hex", "hex")
        .toString("hex"); // Bobs does this

      console.log(
        "Sara createDiffieHellman Prime",
        diffieHellmanObject.getPrime().toString("hex")
      );
      console.log(
        "Sara createDiffieHellman Generator",
        diffieHellmanObject.getGenerator().toString("hex")
      );
      console.log(
        "Sara createDiffieHellman Public Key",
        diffieHellmanObject.getPublicKey().toString("hex")
      );
      console.log(
        "Sara createDiffieHellman Private Key",
        diffieHellmanObject.getPrivateKey().toString("hex")
      );

      console.log("Sara secret_key: " + sara_secret_key);
      console.log("Sara secret_key type: " + typeof sara_secret_key);
      // console.log("Sara secret_key: ");
      // console.log(sara_secret_key);

      state.diffieHellmanObject[data["srcUser"]] = diffieHellmanObject;
      state.secret_key = sara_secret_key;
      state.public_key = sara_public_key;

      // Set exchange to true in order to send public key to the sender
      state.exchange = true;

      //let data_to_send = { public_key: data["public_key"].toString("hex") };

      // TODO: Send to Socket
    },
    SOCKET_GENERATE_SECRET_KEY_SENDER(state, { public_key, receiver }) {
      // console.log("Juan public_key received: " + public_key);
      // console.log("Juan public_key received type: " + typeof public_key);

      const diffieHellmanObject = state.diffieHellmanObject[receiver];

      console.log(
        "Juan diffObj prime: " + diffieHellmanObject.getPrime().toString("hex")
      );
      console.log(
        "Juan diffObj generator: " +
          diffieHellmanObject.getGenerator().toString("hex")
      );

      const juan_secret_key = diffieHellmanObject
        .computeSecret(public_key, "hex", "hex")
        .toString("hex");

      console.log(
        "Juan createDiffieHellman Prime",
        diffieHellmanObject.getPrime().toString("hex")
      );
      console.log(
        "Juan createDiffieHellman Generator",
        diffieHellmanObject.getGenerator().toString("hex")
      );
      console.log(
        "Juan createDiffieHellman Public Key",
        diffieHellmanObject.getPublicKey().toString("hex")
      );
      console.log(
        "Juan createDiffieHellman Private Key",
        diffieHellmanObject.getPrivateKey().toString("hex")
      );

      console.log("Juan secret_key: " + juan_secret_key);
      console.log("Juan secret_key type: " + typeof juan_secret_key);

      state.secret_key = juan_secret_key;
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
      //state.convOpen = srcUser;
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
    },
    public_key(state) {
      return state.public_key;
    },
    private_key(state) {
      return state.public_key;
    },
    exchange(state) {
      return state.exchange;
    }
  }
};

export default chatModule;
