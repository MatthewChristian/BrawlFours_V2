import { CardAbilities } from '../core/services/abilities';

export interface DeckCard {
  suit: string;
  value: string;
  power: number;
  points: number;
  abilityPoints?: number;
  playable: boolean;
  ability?: CardAbilities;
  isRandom: boolean;
  trump: boolean;
  disabled?: boolean;
}