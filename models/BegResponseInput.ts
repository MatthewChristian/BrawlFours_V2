import { BasicRoomInput } from './BasicRoomInput';

export interface BegResponseInput extends BasicRoomInput {
  response: 'begging' | 'begged' | 'stand' | 'give' | 'run';
}