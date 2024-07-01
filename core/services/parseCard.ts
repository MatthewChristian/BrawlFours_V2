import { DeckCard } from "../../models/DeckCard";

export function getCardShortcode(cardData?: DeckCard) {
  if (!cardData) {
    return undefined
  }

  const suit: string = cardData.suit;
  const value: string = cardData.value;

  console.log("SC: ", suit + value);
  return suit + value;
}