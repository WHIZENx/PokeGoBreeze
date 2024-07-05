export interface ISticker {
  id: string;
  maxCount: number;
  stickerUrl: string | null;
  pokemonId?: number | null;
  pokemonName: string | null;
  shop: boolean;
  pack: number[];
}

export class Sticker implements ISticker {
  id: string;
  maxCount: number;
  stickerUrl!: string | null;
  pokemonId?: number | null;
  pokemonName!: string | null;
  shop!: boolean;
  pack: number[];

  constructor() {
    this.id = '';
    this.maxCount = 0;
    this.pack = [];
  }
}
