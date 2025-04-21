import { MoveType, PokemonType } from '../../../enums/type.enum';
import { getValueOrDefault } from '../../../util/extension';

export interface ISelectMoveModel {
  name: string;
  moveType: MoveType;
}

export class SelectMoveModel implements ISelectMoveModel {
  name = '';
  moveType = MoveType.None;

  constructor(name: string | undefined, moveType = MoveType.None) {
    this.name = getValueOrDefault(String, name);
    this.moveType = moveType;
  }
}

export interface ISelectMovePokemonModel {
  id: number | undefined;
  form: string | undefined;
  pokemonType?: PokemonType;
}

export class SelectMovePokemonModel implements ISelectMovePokemonModel {
  id: number | undefined;
  form: string | undefined;
  pokemonType = PokemonType.None;

  constructor(id: number | undefined, form: string | undefined, pokemonType = PokemonType.None) {
    this.id = id;
    this.form = form;
    this.pokemonType = pokemonType;
  }
}
