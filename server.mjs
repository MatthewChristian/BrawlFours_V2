import next from 'next'
import { Server, Socket } from 'socket.io';
import express from 'express';
import { createServer } from 'node:http';

const app = express();
const server = createServer(app);

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const io = new Server(server);

let port = 3000
let count = 0;
let gameSocket;

io.on('connect', socket => {
  count = count + 1;
  socket.emit('now', {
    message: 'test',
    count: count
  });
})

io.on('connection', (socket) => {
  console.log('a user connected');
  gameSocket = socket;
  socket.on('createRoom', createRoom);
  socket.on('joinRoom', joinRoom);
  socket.on('playerJoinedRoom', playerJoinedRoom)
});

function logMapElements(value, key, map) {
  console.log(`m[${key}] = ${value}`);
}

function createRoom() {
  // Create a unique numbered room
  var thisRoomId = (Math.random() * 100000) | 0;

  // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  this.emit('newRoomCreated', { roomId: thisRoomId, mySocketId: this.id });

  console.log('Room created: ' + thisRoomId + this.id);

  // Join the Room and wait for the players
  this.join(thisRoomId.toString());
};

function joinRoom(data) {
  // A reference to the player's Socket.IO socket object
  var playerSocket = this;

  // Look up the room ID in the Socket.IO manager object.

  /*var rooms = gameSocket.adapter.rooms;
  console.log("Len: " + gameSocket.adapter.rooms.size)
  gameSocket.adapter.rooms.forEach(logMapElements);
  console.log("RID: " + gameSocket.adapter.rooms.get('123'));*/

  //this is an ES6 Set of all client ids in the room

  console.log("DataR: ", data);

  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId)) {
    gameSocket.adapter.rooms.forEach(logMapElements);
    console.log("Heyo " + gameSocket.adapter.rooms.get(data.roomId).size)
    if (gameSocket.adapter.rooms.get(data.roomId).size < 4) {
      // attach the socket id to the data object.
      data.mySocketId = playerSocket.id;

      // Join the room
      playerSocket.join(data.roomId);

      console.log('Player ' + data.nickname + ' joining game: ' + data.roomId);

      // Emit an event notifying the clients that the player has joined the room.
      gameSocket.in(data.roomId).emit('playerJoinedRoom', data);
    }
    else {
      console.log("Full room")
    }

  } else {
    // Otherwise, send an error message back to the player.
    this.emit('error', { message: "This room does not exist." });
    console.log("Room doesnt exist");
  }
}

function playerJoinedRoom(data) {
  console.log('Player joined room: ', data);
  console.log('GS: ', gameSocket.adapter.rooms);
}

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
