export interface ISticker {
  id: string;
  maxCount: number;
  stickerUrl: string | undefined;
  pokemonId?: number;
  pokemonName: string | undefined;
  shop: boolean;
  pack: number[];
}

export class Sticker implements ISticker {
  id = '';
  maxCount = 0;
  stickerUrl: string | undefined;
  pokemonId?: number;
  pokemonName: string | undefined;
  shop = false;
  pack: number[] = [];
}
