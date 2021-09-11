const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')
    
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

let port = 3000
let count = 0;

io.on('connect', socket => {
  count = count + 1;
  socket.emit('now', {
    message: 'test',
    count: count
  });
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('createRoom', createRoom);
});



function createRoom() {
  // Create a unique numbered room
  var thisRoomId = ( Math.random() * 100000 ) | 0;

  // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  this.emit('newRoomCreated', {roomId: thisRoomId, mySocketId: this.id});

  console.log('Room created: ' + thisRoomId + this.id);

  // Join the Room and wait for the players
  this.join(thisRoomId.toString());
};

nextApp.prepare()
.then(() => {

  app.get('*', (req, res) => {
    return handle(req, res)
  })
   
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})


