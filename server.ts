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
import { delay } from './core/services/delay';
import { CardAbilities, getAbilityData, handleAbility, hangSaverPointsEarned } from './core/services/abilities';
import { ChatInput } from './models/ChatInput';
import { ChatMessage } from './models/ChatMessage';
import { getCardName } from './core/services/parseCard';
import { determineIfCardsPlayable, emitPlayerCardData, initialiseDeck, orderCards, scoreLift, sendSystemMessage, shuffleDeck } from './core/services/sharedGameFunctions';
import { TargetPlayerInput } from './models/TargetPlayerInput';
import { SwapAllyCardInput } from './models/SwapAllyCardInput';
import { TargetLiftInput } from './models/TargetLiftInput';
import { KickPlayerInput } from './models/KickPlayerInput';
import { SetGameIsTwoInput } from './models/SetGameIsTwoInput';

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
  socket.on('kickPlayer', (data) => kickPlayer(data));
  socket.on('setGameIsTwo', async (data) => setGameIsTwo(data));
  socket.on('setTeams', (data) => setTeams(data));
  socket.on('initialiseGame', (data) => initialiseGame(data));
  socket.on('playerCards', (data) => playerCards(data, socket));
  socket.on('begResponse', (data) => begResponse(data, socket));
  socket.on('redeal', (data) => initialiseGameCards(data));
  socket.on('playCard', async (data) => await playCard(data, socket));
  socket.on('chat', (data) => handleChatMessage(data));
  socket.on('targetPowerless', async (data) => await handleTargetPowerless(data, socket));
  socket.on('oppReplay', async (data) => await handleOppReplay(data, socket));
  socket.on('swapOppCard', async (data) => await handleSwapOppCard(data, socket));
  socket.on('swapAllyCard', async (data) => await handleSwapAllyCard(data, socket));
  socket.on('chooseStarter', async (data) => await handleChooseStarter(data, socket));
  socket.on('swapHands', async (data) => await handleSwapHands(data, socket));
});

function generateRoomId() {
  let randomNumber: string;
  do {
    randomNumber = (Math.floor(Math.random() * 90000) + 10000).toString();
  } while (io.of('/').adapter.rooms.get(randomNumber)); // Regenerate if ID is not unique

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
      id: data.localId,
      socketId: gameSocket.id
    });
  }
  else {
    roomUsers[thisRoomId] = {
      users: []
    };

    roomUsers[thisRoomId].users.push({
      nickname: data.nickname,
      id: data.localId,
      socketId: gameSocket.id
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

    // If player is already connected
    if (roomUsers[data.roomId] && roomUsers[data.roomId].users && roomUsers[data.roomId].users.find(el => el.id == gameSocket.id)) {
      return;
    }

    // Find if user is already in room using id from local storage
    const userIndex = roomUsers[data.roomId].users.findIndex(el => el.id == data.localId);

    // If room is not full or if user is already in room
    if (roomUsers[data.roomId].users.length < 4 || userIndex >= 0) {

      // Join the room
      gameSocket.join(data.roomId);

      if (roomUsers[data.roomId] && roomUsers[data.roomId].users) {

        // If user is not in room, add them to room
        if (userIndex < 0) {
          roomUsers[data.roomId].users.push({
            nickname: data.nickname,
            id: data.localId,
            socketId: gameSocket.id
          });

          const message = data.nickname + ' has joined the room!';

          sendSystemMessage({ io, message, roomId: data.roomId, colour: '#22c55e' });
        }
        else { // Otherwise update their data in the room
          roomUsers[data.roomId].users[userIndex].id = data.localId;
          roomUsers[data.roomId].users[userIndex].socketId = gameSocket.id;

          if (roomUsers[data.roomId].users[userIndex].disconnected) {

            roomUsers[data.roomId].users[userIndex].disconnected = false;
            const message = data.nickname + ' has rejoined the room!';
            sendSystemMessage({ io, message, roomId: data.roomId, colour: '#22c55e' });

          }


          const oldNickname = roomUsers[data.roomId].users[userIndex].nickname;

          if (data.nickname && data.nickname != oldNickname) {
            const message = oldNickname + ' has changed their name to ' + data.nickname;

            sendSystemMessage({ io, message, roomId: data.roomId, colour: '#22c55e' });

            roomUsers[data.roomId].users[userIndex].nickname = data.nickname;
          }


          // Update teammateSocketId variables
          const team = roomUsers[data.roomId].users[userIndex].team;

          const teammate = roomUsers[data.roomId].users.find(el => el.team && el.team == team && el.id != data.localId);

          if (teammate) {
            roomUsers[data.roomId].users[userIndex].teammateSocketId = teammate.socketId;
            teammate.teammateSocketId = gameSocket.id;
          }

        }
      }
      else {
        roomUsers[data.roomId] = {
          users: []
        };

        // If user is not in room, add them to room
        if (userIndex < 0) {
          roomUsers[data.roomId].users.push({
            nickname: data.nickname,
            id: data.localId,
            socketId: gameSocket.id
          });
        }
        else { // Otherwise update their data in the room
          roomUsers[data.roomId].users[userIndex].id = data.localId;
          roomUsers[data.roomId].users[userIndex].socketId = gameSocket.id;
        }
      }

      emitInitGameData(data, gameSocket);
    }
    else {
      gameSocket.emit('playerJoinedRoom', { success: false, errorMsg: 'Sorry, this room is full!' });
    }

  } else {
    // Otherwise, send an error message back to the player.
    gameSocket.emit('playerJoinedRoom', { success: false, errorMsg: 'Sorry, this room does not exist!' });
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

function emitInitGameData(data: BasicRoomInput, gameSocket: Socket) {
  io.to(gameSocket.id).emit('playerJoinedRoom', { success: true, room_id: data.roomId });

  playersInRoom(data);

  playerCards(data, gameSocket);
  teammateCards(data, gameSocket);

  io.to(gameSocket.id).emit('dealer', roomUsers[data.roomId].dealer);
  io.to(gameSocket.id).emit('turn', roomUsers[data.roomId].turn);
  io.to(gameSocket.id).emit('beg', roomUsers[data.roomId].beg);
  io.to(gameSocket.id).emit('kickedCards', roomUsers[data.roomId].kicked);
  io.to(gameSocket.id).emit('teamScore', roomUsers[data.roomId].teamScore);
  io.to(gameSocket.id).emit('lift', roomUsers[data.roomId].lift);
  io.to(gameSocket.id).emit('activeAbilities', roomUsers[data.roomId].activeAbilities);
  io.to(gameSocket.id).emit('playerStatus', roomUsers[data.roomId].playerStatus);
  io.to(gameSocket.id).emit('twosPlayed', roomUsers[data.roomId].twosPlayed);
  io.to(gameSocket.id).emit('revealedBare', roomUsers[data.roomId].revealedBare);
  io.to(gameSocket.id).emit('doubleLiftCards', roomUsers[data.roomId].doubleLiftCards);
  io.to(gameSocket.id).emit('gameStarted', roomUsers[data.roomId].gameStarted);
  io.to(gameSocket.id).emit('gameIsTwo', roomUsers[data.roomId].gameIsTwo);

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
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

function leaveRoom(data: BasicRoomInput, gameSocket: Socket) {
  // If the room exists...
  if (io.of('/').adapter.rooms.get(data.roomId)) {
    gameSocket.leave(data.roomId);

    const index = roomUsers[data.roomId]?.users.findIndex((el) => el.socketId == gameSocket.id);

    if (index >= 0) {
      const message = roomUsers[data.roomId]?.users[index].nickname + ' has left the room!';

      sendSystemMessage({ io, message, roomId: data.roomId, colour: '#991b1b' });

      // If game has started
      if (roomUsers[data.roomId]?.kicked) {
        roomUsers[data.roomId].users[index].disconnected = true;
        playersInRoom(data);
      }
      else {
        roomUsers[data.roomId].users.splice(index, 1);
        io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);
      }
    }

    gameSocket.emit('playerLeftRoom', true);
  }
}

function kickPlayer(data: KickPlayerInput) {
  // If the room exists...
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    io.in(data.kickedPlayerSocketId).socketsLeave(data.roomId);

    const index = roomUsers[data.roomId]?.users.findIndex((el) => el.socketId == data.kickedPlayerSocketId);

    if (index >= 0) {
      roomUsers[data.roomId].users.splice(index, 1);
    }

    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);
    io.to(data.kickedPlayerSocketId).emit('playerKicked', true);

    const message = data.kickedPlayerNickname + ' has been kicked!';
    sendSystemMessage({ io, message, roomId: data.roomId, colour: '#991b1b' });
  }
}

function setGameIsTwo(data: SetGameIsTwoInput) {
  // If the room exists...
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    roomUsers[data.roomId].gameIsTwo = data.gameIsTwo;

    io.to(data.roomId).emit('gameIsTwo', roomUsers[data.roomId].gameIsTwo);

  }
}

function setTeams(data: ChoosePartnerInput) {
  // If the room exists...
  if (io.of('/').adapter.rooms.get(data.roomId) && io.of('/').adapter.rooms.get(data.roomId).size == 4 && roomUsers[data.roomId]) {

    let isTeam2MemberSetAlready = false;

    const socketIds = [];

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el, i) => {

      // Set host to team 1 and as player 1
      if (el.id == data.localId) {
        roomUsers[data.roomId].users[i].team = 1;
        roomUsers[data.roomId].users[i].player = 1;
        socketIds[1] = el.socketId;
      }
      else if (el.id == data.partnerId) { // Set host's chosen partner to team 1 and as player 3
        roomUsers[data.roomId].users[i].team = 1;
        roomUsers[data.roomId].users[i].player = 3;
        socketIds[3] = el.socketId;
      }
      else { // Set other users to team 2
        roomUsers[data.roomId].users[i].team = 2;

        if (!isTeam2MemberSetAlready) { // If a player has not been added to team 2 as yet, assign them as player 2
          roomUsers[data.roomId].users[i].player = 2;
          socketIds[2] = el.socketId;
          isTeam2MemberSetAlready = true;
        }
        else { // Else assign them as player 4
          roomUsers[data.roomId].users[i].player = 4;
          socketIds[4] = el.socketId;
        }
      }
    });


    // Second loop to set teammate socket id
    roomUsers[data.roomId].users.forEach((el, i) => {
      if (el.player == 1) {
        roomUsers[data.roomId].users[i].teammateSocketId = socketIds[3];
      }
      else if (el.player == 2) {
        roomUsers[data.roomId].users[i].teammateSocketId = socketIds[4];
      }
      else if (el.player == 3) {
        roomUsers[data.roomId].users[i].teammateSocketId = socketIds[1];
      }
      else if (el.player == 4) {
        roomUsers[data.roomId].users[i].teammateSocketId = socketIds[2];
      }
    });


    resetGameState(data.roomId);
    io.to(data.roomId).emit('roundWinners', undefined);
    io.to(data.roomId).emit('matchWinner', undefined);
    io.to(data.roomId).emit('playersInRoom', roomUsers[data.roomId].users);

    roomUsers[data.roomId].gameStarted = true;
    io.to(data.roomId).emit('gameStarted', true);
  }
  else {
    console.log(data.roomId + ': ' + 'setTeams: Error');
  }
}

function handleChatMessage(data: ChatInput) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    const sender: PlayerSocket = roomUsers[data.roomId].users.find(el => el.id == data.localId);

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el) => {

      const message: ChatMessage = {
        message: data.message,
        sender: sender?.nickname,
        messageColour: 'black',
        senderColour: '#3b82f6',
        mode: data.mode
      };

      // Set sender colour to blue if player is on same team as sender, otherwise set it to red
      if (el.team == sender.team) {
        message.senderColour = '#3b82f6';
      }
      else {
        message.senderColour = '#ef4444';
      }

      // Send message to all users if chat mode was all
      if (data.mode == 'all') {
        message.modeColour = '#dc2626';
        io.to(el.socketId).emit('chat', message);
      }
      // Send message to teammates if chat mode was team
      else if (data.mode == 'team' && el.team == sender.team) {
        message.modeColour = '#2563eb';
        io.to(el.socketId).emit('chat', message);
      }

    });

  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}


// Game Logic

function generateDeck(data: BasicRoomInput) {
  if (!roomUsers[data.roomId] || !io.of('/').adapter.rooms.get(data.roomId)) {
    console.log(data.roomId + ': ' + 'generateDeck: Error');
    return;
  }

  if (roomUsers[data.roomId].deck) {
    console.log(data.roomId + ': ' + 'Deck already generated');
    return;
  }

  const deck = initialiseDeck();

  shuffleDeck(deck);

  roomUsers[data.roomId].deck = deck;
}

/*
   Check to see what card that the dealer has kicked
 */
function checkKicked(kicked: DeckCard, roomId: string, dealer: PlayerSocket) {
  if (!roomUsers[roomId].teamScore) {
    roomUsers[roomId].teamScore = [0, 0];
  }

  const dealerTeam = dealer.team;
  const dealerName = dealer.nickname;

  let kickedPointsText: string;

  if (kicked.value == '6') {
    kickedPointsText = 'a six!!';
    if (dealerTeam == 1) {
      roomUsers[roomId].teamScore[0] += 2;
    }
    else {
      roomUsers[roomId].teamScore[1] += 2;
    }
  }
  if (kicked.value == 'J') {
    kickedPointsText = 'a Jack!!!';
    if (dealerTeam == 1) {
      roomUsers[roomId].teamScore[0] += 3;
    }
    else {
      roomUsers[roomId].teamScore[1] += 3;
    }
  }
  if (kicked.value == 'A') {
    kickedPointsText = 'an Ace!';
    if (dealerTeam == 1) {
      roomUsers[roomId].teamScore[0]++;
    }
    else {
      roomUsers[roomId].teamScore[1]++;
    }
  }

  if (kickedPointsText) {
    const message = dealerName + ' kicked ' + kickedPointsText;
    sendSystemMessage({ io, message, roomId, colour: '#22c55e'});

    io.to(roomId).emit('message', {
      message: message,
      shortcode: 'KICKED'
    });
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
    console.log(data.roomId + ': ' + 'kickCard: Error');
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

  const dealer = roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].dealer);

  const matchWon = checkKicked(kickVal, data.roomId, dealer);

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

  /*********FOR WHEN YOU WANT TO START A PLAYER WITH A SPECIFIC CARD*************/
  // if (!tempPlayer.cards) {
  //   tempPlayer.cards = [];
  // }

  // if (tempPlayer.player == 2) {
  //   const card = tempDeck.find(el => el.suit == 'h' && el.value == 'A');
  //   if (card){
  //     tempPlayer.cards.push(card);
  //   }

  // }
  // else if (tempPlayer.player == 1) {
  //   const card = tempDeck.find(el => el.suit == 's' && el.value == 'A');
  //   if (card) {
  //     tempPlayer.cards.push(card);
  //   }
  // }
  /**********************/

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
    console.log(data.roomId + ': ' + 'dealAll: Error');
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

function initialiseGameCards(data: BasicRoomInput) {

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
  orderCards(roomUsers[data.roomId].users);


  io.to(data.roomId).emit('dealer', roomUsers[data.roomId].dealer);
  io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);
  io.to(data.roomId).emit('beg', roomUsers[data.roomId].beg);

  // Loop through users in room
  roomUsers[data.roomId].users.forEach((el, i) => {

    // Determine which cards are playable for the player whose turn it is
    if (el.player == roomUsers[data.roomId].turn) {
      determineIfCardsPlayable(roomUsers[data.roomId], el);
    }

    // Send player card data to player who is begging and dealer
    if (el.player == roomUsers[data.roomId].turn || el.player == roomUsers[data.roomId].dealer) {
      io.to(el.socketId).emit('playerCards', roomUsers[data.roomId].users[i].cards);
    }
    else {
      io.to(el.socketId).emit('playerCards', undefined);
    }
  });
}

function initialiseGame(data: BasicRoomInput) {
  if (!roomUsers[data.roomId] || !io.of('/').adapter.rooms.get(data.roomId)) {
    console.log(data.roomId + ': ' + 'initialiseGame: Error');
    return;
  }

  if (roomUsers[data.roomId].deck) {
    console.log(data.roomId + ': ' + 'IG Deck already generated');
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


function playerCards(data: BasicRoomInput, gameSocket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el) => {
      // Send player card data to player if the round has started OR if round has not yet started but player is dealer or it is players turn (i.e. player hasnt beg or stood yet)
      if (el.id == data.localId && (roomUsers[data.roomId].roundStarted || ((roomUsers[data.roomId].turn == el.player || roomUsers[data.roomId].dealer == el.player)))) {
        gameSocket.emit('playerCards', el.cards);
        return;
      }
    });
  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

function teammateCards(data: BasicRoomInput, gameSocket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Loop through users in room
    roomUsers[data.roomId].users.forEach((el) => {
      // Send player card data to player if the round has started OR if round has not yet started but player is dealer or it is players turn (i.e. player hasnt beg or stood yet)
      if (el.id == data.localId && (roomUsers[data.roomId].roundStarted || (!(roomUsers[data.roomId].turn == el.player || roomUsers[data.roomId].dealer == el.player)))) {
        const teammateCards = roomUsers[data.roomId].users.find(user => user.socketId == el.teammateSocketId).cards;
        gameSocket.emit('teammateCards', teammateCards);
        return;
      }
    });
  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}


function runPack(data: BasicRoomInput) {
  if (!roomUsers[data.roomId] || !roomUsers[data.roomId].kicked) {
    console.log(data.roomId + ': ' + 'Missing data');
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
  orderCards(roomUsers[data.roomId].users);

  // Loop through users in room
  roomUsers[data.roomId].users.forEach((el, i) => {

    // Determine which cards are playable for the player whose turn it is
    if (el.player == roomUsers[data.roomId].turn) {
      determineIfCardsPlayable(roomUsers[data.roomId], el);
    }

    // Send player card data to player who is begging and dealer
    if (el.player == roomUsers[data.roomId].turn || el.player == roomUsers[data.roomId].dealer) {
      io.to(el.socketId).emit('playerCards', roomUsers[data.roomId].users[i].cards);
    }
    else {
      io.to(el.socketId).emit('playerCards', undefined);
    }
  });

  emitPlayerCardData(io, roomUsers[data.roomId]);

}

function begResponse(data: BegResponseInput, gameSocket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Reset round states
    resetRoundState(data.roomId);

    const begger = roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].turn);
    const dealer = roomUsers[data.roomId].users.find(el => el.player == roomUsers[data.roomId].dealer);

    if (data.response == 'begged') {
      roomUsers[data.roomId].beg = 'begged';
      io.to(data.roomId).emit('message', {
        message: begger.nickname + ' has begged!',
        shortcode: 'BEGGED'
      });
      sendSystemMessage({io, message: begger.nickname + ' has begged!', roomId: data.roomId, colour: '#06b6d4'});
    }
    else if (data.response == 'stand') {
      roomUsers[data.roomId].beg = 'stand';
      sendSystemMessage({io, message: begger.nickname + ' has stood!', roomId: data.roomId, colour: '#06b6d4'});
    }
    else if (data.response == 'give') {
      roomUsers[data.roomId].beg = 'give';

      const beggerTeam = begger.team;

      const dealerForceStandCard = dealer.cards.find(el => el.ability == CardAbilities.forceStand);

      if (dealerForceStandCard) {
        io.to(data.roomId).emit('message', {
          message: dealer.nickname + ' forced ' + begger.nickname + ' to stand without giving a point!',
          shortcode: 'GIVE'
        });

        sendSystemMessage({io, message: dealer.nickname + ' forced ' + begger.nickname + ' to stand without giving a point!', roomId: data.roomId, colour: '#06b6d4'});
      }
      else {
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
          message: dealer.nickname + ' gave a point!',
          shortcode: 'GIVE'
        });

        sendSystemMessage({io, message: dealer.nickname + ' gave a point!', roomId: data.roomId, colour: '#06b6d4'});
      }
    }
    else if (data.response == 'run') {
      roomUsers[data.roomId].beg = 'run';
      runPack(data);
      playerCards(data, gameSocket);
      teammateCards(data, gameSocket);
      sendSystemMessage({io, message: dealer.nickname + ' ran the pack!', roomId: data.roomId, colour: '#06b6d4'});
    }

    io.to(data.roomId).emit('beg', roomUsers[data.roomId].beg);
    io.to(data.roomId).emit('roundWinners', undefined);
  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

function resetCardsPlayability(player: PlayerSocket) {
  player.cards.forEach((card) => {
    card.playable = false;
  });
}

function setCardsPlayability(roomId: string) {
  // Set playable status of cards of player whose turn is next
  const turnPlayer = roomUsers[roomId].users.find(el => el.player == roomUsers[roomId].turn);
  determineIfCardsPlayable(roomUsers[roomId], turnPlayer);
  io.to(turnPlayer.socketId).emit('playerCards', turnPlayer.cards);
}

async function playCard(data: PlayCardInput, gameSocket: Socket) {
  if (!io.of('/').adapter.rooms.get(data.roomId)) {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }

  const player = roomUsers[data.roomId].users.find(el => el.id == data.localId);

  const playerCards = player.cards;

  // Find card data using data from roomUsers object to prevent user from sending false information
  const cardIndex = playerCards.findIndex(el => (el.suit == data?.card?.suit) && (el.value == data?.card?.value));

  if (cardIndex == -1) {
    return;
  }

  const cardData = playerCards[cardIndex];

  if (!cardData.playable) {
    return;
  }

  // Add card to lift
  if (!roomUsers[data.roomId].lift) {
    // Reset lift winner
    io.to(data.roomId).emit('liftWinner', undefined);

    roomUsers[data.roomId].lift = [{ ...cardData, player: player.player }];
  }
  else {
    roomUsers[data.roomId].lift.push({ ...cardData, player: player.player });
  }

  // If suit has not been called yet
  if (!roomUsers[data.roomId].called) {
    roomUsers[data.roomId].called = cardData;
  }

  sendSystemMessage({io, message: player.nickname + ' played ' + getCardName(cardData), roomId: data.roomId});

  // Remove card clicked from array
  playerCards.splice(cardIndex, 1);

  // Show player their cards if round has officially started (ie player stood and played a card)
  if (!roomUsers[data.roomId].roundStarted) {
    resetRoundState(data.roomId);
    roomUsers[data.roomId].roundStarted = true;
    emitPlayerCardData(io, roomUsers[data.roomId]);
  }

  // Trigger card ability if it has one
  handleAbility({ roomData: roomUsers[data.roomId], card: cardData, socket: gameSocket, io: io, id: data.localId, player: player, roomId: data.roomId });

  // Reset card playability of player who just played
  resetCardsPlayability(roomUsers[data.roomId].users.find(el => el.id == data.localId)); // Need to get data directly from roomUsers object because data might have changed in handleAbility

  // Set twosPlayed value if card played was a two and not the 2 of clubs
  if (cardData.value == '2' && cardData.suit != 'c') {
    if (!roomUsers[data.roomId].twosPlayed) {
      roomUsers[data.roomId].twosPlayed = [];
    }
    if (!roomUsers[data.roomId].twosPlayed.includes(cardData.suit as 'd' | 'h' | 's')) {
      roomUsers[data.roomId].twosPlayed.push(cardData.suit as 'd' | 'h' | 's');
    }
  }

  // Check if player was revealed to be bare
  if (roomUsers[data.roomId].called &&                                    // If a suit was called
    roomUsers[data.roomId].called.suit == roomUsers[data.roomId].trump && // If the suit called was trump
    cardData.suit != roomUsers[data.roomId].called.suit &&                // If the card played was not the suit that was called
    (!(cardData.ability == CardAbilities.alwaysPlayable && !roomUsers[data.roomId].activeAbilities.includes(CardAbilities.abilitiesDisabled)))
  ) { // If the card played's ability was not alwaysPlayable and abilities are not disabled

    // Set revealedBare value
    roomUsers[data.roomId].revealedBare[player.player] = true;

    // Emit revealedBare status to player
    io.to(player.socketId).emit('revealedBare', true);

  }


  // Emit data
  gameSocket.emit('playerCards', player.cards);
  io.to(player.teammateSocketId).emit('teammateCards', player.cards);
  io.to(data.roomId).emit('lift', roomUsers[data.roomId].lift);
  io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);
  io.to(data.roomId).emit('activeAbilities', roomUsers[data.roomId].activeAbilities);
  io.to(data.roomId).emit('playerStatus', roomUsers[data.roomId].playerStatus);
  io.to(data.roomId).emit('twosPlayed', roomUsers[data.roomId].twosPlayed);

  playersInRoom(data);

  if (roomUsers[data.roomId].lift.length >= 4) {
    await liftScoring(data);
  }
  else {

    // Increment player turn
    if (roomUsers[data.roomId].pendingTurn && roomUsers[data.roomId].pendingTurn.length > 0 && !roomUsers[data.roomId].tempPendingTurn) {
      // Check if there is a player's turn pending (caused by card ability which allows an opponent to take back and replay a card)
      roomUsers[data.roomId].turn = roomUsers[data.roomId].pendingTurn.shift();
    } else
    if (roomUsers[data.roomId].tempPendingTurn) {
      // Check if there is a player's turn pending (caused by card ability which allows an ally to take back and replay a card)
      if (!roomUsers[data.roomId].pendingTurn) {
        roomUsers[data.roomId].pendingTurn = [];
      }

      roomUsers[data.roomId].pendingTurn.push(roomUsers[data.roomId].tempPendingTurn);
      roomUsers[data.roomId].tempPendingTurn = undefined;
    }
    else if (roomUsers[data.roomId].turn >= 4) {
      roomUsers[data.roomId].turn = 1;
    }
    else {
      roomUsers[data.roomId].turn = roomUsers[data.roomId].turn + 1;
    }

    // Handle allyPlaysLast ability, ignore if lift has 3 cards ie player was playing last anyway
    if (roomUsers[data.roomId].allyPlaysLastPlayer == roomUsers[data.roomId].turn && roomUsers[data.roomId].lift?.length < 3) {
      if (!roomUsers[data.roomId].pendingTurn) {
        roomUsers[data.roomId].pendingTurn = [];
      }

      roomUsers[data.roomId].pendingTurn.push(roomUsers[data.roomId].turn);

      if (roomUsers[data.roomId].turn >= 4) {
        roomUsers[data.roomId].turn = 1;
      }
      else {
        roomUsers[data.roomId].turn = roomUsers[data.roomId].turn + 1;
      }

      roomUsers[data.roomId].allyPlaysLastPlayer = undefined;
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

async function liftScoring(data: BasicRoomInput) {

  const resp = scoreLift(roomUsers[data.roomId]);

  const liftWinnerPlayer = resp.liftWinnerPlayer;
  const highestHangerPlayer = resp.highestHangerPlayer;
  const jackOwnerPlayer = resp.jackOwnerPlayer;

  roomUsers[data.roomId].lift = undefined;
  roomUsers[data.roomId].called = undefined;
  roomUsers[data.roomId].allyPlaysLastPlayer = undefined;

  // Set starter as lift winner or the target of the chooseStarter ability if it was active
  roomUsers[data.roomId].turn = roomUsers[data.roomId].chooseStarterPlayer ?? liftWinnerPlayer.player;

  roomUsers[data.roomId].chooseStarterPlayer = undefined;

  // Remove abilities that only last for a lift
  const removedLiftAbilities = roomUsers[data.roomId].activeAbilities?.filter(el => getAbilityData(el).duration != 'lift');
  roomUsers[data.roomId].activeAbilities = removedLiftAbilities;

  // Remove player status that only last for a lift
  roomUsers[data.roomId].playerStatus?.forEach((stat) => {
    const removedPlayerStatuses = stat.status?.filter(el => getAbilityData(el).duration != 'lift');
    stat.status = removedPlayerStatuses;
  });

  // Reset pending turns
  roomUsers[data.roomId].tempPendingTurn = undefined;
  roomUsers[data.roomId].pendingTurn = [];


  // Set playable status of cards of player whose turn is next
  setCardsPlayability(data.roomId);


  if (highestHangerPlayer && jackOwnerPlayer && highestHangerPlayer.team != jackOwnerPlayer.team) { // Hang Jack
    sendSystemMessage({ io, message: highestHangerPlayer.nickname + ' hung jack!!!', roomId: data.roomId, colour: '#f97316', showToast: true });
  }
  else if (roomUsers[data.roomId].jackSaved && highestHangerPlayer) { // Save Jack
    sendSystemMessage({ io, message: highestHangerPlayer.nickname + ' saved jack from being hung!!!', roomId: data.roomId, colour: '#db2777', showToast: true });
  }

  io.to(data.roomId).emit('liftWinner', liftWinnerPlayer.player);

  sendSystemMessage({io, message: liftWinnerPlayer.nickname + ' won the lift!', roomId: data.roomId, colour: '#f97316'});

  // Wait 1.5 seconds before emitting to allow players to see last card played
  await delay(1500);
  io.to(data.roomId).emit('turn', roomUsers[data.roomId].turn);
  io.to(data.roomId).emit('lift', undefined);
  io.to(data.roomId).emit('game', roomUsers[data.roomId].game);
  io.to(data.roomId).emit('activeAbilities', roomUsers[data.roomId].activeAbilities);
  io.to(data.roomId).emit('playerStatus', roomUsers[data.roomId].playerStatus);
  io.to(data.roomId).emit('doubleLiftCards', roomUsers[data.roomId].doubleLiftCards);
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
  roomUsers[roomId].jackSaved = undefined;
  roomUsers[roomId].tempPendingTurn = undefined;
  roomUsers[roomId].pendingTurn = [];
  roomUsers[roomId].playerStatus = [];
  roomUsers[roomId].allyPlaysLastPlayer = undefined;
  roomUsers[roomId].chooseStarterPlayer = undefined;
  roomUsers[roomId].twosPlayed = [];
  roomUsers[roomId].twoWinGameWinnerTeam = undefined;
  roomUsers[roomId].activeAbilities = [];
  roomUsers[roomId].playerStatus = undefined;
  roomUsers[roomId].revealedBare = [false, false, false, false, false];
  roomUsers[roomId].doubleLiftCards = [];
  roomUsers[roomId].doubleLiftJack= undefined;

  io.to(roomId).emit('game', [0, 0]);
  io.to(roomId).emit('twosPlayed', undefined);
  io.to(roomId).emit('revealedBare', undefined);
  io.to(roomId).emit('doubleLiftCards', undefined);
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
    jackSaved: roomUsers[data.roomId].jackSaved,
    game: roomUsers[data.roomId].game,
    twoWinGameWinnerTeam: roomUsers[data.roomId].twoWinGameWinnerTeam,
  };

  io.to(data.roomId).emit('roundWinners', { ...roundWinners });


  let matchWinner: number;

  // Send chat log for high, low and jack winner
  sendSystemMessage({io, message: roundWinners.highWinner.nickname + ' won high!', roomId: data.roomId, colour: '#22c55e'});
  sendSystemMessage({io, message: roundWinners.lowWinner.nickname + ' won low!', roomId: data.roomId, colour: '#22c55e'});

  if (roundWinners.jackWinner) {
    const jackWinnerMsg = roundWinners.hangJack ? ' hung Jack!!!' : roundWinners.jackSaved ? ' saved Jack!!!' : ' won Jack!';
    sendSystemMessage({io, message: roundWinners.jackWinner.nickname + jackWinnerMsg, roomId: data.roomId, colour: '#22c55e'});
  }


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

    if (roomUsers[data.roomId].jackSaved) {
      jackPoints = hangSaverPointsEarned;
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

  let gameWinnerTeam;

  // Assign points for game
  if (roomUsers[data.roomId].game) {
    if (roomUsers[data.roomId].twoWinGameWinnerTeam) {  // If twoWinGame ability was been activated
      gameWinnerTeam = roomUsers[data.roomId].twoWinGameWinnerTeam;
    }
    if (roomUsers[data.roomId].game[0] > roomUsers[data.roomId].game[1]) {
      roomUsers[data.roomId].teamScore[0] = roomUsers[data.roomId].teamScore[0] + (roomUsers[data.roomId].gameIsTwo ? 2 : 1);
      gameWinnerTeam = 1;
    }
    else {
      roomUsers[data.roomId].teamScore[1] = roomUsers[data.roomId].teamScore[1] + (roomUsers[data.roomId].gameIsTwo ? 2 : 1);
      gameWinnerTeam = 2;
    }
  }

  // Send chat log for game winner
  roomUsers[data.roomId].users.forEach((el, i) => {
    if (el.team == gameWinnerTeam) {
      sendSystemMessage({io, message: 'Your team won game!', roomId: el.socketId, colour: '#22c55e'});
    }
    else {
      sendSystemMessage({io, message: 'The opposing team won game!', roomId: el.socketId, colour: '#22c55e'});
    }
  });

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
      if (roomUsers[roomId].twoWinGameWinnerTeam) {
        if (el.team == roomUsers[roomId].twoWinGameWinnerTeam) {
          gameWinners.push(el.nickname);
        }
      }
      else if (roomUsers[roomId].game[0] > roomUsers[roomId].game[1]) {
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
  roomUsers[roomId].gameStarted = false;

  io.to(roomId).emit('matchWinner', {
    matchWinners: winnerNames,
    winByKick: winByKick,
    gameWinners: gameWinners,
  });
}

async function handleTargetPowerless(data: TargetLiftInput, socket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Not player's turn yet
    if (roomUsers[data.roomId].turn != data.player) {
      return;
    }

    const liftCardData = roomUsers[data.roomId].lift.find(el => (el?.suit == data?.card?.suit) && (el?.value == data?.card?.value));

    liftCardData.power = 0;
    liftCardData.points = 0;

    if (liftCardData.abilityPoints) {
      liftCardData.abilityPoints = 0;
    }

    sendSystemMessage({
      io,
      message: 'The ' + getCardName(liftCardData) + ' has been made powerless!',
      roomId: data.roomId,
      colour: '#db2777'
    });

    await playCard({ ...data, card: data.playedCard }, socket);

  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

async function handleOppReplay(data: TargetLiftInput, socket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Not player's turn yet
    if (roomUsers[data.roomId].turn != data.player) {
      return;
    }

    const liftCardIndex = roomUsers[data.roomId].lift.findIndex(el => (el?.suit == data?.card?.suit) && (el?.value == data?.card?.value));

    const liftCardPlayer = roomUsers[data.roomId].lift[liftCardIndex].player;

    if (!roomUsers[data.roomId].pendingTurn) {
      roomUsers[data.roomId].pendingTurn = [];
    }

    // Store the next players turn in pendingTurn variable
    if (roomUsers[data.roomId].turn >= 4) {
      roomUsers[data.roomId].tempPendingTurn = 1;
    }
    else {
      roomUsers[data.roomId].tempPendingTurn = roomUsers[data.roomId].turn + 1;
    }

    // Make it the turn of the player whose card was chosen
    roomUsers[data.roomId].turn = liftCardPlayer;

    const liftCard = roomUsers[data.roomId].lift[liftCardIndex];

    // Remove card from lift
    if (liftCardIndex > -1) {
      roomUsers[data.roomId].lift.splice(liftCardIndex, 1);
    }

    // Add card back to player's hand
    const liftCardPlayerObj = roomUsers[data.roomId].users.find(el => el.player == liftCardPlayer);

    const isPlayerHandEmpty = liftCardPlayerObj.cards.length ? false : true;

    liftCardPlayerObj.cards.push({ ...liftCard, disabled: isPlayerHandEmpty ? false : true });

    sendSystemMessage({
      io: io,
      message: liftCardPlayerObj.nickname + ' has to play another card!',
      roomId: data.roomId,
      colour: '#db2777'
    });

    await playCard({ ...data, card: data.playedCard }, socket);

    orderCards(roomUsers[data.roomId].users);

    emitPlayerCardData(io, roomUsers[data.roomId]);

    io.to(liftCardPlayerObj.socketId).emit('playerCards', liftCardPlayerObj.cards);

  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}


async function handleSwapOppCard(data: TargetPlayerInput, socket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Get random card from target
    const selectedPlayer = roomUsers[data.roomId].users.find((el) => el.player == data.target.player);

    const randomCardIndex = Math.floor(Math.random() * selectedPlayer.cards.length);

    const randomCard = selectedPlayer.cards[randomCardIndex];

    const player = roomUsers[data.roomId].users.find((el) => el.player == data.player);

    // Remove card from player's hand
    const selectedCardIndex = player.cards.findIndex(el => el.suit == data.card.suit && el.value == data.card.value);

    player.cards.splice(selectedCardIndex, 1);

    // Add card to player's hand
    player.cards.push({ ...randomCard });


    // Remove card from target's hand
    selectedPlayer.cards.splice(randomCardIndex, 1);

    // Add card to target's hand
    selectedPlayer.cards.push(data.card);

    // Send system messages
    sendSystemMessage({io, message: `You swapped your ${getCardName(data.card)} for ${selectedPlayer.nickname}'s ${getCardName(randomCard)}`, roomId: player.socketId, showToast: true, colour: '#db2777'});

    sendSystemMessage({io, message: `${player.nickname} swapped your ${getCardName(randomCard)} for their ${getCardName(data.card)}`, roomId: data.target.socketId, showToast: true, colour: '#db2777'});

    sendSystemMessage({
      io: io,
      message: `${player.nickname} has swapped their ${getCardName(data.card)} for ${selectedPlayer.nickname}'s ${getCardName(randomCard)}`,
      roomId: [selectedPlayer.teammateSocketId, player.teammateSocketId],
      colour: '#db2777'
    });

    // Finalize
    await playCard({ ...data, card: data.playedCard }, socket);

    orderCards(roomUsers[data.roomId].users);

    emitPlayerCardData(io, roomUsers[data.roomId]);
  }

  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

async function handleSwapAllyCard(data: SwapAllyCardInput, socket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {


    const player = roomUsers[data.roomId].users.find((el) => el.player == data.player);

    const teammatePlayer = roomUsers[data.roomId].users.find((el) => el.socketId == player.teammateSocketId);

    const oppPlayer = roomUsers[data.roomId].users.find((el) => el.socketId != player.teammateSocketId && el.socketId != player.socketId);

    // Remove card from player's hand
    const selectedCardIndex = player.cards.findIndex(el => el.suit == data.card.suit && el.value == data.card.value);
    player.cards.splice(selectedCardIndex, 1);

    // Add ally card to player's hand
    player.cards.push(data.allyCard);

    // Remove card from ally's hand
    const selectedAllyCardIndex = teammatePlayer.cards.findIndex(el => el.suit == data.allyCard.suit && el.value == data.allyCard.value);
    teammatePlayer.cards.splice(selectedAllyCardIndex, 1);

    // Add card to ally's hand
    teammatePlayer.cards.push(data.card);

    // Send system messages
    sendSystemMessage({ io, message: `You swapped your ${getCardName(data.card)} for ${teammatePlayer.nickname}'s ${getCardName(data.allyCard)}`, roomId: player.socketId, showToast: true, colour: '#db2777' });

    sendSystemMessage({ io, message: `${player.nickname} swapped your ${getCardName(data.allyCard)} for their ${getCardName(data.card)}`, roomId: teammatePlayer.socketId, showToast: true, colour: '#db2777' });

    sendSystemMessage({
      io: io,
      message: player.nickname + ' and ' + teammatePlayer.nickname + ' swapped a card!',
      roomId: [oppPlayer.socketId, oppPlayer.teammateSocketId],
      colour: '#db2777'
    });

    // Finalize
    await playCard({ ...data, card: data.playedCard }, socket);

    orderCards(roomUsers[data.roomId].users);

    emitPlayerCardData(io, roomUsers[data.roomId]);
  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

async function handleChooseStarter(data: TargetPlayerInput, socket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    // Push status to selected player
    const selectedPlayer = roomUsers[data.roomId].users.find((el) => el.player == data.target.player);

    const player = roomUsers[data.roomId].users.find((el) => el.player == data.player);

    if (!roomUsers[data.roomId].playerStatus) {
      roomUsers[data.roomId].playerStatus = [];
    }

    if (!roomUsers[data.roomId].playerStatus[selectedPlayer.player]) {
      roomUsers[data.roomId].playerStatus[selectedPlayer.player] = { player: { ...selectedPlayer, cards: null }, status: [] };
    }

    roomUsers[data.roomId].playerStatus[selectedPlayer.player].status.push(CardAbilities.chooseStarter);

    // Update chooseStarter room variable
    roomUsers[data.roomId].chooseStarterPlayer = selectedPlayer.player;

    // Send system messages
    sendSystemMessage({io, message: `${player.nickname} chose ${selectedPlayer.nickname} to play first next lift!`, roomId: data.roomId, colour: '#db2777'});

    // Emit status
    io.to(data.roomId).emit('playerStatus', roomUsers[data.roomId].playerStatus);

    // Finalize
    await playCard({ ...data, card: data.playedCard }, socket);

  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

async function handleSwapHands(data: TargetPlayerInput, socket: Socket) {
  if (io.of('/').adapter.rooms.get(data.roomId)) {

    const player = roomUsers[data.roomId].users.find((el) => el.player == data.player);

    const selectedPlayer = roomUsers[data.roomId].users.find((el) => el.player == data.target.player);

    // Remove played card from hand before swapping
    const playedCardIndex = player.cards.findIndex(el => el.suit == data.playedCard.suit && el.value == data.playedCard.value);
    const playerCards = [...player.cards];

    playerCards.splice(playedCardIndex, 1);

    // Check if player or target has any cards remaining to swap
    if (!playerCards.length || !selectedPlayer.cards.length) {
      return;
    }

    // Check if players have same amount of cards in hand
    if (playerCards.length == selectedPlayer.cards.length) {
      const tempSelectedPlayerCards = [...selectedPlayer.cards];

      player.cards = tempSelectedPlayerCards.concat([data.playedCard]);
      selectedPlayer.cards = playerCards;

      // Send system messages to selected player
      sendSystemMessage({ io, message: `You swapped your hand with ${player.nickname}'s hand!`, roomId: selectedPlayer.socketId, showToast: true, colour: '#db2777' });
    }
    else {
      // Get random card from selected player's hand to not swap
      const randomCardIndex = Math.floor(Math.random() * selectedPlayer.cards.length);

      const randomCard = selectedPlayer.cards[randomCardIndex];

      // Remove card from list of cards to be swapped
      const tempSelectedPlayerCards = [...selectedPlayer.cards];

      tempSelectedPlayerCards.splice(randomCardIndex, 1);

      player.cards = tempSelectedPlayerCards.concat([data.playedCard]);
      selectedPlayer.cards = playerCards.concat([randomCard]);

      // Send system messages to selected player
      sendSystemMessage({ io, message: `You and ${player.nickname} swapped hands and you kept your ${getCardName(randomCard)}!`, roomId: selectedPlayer.socketId, showToast: true, colour: '#db2777' });
    }

    // Send system messages to player
    sendSystemMessage({ io, message: `You and ${selectedPlayer.nickname} swapped hands!`, roomId: player.socketId, showToast: true, colour: '#db2777' });

    // Send system messages to other players
    roomUsers[data.roomId].users.forEach(el => {
      if (!(el.id == player.id || el.id == selectedPlayer.id)) {
        sendSystemMessage({ io, message: `${player.nickname} and ${selectedPlayer.nickname} swapped hands!`, roomId: el.socketId, colour: '#db2777' });
      }
    });

    // Finalize
    await playCard({ ...data, card: data.playedCard }, socket);

    orderCards(roomUsers[data.roomId].users);

    emitPlayerCardData(io, roomUsers[data.roomId]);
  }
  else {
    console.log(data.roomId + ': ' + 'Room doesnt exist');
  }
}

nextApp.prepare()
  .then(() => {

    app.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port} on ${process.env.NODE_ENV}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    // eslint-disable-next-line no-undef
    process.exit(1);
  });
