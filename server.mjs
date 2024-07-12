import next from 'next';
import { Server } from 'socket.io';
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
  socket.on('initialiseGame', (data) => initialiseGame(data, socket));
  socket.on('kickCard', (data) => kickCard(data, socket));
  socket.on('playerCards', (data) => playerCards(data, socket));
  socket.on('begResponse', (data) => begResponse(data, socket));
  socket.on('redeal', (data) => initialiseGameCards(data, socket));
  socket.on('playCard', (data) => playCard(data, socket));
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

    // If player is already in room
    if (roomUsers[data.roomId] && roomUsers[data.roomId].users && roomUsers[data.roomId].users.find(el => el.id == gameSocket.id)) {
      return;
    }

    // If room is not full
    if (gameSocket.adapter.rooms.get(data.roomId).size < 4) {

      // Join the room
      gameSocket.join(data.roomId);

      if (roomUsers[data.roomId] && roomUsers[data.roomId].users) {
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

    if (!roomUsers[data.roomId].users) {
      return;
    }

    const playersData = roomUsers[data.roomId].users.map(el => {
      return {
        ...el,
        numCards: el.cards?.length ?? 0,
        cards: undefined
      };
    });

    io.to(data.roomId).emit('playersInRoom', playersData);
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

    let isTeam2MemberSetAlready = false;

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el, i) => {

      // Set host to team 1 and as player 1
      if (el.id == gameSocket.id) {
        roomUsers[data.roomId].users[i].team = 1;
        roomUsers[data.roomId].users[i].player = 1;
      }
      else if (el.id == data.partnerId) { // Set host's chosen partner to team 1 and as player 3
        roomUsers[data.roomId].users[i].team = 1;
        roomUsers[data.roomId].users[i].player = 3;
      }
      else { // Set other users to team 2
        roomUsers[data.roomId].users[i].team = 2;


        if (!isTeam2MemberSetAlready) { // If a player has not been added to team 2 as yet, assign them as player 2
          roomUsers[data.roomId].users[i].player = 2;
          isTeam2MemberSetAlready = true;
        }
        else { // Else assign them as player 4
          roomUsers[data.roomId].users[i].player = 4;
        }
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
    console.log('Deck already generated');
    return;
  }

  const suits = ['s', 'd', 'c', 'h']; // s=Spades, d=Dimes, c=Clubs, h=Hearts
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K', 'A'];
  const power = [2, 3, 4, 5, 6, 7, 8, 9 , 10, 11, 12, 13, 14];
  const deck = [];
  let card;
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      card = { suit: suits[i], value: values[j], power: power[j] };
      deck.push(card);
    }
  }
  shuffle(deck);

  roomUsers[data.roomId].deck = deck;
}

/*
   Check to see what card that the dealer has kicked
 */
function checkKicked(kicked, roomId, dealerTeam) {
  if (!roomUsers[roomId].teamScore) {
    roomUsers[roomId].teamScore = [0, 0];
  }

  if (kicked.value == '6') {
    if (dealerTeam == 1) {
      roomUsers[roomId].teamScore[0] += 2;
    }
    else {
      roomUsers[roomId].teamScore[1] += 2;
    }
  }
  if (kicked.value == 'J') {
    if (dealerTeam == 1) {
      roomUsers[roomId].teamScore[0] += 3;
    }
    else {
      roomUsers[roomId].teamScore[1] += 3;
    }
  }
  if (kicked.value == 'A') {
    if (dealerTeam == 1) {
      roomUsers[roomId].teamScore[0]++;
    }
    else {
      roomUsers[roomId].teamScore[1]++;
    }
  }

}

function kickCard(data, gameSocket) {
  if (!roomUsers[data.roomId] || !gameSocket.adapter.rooms.get(data.roomId) || !roomUsers[data.roomId].deck) {
    console.log('kickCard: Error');
    return;
  }

  // Kick card
  const kickVal = roomUsers[data.roomId].deck.pop();

  if (!roomUsers[data.roomId].kicked) {
    roomUsers[data.roomId].kicked = [kickVal];
  }
  else {
    roomUsers[data.roomId].kicked.push(kickVal);
  }

  roomUsers[data.roomId].trump = kickVal.suit;

  const dealerTeam = roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].dealer).team;

  checkKicked(kickVal, data.roomId, dealerTeam);

  roomUsers[data.roomId].trump = kickVal.suit;

  io.to(data.roomId).emit('kickedCards', roomUsers[data.roomId].kicked);
  io.to(data.roomId).emit('teamScore', roomUsers[data.roomId].teamScore);
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

  playersInRoom(data, gameSocket);

}

function resetGameState(roomId) {
  roomUsers[roomId].deck = undefined;

  roomUsers[roomId].kicked = undefined;

  // Set beg state to 'begging' to let game know that a player is currently deciding whether to beg or not
  roomUsers[roomId].beg = 'begging';

  for (let i = 0; i < 4; i++) {
    roomUsers[roomId].users[i].cards = undefined;
    roomUsers[roomId].users[i].numCards = undefined;
  }
}

function initialiseGameCards(data, gameSocket) {
  resetGameState(data.roomId);

  generateDeck(data, gameSocket);

  // Kick card
  kickCard(data, gameSocket);

  // Deal 3 cards to each player twice
  dealAll(data, gameSocket);
  dealAll(data, gameSocket);

  io.to(data.roomId).emit('dealer', roomUsers[data.roomId].dealer);
  io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);
  io.to(data.roomId).emit('beg', roomUsers[data.roomId].beg);

  // Loop through users in room
  roomUsers[data.roomId].users.forEach((el, i) => {

    // Send player card data to player who is begging and dealer
    if (el.player == roomUsers[data.roomId].turn || el.player == roomUsers[data.roomId].dealer) {
      io.to(el.id).emit('playerCards', roomUsers[data.roomId].users[i].cards);
    }
    else {
      io.to(el.id).emit('playerCards', undefined);
    }
  });
}

function initialiseGame(data, gameSocket) {
  if (!roomUsers[data.roomId] || !gameSocket.adapter.rooms.get(data.roomId)) {
    console.log('generateDeck: Error');
    return;
  }

  if (roomUsers[data.roomId].deck) {
    console.log('Deck already generated');
    return;
  }

  // Determine who is the dealer
  if (!roomUsers[data.roomId].dealer || roomUsers[data.roomId].dealer == 4) {
    roomUsers[data.roomId].dealer = 1;
  }
  else {
    roomUsers[data.roomId].dealer = roomUsers[data.roomId].dealer + 1;
  }

  // Determine whose turn it is
  if (!roomUsers[data.roomId].turn) { // This means it is a new game
    roomUsers[data.roomId].turn = 2;
  }
  else if (roomUsers[data.roomId].turn == 4) {
    roomUsers[data.roomId].turn = 1;
  }
  else {
    roomUsers[data.roomId].turn = roomUsers[data.roomId].turn + 1;
  }

  initialiseGameCards(data, gameSocket);
}


function playerCards(data, gameSocket) {
  if (gameSocket.adapter.rooms.get(data.roomId)) {

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el, i) => {
      // Send player card data to player
      if (el.id == gameSocket.id) {
        gameSocket.emit('playerCards', el.cards);
        return;
      }
    });
  }
  else {
    console.log('Room doesnt exist');
  }
}

function emitPlayerCardData(data) {
  // Loop through users in room
  roomUsers[data.roomId].users.forEach((el, i) => {
    // Send player card data to each player
    io.to(el.id).emit('playerCards', el.cards);
  });
}

function beg(data, gameSocket) {
  if (!roomUsers[data.roomId] || !roomUsers[data.roomId].kicked) {
    console.log('Missing data');
  }

  io.to(data.roomId).emit('message', {
    message: roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].dealer).nickname + ' ran the pack!',
    shortcode: 'RUN'
  });

  kickCard(data, gameSocket);

  dealAll(data, gameSocket);

  // If same suit is kicked again (1)
  if (roomUsers[data.roomId].kicked[1].suit == roomUsers[data.roomId].kicked[0].suit) {
    kickCard(data, gameSocket);

    dealAll(data, gameSocket);

    // If same suit is kicked again (2)
    if (roomUsers[data.roomId].kicked[2].suit == roomUsers[data.roomId].kicked[1].suit) {
      kickCard(data, gameSocket);

      // If same suit is kicked again (3)
      if (roomUsers[data.roomId].kicked[3].suit == roomUsers[data.roomId].kicked[2].suit) {

        // Redeal
        io.to(data.roomId).emit('message', {
          message: 'The deck has run out of cards and must be redealt!',
          shortcode: 'REDEAL'
        });
        // roomUsers[data.roomId].turn = undefined;
        // io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);
      }

    }

  }

  emitPlayerCardData(data);

}

function begResponse(data, gameSocket) {
  if (gameSocket.adapter.rooms.get(data.roomId)) {

    if (data.response == 'begged') {
      roomUsers[data.roomId].beg = 'begged';
      io.to(data.roomId).emit('message', {
        message: roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].turn).nickname + ' has begged!',
        shortcode: 'BEGGED'
      });
    }
    else if (data.response == 'stand') {
      roomUsers[data.roomId].beg = 'stand';
      // io.to(data.roomId).emit('message', {
      //   message: roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].turn).nickname + ' has stood!',
      //   shortcode: 'STAND'
      // });
    }
    else if (data.response == 'give') {
      roomUsers[data.roomId].beg = 'give';

      const beggerTeam = roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].turn).team;

      if (beggerTeam == 1) {
        roomUsers[data.roomId].teamScore[0]++;
      }
      else {
        roomUsers[data.roomId].teamScore[1]++;
      }

      io.to(data.roomId).emit('teamScore', roomUsers[data.roomId].teamScore);

      io.to(data.roomId).emit('message', {
        message: roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].dealer).nickname + ' gave a point!',
        shortcode: 'GIVE'
      });
    }
    else if (data.response == 'run') {
      roomUsers[data.roomId].beg = 'run';
      beg(data, gameSocket);
      playerCards(data, gameSocket);
    }

    io.to(data.roomId).emit('beg', roomUsers[data.roomId].beg);
  }
  else {
    console.log('Room doesnt exist');
  }
}


/*
    Determine whether or not a player tried to undertrump
  */
function didUndertrump(data) {
  if (!roomUsers[data.roomId].lift || !roomUsers[data.roomId].trump || data.card?.suit != roomUsers[data.roomId].trump) {
    return false;
  }

  roomUsers[data.roomId].lift.forEach(el => {
    if ((el.suit == roomUsers[data.roomId].trump) && (el.power > data.card.power)) {
      return true;
    }
  });

  return false;
}


function playCard(data, gameSocket) {
  if (!gameSocket.adapter.rooms.get(data.roomId)) {
    console.log('Room doesnt exist');
  }

  if (data.player != roomUsers[data.roomId].turn) {
    console.log('It is not this players turn to play ');
  }

  const undertrumped = didUndertrump(data);

  const player = roomUsers[data.roomId].users.find(el => el.id == gameSocket.id);

  const playerCards = player.cards;

  const trump = roomUsers[data.roomId].trump;

  let bare = true;

  // Determine if a player does not have a card in the suit of the card that was called
  if (roomUsers[data.roomId].called) {
    playerCards.forEach((el) => {
      if (el.suit == roomUsers[data.roomId].called.suit) {
        bare = false;
      }
    });
  }

  // If the player:
  // * Played a suit that wasn't called,
  // * Wasn't the first player to play for the round,
  // * Has cards in their hand that correspond to the called suit, and
  // * the card played is not trump,
  // then end function and do not add card to lift
  if (roomUsers[data.roomId].called && data.card.suit != roomUsers[data.roomId].called.suit && !bare && data.card.suit != trump) {
    console.log('Invalid card played');
    return;
  }

  // If the player attempted to undertrump, end function and do not add card to lift
  if (roomUsers[data.roomId].called && (data.card.suit == roomUsers[data.roomId].trump && undertrumped == true) && roomUsers[data.roomId].called.suit != trump && !bare) {
    console.log('Undertrump');
    return;
  }

  // Add card to lift
  if (!roomUsers[data.roomId].lift) {
    roomUsers[data.roomId].lift = [{ ...data.card, player: player.player }];
  }
  else {
    roomUsers[data.roomId].lift.push({ ...data.card, player: player.player });
  }

  // If trump has not been called yet
  if (!roomUsers[data.roomId].called) {
    roomUsers[data.roomId].called = data.card;
  }

  // Find card in playerCards array that correspond to the card clicked
  const cardIndex = playerCards.findIndex(el => (el.suit == data.card.suit) && (el.value == data.card.value));

  // Remove card clicked from array
  playerCards.splice(cardIndex, 1);

  // Increment player turn
  if (roomUsers[data.roomId].turn >= 4) {
    roomUsers[data.roomId].turn = 1;
  }
  else {
    roomUsers[data.roomId].turn = roomUsers[data.roomId].turn + 1;
  }

  gameSocket.emit('playerCards', playerCards);
  io.to(data.roomId).emit('lift', roomUsers[data.roomId].lift);
  io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);

  if (!roomUsers[data.roomId].roundStarted) {
    roomUsers[data.roomId].roundStarted = true;
    emitPlayerCardData(data);
  }

}

function liftScoring(data, gameSocket) {
  // // If trump is played
  // if (data.card.suit == trump) {

  //   const power = data.card.power;
  //   if (power > roomUsers[data.roomId].high) {
  //     roomUsers[data.roomId].highWinner = playerTeam;
  //     roomUsers[data.roomId].high = power;
  //   }
  //   if (power < roomUsers[data.roomId].low) {
  //     roomUsers[data.roomId].lowWinner = playerTeam;
  //     roomUsers[data.roomId].low = power;
  //   }
  //   if (data.card.value == 'J') {
  //     const hangerInLift = roomUsers[data.roomId].lift.find(el => el.power > data.card.power);


  //   }
  //   if (value > 11 && jackInPlay == true) { // If jack is in lift and a Queen or higher has been played
  //     setJackWinner(team);
  //     jackWinnerVar = team;
  //   }
  //   if (value > 11 && value > jackHangerValue) { // If jack is in lift with a Queen or higher and a Card stronger than the previous royal is played
  //     setJackHangerTeam(team);
  //     setJackHangerValue(value);
  //     jackHangerTeamVar = team;
  //   }
  // }
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
