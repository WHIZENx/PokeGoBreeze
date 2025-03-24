import { ISearchingModel } from '../../store/models/searching.model';
import { IPokemonFormModify } from './API/form.model';
import { IPokemonDetail } from './API/info.model';
import { IPokemonData } from './pokemon.model';

export interface SearchingOptionsModel {
  mainSearching: ISearchingModel | null;
  toolSearching: IToolSearching | null;
  pokemonDetails: IPokemonDetail | null;
  pokemon: IPokemonData | null;
  form?: IPokemonFormModify | undefined;
}

export interface IToolSearching {
  id: number;
  name?: string;
  form?: string | null;
  fullName?: string;
  timestamp: Date;
  obj?: ISearchingModel;
}

export class ToolSearching implements IToolSearching {
  id = 0;
  name?: string;
  form?: string | null;
  fullName?: string;
  timestamp = new Date();
  obj?: ISearchingModel;

  static create(value: IToolSearching | null) {
    const obj = new ToolSearching();
    if (value) {
      Object.assign(obj, value);
    }
    return obj;
  }
}
