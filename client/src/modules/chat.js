import { type } from "os";

const {
  createDiffieHellman,
  scrypt,
  randomFill,
  createCipheriv,
  scryptSync,
  createDecipheriv,
  createCipher,
  createHash,
  DiffieHellman,
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
    exchange: false,
    private_key: null,
    prime: null
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
      console.log("Calculating primes and generator...");
      let dhObj = createDiffieHellman(256);
      // Prime
      let p = parseInt(dhObj.getPrime('hex'), 16);
      console.log("Prime: " + p);

      // Generator
      let g = parseInt(dhObj.getGenerator('hex'), 16);
      console.log("Generator: " + g);

      // private key of Alice
      let a = Math.floor(Math.random() * 9) + 1;
      
      // public key of Alice
      let K_a = Math.pow(g, a) % p;
      commit("SET_PRIVATE_AND_PUBLIC_KEY_AND_PRIME", {
        private_key: a,
        public_key: K_a,
        prime: p
      })

      let data_to_send = {
        public_key: K_a,
        prime: p,
        generator: g
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
    SET_PRIVATE_AND_PUBLIC_KEY_AND_PRIME(
      state,
      { private_key, public_key, prime }
    ) {
      state.private_key = private_key;
      state.public_key = public_key;
      state.prime = prime;
    },
    SOCKET_GENERATE_SECRET_KEY_RECEIVER(state, {
      public_key,
      prime,
      generator
    }) {
      let K_a = public_key
      // Bob's private key 
      let b = Math.floor(Math.random() * 9) + 1;
      // Bob's public key
      let K_b = Math.pow(generator, b) % prime;
      // Bob's secret key
      let B = Math.pow(K_a, b) % prime;
      console.log("Bob's secret key: " + B); 
      state.secret_key = B;
      state.private_key = b;
      state.public_key = K_b;
      state.prime = prime;
      state.exchange = true;
    },
    SOCKET_GENERATE_SECRET_KEY_SENDER(state, { public_key }) {
      let K_b = public_key;
      let a = state.private_key;
      // Alice's secret key
      let A = Math.pow(K_b, a) % state.prime;
      state.secret_key = A;
      console.log("Alice's secret key: " + state.secret_key)
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
