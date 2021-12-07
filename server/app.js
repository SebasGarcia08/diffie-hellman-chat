const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('socket.io server');
});

io.on('connection', (socket) => {
  console.log('New socket connected');
});


http.listen(5000, ()=> {
  console.log('NANDITO ES UN CANGURO')
});

module.exports = app;