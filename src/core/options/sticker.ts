import { toNumber } from '../../utils/extension';
import { PokemonDataGM } from '../models/options.model';
import { IPokemonData } from '../models/pokemon.model';
import { ISticker, Sticker } from '../models/sticker.model';

export const optionSticker = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  const pokemonMap = new Map<string | number, number>(
    pokemon
      .filter((p): p is typeof p & { pokemonId: string | number } => p.pokemonId !== undefined)
      .map((p) => [p.pokemonId, toNumber(p.num)])
  );

  const stickers: ISticker[] = [];
  const stickerMap = new Map<string, ISticker>();

  for (const item of data) {
    if (!/^STICKER_/g.test(item.templateId)) {
      continue;
    }

    if (item.data.iapItemDisplay) {
      const id = item.data.iapItemDisplay.sku?.replace('STICKER_', '');
      const baseId = id.split('.')[0];
      const sticker = stickerMap.get(baseId);
      if (sticker) {
        sticker.isShop = true;
        sticker.pack.push(toNumber(id?.replace(`${sticker.id}.`, '')));
      }
    } else if (item.data.stickerMetadata) {
      const sticker = new Sticker();
      sticker.id = item.data.stickerMetadata.stickerId?.replace('STICKER_', '');
      sticker.maxCount = toNumber(item.data.stickerMetadata.maxCount);
      sticker.stickerUrl = item.data.stickerMetadata.stickerUrl;
      if (item.data.stickerMetadata.pokemonId) {
        sticker.pokemonId = pokemonMap.get(item.data.stickerMetadata.pokemonId);
        sticker.pokemonName = item.data.stickerMetadata.pokemonId;
      }
      stickers.push(sticker);
      if (sticker.id) {
        stickerMap.set(sticker.id, sticker);
      }
    }
  }
  return stickers;
};
