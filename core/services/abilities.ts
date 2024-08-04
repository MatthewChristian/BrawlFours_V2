import { AbilityData } from "../../models/AbilityData";
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
  disableAbilities,     // Q
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
  randomAbility,      // 9
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
      return CardAbilities.randomAbility;
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

// TODO: Give back type AbilityData
const abilityData = {
  [CardAbilities.alwaysPlayable]: {
    description: 'Can be played no matter what suit has been called',
    ability: (roomData: RoomSocket) => alwaysPlayableAbility(roomData)
  },
}

export function handleAbility(roomData: RoomSocket, powerName: CardAbilities) {
  return abilityData[powerName].ability(roomData);
}


function alwaysPlayableAbility(roomData: RoomSocket) {
  console.log("alwaysPlayableAbility: Played");
}