import { BasicRoomInput } from './BasicRoomInput';

export interface ChoosePartnerInput extends BasicRoomInput {
  partnerId: string;
}