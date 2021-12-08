<template>
  <div id="app">
    <header>
      <ul class="nav">
        <li class="nav-item">ENCRYPTED CHAT ROOM</li>
      </ul>
    </header>
    <div class="container">
      <main>
        <h1>{{ msg }}</h1>
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      msg: "Welcome to Your Chat Room!",
    };
  },
};
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495e;
  color: #fff;
}

header li {
  list-style: none;
  margin-top: 15px;
  float: left;
  margin-right: 25px;
}

header a {
  color: white;
}

header a:hover {
  color: #fff !important;
}
</style>
