import APIService from '../../services/API.service';
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
    this.name = item.name;
    this.sprites = APIService.getPokeSprite(item.num);
  }
}
