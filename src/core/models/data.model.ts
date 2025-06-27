import { ICombat } from './combat.model';
import { IPokemonData } from './pokemon.model';

export interface IData {
  pokemons: IPokemonData[];
  combats: ICombat[];
}

export class Data implements IData {
  pokemons: IPokemonData[] = [];
  combats: ICombat[] = [];
}
