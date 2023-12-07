import APIService from '../../services/API.service';
import { PokemonNameModel } from './pokemon.model';

export interface PokemonSearchingModel {
  id: number;
  name: string;
  sprites: string;
}

export class PokemonSearchingModel {
  id: number;
  name: string;
  sprites: string;
  constructor(item: PokemonNameModel) {
    this.id = item.id;
    this.name = item.name;
    this.sprites = APIService.getPokeSprite(item.id);
  }
}
