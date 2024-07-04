import next from 'next';
import { Server, Socket } from 'socket.io';
import express from 'express';
import { createServer } from 'node:http';

const app = express();
const server = createServer(app);

// eslint-disable-next-line no-undef
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const io = new Server(server);

let port = 3000;
let count = 0;

let roomUsers = {};

io.on('connect', socket => {
  count = count + 1;
  socket.emit('now', {
    message: 'test',
    count: count
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('createRoom', (data) => createRoom(data, socket));
  socket.on('joinRoom', (data) => joinRoom(data, socket));
  socket.on('playerJoinedRoom', (data) => playerJoinedRoom(data, socket));
  socket.on('playersInRoom', (data) =>playersInRoom(data, socket));
  socket.on('leaveRoom', (data) => leaveRoom(data, socket));
  socket.on('setTeams', (data) => setTeams(data, socket));
  socket.on('gameStarted', (data) => gameStarted(data, socket));
});

function generateRoomId(gameSocket) {
  let randomNumber;
  do {
    randomNumber = (Math.floor(Math.random() * 90000) + 10000).toString();
  } while (gameSocket.adapter.rooms.get(randomNumber)); // Regenerate if ID is not uniqute

  return randomNumber.toString();
}

function createRoom(data, gameSocket) {
  // Create a unique numbered room
  let thisRoomId = generateRoomId(gameSocket);

  // Join the Room and wait for the players
  gameSocket.join(thisRoomId);

  // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  io.to(thisRoomId).emit('newRoomCreated', { roomId: thisRoomId, mySocketId: gameSocket.id });

  if (roomUsers[thisRoomId]) {
    roomUsers[thisRoomId].push({
      nickname: data.nickname,
      id: gameSocket.id
    });
  }
  else {
    roomUsers[thisRoomId] = [{
      nickname: data.nickname,
      id: gameSocket.id
    }];
  }

  io.to(thisRoomId).emit('playerJoinedRoom', { success: true, room_id: thisRoomId });
  io.to(thisRoomId).emit('playersInRoom', roomUsers[thisRoomId]);
}

function joinRoom(data, gameSocket) {
  // Look up the room ID in the Socket.IO manager object.
  //this is an ES6 Set of all client ids in the room

  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId)) {

    // If room is not full
    if (gameSocket.adapter.rooms.get(data.roomId).size < 4) {
      // attach the socket id to the data object.
      data.mySocketId = gameSocket.id;

      // Join the room
      gameSocket.join(data.roomId);

      if (roomUsers[data.roomId]) {
        roomUsers[data.roomId].push({
          nickname: data.nickname,
          id: gameSocket.id
        });
      }
      else {
        roomUsers[data.roomId] = [{
          nickname: data.nickname,
          id: gameSocket.id
        }];
      }

      // Emit an event notifying the clients that the player has joined the room.
      io.to(data.roomId).emit('playerJoinedRoom', { success: true, room_id: data.roomId });
      io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId]);
    }
    else {
      gameSocket.emit('playerJoinedRoom', { success: false, errorMsg: 'Sorry, this room is full!' });
    }

  } else {
    // Otherwise, send an error message back to the player.
    gameSocket.emit('playerJoinedRoom', { success: false, errorMsg: 'Sorry, this room does not exist!' });
    console.log('Room doesnt exist');
  }
}

function playerJoinedRoom(data, gameSocket) {
  console.log('Player joined room: ', data);
}

function playersInRoom(data, gameSocket) {
  if (gameSocket.adapter.rooms.get(data.roomId)) {
    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId]);
  }
  else {
    console.log('Room doesnt exist');
  }
}

function leaveRoom(data, gameSocket) {
  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId)) {
    gameSocket.leave(data.roomId);

    const index = roomUsers[data.roomId]?.findIndex((el) => el.id == gameSocket.id);

    if (index >= 0) {
      roomUsers[data.roomId].splice(index, 1);
    }

    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId]);
  }
}

function setTeams(data, gameSocket) {
  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId) && gameSocket.adapter.rooms.get(data.roomId).size == 4 && roomUsers[data.roomId]) {

    // Loop through users in room
    roomUsers[data.roomId].forEach((el, i) => {

      // Set host and their chosen partner to team 1
      if (el.id == gameSocket.id || el.id == data.partnerId) {
        roomUsers[data.roomId][i].team = 1;
      }
      else { // Set other users to team 2
        roomUsers[data.roomId][i].team = 2;
      }
    });

    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId]);
  }
  else {
    console.log('Error');
  }
}


function gameStarted(data, gameSocket) {

  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId)) {

    io.to(data.roomId).emit('gameStarted', true);
  }
  else {
    console.log('Error');
  }
}


nextApp.prepare()
  .then(() => {

    app.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    // eslint-disable-next-line no-undef
    process.exit(1);
  });
