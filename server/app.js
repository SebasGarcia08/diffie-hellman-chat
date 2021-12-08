const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:8080',
    credentials: true
  }
});


app.get('/', (req, res) => {
  console.log(req);
  res.send('socket.io server');
});

io.on('connection', (socket) => {
  console.log(socket)
  console.log('New socket connected');
});


http.listen(5000, ()=> {
  console.log('NANDITO ES UN CANGURO')
});

module.exports = app;