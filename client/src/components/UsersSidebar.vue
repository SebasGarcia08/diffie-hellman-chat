<template>
  <div class="users-sidebar">
    <div class="card">
      <ul v-if="users">
        <li>Usuarios conectados:</li>
        <hr />
        <li v-for="user in users">
          <b v-if="user == username"> {{ user }} </b>
          <span v-else> {{ user }} </span>
        </li>
      </ul>
      <p v-else>Ningún usuario conectado</p>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters } from "vuex";

export default Vue.extend({
  name: "users-sidebar",
  computed: {
    ...mapGetters(["users", "username"]),
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