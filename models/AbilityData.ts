import { CardAbilities } from '../core/services/abilities';
import { AbilityInput } from './AbilityInput';

export type AbilityData = {
  [key in CardAbilities]: {
    description: string;
    ability: (args: AbilityInput) => void;
    duration?: 'lift' | 'round' | 'game';
  };
};