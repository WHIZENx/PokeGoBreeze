import { Combat, ICombat } from '../../core/models/combat.model';

export interface IPokemonTopMove {
  num: number;
  forme: string | null;
  name: string;
  baseSpecies: string | null;
  sprite: string;
  releasedGO: boolean;
  isElite: boolean;
  isSpecial: boolean;
  dps: number;
  tdo: number;
}

export class PokemonTopMove implements IPokemonTopMove {
  num = 0;
  forme = '';
  name = '';
  baseSpecies = '';
  sprite = '';
  releasedGO = false;
  isElite = false;
  isSpecial = false;
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

export class EDPS implements IeDPS {
  offensive = 0;
  defensive = 0;

  static create(value: IeDPS) {
    const obj = new EDPS();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonQueryMove {
  fMove: ICombat;
  cMove: ICombat;
  eDPS: IeDPS;
}

export class PokemonQueryMove implements IPokemonQueryMove {
  fMove = new Combat();
  cMove = new Combat();
  eDPS = new EDPS();

  constructor({ ...props }: IPokemonQueryMove) {
    Object.assign(this, props);
  }
}

export interface IPokemonQueryRankMove {
  data: IPokemonQueryMove[];
  maxOff?: number;
  maxDef?: number;
}

export class PokemonQueryRankMove implements IPokemonQueryRankMove {
  data: IPokemonQueryMove[] = [];
  maxOff?: number;
  maxDef?: number;

  static create(value: IPokemonQueryRankMove) {
    const obj = new PokemonQueryRankMove();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonQueryCounter {
  pokemonId: number;
  pokemonName: string;
  pokemonForme: string | null;
  releasedGO: boolean;
  dps: number;
  fMove: ICombat;
  cMove: ICombat;
}

export class PokemonQueryCounter implements IPokemonQueryCounter {
  pokemonId = 0;
  pokemonName = '';
  pokemonForme = '';
  releasedGO = false;
  dps = 0;
  fMove = new Combat();
  cMove = new Combat();

  constructor({ ...props }: IPokemonQueryCounter) {
    Object.assign(this, props);
  }
}
