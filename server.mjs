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

let roomUsers = {};

io.on('connect', socket => {
  count = count + 1;
  socket.emit('now', {
    message: 'test',
    count: count
  });
})

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('createRoom', (data) => createRoom(data, socket));
  socket.on('joinRoom', (data) => joinRoom(data, socket));
  socket.on('playerJoinedRoom', (data) => playerJoinedRoom(data, socket));
  socket.on('playersInRoom', (data) => console.log('PIR'));
});

function createRoom(data, gameSocket) {
  // Create a unique numbered room
  var thisRoomId = ((Math.random() * 100000) | 0).toString();

  // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  io.emit('newRoomCreated', { roomId: thisRoomId, mySocketId: gameSocket.id });

  console.log('Room created: ' + thisRoomId + gameSocket.id);

  // Join the Room and wait for the players
  gameSocket.join(thisRoomId);

  console.log("CData: ", data);

  if (roomUsers[thisRoomId]) {
    roomUsers[thisRoomId].push(data.nickname);
  }
  else {
    roomUsers[thisRoomId] = [data.nickname];
  }

  io.to(thisRoomId).emit('playerJoinedRoom', data);
  io.to(thisRoomId).emit('playersInRoom', roomUsers[thisRoomId]);
};

function joinRoom(data, gameSocket) {
  // Look up the room ID in the Socket.IO manager object.

  //this is an ES6 Set of all client ids in the room

  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId)) {
    // gameSocket.adapter.rooms.forEach(logMapElements);
    console.log("Heyo " + gameSocket.adapter.rooms.get(data.roomId).size)
    if (gameSocket.adapter.rooms.get(data.roomId).size < 4) {
      // attach the socket id to the data object.
      data.mySocketId = gameSocket.id;

      // Join the room
      gameSocket.join(data.roomId);

      console.log('Player ' + data.nickname + ' joining game: ' + data.roomId + ' with socket ID of :' + gameSocket.id);

      if (roomUsers[data.roomId]) {
        roomUsers[data.roomId].push(data.nickname);
      }
      else {
        roomUsers[data.roomId] = [data.nickname];
      }

      console.log("Room Users for Room " + data.roomId + ': ', roomUsers);

      console.log("Rooms: ", gameSocket.adapter.rooms);

      // Emit an event notifying the clients that the player has joined the room.
      io.to(data.roomId).emit('playerJoinedRoom', data);
      io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId]);
    }
    else {
      console.log("Full room")
    }

  } else {
    // Otherwise, send an error message back to the player.
    gameSocket.emit('error', { message: "This room does not exist." });
    console.log("Room doesnt exist");
  }
}

function playerJoinedRoom(data, gameSocket) {
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
