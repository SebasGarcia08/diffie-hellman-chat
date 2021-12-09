<template>
  <div class="chat">
    <login-modal
      v-on:login="processLogin($event)"
      v-if="!username || exists"
    ></login-modal>

    <div class="row">
      <div class="col-9">
        <h3 v-if="username">Session: {{ username }}</h3>

        <!-- <span v-if="diffieHellman"> Encrypting conversation... </span> -->

        <!-- <div class="chats" v-for="conversationWith in conversations[username]"> -->
        <conversation
          :v-if="convOpened"
          :dstUser="conversationWith"
        ></conversation>
      </div>

      <div class="col-3">
        <users-sidebar v-on:openChat="openChat($event)"></users-sidebar>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import LoginModal from "./LoginModal.vue";
import { mapGetters, mapActions } from "vuex";
import UsersSidebar from "./UsersSidebar.vue";
import Conversation from "./Conversation.vue";
export default Vue.extend({
  components: { LoginModal, UsersSidebar, Conversation },
  data() {
    return {
      message: "",
      convOpened: false,
      conversationWith: "",
      diffieHellman: false,
    };
  },
  methods: {
    ...mapActions([
      "socket_login",
      "socket_new_message",
      "socket_diffieHellman",
      "socket_send_public_key",
    ]),
    processLogin(username) {
      this.socket_login(username);
    },
    openChat(dstUsername) {
      this.conversationWith = dstUsername;
      this.convOpened = true;
      if (!this.conversations[this.username]) {
        this.conversations[this.username] = {};
      }
      if (!this.conversations[this.username][dstUsername]) {
        this.conversations[this.username][dstUsername] = [];
      }
      this.socket_diffieHellman({
        dstUser: dstUsername,
        srcUser: this.username,
      });
      // if (!this.conversations[dstUsername]) {
      //   this.conversations[dstUsername] = {};
      // }
      // if (!this.conversations[dstUsername][this.usernamee]) {
      //   this.conversations[dstUsername][this.username] = [];
      // }
    },
  },
  watch: {
    private_key: {
      deep: true,
      handler: function (newVal, oldVal) {
        console.log("Prop changed");
        if (this.exchange) {
          console.log("WATCH: Sending public key");
          console.log("Public key: " + this.public_key);
          console.log("Receiver: " + this.username); // Should be Sara
          this.socket_send_public_key({
            public_key: this.public_key,
          });
        }
        //console.log(this.private_key);
      },
    },
  },
  computed: {
    ...mapGetters([
      "username",
      "exists",
      "conversations",
      "public_key",
      "exchange",
      "private_key",
    ]),
    // conversations: {
    //   get() {
    //     return this.$store.chatModules.conversations;
    //   },
    // },
  },
});
</script>

<style scoped>
li {
  list-style: none;
  text-align: left;
}

.card {
  padding: 20px !important;
}
</style>
