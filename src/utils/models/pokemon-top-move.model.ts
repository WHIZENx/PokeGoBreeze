import { ICombat } from '../../core/models/combat.model';
import { MoveType } from '../../enums/type.enum';

export interface IPokemonTopMove {
  num: number;
  form: string | undefined;
  name: string;
  baseSpecies: string | undefined;
  sprite: string;
  releasedGO: boolean;
  moveType: MoveType;
  dps: number;
  tdo: number;
}

export class PokemonTopMove implements IPokemonTopMove {
  num = 0;
  form: string | undefined;
  name = '';
  baseSpecies = '';
  sprite = '';
  releasedGO = false;
  moveType = MoveType.None;
  dps = 0;
  tdo = 0;

  constructor({ ...props }: IPokemonTopMove) {
    Object.assign(this, props);
  }
}

interface IeDPS {
  offensive: number;
  defensive: number;
}

export interface IPokemonQueryMove {
  fMove: ICombat;
  cMove: ICombat;
  eDPS: IeDPS;
}

export interface IPokemonQueryRankMove {
  data: IPokemonQueryMove[];
  maxOff?: number;
  maxDef?: number;
}

export interface IPokemonQueryCounter {
  pokemonId: number;
  pokemonName: string;
  pokemonForm: string | undefined;
  releasedGO: boolean;
  dps: number;
  fMove: ICombat;
  cMove: ICombat;
}

export class PokemonQueryCounter implements IPokemonQueryCounter {
  pokemonId = 0;
  pokemonName = '';
  pokemonForm: string | undefined;
  releasedGO = false;
  dps = 0;
  fMove = new Combat();
  cMove = new Combat();

  constructor({ ...props }: IPokemonQueryCounter) {
    Object.assign(this, props);
  }
}
