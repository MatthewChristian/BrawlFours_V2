import { describe, test, expect } from "@jest/globals";
import { scoreLift } from "../core/services/sharedGameFunctions";
import { PlayerSocket } from "../models/PlayerSocket";
import { RoomSocket } from "../models/RoomSocket";
import { testCard } from "./testCard";
import { ScoreLiftOutput } from "../models/ScoreLiftOutput";
import { LiftCard } from "../models/LiftCard";

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


  test('All same suits as called', () => {
    const lift: LiftCard[] = [
      { ...testCard, value: '2', suit: 'd', power: 2, player: 1 },
      { ...testCard, value: '3', suit: 'd', power: 3, player: 2 },
      { ...testCard, value: '4', suit: 'd', power: 4, player: 3 },
      { ...testCard, value: '5', suit: 'd', power: 5, player: 4 },
    ]

    const tempRoomData: RoomSocket = { ...roomData, lift: lift };

    const resp = scoreLift(tempRoomData);

    const expectedResp: ScoreLiftOutput = {
      liftWinnerPlayer: player4
    }

    expect(resp).toMatchObject(expectedResp as any);
  });


});