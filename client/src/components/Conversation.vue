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

    <button class="btn btn-block btn-info" @click="sendMessage">
      Enviar mensaje
    </button>
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";

export default Vue.extend({
  name: "conversation",
  props: ["dstUser"],
  data() {
    return {
      message: "",
    };
  },
  methods: {
    ...mapActions(["socket_new_message"]),
    sendMessage() {
      let data = {
        message: this.message,
        srcUser: this.username,
        dstUser: this.dstUser,
      };
      console.log(this.conversations);
      this.socket_new_message(data);
      this.message = "";
    },
  },
  computed: {
    ...mapGetters(["conversations", "username"]),
  },
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