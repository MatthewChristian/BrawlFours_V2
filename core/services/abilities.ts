import { AbilityData } from "../../models/AbilityData";
import { AbilityInput } from "../../models/AbilityInput";
import { DeckCard } from "../../models/DeckCard";
import { determineIfCardsPlayable, emitPlayerCardData, orderCards, shuffleDeck } from "./sharedGameFunctions";

const hangSaverPointsEarned = 3;

export enum CardAbilities {
  // Spades
  alwaysPlayable,     // 2 TESTED
  ninePowerful,       // 9
  trumpDisabled,      // 10 Need to test when trump played after trump was called
  targetPowerless,    // J TESTED
  noWinLift,          // Q TESTED
  shuffleHand,        // K TESTED - Need to implement animations
  takeBackCard,       // A

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
  freePlay,           // Q
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
      return CardAbilities.takeBackCard;
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
      return CardAbilities.freePlay;
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
  let randomAbility: CardAbilities;
  do {
    const enumValues = (Object.values(CardAbilities) as unknown) as CardAbilities[];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    randomAbility = enumValues[randomIndex];
  } while (randomAbility == CardAbilities.randomAbility); // Redo if function got random ability again

  return randomAbility
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
  [CardAbilities.royalsDisabled]: {
    description: 'No royals can be played this turn unless they are flush',
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
    duration: 'lift'
  },
  [CardAbilities.hangSaver]: {
    description: `Can save your teammate's Jack from being hung and earn ${hangSaverPointsEarned} points for Jack if successful`,
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.twentyPoints]: {
    description: 'Worth 20 points for game',
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.pointsForSaved]: {
    description: 'If saved from hanging, get 10 points for game',
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.abilitiesDisabled]: {
    description: 'All other abilities are disabled for this turn',
    ability: (args: AbilityInput) => abilitiesDisabledAbility(args),
    duration: 'lift'
  },
  [CardAbilities.swapOppCard]: {
    description: "Swap one of your cards with a random card from an opponent of your choosing",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.allyReplay]: {
    description: "Allow your ally to take back their card and play again",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.forceStand]: {
    description: "If in your hand when dealing, can force opponent to stand without giving a point",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.ninePoints]: {
    description: "This card is worth 9 points for game",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.oppositePower]: {
    description: "Card power is opposite this turn",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
    duration: 'lift'
  },
  [CardAbilities.chooseStarter]: {
    description: "Choose a player to play first next turn",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
    duration: 'lift'
  },
  [CardAbilities.twoWinGame]: {
    description: "If every 2 has already been played this round, win game for that round",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
    duration: 'round'
  },
  [CardAbilities.revealedBare]: {
    description: "If you are revealed to have no trump then this card becomes trump",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.nextCardTrump]: {
    description: "The next card you play becomes trump",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
    duration: 'round'
  },
  [CardAbilities.swapAllyCard]: {
    description: "Swap a card with your ally",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
  [CardAbilities.doubleLift]: {
    description: "Leave the current lift on table and the winner of next lift takes both lifts",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
    duration: 'lift'
  },
  [CardAbilities.swapHands]: {
    description: "Swap hands with any player",
    ability: (args: AbilityInput) => targetPowerlessAbility(args),
  },
}

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
  console.log("alwaysPlayableAbility: Played");
}

function ninePowerfulAbility(args: AbilityInput) {
  if (args.roomData.game.includes(9)) {
    args.roomData.activeAbilities.push(CardAbilities.ninePowerful);
  }
}

function trumpDisabledAbility(args: AbilityInput) {
  args.roomData.activeAbilities.push(CardAbilities.trumpDisabled);
}

function targetPowerlessAbility(args: AbilityInput) {
  console.log("targetPowerlessAbility: Played");
}

function noWinLiftAbility(args: AbilityInput) {
  args.roomData.activeAbilities.push(CardAbilities.noWinLift);
}

function abilitiesDisabledAbility(args: AbilityInput) {
  args.roomData.activeAbilities = [CardAbilities.abilitiesDisabled];
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

  orderCards(args.roomData.users);

  determineIfCardsPlayable(args.roomData, player);

  emitPlayerCardData(args.roomData.users, args.io);
}