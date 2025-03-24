import { PokemonType } from '../../enums/type.enum';

export interface ISearchingModel {
  id: number;
  name?: string;
  form?: string | null;
  pokemonType?: PokemonType;
  fullName?: string;
  timestamp: Date;
}

export class SearchingModel implements ISearchingModel {
  id = 0;
  name?: string;
  form?: string | null;
  pokemonType?: PokemonType;
  fullName?: string;
  timestamp = new Date();

  constructor({ ...props }: ISearchingModel) {
    Object.assign(this, props);
  }
}
