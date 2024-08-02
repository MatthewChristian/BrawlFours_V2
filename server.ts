import next from 'next';
import { Server, Socket } from 'socket.io';
import express from 'express';
import { createServer } from 'node:http';
import { RoomSocket } from './models/RoomSocket';
import { CreateRoomInput } from './models/CreateRoomInput';
import { JoinRoomInput } from './models/JoinRoomInput';
import { BasicRoomInput } from './models/BasicRoomInput';
import { ChoosePartnerInput } from './models/ChoosePartnerInput';
import { DeckCard } from './models/DeckCard';
import { PlayerSocket } from './models/PlayerSocket';
import { BegResponseInput } from './models/BegResponseInput';
import { PlayCardInput } from './models/PlayCardInput';

const app = express();
const server = createServer(app);

// eslint-disable-next-line no-undef
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const io = new Server(server);

const port = process.env.PORT || 3000;
let count = 0;

const roomUsers: { [key: string]: RoomSocket} = {};

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
  socket.on('leaveRoom', (data) => leaveRoom(data, socket));
  socket.on('setTeams', (data) => setTeams(data, socket));
  socket.on('initialiseGame', (data) => initialiseGame(data));
  socket.on('playerCards', (data) => playerCards(data, socket));
  socket.on('begResponse', (data) => begResponse(data, socket));
  socket.on('redeal', (data) => initialiseGameCards(data));
  socket.on('playCard', (data) => playCard(data, socket));
});

function generateRoomId() {
  let randomNumber: string;
  do {
    randomNumber = (Math.floor(Math.random() * 90000) + 10000).toString();
  } while (io.of('/').adapter.rooms.get(randomNumber)); // Regenerate if ID is not uniqute

  return randomNumber.toString();
}

function createRoom(data: CreateRoomInput, gameSocket: Socket) {
  // Create a unique numbered room
  const thisRoomId = generateRoomId();

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

function joinRoom(data: JoinRoomInput, gameSocket: Socket) {
  // Look up the room ID in the Socket.IO manager object.
  //this is an ES6 Set of all client ids in the room

  // If the room exists...
  if (data.roomId && io.of('/').adapter.rooms.get(data.roomId)) {

    // If player is already in room
    if (roomUsers[data.roomId] && roomUsers[data.roomId].users && roomUsers[data.roomId].users.find(el => el.id == gameSocket.id)) {
      return;
    }

    // If room is not full
    if (io.of('/').adapter.rooms.get(data.roomId).size < 4) {

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

function playersInRoom(data: BasicRoomInput) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

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

function leaveRoom(data: BasicRoomInput, gameSocket: Socket) {
  // If the room exists...
  if (io.of('/').adapter.rooms.get(data.roomId)) {
    gameSocket.leave(data.roomId);

    const index = roomUsers[data.roomId]?.users.findIndex((el) => el.id == gameSocket.id);

    if (index >= 0) {
      roomUsers[data.roomId].users.splice(index, 1);
    }

    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);
  }
}

function setTeams(data: ChoosePartnerInput, gameSocket: Socket) {
  // If the room exists...
  if (io.of('/').adapter.rooms.get(data.roomId) && io.of('/').adapter.rooms.get(data.roomId).size == 4 && roomUsers[data.roomId]) {

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

    resetGameState(data.roomId);
    io.to(data.roomId).emit('roundWinners', undefined);
    io.to(data.roomId).emit('matchWinner', undefined);
    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);
    io.to(data.roomId).emit('gameStarted', true);
  }
  else {
    console.log('setTeams: Error');
  }
}




// Game Logic

function shuffle(deck: DeckCard[]) {
  let loc1: number;
  let loc2: number;
  let temp: DeckCard;

  for (let i = 0; i < 1000; i++) {
    loc1 = Math.floor((Math.random() * deck.length));
    loc2 = Math.floor((Math.random() * deck.length));
    temp = deck[loc1];
    deck[loc1] = deck[loc2];
    deck[loc2] = temp;
  }
}

function generateDeck(data: BasicRoomInput) {
  if (!roomUsers[data.roomId] || !io.of('/').adapter.rooms.get(data.roomId)) {
    console.log('generateDeck: Error');
    return;
  }

  if (roomUsers[data.roomId].deck) {
    console.log('Deck already generated');
    return;
  }

  const suits = ['s', 'd', 'c', 'h']; // s=Spades, d=Dimes, c=Clubs, h=Hearts
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K', 'A'];
  const power = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const points = [0, 0, 0, 0, 0, 0, 0 , 0, 10, 1, 2, 3, 4];
  const deck: DeckCard[] = [];
  let card: DeckCard;
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      card = { suit: suits[i], value: values[j], power: power[j], points: points[j], playable: false };
      deck.push(card);
    }
  }
  shuffle(deck);

  roomUsers[data.roomId].deck = deck;
}

/*
   Check to see what card that the dealer has kicked
 */
function checkKicked(kicked: DeckCard, roomId: string, dealerTeam: number) {
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

  const matchWinner = determineMatchEnd(roomId);
  if (matchWinner) {
    return {
      matchWon: true
    };
  }

  return {
    matchWon: false
  };


}

function kickCard(data: BasicRoomInput) {
  if (!roomUsers[data.roomId] || !io.of('/').adapter.rooms.get(data.roomId) || !roomUsers[data.roomId].deck) {
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

  const matchWon = checkKicked(kickVal, data.roomId, dealerTeam);

  roomUsers[data.roomId].trump = kickVal.suit;

  io.to(data.roomId).emit('kickedCards', roomUsers[data.roomId].kicked);
  io.to(data.roomId).emit('teamScore', roomUsers[data.roomId].teamScore);

  return matchWon;
}

/*
  Deal 3 cards to a player
*/
function deal(player: PlayerSocket, deck: DeckCard[]) {
  let card: DeckCard;

  const tempPlayer: PlayerSocket = { ...player };
  const tempDeck: DeckCard[] = [ ...deck ];

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
function dealAll(data: BasicRoomInput) {
  if (!roomUsers[data.roomId] || !io.of('/').adapter.rooms.get(data.roomId) || !roomUsers[data.roomId].deck) {
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

  playersInRoom(data);

}

function resetGameState(roomId: string) {
  roomUsers[roomId].deck = undefined;

  roomUsers[roomId].kicked = undefined;

  roomUsers[roomId].game = undefined;

  // Set beg state to 'begging' to let game know that a player is currently deciding whether to beg or not
  roomUsers[roomId].beg = 'begging';

  for (let i = 0; i < 4; i++) {
    roomUsers[roomId].users[i].cards = undefined;
    roomUsers[roomId].users[i].numCards = undefined;
  }
}

function resetMatchState(roomId: string) {
  roomUsers[roomId].matchWinner = undefined;
  roomUsers[roomId].teamScore = undefined;
  roomUsers[roomId].turn = undefined;
  roomUsers[roomId].dealer = undefined;

  resetRoundState(roomId);

  io.to(roomId).emit('game', roomUsers[roomId].game);
}

function orderCards(roomId: string) {
  const order: string[] = ['s', 'h', 'c', 'd'];

  roomUsers[roomId].users.forEach(el => {
    const orderedPlayerCards = [...el.cards];

    orderedPlayerCards.sort(function (a, b) {
      const aSuitIndex = order.findIndex(el => el == a.suit);
      const bSuitIndex = order.findIndex(el => el == b.suit);

      if (aSuitIndex < bSuitIndex) { return -1; }
      if (aSuitIndex > bSuitIndex) { return 1; }
      if (a.power < b.power) { return -1; }
      if (a.power > b.power) { return 1; }
      return 0;
    });

    el.cards = orderedPlayerCards;
  });
}

function initialiseGameCards(data: BasicRoomInput) {
  console.log('Resetting game state from IGC');
  resetGameState(data.roomId);

  generateDeck(data);

  // Kick card
  const matchWon = kickCard(data);

  // If game was ended because team kicked a card that gave them enough points to win, then stop function
  if (matchWon.matchWon) {
    announceWinner(data.roomId, true);
    return;
  }

  // Deal 3 cards to each player twice
  dealAll(data);
  dealAll(data);

  // Order player cards by suit and value
  orderCards(data.roomId);

  io.to(data.roomId).emit('dealer', roomUsers[data.roomId].dealer);
  io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);
  io.to(data.roomId).emit('beg', roomUsers[data.roomId].beg);

  // Loop through users in room
  roomUsers[data.roomId].users.forEach((el, i) => {

    // Determine which cards are playable for the player whose turn it is
    if (el.player == roomUsers[data.roomId].turn) {
      determineIfCardsPlayable(el, data.roomId);
    }

    // Send player card data to player who is begging and dealer
    if (el.player == roomUsers[data.roomId].turn || el.player == roomUsers[data.roomId].dealer) {
      io.to(el.id).emit('playerCards', roomUsers[data.roomId].users[i].cards);
    }
    else {
      io.to(el.id).emit('playerCards', undefined);
    }
  });
}

function initialiseGame(data: BasicRoomInput) {
  if (!roomUsers[data.roomId] || !io.of('/').adapter.rooms.get(data.roomId)) {
    console.log('generateDeck: Error');
    return;
  }

  if (roomUsers[data.roomId].deck) {
    console.log('Deck already generated');
    return;
  }

  // Reset match state
  resetMatchState(data.roomId);

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

  initialiseGameCards(data);
}


function playerCards(data, gameSocket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el) => {
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

function emitPlayerCardData(data: BasicRoomInput) {
  // Loop through users in room
  roomUsers[data.roomId].users.forEach((el) => {
    // Send player card data to each player
    io.to(el.id).emit('playerCards', el.cards);
  });
}

function beg(data: BasicRoomInput) {
  if (!roomUsers[data.roomId] || !roomUsers[data.roomId].kicked) {
    console.log('Missing data');
  }

  io.to(data.roomId).emit('message', {
    message: roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].dealer).nickname + ' ran the pack!',
    shortcode: 'RUN'
  });

  let matchWon = kickCard(data);

  // If game was ended because team kicked a card that gave them enough points to win, then stop function
  if (matchWon.matchWon) {
    announceWinner(data.roomId, true);
    return;
  }

  dealAll(data);

  // If same suit is kicked again (1)
  if (roomUsers[data.roomId].kicked[1].suit == roomUsers[data.roomId].kicked[0].suit) {
    matchWon = kickCard(data);

    if (matchWon.matchWon) {
      announceWinner(data.roomId, true);
      return;
    }

    dealAll(data);

    // If same suit is kicked again (2)
    if (roomUsers[data.roomId].kicked[2].suit == roomUsers[data.roomId].kicked[1].suit) {
      matchWon = kickCard(data);

      if (matchWon.matchWon) {
        announceWinner(data.roomId, true);
        return;
      }

      // If same suit is kicked again (3)
      if (roomUsers[data.roomId].kicked[3].suit == roomUsers[data.roomId].kicked[2].suit) {

        // Redeal
        io.to(data.roomId).emit('message', {
          message: 'The deck has run out of cards and must be redealt!',
          shortcode: 'REDEAL'
        });
      }

    }

  }

  // Order player cards by suit and value
  orderCards(data.roomId);

  emitPlayerCardData(data);

}

function begResponse(data: BegResponseInput, gameSocket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Reset round states
    resetRoundState(data.roomId);

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
        if (roomUsers[data.roomId].teamScore[0] >= 13) {
          io.to(gameSocket.id).emit('message', {
            message: 'You cannot give a point as it will end the game!',
            shortcode: 'WARNING'
          });
          return;
        }
        roomUsers[data.roomId].teamScore[0]++;
      }
      else {
        if (roomUsers[data.roomId].teamScore[1] >= 13) {
          io.to(gameSocket.id).emit('message', {
            message: 'You cannot give a point as it will end the game!',
            shortcode: 'WARNING'
          });
          return;
        }
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
      beg(data);
      playerCards(data, gameSocket);
    }

    io.to(data.roomId).emit('beg', roomUsers[data.roomId].beg);
    io.to(data.roomId).emit('roundWinners', undefined);
  }
  else {
    console.log('Room doesnt exist');
  }
}


/*
    Determine whether or not a player tried to undertrump
  */
function didUndertrump(data: PlayCardInput) {
  if (!roomUsers[data.roomId].lift || !roomUsers[data.roomId].trump || data.card?.suit != roomUsers[data.roomId].trump) {
    return false;
  }

  let undertrumped = false;

  roomUsers[data.roomId].lift.forEach(el => {
    if ((el.suit == roomUsers[data.roomId].trump) && (el.power > data.card.power)) {
      undertrumped = true;
    }
  });

  return undertrumped;
}

function determineIfCardsPlayable(player: PlayerSocket, roomId: string) {
  let bare = true;
  const trump = roomUsers[roomId].trump;

  // Determine if a player does not have a card in the suit of the card that was called
  if (roomUsers[roomId].called) {
    player.cards.forEach((el) => {
      if (el.suit == roomUsers[roomId].called.suit) {
        bare = false;
      }
    });
  }

  player.cards.forEach((card) => {
    const undertrumped = didUndertrump({ card: card, player: player.player, roomId: roomId });

    // If the player:
    // * Played a suit that wasn't called,
    // * Wasn't the first player to play for the round,
    // * Has cards in their hand that correspond to the called suit, and
    // * the card played is not trump,
    // then end function and do not add card to lift
    if (roomUsers[roomId].called && card.suit != roomUsers[roomId].called.suit && !bare && card.suit != trump) {
      console.log('Invalid card played');
      card.playable = false;
    }
    // If the player attempted to undertrump, end function and do not add card to lift
    else if (roomUsers[roomId].called && (card.suit == roomUsers[roomId].trump && undertrumped == true) && roomUsers[roomId].called.suit != trump && !bare) {
      console.log('Undertrump');
      card.playable = false;
    }
    else {
      card.playable = true;
    }

  });
}

function resetCardsPlayability(player: PlayerSocket) {
  player.cards.forEach((card) => {
    card.playable = false;
  });
}

function setCardsPlayability(roomId: string) {
  // Set playable status of cards of player whose turn is next
  const turnPlayer = roomUsers[roomId].users.find(el => el.player == roomUsers[roomId].turn);
  determineIfCardsPlayable(turnPlayer, roomId);
  io.to(turnPlayer.id).emit('playerCards', turnPlayer.cards);
}

function playCard(data: PlayCardInput, gameSocket: Socket) {
  if (!io.of('/').adapter.rooms.get(data.roomId)) {
    console.log('Room doesnt exist');
  }

  if (data.player != roomUsers[data.roomId].turn) {
    console.log('It is not this players turn to play ');
  }

  const player = roomUsers[data.roomId].users.find(el => el.id == gameSocket.id);

  const playerCards = player.cards;

  // Find card data using data from roomUsers object to prevent user from sending false information
  const cardIndex = playerCards.findIndex(el => (el.suit == data.card.suit) && (el.value == data.card.value));

  if (cardIndex == -1) {
    console.log("Invalid card");
    return;
  }

  const cardData = playerCards[cardIndex];

  if (!cardData.playable) {
    console.log('Card not playable');
    return;
  }

  // Add card to lift
  if (!roomUsers[data.roomId].lift) {
    roomUsers[data.roomId].lift = [{ ...cardData, player: player.player }];
  }
  else {
    roomUsers[data.roomId].lift.push({ ...cardData, player: player.player });
  }

  // If trump has not been called yet
  if (!roomUsers[data.roomId].called) {
    roomUsers[data.roomId].called = cardData;
  }


  // Remove card clicked from array
  playerCards.splice(cardIndex, 1);

  // Reset card playability of player who just played
  resetCardsPlayability(player);

  // Emit data
  gameSocket.emit('playerCards', playerCards);
  io.to(data.roomId).emit('lift', roomUsers[data.roomId].lift);
  io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);



  playersInRoom(data);

  // Show player their cards if round has officially started (ie player stood and played a card)
  if (!roomUsers[data.roomId].roundStarted) {
    resetRoundState(data.roomId);
    roomUsers[data.roomId].roundStarted = true;
    emitPlayerCardData(data);
  }

  if (roomUsers[data.roomId].lift.length >= 4) {
    liftScoring(data);
  }
  else {
    // Increment player turn
    if (roomUsers[data.roomId].turn >= 4) {
      roomUsers[data.roomId].turn = 1;
    }
    else {
      roomUsers[data.roomId].turn = roomUsers[data.roomId].turn + 1;
    }

    // Set playable status of cards of player whose turn is next
    setCardsPlayability(data.roomId);

    io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);
  }

  let roundEnded = true;

  // Iterate through users cards and check if anybody still has cards in their hand
  roomUsers[data.roomId].users.forEach(el => {
    if (el.cards && el.cards.length > 0)  {
      roundEnded = false;
    }
  });

  if (roundEnded) {
    roundScoring(data);
  }
}

function liftScoring(data: BasicRoomInput) {

  let highestHangerPower = 0;
  let highestHangerPlayer: PlayerSocket;
  let jackOwnerPlayer: PlayerSocket;
  let liftWinnerPlayer: PlayerSocket;

  let highestPowerInLift = 0;
  let liftPoints = 0;


  // Loop through lift
  roomUsers[data.roomId].lift.forEach(el => {
    // Add 100 points to power if card was trump, minus 100 points from power if card was not suit that was called
    const power = el.power + (el.suit == roomUsers[data.roomId].trump ? 100 : el.suit != roomUsers[data.roomId].called.suit ? -100 : 0);
    const player = roomUsers[data.roomId].users.find(usr => usr.player == el.player);

    if (el.suit == roomUsers[data.roomId].trump) {

      // Store potential high
      if (!roomUsers[data.roomId].high || el.power > roomUsers[data.roomId].high.power) {
        console.log('High Stored: ', el);
        roomUsers[data.roomId].highWinner = player;
        roomUsers[data.roomId].high = el;
      }

      // Store potential low
      if (!roomUsers[data.roomId].low || el.power < roomUsers[data.roomId].low.power) {
        console.log('Low Stored: ', el);
        roomUsers[data.roomId].lowWinner = player;
        roomUsers[data.roomId].low = el;
      }

      // Determine if Jack is in lift
      if (el.value == 'J') {
        console.log('Jack Stored: ', el);
        jackOwnerPlayer = player;
        roomUsers[data.roomId].jack = el;
      }

      // Determine if hanger in lift
      if (el.power > 11 && el.power > highestHangerPower) {
        highestHangerPower = el.power;
        highestHangerPlayer = player;
      }

    }

    // Determine if card is winning the lift
    if (power > highestPowerInLift) {
      liftWinnerPlayer = player;
      highestPowerInLift = power;
    }

    // Tally lift points
    liftPoints = liftPoints + el.points;

  });

  if (!roomUsers[data.roomId].game) {
    roomUsers[data.roomId].game = [0, 0];
  }

  // Assign points for game
  if (liftWinnerPlayer.team == 1) {
    roomUsers[data.roomId].game[0] = roomUsers[data.roomId].game[0] + liftPoints;
  }
  else if (liftWinnerPlayer.team == 2) {
    roomUsers[data.roomId].game[1] = roomUsers[data.roomId].game[1] + liftPoints;
  }

  // Determine who won/hung Jack
  if (jackOwnerPlayer) {
    if (highestHangerPlayer && highestHangerPlayer.team != jackOwnerPlayer.team) { // Hang Jack
      io.to(data.roomId).emit('message', { message: highestHangerPlayer.nickname + ' hung jack!!!', shortcode: 'HANG' });
      roomUsers[data.roomId].jackWinner = highestHangerPlayer;
      roomUsers[data.roomId].hangJack = true;
    }
    else {
      roomUsers[data.roomId].jackWinner = jackOwnerPlayer;
    }
  }

  roomUsers[data.roomId].lift = undefined;
  roomUsers[data.roomId].called = undefined;
  roomUsers[data.roomId].turn = liftWinnerPlayer.player;

  // Set playable status of cards of player whose turn is next
  setCardsPlayability(data.roomId);

  io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);
  io.to(data.roomId).emit('lift', undefined);
  io.to(data.roomId).emit('game', roomUsers[data.roomId].game);
}

function resetRoundState(roomId: string) {
  roomUsers[roomId].highWinner = undefined;
  roomUsers[roomId].lowWinner = undefined;
  roomUsers[roomId].jackWinner = undefined;
  roomUsers[roomId].hangJack = undefined;
  roomUsers[roomId].game = undefined;
  roomUsers[roomId].high = undefined;
  roomUsers[roomId].low = undefined;
  roomUsers[roomId].jack = undefined;
}

function roundScoring(data: BasicRoomInput) {
  // Emit winners

  const roundWinners = {
    highWinner: roomUsers[data.roomId].highWinner,
    high: roomUsers[data.roomId].high,
    lowWinner: roomUsers[data.roomId].lowWinner,
    low: roomUsers[data.roomId].low,
    jackWinner: roomUsers[data.roomId].jackWinner,
    jack: roomUsers[data.roomId].jack,
    hangJack: roomUsers[data.roomId].hangJack,
    game: roomUsers[data.roomId].game
  };

  console.log('RW: ', {...roundWinners});

  io.to(data.roomId).emit('roundWinners', { ...roundWinners });

  let matchWinner: number;

  // Assign scores
  if (!roomUsers[data.roomId].teamScore) {
    roomUsers[data.roomId].teamScore = [0, 0];
  }

  // Assign points for high
  if (roomUsers[data.roomId].highWinner) {
    if (roomUsers[data.roomId].highWinner.team == 1){
      roomUsers[data.roomId].teamScore[0] = roomUsers[data.roomId].teamScore[0] + 1;
    }
    else if (roomUsers[data.roomId].highWinner.team == 2) {
      roomUsers[data.roomId].teamScore[1] = roomUsers[data.roomId].teamScore[1] + 1;
    }
  }
  matchWinner = determineMatchEnd(data.roomId);
  if (matchWinner) {
    announceWinner(data.roomId);
    return;
  }

  // Assign points for low
  if (roomUsers[data.roomId].lowWinner) {
    if (roomUsers[data.roomId].lowWinner.team == 1) {
      roomUsers[data.roomId].teamScore[0] = roomUsers[data.roomId].teamScore[0] + 1;
    }
    else if (roomUsers[data.roomId].lowWinner.team == 2) {
      roomUsers[data.roomId].teamScore[1] = roomUsers[data.roomId].teamScore[1] + 1;
    }
  }
  matchWinner = determineMatchEnd(data.roomId);
  if (matchWinner) {
    announceWinner(data.roomId);
    return;
  }

  // Assign points for jack
  if (roomUsers[data.roomId].jackWinner) {
    let jackPoints = 1;

    if (roomUsers[data.roomId].hangJack) {
      jackPoints = 3;
    }

    if (roomUsers[data.roomId].jackWinner.team == 1) {
      roomUsers[data.roomId].teamScore[0] = roomUsers[data.roomId].teamScore[0] + jackPoints;
    }
    else if (roomUsers[data.roomId].jackWinner.team == 2) {
      roomUsers[data.roomId].teamScore[1] = roomUsers[data.roomId].teamScore[1] + jackPoints;
    }
  }
  matchWinner = determineMatchEnd(data.roomId);
  if (matchWinner) {
    announceWinner(data.roomId);
    return;
  }

  // Assign points for game
  if (roomUsers[data.roomId].game) {
    if (roomUsers[data.roomId].game[0] > roomUsers[data.roomId].game[1]) {
      roomUsers[data.roomId].teamScore[0] = roomUsers[data.roomId].teamScore[0] + (roomUsers[data.roomId].gameIsTwo ? 2 : 1);
    }
    else {
      roomUsers[data.roomId].teamScore[1] = roomUsers[data.roomId].teamScore[1] + (roomUsers[data.roomId].gameIsTwo ? 2 : 1);
    }
  }
  matchWinner = determineMatchEnd(data.roomId);
  if (matchWinner) {
    announceWinner(data.roomId);
    return;
  }

  // Emit team scores
  io.to(data.roomId).emit('teamScore', roomUsers[data.roomId].teamScore);

  // Set next dealer and turn
  roomUsers[data.roomId].dealer = roomUsers[data.roomId].dealer == 4 ? 1 : roomUsers[data.roomId].dealer + 1;
  roomUsers[data.roomId].turn = roomUsers[data.roomId].dealer == 4 ? 1 : roomUsers[data.roomId].dealer + 1;

  roomUsers[data.roomId].roundStarted = false;

  // Init new round
  initialiseGameCards(data);
}

function determineMatchEnd(roomId: string) {
  if (roomUsers[roomId].teamScore[0] >= 14) {
    roomUsers[roomId].matchWinner = 1;
    return 1;
  }
  else if (roomUsers[roomId].teamScore[1] >= 14) {
    roomUsers[roomId].matchWinner = 2;
    return 2;
  }

  return undefined;
}

function announceWinner(roomId: string, winByKick?: boolean) {

  const winnerNames: string[] = [];
  const gameWinners: string[] = [];

  if (roomUsers[roomId].game) {
    // Loop through users in room and get winner names and reset teams
    roomUsers[roomId].users.forEach((el, i) => {
      if (el.team == roomUsers[roomId].matchWinner) {
        winnerNames.push(el.nickname);
      }
      if (roomUsers[roomId].game[0] > roomUsers[roomId].game[1]) {
        if (el.team == 1) {
          gameWinners.push(el.nickname);
        }
      }
      else if (roomUsers[roomId].game[1] > roomUsers[roomId].game[0]) {
        if (el.team == 2) {
          gameWinners.push(el.nickname);
        }
      }
      el.team = undefined;
    });
  }

  if (winByKick) {
    // If won by kicking, get dealer's team and get the names of players on that team
    const dealerTeam = roomUsers[roomId].users.find((el) => el.player == roomUsers[roomId].dealer).team;

    roomUsers[roomId].users.forEach((el, i) => {
      if (el.team == dealerTeam) {
        winnerNames.push(el.nickname);
      }
    });
  }

  io.to(roomId).emit('gameStarted', false);

  io.to(roomId).emit('matchWinner', {
    matchWinners: winnerNames,
    winByKick: winByKick,
    gameWinners: gameWinners
  });
}


nextApp.prepare()
  .then(() => {

    app.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    // eslint-disable-next-line no-undef
    process.exit(1);
  });
