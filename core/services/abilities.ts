import { AbilityData } from "../../models/AbilityData";
import { AbilityInput } from "../../models/AbilityInput";
import { DeckCard } from "../../models/DeckCard";
import { RoomSocket } from "../../models/RoomSocket";

export enum CardAbilities {
  // Spades
  alwaysPlayable,   // 2
  ninePowerful,     // 9
  trumpDisabled,    // 10
  targetPowerless,  // J
  noWinLift,        // Q
  shuffleHand,      // K
  takeBackCard,     // A

  // Hearts
  royalsDisabled,   // 2
  hangSaver,        // 9
  twentyPoints,     // 10
  pointsForSaved,   // J
  disableAbilities, // Q
  swapOppCard,      // K
  allyReplay,       // A

  // Dimes
  forceStand,       // 2
  ninePoints,       // 9
  oppositePower,    // 10
  allyPlaysLast,    // J
  freePlay,         // Q
  doublePoints,     // K
  chooseStarter,    // A

  // Clubs
  twoWinGame,       // 2
  randomAbility,    // 9
  revealedBare,     // 10
  randomTrump,      // J
  swapAllyCard,     // Q
  doubleLift,       // K
  swapHands,        // A

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
      return CardAbilities.disableAbilities;
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
      return CardAbilities.randomTrump;
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
    ability: (args: AbilityInput) => alwaysPlayableAbility(args)
  },
  [CardAbilities.ninePowerful]: {
    description: 'If either team has 9 points for game, this card is the the most powerful card',
    ability: (args: AbilityInput) => ninePowerfulAbility(args),
  },
}

export function getAbilityData(ability: CardAbilities) {
  return abilityData[ability];
}

export function handleAbility(args: AbilityInput) {
  return abilityData[args.card.ability].ability(args);
}


function alwaysPlayableAbility(args: AbilityInput) {
  console.log("alwaysPlayableAbility: Played");
}

function ninePowerfulAbility(args: AbilityInput) {
  if (args.roomData.game.includes(9)) {
    args.roomData.activeAbilities.push(CardAbilities.ninePowerful);
  }
}