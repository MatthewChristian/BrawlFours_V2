import { Server } from 'socket.io';
import { PlayerSocket } from '../../models/PlayerSocket';
import { DeckCard } from '../../models/DeckCard';
import { RoomSocket } from '../../models/RoomSocket';
import { CardAbilities, getIsRandom, mapAbility, pointsForSavedPointsEarned } from './abilities';
import { ScoreLiftOutput } from '../../models/ScoreLiftOutput';
import { ChatMessage } from '../../models/ChatMessage';
import { SendSystemMessageInput } from '../../models/SendSystemMessageInput';
import { PlayerStatus } from '../../models/PlayerStatus';
import { LiftCard } from '../../models/LiftCard';

export function emitPlayerCardData(io: Server, roomData: RoomSocket) {
  // Loop through users in room

  roomData.users.forEach((el) => {
    // Send player card data to each player and their teammate
    io.to(el.socketId).emit('playerCards', el.cards);
    io.to(el.teammateSocketId).emit('teammateCards', el.cards);
  });
}

export function sendSystemMessage(args: SendSystemMessageInput) {
  const messageObj: ChatMessage = {
    message: args.message,
    messageColour: args.colour ?? '#f59e0b',
    mode: 'log',
    showToast: args.showToast
  };

  // If pass in a player's socket id instead of room ID, it will only emit message to that player
  args.io.to(args.roomId).emit('chat', messageObj);
}

export function orderCards(users: PlayerSocket[]) {
  const order: string[] = ['s', 'h', 'c', 'd'];

  users.forEach(el => {
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

export function shuffleDeck(deck: DeckCard[]) {
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


export function initialiseDeck() {
  const suits = ['s', 'd', 'c', 'h']; // s=Spades, d=Dimes, c=Clubs, h=Hearts
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K', 'A'];
  const power = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const points = [0, 0, 0, 0, 0, 0, 0, 0, 10, 1, 2, 3, 4];
  const deck: DeckCard[] = [];
  let card: DeckCard;
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {

      const ability = mapAbility(values[j], suits[i]);

      card = {
        suit: suits[i],
        value: values[j],
        power: power[j],
        points: points[j],
        abilityPoints: ability == CardAbilities.twentyPoints ? 20
          : ability == CardAbilities.ninePoints ? 9
            : undefined,
        playable: false,
        ability: ability,
        isRandom: getIsRandom(values[j], suits[i]),
        trump: false
      };
      deck.push(card);
    }
  }

  return deck;
}

/*
    Determine whether or not a player tried to undertrump
  */
function didUndertrump(roomData: RoomSocket, card: DeckCard) {
  if (!roomData.lift || !roomData.trump || !card?.trump) {
    return false;
  }

  let undertrumped = false;

  roomData.lift.forEach(el => {
    if ((el.trump) && (el.power > card.power)) {
      undertrumped = true;
    }
  });

  return undertrumped;
}

export function isCardRoyal(card: DeckCard) {
  if (card.value?.toUpperCase() == 'J'
    || card.value?.toUpperCase() == 'Q'
    || card.value?.toUpperCase() == 'K'
    || card.value?.toUpperCase() == 'A'
  ) {
    return true;
  }

  return false;
}

export function determineIfCardsPlayable(roomData: RoomSocket, player: PlayerSocket) {
  let bare = true;
  let flush = true;
  let flushRoyalsCalled = true;
  let flushRoyals = true;
  let nextCardTrumpActive = false;
  let status: PlayerStatus;

  // Check if player has nextCardTrump status
  if (roomData?.playerStatus && player) {
    status = roomData.playerStatus[player.player];

    if (status?.status?.includes(CardAbilities.nextCardTrump)) {
      nextCardTrumpActive = true;
    }
  }

  player.cards.forEach((el) => {

    // Determine which cards are trump
    // If nextCardTrump ability is active for player
    if (nextCardTrumpActive) {
      el.trump = true;

      // Remove player status
      const removedPlayerStatuses = status?.status.filter(el => el != CardAbilities.nextCardTrump);
      status.status = removedPlayerStatuses;
    }
    // If suit of card played is trump
    else if (el.suit == roomData.trump) {
      el.trump = true;
    }
    // If ability is revealedBare and the player has already been revealed to be bare and abilities are not disabled
    else if (el.ability == CardAbilities.revealedBare && roomData.revealedBare[player.player] && !roomData.activeAbilities.includes(CardAbilities.abilitiesDisabled)) {
      el.trump = true;
    }
    else { // Need to put else statement in case pack was run
      el.trump = false;
    }

    if (!el.disabled) {
      // Determine if a player does not have a card in the suit of the card that was called
      if (roomData.called && (el.suit == roomData.called.suit)) {
        bare = false;
      }

      // Determine if player is flush (only has trump in hand)
      if (!el.trump) {
        flush = false;
      }

      // Determine if a player only has royals in the suit that called
      if (!isCardRoyal(el)) {
        flushRoyals = false;

        if (roomData.called && (el.suit == roomData.called.suit)) {
          flushRoyalsCalled = false;
        }
      }
    }
  });

  player.cards.forEach((card) => {
    const undertrumped = didUndertrump(roomData, card);

    // If it is not player's turn
    if (roomData?.turn != player.player) {
      card.playable = false;
    }
    // If card was removed from lift because of oppReplay
    else if (card.disabled) {
      card.playable = false;
      card.disabled = false;
    }
    // If the card has an ability that allows them to be played (and abilities are not disabled)
    else if (card.ability == CardAbilities.alwaysPlayable && !roomData.activeAbilities?.includes(CardAbilities.abilitiesDisabled)) {
      card.playable = true;
    }
    // If card is trump but trump is disabled for that round and the player is not flush and trump was not called
    else if (roomData.activeAbilities?.includes(CardAbilities.trumpDisabled) && card.trump && !flush && roomData.called && card.suit != roomData.called.suit) {
      card.playable = false;
    }
    // If card is a royal but royals are disabled for that round and the player is not flush in the suit that was called
    else if (
      roomData.activeAbilities?.includes(CardAbilities.royalsDisabled)
      && isCardRoyal(card)
      && (
        !flushRoyalsCalled
        || (flushRoyalsCalled && !flushRoyals && card.trump && card.suit != roomData.called.suit)
        || (!flushRoyals && bare)
      )
    ) {
      card.playable = false;
    }
    // If the player:
    // * Played a suit that wasn't called,
    // * Wasn't the first player to play for the round,
    // * Has cards in their hand that correspond to the called suit, and
    // * the card played is not trump,
    // then end function and do not add card to lift
    else if (roomData.called && card.suit != roomData.called.suit && !bare && !card.trump) {
      card.playable = false;
    }
    // If the player attempted to undertrump, end function and do not add card to lift
    else if (roomData.called && (card.trump && undertrumped == true) && !roomData.called.trump && !bare) {
      card.playable = false;
    }
    else {
      card.playable = true;
    }

  });
}

export function oppositePowerMap(power: number) {
  const powerArr = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  const index = powerArr.findIndex(el => el == power);

  const reversePowerArr = [...powerArr].reverse();

  if (index > -1) {
    return reversePowerArr[index];
  }
  else {
    return 0;
  }
}

function handleOppositePower(roomData: RoomSocket, power: number) {
  if (roomData.activeAbilities.includes(CardAbilities.oppositePower)) {
    return oppositePowerMap(power);
  }
  else {
    return power;
  }
}


export function scoreLift(roomData: RoomSocket): ScoreLiftOutput {

  let highestHangerPower = 0;
  let highestHangerPlayer: PlayerSocket;
  let jackOwnerPlayer: PlayerSocket;
  let liftWinnerPlayer: PlayerSocket;
  let doubleLiftJackPlayer: PlayerSocket;
  let jackSaved = false;

  const teamsWithGreaterPowerThanJack = [false, false, false];
  const teamsWhoCouldveWonLift = [false, false, false]; // Which teams coudve won the lift at some point, used for pointsForSaved and doubleLift interaction

  let highestPowerInLift = 0;
  let liftPoints = 0;
  const jackPower = roomData.activeAbilities.includes(CardAbilities.oppositePower) ? 105 : 111;
  let lift: LiftCard[] = [...roomData.lift];

  const abilitiesDisabled = roomData.activeAbilities.includes(CardAbilities.abilitiesDisabled);

  // If doubleLift ability is active and everybody's hand is not empty, then don't score lift and instead store the lift cards in variable
  if (roomData.activeAbilities.includes(CardAbilities.doubleLift) && roomData.users[0].cards.length > 0 && (!abilitiesDisabled)) {
    const formattedLift: LiftCard[] = [];

    roomData.lift.forEach((el) => {
      const power = handleOppositePower(roomData, el.power) + (el.trump ? 100 : el.suit != roomData.called.suit ? -100 : 0);
      const player = roomData.users.find(usr => usr.player == el.player);

      if (el.trump && el.value == 'J') {
        roomData.doubleLiftJack = el;
      }

      // Determine if card is winning the lift
      if (power > highestPowerInLift) {
        liftWinnerPlayer = player;
        highestPowerInLift = power;
      }

      // Set card power to 0 and trump to false
      formattedLift.push({ ...el, power: 0, trump: false });
    });

    if (!roomData.doubleLiftCards) {
      roomData.doubleLiftCards = [];
    }

    roomData.doubleLiftCards = roomData.doubleLiftCards.concat(formattedLift);

    return({
      liftWinnerPlayer: liftWinnerPlayer,
      highestHangerPlayer: undefined,
      jackOwnerPlayer: undefined,
    });
  }

  // If doubleLiftCards variable is not empty, then add the cards to the lift when calculating points
  if (roomData.doubleLiftCards && roomData.doubleLiftCards.length > 0) {
    lift = lift.concat(roomData.doubleLiftCards);
    roomData.doubleLiftCards = undefined;
  }

  // Loop through lift
  lift.forEach(el => {
    // Add 100 points to power if card was trump, minus 100 points from power if card was not suit that was called
    // Call function to check if oppositePower ability is in effect
    const power = handleOppositePower(roomData, el.power) + (el.trump ? 100 : el.suit != roomData.called.suit ? -100 : 0);
    const player = roomData.users.find(usr => usr.player == el.player);

    if (el.trump) {

      // Store potential high
      if (!roomData.high || el.power > roomData.high.power) {
        roomData.highWinner = player;
        roomData.high = el;
      }

      // Store potential low
      if (!roomData.low || el.power < roomData.low.power) {
        roomData.lowWinner = player;
        roomData.low = el;
      }

      // Determine if Jack is in lift
      if (el.value == 'J') {
        jackOwnerPlayer = player;
        roomData.jack = el;
      }

    }

    // Determine if hanger in lift
    if (power > jackPower) {

      teamsWithGreaterPowerThanJack[player.team] = true;

      if (power > highestHangerPower) {
        highestHangerPower = power;
        highestHangerPlayer = player;
      }

    }

    // Determine if card is winning the lift
    if (power > highestPowerInLift) {
      liftWinnerPlayer = player;
      highestPowerInLift = power;
      teamsWhoCouldveWonLift[player.team] = true;
    }

    // Tally lift points
    liftPoints = liftPoints + (!abilitiesDisabled && el.abilityPoints ? el.abilityPoints : el.points);

  });

  if (!roomData.game) {
    roomData.game = [0, 0];
  }

  // Handle doublePoints ability is active
  if (roomData.activeAbilities.includes(CardAbilities.doublePoints)) {
    liftPoints = liftPoints * 2;
  }

  // Assign points for game
  if (!roomData.activeAbilities.includes(CardAbilities.noWinLift)) { // Check to see if teams are allowed to earn points for this lift
    if (liftWinnerPlayer.team == 1) {
      roomData.game[0] = roomData.game[0] + liftPoints;
    }
    else if (liftWinnerPlayer.team == 2) {
      roomData.game[1] = roomData.game[1] + liftPoints;
    }
  }

  if (roomData.doubleLiftJack) {
    doubleLiftJackPlayer = roomData.users.find(el => el.player == roomData.doubleLiftJack.player);
    jackOwnerPlayer = doubleLiftJackPlayer;
  }

  // Determine who won/hung Jack
  if (jackOwnerPlayer || roomData.doubleLiftJack) {
    if ((highestHangerPlayer && highestHangerPlayer.team != jackOwnerPlayer.team) || (doubleLiftJackPlayer && doubleLiftJackPlayer.team != liftWinnerPlayer.team)) { // Hang Jack

      const jackOwnerTeammate = roomData.users.find(el => el.team == jackOwnerPlayer.team && el.player != jackOwnerPlayer.player);

      // If jack was saved from hanging with ability
      if (
        roomData.playerStatus && roomData.playerStatus[jackOwnerTeammate.player]?.status?.includes(CardAbilities.hangSaver)
      ) {
        roomData.jackSaved = true;
        jackSaved = true;
        roomData.jackWinner = jackOwnerTeammate;
        highestHangerPlayer = jackOwnerTeammate;
      }
      else {
        roomData.jackWinner = roomData.doubleLiftJack ? liftWinnerPlayer : highestHangerPlayer;
        roomData.hangJack = true;

        pushPlayerStatus(roomData, jackOwnerPlayer, CardAbilities.jackHanged);

        if (roomData.doubleLiftJack) {
          highestHangerPlayer = liftWinnerPlayer;
        }
      }

    }
    else {

      const roundJack = roomData.doubleLiftJack ?? roomData.jack;

      // If jack was saved from hanging, grant 10 points for game if the card had the ability
      // If in this part of this if statement, it means that Jack was not hung
      // and if both values in the teamsWithGreaterPowerThanJack array are true, then it means that the opposing team played a card that could hang Jack
      if (
        (roundJack.ability == CardAbilities.pointsForSaved) &&
      (
        (teamsWithGreaterPowerThanJack[1] && teamsWithGreaterPowerThanJack[2]) ||
        (roomData.doubleLiftJack && teamsWhoCouldveWonLift[1] && teamsWhoCouldveWonLift[2]) // If jack of trump was in pending lift from doubleLift, check if opposing team couldve won the lift at some point and thus couldve hung jack but was stopped
      )) {
        if (jackOwnerPlayer.team == 1) {
          roomData.game[0] = roomData.game[0] + pointsForSavedPointsEarned;
        }
        else if (jackOwnerPlayer.team == 2) {
          roomData.game[1] = roomData.game[1] + pointsForSavedPointsEarned;
        }

      }

      roomData.jackWinner = jackOwnerPlayer;
    }
  }

  // Reset doubleLiftJack variable
  roomData.doubleLiftJack = undefined;

  return ({
    liftWinnerPlayer: liftWinnerPlayer,
    highestHangerPlayer: highestHangerPlayer,
    jackOwnerPlayer: jackOwnerPlayer,
    jackSaved: jackSaved
  });
}

export function pushPlayerStatus(roomData: RoomSocket, player: PlayerSocket, ability: CardAbilities) {
  if (!roomData.playerStatus) {
    roomData.playerStatus = [];
  }

  if (!roomData.playerStatus[player.player]) {
    roomData.playerStatus[player.player] = { player: { ...player, cards: null }, status: [] };
  }

  roomData.playerStatus[player.player].status.push(ability);
}