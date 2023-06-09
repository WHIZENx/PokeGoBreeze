export interface Sticker {
  id: string;
  maxCount: number;
  stickerUrl: string | null;
  pokemonId?: number | null;
  pokemonName: string | null;
  shop: boolean;
  pack: number[];
}
