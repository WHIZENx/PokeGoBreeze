import APIService from '../../services/API.service';
import { splitAndCapitalize } from '../../util/Utils';
import { PokemonDataModel } from './pokemon.model';

export interface PokemonSearchingModel {
  id: number;
  name: string;
  sprites: string;
}

export class PokemonSearchingModel {
  id: number;
  name: string;
  sprites: string;

  constructor(item: PokemonDataModel) {
    this.id = item.num;
    this.name = splitAndCapitalize(item.pokemonId?.replace(/-M$/, 'MALE').replace(/-F$/, 'FEMALE'), '_', ' ')
      .replace('Mr ', 'Mr. ')
      .replace(/^Ho Oh$/, 'Ho-Oh')
      .replace(/ O$/, '-O');
    this.sprites = APIService.getPokeSprite(item.num);
  }
}
