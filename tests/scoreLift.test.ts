import { describe, test, expect } from "@jest/globals";
import { scoreLift } from "../core/services/sharedGameFunctions";
import { PlayerSocket } from "../models/PlayerSocket";
import { RoomSocket } from "../models/RoomSocket";
import { testCard, testDeck } from "./testCard";
import { ScoreLiftOutput } from "../models/ScoreLiftOutput";
import { LiftCard } from "../models/LiftCard";

function getCard(value: string, suit: string) {
  const deck = [...testDeck];

  return deck.find(el => el.suit == suit && el.value == value);
}

describe('Score Lift', () => {

  const roomData: RoomSocket = {}

  roomData.called = { ...testCard, suit: 'd' }; // Dimes are called
  roomData.trump = 'h' // Hearts is trump

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
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player4
    }

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([0, 0]);
  });


  test('All same suits as called, face cards, team 1 win', () => {
    const lift: LiftCard[] = [
      { ...getCard('X', 'd'), player: 1 },
      { ...getCard('J', 'd'), player: 2 },
      { ...getCard('A', 'd'), player: 3 },
      { ...getCard('K', 'd'), player: 4 },
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    }

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([18, 0]);
  });



  test('All same suits as called, face cards, team 2 win', () => {
    const lift: LiftCard[] = [
      { ...getCard('X', 'd'), player: 1 },
      { ...getCard('J', 'd'), player: 2 },
      { ...getCard('K', 'd'), player: 3 },
      { ...getCard('A', 'd'), player: 4 },
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player4
    }

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([0, 18]);
  });




  test('Higher value but different suit than called', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('3', 'd'), player: 2},
      { ...getCard('4', 's'), player: 3},
      { ...getCard('5', 'c'), player: 4},
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player2
    }

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([0, 0]);
  });



  test('Trump in lift', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('A', 'd'), player: 2},
      { ...getCard('4', 'h'), player: 3},
      { ...getCard('5', 'c'), player: 4},
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    }

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([4, 0]);
  });



  test('Trump in lift, tied values', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('A', 'd'), player: 2},
      { ...getCard('A', 'h'), player: 3},
      { ...getCard('5', 'c'), player: 4},
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3
    }

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.game).toEqual([8, 0]);
  });



  test('Jack hung', () => {
    const lift: LiftCard[] = [
      { ...getCard('2', 'd'), player: 1},
      { ...getCard('J', 'h'), player: 2},
      { ...getCard('A', 'h'), player: 3},
      { ...getCard('5', 'c'), player: 4},
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3,
      jackOwnerPlayer: player2,
      highestHangerPlayer: player3
    }

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeTruthy();
    expect(tempRoomData.game).toEqual([5, 0]);
  });



  test('Jack about to be hung but saved', () => {
    const lift: LiftCard[] = [
      { ...getCard('J', 'h'), player: 1},
      { ...getCard('Q', 'h'), player: 2},
      { ...getCard('A', 'h'), player: 3},
      { ...getCard('5', 'd'), player: 4},
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player3,
      jackOwnerPlayer: player1,
      highestHangerPlayer: player3
    }

    expect(resp).toMatchObject(expectedResp as any);
    expect(tempRoomData.hangJack).toBeFalsy();
    expect(tempRoomData.game).toEqual([7, 0]);
  });


});