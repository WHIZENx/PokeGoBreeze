import { MoveType, PokemonType } from '../../../enums/type.enum';

export interface ISelectMoveModel {
  name: string;
  moveType: MoveType;
}

export class SelectMoveModel implements ISelectMoveModel {
  name = '';
  moveType = MoveType.None;

  constructor(name: string, moveType: MoveType) {
    this.name = name;
    this.moveType = moveType;
  }
}

export interface ISelectMovePokemonModel {
  id: number | undefined;
  form: string | null | undefined;
  pokemonType?: PokemonType;
}

export class SelectMovePokemonModel implements ISelectMovePokemonModel {
  id: number | undefined;
  form: string | null | undefined;
  pokemonType = PokemonType.None;

  constructor(id: number | undefined, form: string | null | undefined, pokemonType = PokemonType.None) {
    this.id = id;
    this.form = form;
    this.pokemonType = pokemonType;
  }
}
