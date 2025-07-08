import APIService from '../../services/api.service';
import { splitAndCapitalize } from '../../utils/utils';
import { IPokemonData } from './pokemon.model';

export interface IPokemonSearching {
  id: number;
  name: string;
  sprites: string;
}

export class PokemonSearching implements IPokemonSearching {
  id: number;
  name: string;
  sprites: string;

  constructor(item: IPokemonData) {
    this.id = item.num;
    this.name = splitAndCapitalize(item.pokemonId?.replace(/-M$/, 'MALE').replace(/-F$/, 'FEMALE'), '_', ' ')
      .replace('Mr ', 'Mr. ')
      .replace(/^Ho Oh$/, 'Ho-Oh')
      .replace(/ O$/, '-O');
    this.sprites = APIService.getPokeSprite(item.num);
  }
}
