import { PokemonType } from '../../../../enums/type.enum';

export interface SearchOption {
  id: number;
  form?: string;
  pokemonType?: PokemonType;
}
