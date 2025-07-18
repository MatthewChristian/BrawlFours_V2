import { describe, test, expect } from '@jest/globals';
import { scoreLift } from '../core/services/sharedGameFunctions';
import { PlayerSocket } from '../models/PlayerSocket';
import { RoomSocket } from '../models/RoomSocket';
import { testCard, testDeck } from './testCard';
import { ScoreLiftOutput } from '../models/ScoreLiftOutput';
import { LiftCard } from '../models/LiftCard';
import { CardAbilities } from '../core/services/abilities';
import { DeckCard } from '../models/DeckCard';

function getCard(value: string, suit: string): DeckCard {
  const deck = [...testDeck];

  const card = deck.find(el => el.suit == suit && el.value == value);

  if (card.suit == 'h') {
    return { ...card, trump: true};
  }
  else {
    return card;
  }

}

describe('Score Lift', () => {

  const roomData: RoomSocket = {};

  roomData.called = { ...testCard, suit: 'd' }; // Dimes are called
  roomData.trump = 'h'; // Hearts is trump

  const player1: PlayerSocket = { player: 1, team: 1 };
  const player2: PlayerSocket = { player: 2, team: 2 };
  const player3: PlayerSocket = { player: 3, team: 1 };
  const player4: PlayerSocket = { player: 4, team: 2 };

  roomData.users = [player1, player2, player3, player4];
  roomData.activeAbilities = [];


  test('All same suits as called, all bush', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('3', 'd'), player: 2},
      { ...getCard('4', 'd'), player: 3},
      { ...getCard('5', 'd'), player: 4},
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player4
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([0, 0]);
  });


  test('All same suits as called, face cards, team 1 win', () => {
    const lift: LiftCard[] = [
      { ...getCard('X', 'd'), player: 1 },
      { ...getCard('J', 'd'), player: 2 },
      { ...getCard('A', 'd'), player: 3 },
      { ...getCard('K', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([18, 0]);
  });



  test('All same suits as called, face cards, team 2 win', () => {
    const lift: LiftCard[] = [
      { ...getCard('X', 'd'), player: 1 },
      { ...getCard('J', 'd'), player: 2 },
      { ...getCard('K', 'd'), player: 3 },
      { ...getCard('A', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player4
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([0, 18]);
  });




  test('Higher value but different suit than called', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('3', 'd'), player: 2},
      { ...getCard('4', 's'), player: 3},
      { ...getCard('5', 'c'), player: 4},
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player2
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([0, 0]);
  });



  test('Trump in lift', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('A', 'd'), player: 2},
      { ...getCard('4', 'h'), player: 3},
      { ...getCard('5', 'c'), player: 4},
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([4, 0]);
  });



  test('Trump in lift, tied values', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('A', 'd'), player: 2},
      { ...getCard('A', 'h'), player: 3},
      { ...getCard('5', 'c'), player: 4},
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([8, 0]);
  });



  test('Jack hung', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('J', 'h'), player: 2},
      { ...getCard('A', 'h'), player: 3},
      { ...getCard('5', 'c'), player: 4},
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3,
      jackOwnerPlayer: player2,
      highestHangerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeTruthy();
    expect(tempRoomData.game).toEqual([5, 0]);
  });



  test('Jack about to be hung but saved', () => {
    const lift: LiftCard[] = [
      { ...getCard('J', 'h'), player: 1, ability: undefined},
      { ...getCard('Q', 'h'), player: 2},
      { ...getCard('A', 'h'), player: 3},
      { ...getCard('5', 'd'), player: 4},
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3,
      jackOwnerPlayer: player1,
      highestHangerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.game).toEqual([7, 0]);
  });


  test('Card with ninePowerful ability is played', () => {
    const lift: LiftCard[] = [
      { ...getCard('9', 's'), player: 1, power: 9001 },
      { ...getCard('Q', 'h'), player: 2 },
      { ...getCard('A', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player1,
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.game).toEqual([6, 0]);
  });

  test('Card with ninePowerful ability is played and jack is hung', () => {
    const lift: LiftCard[] = [
      { ...getCard('9', 's'), player: 1, power: 9001 },
      { ...getCard('J', 'h'), player: 2 },
      { ...getCard('A', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player1,
      jackOwnerPlayer: player2,
      highestHangerPlayer: player1
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeTruthy();
    expect(tempRoomData.game).toEqual([5, 0]);
  });


  test('Card with ninePowerful ability is played and saves jack from being hung', () => {
    const lift: LiftCard[] = [
      { ...getCard('9', 's'), player: 1, power: 9001 },
      { ...getCard('A', 'h'), player: 2 },
      { ...getCard('J', 'h'), player: 3, ability: undefined },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player1,
      jackOwnerPlayer: player3,
      highestHangerPlayer: player1
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.game).toEqual([5, 0]);
  });


  test('noWinLift ability is active', () => {
    const lift: LiftCard[] = [
      { ...getCard('J', 'd'), player: 1 },
      { ...getCard('Q', 'h'), player: 2 },
      { ...getCard('A', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift, activeAbilities: [CardAbilities.noWinLift] };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3,
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.game).toEqual([0, 0]);
  });

  test('Card with hangSaver ability is played and saves jack from being hung', () => {
    const lift: LiftCard[] = [
      { ...getCard('9', 'h'), player: 1 },
      { ...getCard('A', 'h'), player: 2 },
      { ...getCard('J', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift, playerStatus: [undefined, { player: player1, status: [CardAbilities.hangSaver] }, undefined, undefined, undefined] };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player2,
      jackOwnerPlayer: player3,
      highestHangerPlayer: player1
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.jackSaved).toBeTruthy();
    expect(tempRoomData.game).toEqual([0, 5]);
  });


  test('Card with hangSaver ability is played when there is no jack to be hung', () => {
    const lift: LiftCard[] = [
      { ...getCard('9', 'h'), player: 1 },
      { ...getCard('A', 'h'), player: 2 },
      { ...getCard('K', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift, playerStatus: [undefined, { player: player1, status: [CardAbilities.hangSaver] }, undefined, undefined, undefined] };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player2,
      jackOwnerPlayer: undefined,
      highestHangerPlayer: player2
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.jackSaved).toBeFalsy();
    expect(tempRoomData.game).toEqual([0, 7]);
  });


  test('Card with hangSaver ability is played but their teammate hangs Jack', () => {
    const lift: LiftCard[] = [
      { ...getCard('9', 'h'), player: 1 },
      { ...getCard('J', 'h'), player: 2 },
      { ...getCard('A', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift, playerStatus: [undefined, { player: player1, status: [CardAbilities.hangSaver] }, undefined, undefined, undefined] };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3,
      jackOwnerPlayer: player2,
      highestHangerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeTruthy();
    expect(tempRoomData.jackSaved).toBeFalsy();
    expect(tempRoomData.game).toEqual([5, 0]);
  });



  test('Card with pointsForSaved ability is saved from being hung', () => {
    const lift: LiftCard[] = [
      { ...getCard('J', 'h'), player: 1 },
      { ...getCard('K', 'h'), player: 2 },
      { ...getCard('A', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3,
      jackOwnerPlayer: player1,
      highestHangerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.game).toEqual([18, 0]);
  });


  test('Card with pointsForSaved ability is saved from being hung via hangSaver', () => {
    const lift: LiftCard[] = [
      { ...getCard('J', 'h'), player: 1 },
      { ...getCard('K', 'h'), player: 2 },
      { ...getCard('9', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player2,
      jackOwnerPlayer: player1,
      highestHangerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.game).toEqual([18, 0]);
  });


  test('Card with pointsForSaved ability is hung', () => {
    const lift: LiftCard[] = [
      { ...getCard('J', 'h'), player: 1 },
      { ...getCard('K', 'h'), player: 2 },
      { ...getCard('Q', 'h'), player: 3 },
      { ...getCard('5', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player2,
      jackOwnerPlayer: player1,
      highestHangerPlayer: player2
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeTruthy();
    expect(tempRoomData.game).toEqual([0, 6]);
  });

  test('ninePoints in lift', () => {
    const lift: LiftCard[] = [
      { ...getCard('3', 'd'), player: 1 },
      { ...getCard('5', 'd'), player: 2 },
      { ...getCard('9', 'd'), player: 3 },
      { ...getCard('4', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([9, 0]);
  });

  test('ninePoints in lift, abilities disabled', () => {
    const lift: LiftCard[] = [
      { ...getCard('3', 'd'), player: 1 },
      { ...getCard('5', 'd'), player: 2 },
      { ...getCard('9', 'd'), player: 3 },
      { ...getCard('4', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift, activeAbilities: [CardAbilities.abilitiesDisabled] };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([0, 0]);
  });


  test('twentyPoints in lift', () => {
    const lift: LiftCard[] = [
      { ...getCard('3', 'd'), player: 1 },
      { ...getCard('5', 'd'), player: 2 },
      { ...getCard('X', 'h'), player: 3 },
      { ...getCard('4', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([20, 0]);
  });

  test('twentyPoints in lift, abilities disabled', () => {
    const lift: LiftCard[] = [
      { ...getCard('3', 'd'), player: 1 },
      { ...getCard('5', 'd'), player: 2 },
      { ...getCard('X', 'h'), player: 3 },
      { ...getCard('4', 'd'), player: 4 },
    ];

    const tempRoomData: RoomSocket = { ...roomData, lift: lift, activeAbilities: [CardAbilities.abilitiesDisabled] };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    };

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([10, 0]);
  });

});
