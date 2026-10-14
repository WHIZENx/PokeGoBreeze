import { formatPokemonDisplayName } from '../../utils/pokemon-display-name';
import { IPokemonData } from './pokemon.model';

export interface IPokemonSearching {
  id: number;
  name: string;
}

export class PokemonSearching implements IPokemonSearching {
  id: number;
  name: string;

  constructor(item: IPokemonData) {
    this.id = item.num;
    this.name = formatPokemonDisplayName(item.pokemonId?.toString());
  }
}
