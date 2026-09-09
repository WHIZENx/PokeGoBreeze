import { IImage } from '../asset.model';
import { IPokemonData } from '../pokemon.model';

export interface PokedexApiPokemon extends IPokemonData {
  assetForm?: IImage;
}

export interface PokedexApiResponse {
  data: PokedexApiPokemon[];
  meta: {
    page: number;
    pages: number;
    total: number;
  };
}

export const isPokedexApiResponse = (value: unknown): value is PokedexApiResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Partial<PokedexApiResponse>;
  return (
    Array.isArray(response.data) &&
    !!response.meta &&
    typeof response.meta.pages === 'number' &&
    typeof response.meta.page === 'number' &&
    typeof response.meta.total === 'number'
  );
};
