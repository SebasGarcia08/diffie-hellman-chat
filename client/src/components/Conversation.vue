<template>
  <div class="conversation">
    {{ dstUser }}

    <!-- Chat messages -->
    <div class="col-md-12">
      <ul>
        <li v-for="msg in conversations[username][dstUser]">
          {{ msg }}
        </li>
      </ul>
    </div>

    <div class="col card">
      <textarea class="form-control" v-model="message"></textarea>
    </div>

    <br />

    <button class="btn btn-block btn-info" @click="sendEncryptedMessage">
      Enviar mensaje
    </button>
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import { randomFill, createCipheriv, randomUID } from "crypto";

export default Vue.extend({
  name: "conversation",
  props: ["dstUser"],
  data() {
    return {
      message: ""
    };
  },
  methods: {
    ...mapActions(["socket_new_message"]),
    gen_iv(length) {
      var text = "";
      var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    },
    sendEncryptedMessage() {
      let alice_message = this.message;
      console.log(this.secret_key);
      let key = this.secret_key.slice(0, 16); // 16 Bytes == 128 BITS
      let iv = this.gen_iv(16); // 16 Bytes == 128 BITS
      console.log("\nKEY LENGTH:", key.length);
      // Once we have the key and iv, we can create and use the cipher...
      const cipher = createCipheriv("aes-128-cbc", key, iv); // Both need to be utf8

      let encrypted = cipher.update(alice_message, "utf8", "binary");
      encrypted += cipher.final("binary");
      console.log("Sent IV: " + iv.toString("utf8"));
      let data = {
        message: encrypted,
        srcUser: this.username,
        dstUser: this.dstUser,
        iv: iv
      };
      console.log(this.conversations);
      this.socket_new_message(data);
      this.message = "";
    }
  },
  computed: {
    ...mapGetters(["username", "conversations", "secret_key"])
  }
});
</script>

<style scoped>
li {
  list-style: none;
  text-align: left;
}

.card {
  padding: 0px !important;
}
</style>
