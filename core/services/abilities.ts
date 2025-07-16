import { AbilityData } from '../../models/AbilityData';
import { AbilityInput } from '../../models/AbilityInput';
import { DeckCard } from '../../models/DeckCard';
import { determineIfCardsPlayable, emitPlayerCardData, orderCards, pushPlayerStatus, sendSystemMessage, shuffleDeck } from './sharedGameFunctions';

export const hangSaverPointsEarned = 3;
export const pointsForSavedPointsEarned = 10;

export enum CardAbilities {
  // Spades
  alwaysPlayable,     // 2
  ninePowerful,       // 9
  trumpDisabled,      // 10
  targetPowerless,    // J
  noWinLift,          // Q
  shuffleHand,        // K
  oppReplay,          // A

  // Hearts
  royalsDisabled,     // 2
  hangSaver,          // 9
  twentyPoints,       // 10
  pointsForSaved,     // J
  abilitiesDisabled,  // Q
  swapOppCard,        // K
  allyReplay,         // A

  // Dimes
  forceStand,         // 2
  ninePoints,         // 9
  oppositePower,      // 10
  allyPlaysLast,      // J
  drawOne,            // Q
  doublePoints,       // K
  chooseStarter,      // A

  // Clubs
  twoWinGame,         // 2
  randomAbility,      // 9
  revealedBare,       // 10
  nextCardTrump,      // J
  swapAllyCard,       // Q
  doubleLift,         // K
  swapHands,          // A

  // Misc
  jackHanged
}

export function mapAbility(value: string, suit: string) {

  // Spades
  if (suit == 's') {
    if (value == '2') {
      return CardAbilities.alwaysPlayable;
    }
    else if (value == '9') {
      return CardAbilities.ninePowerful;
    }
    else if (value == 'X') {
      return CardAbilities.trumpDisabled;
    }
    else if (value == 'J') {
      return CardAbilities.targetPowerless;
    }
    else if (value == 'Q') {
      return CardAbilities.noWinLift;
    }
    else if (value == 'K') {
      return CardAbilities.shuffleHand;
    }
    else if (value == 'A') {
      return CardAbilities.oppReplay;
    }
    else {
      return undefined;
    }
  }
  else if (suit == 'h') {
    if (value == '2') {
      return CardAbilities.royalsDisabled;
    }
    else if (value == '9') {
      return CardAbilities.hangSaver;
    }
    else if (value == 'X') {
      return CardAbilities.twentyPoints;
    }
    else if (value == 'J') {
      return CardAbilities.pointsForSaved;
    }
    else if (value == 'Q') {
      return CardAbilities.abilitiesDisabled;
    }
    else if (value == 'K') {
      return CardAbilities.swapOppCard;
    }
    else if (value == 'A') {
      return CardAbilities.allyReplay;
    }
    else {
      return undefined;
    }
  }
  else if (suit == 'd') {
    if (value == '2') {
      return CardAbilities.forceStand;
    }
    else if (value == '9') {
      return CardAbilities.ninePoints;
    }
    else if (value == 'X') {
      return CardAbilities.oppositePower;
    }
    else if (value == 'J') {
      return CardAbilities.allyPlaysLast;
    }
    else if (value == 'Q') {
      return CardAbilities.drawOne;
    }
    else if (value == 'K') {
      return CardAbilities.doublePoints;
    }
    else if (value == 'A') {
      return CardAbilities.chooseStarter;
    }
    else {
      return undefined;
    }
  }
  else if (suit == 'c') {
    if (value == '2') {
      return CardAbilities.twoWinGame;
    }
    else if (value == '9') {
      return getRandomAbility();
    }
    else if (value == 'X') {
      return CardAbilities.revealedBare;
    }
    else if (value == 'J') {
      return CardAbilities.nextCardTrump;
    }
    else if (value == 'Q') {
      return CardAbilities.swapAllyCard;
    }
    else if (value == 'K') {
      return CardAbilities.doubleLift;
    }
    else if (value == 'A') {
      return CardAbilities.swapHands;
    }
    else {
      return undefined;
    }
  }
}

function getRandomAbility() {
  let randomIndex: CardAbilities;
  do {
    const enumValues = (Object.values(CardAbilities) as unknown) as CardAbilities[];
    randomIndex = Math.floor(Math.random() * (enumValues.length)/2);
  } while (
    // Redo if function got these abilities
    randomIndex == CardAbilities.randomAbility ||
    randomIndex == CardAbilities.pointsForSaved ||
    randomIndex == CardAbilities.twoWinGame ||
    randomIndex == CardAbilities.jackHanged
  );

  return randomIndex;
}

export function getIsRandom(value: string, suit: string) {
  if (value == '9' && suit == 'c') {
    return true;
  }

  return false;
}

const abilityData: Partial<AbilityData> = {
  [CardAbilities.alwaysPlayable]: {
    description: 'Can be played no matter what suit has been called',
    ability: (args: AbilityInput) => alwaysPlayableAbility(args),
  },
  [CardAbilities.ninePowerful]: {
    description: 'If either team has 9 points for game, this card is the the most powerful card',
    ability: (args: AbilityInput) => ninePowerfulAbility(args),
    duration: 'lift'
  },
  [CardAbilities.trumpDisabled]: {
    description: 'Nobody can play trump this turn unless trump was called or they are flush',
    ability: (args: AbilityInput) => trumpDisabledAbility(args),
    duration: 'lift'
  },
  [CardAbilities.targetPowerless]: {
    description: 'Choose a card in the lift to be powerless and be worth 0 points',
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.noWinLift]: {
    description: 'No team will earn points for game in this lift',
    ability: (args: AbilityInput) => noWinLiftAbility(args),
    duration: 'lift'
  },
  [CardAbilities.shuffleHand]: {
    description: 'Shuffle your hand into the deck and get redealt the amount of cards you have',
    ability: (args: AbilityInput) => shuffleHandAbility(args),
  },
  [CardAbilities.oppReplay]: {
    description: 'Force an opponent to take back their card and play a different one',
    ability: (args: AbilityInput) => oppReplayAbility(args),
  },
  [CardAbilities.royalsDisabled]: {
    description: 'No royals can be played this turn unless they are flush',
    ability: (args: AbilityInput) => royalsDisabledAbility(args),
    duration: 'lift'
  },
  [CardAbilities.hangSaver]: {
    description: `Can save your teammate's Jack from being hung and earn ${hangSaverPointsEarned} points for Jack if successful`,
    ability: (args: AbilityInput) => hangSaverAbility(args),
    duration: 'lift'
  },
  [CardAbilities.twentyPoints]: {
    description: 'Worth 20 points for game',
    ability: (args: AbilityInput) => twentyPointsAbility(args),
  },
  [CardAbilities.pointsForSaved]: {
    description: `If saved from hanging, get ${pointsForSavedPointsEarned} points for game`,
    ability: (args: AbilityInput) => pointsForSavedAbility(args),
  },
  [CardAbilities.abilitiesDisabled]: {
    description: 'All other abilities are disabled for this turn',
    ability: (args: AbilityInput) => abilitiesDisabledAbility(args),
    duration: 'lift'
  },
  [CardAbilities.swapOppCard]: {
    description: 'Swap one of your cards with a random card from an opponent of your choosing',
    ability: (args: AbilityInput) => swapOppCardAbility(args),
  },
  [CardAbilities.allyReplay]: {
    description: 'Allow your ally to take back their card and play again',
    ability: (args: AbilityInput) => allyReplayAbility(args),
  },
  [CardAbilities.forceStand]: {
    description: 'If in your hand when dealing, can force opponent to stand without giving a point',
    ability: (args: AbilityInput) => forceStandAbility(args),
  },
  [CardAbilities.ninePoints]: {
    description: 'Worth 9 points for game',
    ability: (args: AbilityInput) => ninePointsAbility(args),
  },
  [CardAbilities.oppositePower]: {
    description: 'Card power is opposite this turn',
    ability: (args: AbilityInput) => oppositePowerAbility(args),
    duration: 'lift'
  },
  [CardAbilities.allyPlaysLast]: {
    description: 'Your ally plays their card last this turn',
    ability: (args: AbilityInput) => allyPlaysLastAbility(args),
    duration: 'lift'
  },
  [CardAbilities.drawOne]: {
    description: 'All players draw one card',
    ability: (args: AbilityInput) => drawOneAbility(args),
  },
  [CardAbilities.doublePoints]: {
    description: 'This lift will be worth double the points',
    ability: (args: AbilityInput) => doublePointsAbility(args),
    duration: 'lift'
  },
  [CardAbilities.chooseStarter]: {
    description: 'Choose a player to play first next turn',
    ability: (args: AbilityInput) => chooseStarterAbility(args),
    duration: 'lift'
  },
  [CardAbilities.twoWinGame]: {
    description: 'If every other 2 has already been played this round, win game for that round',
    ability: (args: AbilityInput) => twoWinGameAbility(args),
    duration: 'round'
  },
  [CardAbilities.revealedBare]: {
    description: 'If you are revealed to have no trump then this card becomes trump',
    ability: (args: AbilityInput) => revealedBareAbility(args),
  },
  [CardAbilities.nextCardTrump]: {
    description: 'The next card you play becomes trump',
    ability: (args: AbilityInput) => nextCardTrumpAbility(args),
  },
  [CardAbilities.swapAllyCard]: {
    description: 'Swap a card with your ally',
    ability: (args: AbilityInput) => swapAllyCardAbility(args),
  },
  [CardAbilities.doubleLift]: {
    description: 'Leave the current lift on table and the winner of next lift takes both lifts',
    ability: (args: AbilityInput) => doubleLiftAbility(args),
    duration: 'lift'
  },
  [CardAbilities.swapHands]: {
    description: 'Swap hands with any player',
    ability: (args: AbilityInput) => swapHandsAbility(args),
  },
  [CardAbilities.jackHanged]: {
    description: '',
    duration: 'game',
    ability: (args: AbilityInput) => console.log(''),
  },
};

export function getAbilityData(ability: CardAbilities) {
  return abilityData[ability];
}

export function handleAbility(args: AbilityInput) {

  if (!args.roomData.activeAbilities) {
    args.roomData.activeAbilities = [];
  }

  // Check if abilities are disabled
  if (args.roomData.activeAbilities.includes(CardAbilities.abilitiesDisabled)) {
    return;
  }

  return abilityData[args.card.ability]?.ability(args);
}

function alwaysPlayableAbility(args: AbilityInput) {
  console.log('alwaysPlayableAbility: Played');
}

function ninePowerfulAbility(args: AbilityInput) {
  if (args.roomData.game && args.roomData.game.includes(9)) {
    args.roomData.activeAbilities.push(CardAbilities.ninePowerful);
    args.card.power = 9001;
  }
}

function trumpDisabledAbility(args: AbilityInput) {
  args.roomData.activeAbilities.push(CardAbilities.trumpDisabled);
  sendSystemMessage({
    io: args.io,
    message: 'Trump is disabled for this turn!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function targetPowerlessAbility(args: AbilityInput) {
  console.log('targetPowerlessAbility: Played');
}

function noWinLiftAbility(args: AbilityInput) {
  args.roomData.activeAbilities.push(CardAbilities.noWinLift);
  sendSystemMessage({
    io: args.io,
    message: 'No team will earn points for this lift!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function abilitiesDisabledAbility(args: AbilityInput) {
  args.roomData.activeAbilities = [CardAbilities.abilitiesDisabled];
  sendSystemMessage({
    io: args.io,
    message: 'Abilities are disabled for this turn!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function shuffleHandAbility(args: AbilityInput) {

  const player = args.roomData.users.find(el => el.id == args.id);

  const playerHandLength = player.cards.length;

  player.cards.forEach((card) => {
    args.roomData.deck.push(card);
  });

  player.cards = [];

  shuffleDeck(args.roomData.deck);

  let card: DeckCard;

  for (let i = 0; i < playerHandLength; i++) {
    card = args.roomData.deck.pop();

    if (card) {
      player.cards.push(card);
    }
  }

  sendSystemMessage({
    io: args.io,
    message: player.nickname + ' has shuffled their hand!',
    roomId: args.roomId,
    colour: '#db2777'
  });

  orderCards(args.roomData.users);

  determineIfCardsPlayable(args.roomData, player);

  emitPlayerCardData(args.io, args.roomData);
}

function royalsDisabledAbility(args: AbilityInput) {
  args.roomData.activeAbilities.push(CardAbilities.royalsDisabled);
  sendSystemMessage({
    io: args.io,
    message: 'Royals are disabled for this turn!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function oppReplayAbility(args: AbilityInput) {
  console.log('oppReplayAbility: Played');
}

function hangSaverAbility(args: AbilityInput) {
  const player = args.roomData.users.find(el => el.id == args.id);

  pushPlayerStatus(args.roomData, player, CardAbilities.hangSaver);
}

function twentyPointsAbility(args: AbilityInput) {
  console.log('twentyPointsAbility: Played');
}

function pointsForSavedAbility(args: AbilityInput) {
  console.log('pointsForSavedAbility: Played');
}

function swapOppCardAbility(args: AbilityInput) {
  console.log('swapOppCardAbility: Played');
}

function allyReplayAbility(args: AbilityInput) {

  const playerData = args.roomData.users.find(el => el.player == args.player.player);

  const teammatePlayer = args.roomData.users.find(el => el.team == playerData.team && el.player != playerData.player);

  const liftCardIndex = args.roomData.lift.findIndex(el => el.player == teammatePlayer.player);

  // If their teammate hasn't played a card yet, do nothing
  if (liftCardIndex == -1) {
    return;
  }

  // Store the next players turn in pendingTurn variable
  if (args.roomData.turn >= 4) {
    args.roomData.tempPendingTurn = 1;
  }
  else {
    args.roomData.tempPendingTurn = args.roomData.turn + 1;
  }

  // Make it the turn of the player whose card was chosen
  args.roomData.turn = teammatePlayer.player;

  const liftCard = args.roomData.lift[liftCardIndex];

  // Remove card from lift
  if (liftCardIndex > -1) {
    args.roomData.lift.splice(liftCardIndex, 1);
  }

  // Add card back to player's hand
  teammatePlayer.cards.push({ ...liftCard });

  sendSystemMessage({
    io: args.io,
    message: teammatePlayer.nickname + ' gets to replay their card!',
    roomId: args.roomId,
    colour: '#db2777'
  });

  orderCards(args.roomData.users);
}

function forceStandAbility(args: AbilityInput) {
  console.log('forceStandAbility: Played');
}

function ninePointsAbility(args: AbilityInput) {
  console.log('ninePointsAbility: Played');
}

function oppositePowerAbility(args: AbilityInput) {
  args.roomData.activeAbilities.push(CardAbilities.oppositePower);
  sendSystemMessage({
    io: args.io,
    message: 'Card power is opposite this turn!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function drawOneAbility(args: AbilityInput) {
  if (args.roomData.deck.length < 4) {
    sendSystemMessage({
      io: args.io,
      message: 'The deck does not have enough cards for each player to draw one!',
      roomId: args.roomId,
      colour: '#db2777',
      showToast: true
    });
    return;
  }

  const tempDeck: DeckCard[] = [ ...args.roomData.deck ];

  const cards: DeckCard[] = [];

  // Draw 4 cards from deck
  for (let i = 0; i < 4; i++) {
    cards.push(tempDeck.pop());
  }

  // Add card to every player's hand
  args.roomData.users.forEach(user => {
    user.cards.push(cards.pop());
  });

  orderCards(args.roomData.users);

  emitPlayerCardData(args.io, args.roomData);

  sendSystemMessage({
    io: args.io,
    message: 'Each player drew a card!',
    roomId: args.roomId,
    colour: '#db2777',
    showToast: true
  });

}

function allyPlaysLastAbility(args: AbilityInput) {
  const player = args.roomData.users.find(el => el.id == args.id);

  const teammate = args.roomData.users.find(el => el.team == player.team && el.id != player.id);

  // Remove allyPlaysLast status from other players
  args.roomData.playerStatus?.forEach((stat) => {
    const removedPlayerStatuses = stat.status?.filter(el => el != CardAbilities.allyPlaysLast);
    stat.status = removedPlayerStatuses;
  });

  pushPlayerStatus(args.roomData, teammate, CardAbilities.allyPlaysLast);

  args.roomData.allyPlaysLastPlayer = teammate.player;

  sendSystemMessage({
    io: args.io,
    message: teammate.nickname + ' is playing last this turn!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function doublePointsAbility(args: AbilityInput) {
  args.roomData.activeAbilities.push(CardAbilities.doublePoints);
  sendSystemMessage({
    io: args.io,
    message: 'The lift is worth double points this turn!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function chooseStarterAbility(args: AbilityInput) {
  console.log('chooseStarterAbility: Played');
}

function twoWinGameAbility(args: AbilityInput) {
  // If all other twos have not been played yet, do nothing
  if (args.roomData.twosPlayed.length < 3) {
    return;
  }

  args.roomData.twoWinGameWinnerTeam = args.player.team;

  // Add player status
  const player = args.roomData.users.find(el => el.id == args.id);

  pushPlayerStatus(args.roomData, player, CardAbilities.twoWinGame);

  sendSystemMessage({
    io: args.io,
    message: player.nickname + '\'s team will win game this round!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function revealedBareAbility(args: AbilityInput) {
  console.log('revealedBareAbility: Played');
}

function nextCardTrumpAbility(args: AbilityInput) {
  // Add player status
  const player = args.roomData.users.find(el => el.id == args.id);

  pushPlayerStatus(args.roomData, player, CardAbilities.nextCardTrump);

  sendSystemMessage({
    io: args.io,
    message: 'The next card that ' + player.nickname + ' plays will be trump!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function swapAllyCardAbility(args: AbilityInput) {
  console.log('swapAllyCardAbility: Played');
}

function doubleLiftAbility(args: AbilityInput) {
  args.roomData.activeAbilities.push(CardAbilities.doubleLift);
  sendSystemMessage({
    io: args.io,
    message: 'The winner of the next lift wins both lifts!',
    roomId: args.roomId,
    colour: '#db2777'
  });
}

function swapHandsAbility(args: AbilityInput) {
  console.log('swapHandsAbility: Played');
}