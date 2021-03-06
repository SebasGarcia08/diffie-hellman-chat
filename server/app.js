const { SocketAddress } = require("net");

const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    credentials: true,
  },
});

let users = {};
let sockets = {};

app.get("/", (req, res) => {
  console.log(req);
  res.send("socket.io server");
});

io.on("connection", (socket) => {
  console.log(socket);
  console.log("New socket connected");

  socket.on("exchange_sender", (data) => {
    //let dstUser = data["dstUser"];
    socket.broadcast.emit("GENERATE_SECRET_KEY_RECEIVER", data);
    //socket.emit("GENERATE_SECRET_KEY_SENDER", data_to_send);
  });

  socket.on("exchange_receiver", (data) => {
    socket.broadcast.emit("GENERATE_SECRET_KEY_SENDER", data);
  });

  // Chat events
  socket.on("login", (username) => {
    console.log("LOGIN");
    if (users[username]) {
      socket.emit("USER_EXISTS");
      return;
    }

    socket.username = username;
    users[username] = username;
    sockets[username] = socket.id;

    socket.emit("LOGIN", {
      username: socket.username,
      users,
    });
    socket.broadcast.emit("USER_JOINED", {
      username: socket.username,
      users,
    });
  });

  // Message events
  socket.on("newMessage", ({ message, srcUser, dstUser, iv }) => {
    console.log("NEW MESSAGE");
    console.log(iv);

    socket.broadcast.emit("NEW_MESSAGE", {
      message: message,
      srcUser: dstUser,
      dstUser: srcUser,
      iv: iv
    });

    // if()
    // socket.broadcast.emit("OPEN_CHAT", {
    //   message: socket.username + ": " + message,
    //   srcUser: dstUser,
    //   dstUser: srcUser,
    // });

    socket.emit("NEW_MESSAGE", {
      message: message,
      srcUser: srcUser,
      dstUser: dstUser,
      iv: iv
    });
  });

  socket.on("disconnect", () => {
    if (users[socket.username]) {
      delete users[socket.username];
      socket.broadcast.emit("USER_LEFT", {
        username: socket.username,
        users,
      });
    }
  });
});

http.listen(5000, () => {
  console.log("NANDITO ES UN CANGURO");
});

module.exports = app;
