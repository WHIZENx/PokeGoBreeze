import { IPokemonFormModify } from '../../core/models/API/form.model';
import { IPokemonDetail } from '../../core/models/API/info.model';
import { IPokemonData } from '../../core/models/pokemon.model';

export interface ISearchingModel {
  pokemon?: ISearchPokemonDetail;
  form?: ISearchPokemonForm;
}

export interface ISearchPokemonData extends Partial<IPokemonData> {
  timestamp: Date;
}

export class SearchPokemonData implements ISearchPokemonData {
  timestamp = new Date();
}

export interface ISearchPokemonForm extends Partial<IPokemonFormModify> {
  timestamp: Date;
}

export class SearchPokemonForm implements ISearchPokemonForm {
  timestamp = new Date();
}

export interface ISearchPokemonDetail extends Partial<IPokemonDetail> {
  timestamp: Date;
}

export class SearchPokemonDetail implements ISearchPokemonDetail {
  timestamp = new Date();
}

export class SearchingModel implements ISearchingModel {
  pokemonDetail = new SearchPokemonDetail();
  pokemon = new SearchPokemonData();
  form = new SearchPokemonForm();

  constructor({ ...props }: ISearchingModel) {
    Object.assign(this, props);
  }
}
