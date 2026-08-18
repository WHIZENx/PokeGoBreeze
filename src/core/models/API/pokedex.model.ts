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
