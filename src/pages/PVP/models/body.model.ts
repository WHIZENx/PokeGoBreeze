import { IPokemonData } from '../../../core/models/pokemon.model';
import { PokemonType } from '../../../enums/type.enum';

export interface IBody {
  name: string | undefined;
  id: number | undefined;
  form: string | undefined;
  pokemon: IPokemonData | undefined;
  opponent: string;
  rating: number;
  pokemonType: PokemonType;
}

export class BodyModel implements IBody {
  name: string | undefined;
  id: number | undefined;
  form: string | undefined;
  pokemon: IPokemonData | undefined;
  opponent = '';
  rating = 0;
  pokemonType = PokemonType.None;

  static create(value: IBody) {
    const obj = new BodyModel();
    Object.assign(obj, value);
    return obj;
  }
}
