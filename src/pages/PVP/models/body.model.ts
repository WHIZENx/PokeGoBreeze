import { IPokemonData } from '../../../core/models/pokemon.model';

export interface IBody {
  name: string | undefined;
  id: number | undefined;
  form: string | undefined;
  pokemon: IPokemonData | undefined;
  opponent: string;
  rating: number;
}

export class BodyModel implements IBody {
  name: string | undefined;
  id: number | undefined;
  form: string | undefined;
  pokemon: IPokemonData | undefined;
  opponent = '';
  rating = 0;

  static create(value: IBody) {
    const obj = new BodyModel();
    Object.assign(obj, value);
    return obj;
  }
}
