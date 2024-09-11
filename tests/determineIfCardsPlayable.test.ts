import { describe, test, expect } from "@jest/globals";
import { determineIfCardsPlayable } from "../core/services/sharedGameFunctions";
import { PlayerSocket } from "../models/PlayerSocket";
import { RoomSocket } from "../models/RoomSocket";
import { testCard } from "./testCard";
import { CardAbilities } from "../core/services/abilities";

describe('Are Cards Playable', () => {

  const roomData: RoomSocket = {}

  roomData.called = { ...testCard, suit: 'd' }; // Dimes are called
  roomData.trump = 'h' // Hearts is trump

  const player: PlayerSocket = {};





  test('Only called playable', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd' },
      { ...testCard, value: '3', suit: 'd' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 'c' },
      { ...testCard, value: '6', suit: 's' },
      { ...testCard, value: '7', suit: 's' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: false },
      { ...cards[5], playable: false },
    ]

    expect(cards).toMatchObject(expectedCards);
  });





  test('Called and trump playable', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd' },
      { ...testCard, value: '3', suit: 'd' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 'c' },
      { ...testCard, value: '6', suit: 's' },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: false },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });




  test('All cards playable because bare', () => {
    const cards = [
      { ...testCard, value: '2', suit: 's' },
      { ...testCard, value: '3', suit: 'c' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 'c' },
      { ...testCard, value: '6', suit: 's' },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: true },
      { ...cards[3], playable: true },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });




  test('All cards playable because nothing has been called', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd' },
      { ...testCard, value: '3', suit: 'd' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 's' },
      { ...testCard, value: '6', suit: 's' },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, called: undefined };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: true },
      { ...cards[3], playable: true },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });




  test('Undertrump playable is trump was called', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd', power: 2 },
      { ...testCard, value: '3', suit: 'd', power: 3 },
      { ...testCard, value: '4', suit: 'c', power: 4 },
      { ...testCard, value: '5', suit: 's', power: 5 },
      { ...testCard, value: '6', suit: 'h', power: 6 },
      { ...testCard, value: 'J', suit: 'h', power: 11 },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, called: { ...testCard, suit: 'h' },  lift: [ { ...testCard, value: 'X', suit: 'h', power: 10 } ] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: false },
      { ...cards[1], playable: false },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });




  test('Undertrump not playable', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd', power: 2 },
      { ...testCard, value: '3', suit: 'd', power: 3 },
      { ...testCard, value: '4', suit: 'c', power: 4 },
      { ...testCard, value: '5', suit: 's', power: 5 },
      { ...testCard, value: '6', suit: 'h', power: 6 },
      { ...testCard, value: 'J', suit: 'h', power: 11 },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, lift: [{ ...testCard, value: 'X', suit: 'h', power: 10 }] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: false },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });




  test('alwaysPlayable ability playable', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd' },
      { ...testCard, value: '3', suit: 'd' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 's' },
      { ...testCard, value: '2', suit: 's', ability: CardAbilities.alwaysPlayable },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('alwaysPlayable ability not playable because abilities are disabled', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd' },
      { ...testCard, value: '3', suit: 'd' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 's' },
      { ...testCard, value: '2', suit: 's', ability: CardAbilities.alwaysPlayable },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.abilitiesDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: false },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });




  test('alwaysPlayable ability not playable because abilities are disabled', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd' },
      { ...testCard, value: '3', suit: 'd' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 's' },
      { ...testCard, value: '2', suit: 's', ability: CardAbilities.alwaysPlayable },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.abilitiesDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: false },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });




  test('trumpDisabled ability is active', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'd' },
      { ...testCard, value: '3', suit: 'd' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 's' },
      { ...testCard, value: '6', suit: 'h' },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.trumpDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: false },
      { ...cards[5], playable: false },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('trumpDisabled ability is active and is bare', () => {
    const cards = [
      { ...testCard, value: '2', suit: 's' },
      { ...testCard, value: '3', suit: 'c' },
      { ...testCard, value: '4', suit: 'c' },
      { ...testCard, value: '5', suit: 's' },
      { ...testCard, value: '6', suit: 'h' },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.trumpDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: true },
      { ...cards[3], playable: true },
      { ...cards[4], playable: false },
      { ...cards[5], playable: false },
    ]

    expect(cards).toMatchObject(expectedCards);
  });


  test('trumpDisabled ability is active and is flush', () => {
    const cards = [
      { ...testCard, value: '2', suit: 'h' },
      { ...testCard, value: '3', suit: 'h' },
      { ...testCard, value: '4', suit: 'h' },
      { ...testCard, value: '5', suit: 'h' },
      { ...testCard, value: '6', suit: 'h' },
      { ...testCard, value: '7', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.trumpDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: true },
      { ...cards[3], playable: true },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('royalsDisabled ability is active', () => {
    const cards = [
      { ...testCard, value: 'J', suit: 'd' },
      { ...testCard, value: '3', suit: 'd' },
      { ...testCard, value: '4', suit: 's' },
      { ...testCard, value: '5', suit: 'c' },
      { ...testCard, value: '6', suit: 'h' },
      { ...testCard, value: 'K', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.royalsDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: false },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: true },
      { ...cards[5], playable: false },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('royalsDisabled ability is active and is flush in suit that was called', () => {
    const cards = [
      { ...testCard, value: 'J', suit: 'd' },
      { ...testCard, value: 'K', suit: 'd' },
      { ...testCard, value: '4', suit: 's' },
      { ...testCard, value: '5', suit: 'c' },
      { ...testCard, value: '6', suit: 'h' },
      { ...testCard, value: 'K', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.royalsDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: true },
      { ...cards[5], playable: false },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('royalsDisabled ability is active and is flush in suit that was called and trump', () => {
    const cards = [
      { ...testCard, value: 'J', suit: 'd' },
      { ...testCard, value: 'K', suit: 'd' },
      { ...testCard, value: '4', suit: 's' },
      { ...testCard, value: '5', suit: 'c' },
      { ...testCard, value: 'Q', suit: 'h' },
      { ...testCard, value: 'K', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.royalsDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: false },
      { ...cards[5], playable: false },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('royalsDisabled ability is active and is flush', () => {
    const cards = [
      { ...testCard, value: 'J', suit: 'd' },
      { ...testCard, value: 'K', suit: 'd' },
      { ...testCard, value: 'Q', suit: 's' },
      { ...testCard, value: 'A', suit: 'c' },
      { ...testCard, value: 'J', suit: 'h' },
      { ...testCard, value: 'K', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.royalsDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('royalsDisabled ability is active and is flush and bare', () => {
    const cards = [
      { ...testCard, value: 'J', suit: 's' },
      { ...testCard, value: 'K', suit: 'c' },
      { ...testCard, value: 'Q', suit: 's' },
      { ...testCard, value: 'A', suit: 'c' },
      { ...testCard, value: 'J', suit: 'h' },
      { ...testCard, value: 'K', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.royalsDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: true },
      { ...cards[3], playable: true },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('royalsDisabled ability is active and is bare of called suit and trump', () => {
    const cards = [
      { ...testCard, value: 'J', suit: 's' },
      { ...testCard, value: 'K', suit: 'c' },
      { ...testCard, value: 'Q', suit: 's' },
      { ...testCard, value: 'A', suit: 'c' },
      { ...testCard, value: 'J', suit: 's' },
      { ...testCard, value: 'K', suit: 'c' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.royalsDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: true },
      { ...cards[2], playable: true },
      { ...cards[3], playable: true },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });



  test('royalsDisabled ability is active and is bare of called suit', () => {
    const cards = [
      { ...testCard, value: '2', suit: 's' },
      { ...testCard, value: 'J', suit: 'c' },
      { ...testCard, value: 'Q', suit: 's' },
      { ...testCard, value: '5', suit: 'c' },
      { ...testCard, value: '6', suit: 'h' },
      { ...testCard, value: 'K', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, activeAbilities: [CardAbilities.royalsDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: true },
      { ...cards[1], playable: false },
      { ...cards[2], playable: false },
      { ...cards[3], playable: true },
      { ...cards[4], playable: true },
      { ...cards[5], playable: false },
    ]

    expect(cards).toMatchObject(expectedCards);
  });




  test('trumpDisabled ability is active and trump was called', () => {
    const cards = [
      { ...testCard, value: '2', suit: 's' },
      { ...testCard, value: 'J', suit: 'c' },
      { ...testCard, value: 'Q', suit: 's' },
      { ...testCard, value: '5', suit: 'c' },
      { ...testCard, value: '6', suit: 'h' },
      { ...testCard, value: 'K', suit: 'h' },
    ]

    player.cards = cards;

    const tempRoomData: RoomSocket = { ...roomData, called: { ...testCard, suit: 'h' }, activeAbilities: [CardAbilities.trumpDisabled] };
    const tempPlayer: PlayerSocket = { cards: cards };

    determineIfCardsPlayable(tempRoomData, tempPlayer);

    const expectedCards = [
      { ...cards[0], playable: false },
      { ...cards[1], playable: false },
      { ...cards[2], playable: false },
      { ...cards[3], playable: false },
      { ...cards[4], playable: true },
      { ...cards[5], playable: true },
    ]

    expect(cards).toMatchObject(expectedCards);
  });

});