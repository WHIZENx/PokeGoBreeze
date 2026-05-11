import { isEqual, toNumber } from '../../utils/extension';
import { PokemonDataGM } from '../models/options.model';
import { IPokemonData } from '../models/pokemon.model';
import { ISticker, Sticker } from '../models/sticker.model';

export const optionSticker = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  const stickers: ISticker[] = [];
  data
    .filter((item) => /^STICKER_*/g.test(item.templateId))
    .forEach((item) => {
      if (item.data.iapItemDisplay) {
        const id = item.data.iapItemDisplay.sku?.replace('STICKER_', '');
        const sticker = stickers.find((sticker) => isEqual(sticker.id, id.split('.')[0]));
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
          sticker.pokemonId = pokemon.find((poke) => isEqual(poke.pokemonId, item.data.stickerMetadata.pokemonId))?.num;
          sticker.pokemonName = item.data.stickerMetadata.pokemonId;
        }
        stickers.push(sticker);
      }
    });
  return stickers;
};
