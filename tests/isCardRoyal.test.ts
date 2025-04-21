import { describe, expect, test } from '@jest/globals';
import { isCardRoyal } from '../core/services/sharedGameFunctions';
import { testCard } from './testCard';

describe('Is Card Royal', () => {

  test('is 2 Not Royal', () => {
    const card = { ...testCard, value: '2' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is 3 Not Royal', () => {
    const card = { ...testCard, value: '3' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is 4 Not Royal', () => {
    const card = { ...testCard, value: '4' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is 5 Not Royal', () => {
    const card = { ...testCard, value: '5' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is 6 Not Royal', () => {
    const card = { ...testCard, value: '6' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is 7 Not Royal', () => {
    const card = { ...testCard, value: '7' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is 8 Not Royal', () => {
    const card = { ...testCard, value: '8' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is 9 Not Royal', () => {
    const card = { ...testCard, value: '9' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is 10 Not Royal', () => {
    const card = { ...testCard, value: 'X' };
    expect(isCardRoyal(card)).toBeFalsy();
  });

  test('is Jack Royal', () => {
    const card = { ...testCard, value: 'J' };
    expect(isCardRoyal(card)).toBeTruthy();
  });

  test('is Queen Royal', () => {
    const card = { ...testCard, value: 'Q' };
    expect(isCardRoyal(card)).toBeTruthy();
  });

  test('is King Royal', () => {
    const card = { ...testCard, value: 'K' };
    expect(isCardRoyal(card)).toBeTruthy();
  });

  test('is Ace Royal', () => {
    const card = { ...testCard, value: 'A' };
    expect(isCardRoyal(card)).toBeTruthy();
  });

});
