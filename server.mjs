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
  socket.on('createRoom', (data) => createRoom(data, socket));
  socket.on('joinRoom', (data) => joinRoom(data, socket));
  socket.on('playerJoinedRoom', (data) => playerJoinedRoom(data, socket));
  socket.on('playersInRoom', (data) =>playersInRoom(data, socket));
  socket.on('leaveRoom', (data) => leaveRoom(data, socket));
  socket.on('setTeams', (data) => setTeams(data, socket));
  socket.on('gameStarted', (data) => gameStarted(data, socket));
  socket.on('generateDeck', (data) => generateDeck(data, socket));
  socket.on('kickCard', (data) => kickCard(data, socket));
  socket.on('playerCards', (data) => playerCards(data, socket));
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
    roomUsers[thisRoomId].users.push({
      nickname: data.nickname,
      id: gameSocket.id
    });
  }
  else {
    roomUsers[thisRoomId] = {
      users: []
    };

    roomUsers[thisRoomId].users.push({
      nickname: data.nickname,
      id: gameSocket.id
    });
  }

  io.to(thisRoomId).emit('playerJoinedRoom', { success: true, room_id: thisRoomId });
  io.to(thisRoomId).emit('playersInRoom', roomUsers[thisRoomId].users);
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
        roomUsers[data.roomId].users.push({
          nickname: data.nickname,
          id: gameSocket.id
        });
      }
      else {
        roomUsers[data.roomId] = {
          users: []
        };

        roomUsers[data.roomId].users.push({
          nickname: data.nickname,
          id: gameSocket.id
        });
      }

      // Emit an event notifying the clients that the player has joined the room.
      io.to(data.roomId).emit('playerJoinedRoom', { success: true, room_id: data.roomId });
      io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);
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
    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);
  }
  else {
    console.log('Room doesnt exist');
  }
}

function leaveRoom(data, gameSocket) {
  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId)) {
    gameSocket.leave(data.roomId);

    const index = roomUsers[data.roomId]?.users.findIndex((el) => el.id == gameSocket.id);

    if (index >= 0) {
      roomUsers[data.roomId].users.splice(index, 1);
    }

    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);
  }
}

function setTeams(data, gameSocket) {
  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId) && gameSocket.adapter.rooms.get(data.roomId).size == 4 && roomUsers[data.roomId]) {

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el, i) => {

      // Set host and their chosen partner to team 1
      if (el.id == gameSocket.id || el.id == data.partnerId) {
        roomUsers[data.roomId].users[i].team = 1;
      }
      else { // Set other users to team 2
        roomUsers[data.roomId].users[i].team = 2;
      }
    });

    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);
  }
  else {
    console.log('setTeams: Error');
  }
}


function gameStarted(data, gameSocket) {

  // If the room exists...
  if (gameSocket.adapter.rooms.get(data.roomId)) {

    io.to(data.roomId).emit('gameStarted', true);
  }
  else {
    console.log('gameStarted: Error');
  }
}




// Game Logic

function shuffle(deck) {
  let loc1;
  let loc2;
  let temp;
  for (let i = 0; i < 1000; i++) {
    loc1 = Math.floor((Math.random() * deck.length));
    loc2 = Math.floor((Math.random() * deck.length));
    temp = deck[loc1];
    deck[loc1] = deck[loc2];
    deck[loc2] = temp;
  }
}

function generateDeck(data, gameSocket) {
  if (!roomUsers[data.roomId] || !gameSocket.adapter.rooms.get(data.roomId)) {
    console.log('generateDeck: Error');
    return;
  }

  if (roomUsers[data.roomId].deck) {
    gameSocket.emit('deck', roomUsers[data.roomId].deck);
    return;
  }

  const suits = ['s', 'd', 'c', 'h']; // s=Spades, d=Dimes, c=Clubs, h=Hearts
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K', 'A'];
  const deck = [];
  let card;
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      card = { suit: suits[i], value: values[j] };
      deck.push(card);
    }
  }
  shuffle(deck);

  roomUsers[data.roomId].deck = deck;

  console.log('About to emit kickCard');
  kickCard(data, gameSocket);
}

function kickCard(data, gameSocket) {
  if (!roomUsers[data.roomId] || !gameSocket.adapter.rooms.get(data.roomId) || !roomUsers[data.roomId].deck) {
    console.log('kickCard: Error');
    return;
  }

  if (roomUsers[data.roomId].kicked) {
    io.to(data.roomId).emit('kickedCards', roomUsers[data.roomId].kicked);
    return;
  }

  // Kick card
  roomUsers[data.roomId].deck.pop();

  // Deal 3 cards to each player twice
  dealAll(data, gameSocket);
  dealAll(data, gameSocket);
}

/*
  Deal 3 cards to a player
*/
function deal(player, deck) {
  let card;
  const tempPlayer = { ...player };
  const tempDeck = [ ...deck ];

  for (let i = 0; i < 3; i++) {
    card = tempDeck.pop();

    if (card) {
      if (tempPlayer.cards) {
        console.log('TPC: ', tempPlayer.cards);
        tempPlayer.cards.push(card);
      }
      else {
        tempPlayer.cards = [card];
      }
    }
  }

  return {
    hand: tempPlayer.cards,
    deck: tempDeck
  };
}

/*
  Deal 3 cards to all players
*/
function dealAll(data, gameSocket) {
  if (!roomUsers[data.roomId] || !gameSocket.adapter.rooms.get(data.roomId) || !roomUsers[data.roomId].deck) {
    console.log('dealAll: Error');
    return;
  }

  const tempPlayer = [];
  let tempDeck = [ ...roomUsers[data.roomId].deck];

  for (let i = 0; i < 4; i++) {
    const resp = deal(roomUsers[data.roomId].users[i], tempDeck);

    roomUsers[data.roomId].users[i].cards = resp.hand;
    tempPlayer[i] = resp.hand;
    tempDeck = resp.deck;
  }

  roomUsers[data.roomId].deck = tempDeck;

  io.to(data.roomId).emit('deck', tempDeck);
  io.to(data.roomId).emit('kickedCards', roomUsers[data.roomId].kicked);
}


function playerCards(data, gameSocket) {
  if (gameSocket.adapter.rooms.get(data.roomId)) {

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el, i) => {

      // Send player card data to player
      if (el.id == gameSocket.id) {
        gameSocket.emit('playerCards', roomUsers[data.roomId].users[i].cards);
        return;
      }
    });
  }
  else {
    console.log('Room doesnt exist');
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
