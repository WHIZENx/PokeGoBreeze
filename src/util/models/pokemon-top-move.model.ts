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
  num: number = 0;
  forme: string | null = '';
  name: string = '';
  baseSpecies: string | null = '';
  sprite: string = '';
  releasedGO: boolean = false;
  isElite: boolean = false;
  isSpecial: boolean = false;
  dps: number = 0;
  tdo: number = 0;

  constructor({ ...props }: IPokemonTopMove) {
    Object.assign(this, props);
  }
}

interface IeDPS {
  offensive: number;
  defensive: number;
}

// tslint:disable-next-line:max-classes-per-file
class EDPS implements IeDPS {
  offensive: number;
  defensive: number;

  constructor() {
    this.offensive = 0;
    this.defensive = 0;
  }
}

export interface IPokemonQueryMove {
  fmove: ICombat;
  cmove: ICombat;
  eDPS: IeDPS;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonQueryMove implements IPokemonQueryMove {
  fmove: ICombat = new Combat();
  cmove: ICombat = new Combat();
  eDPS: IeDPS = new EDPS();

  constructor({ ...props }: IPokemonQueryMove) {
    Object.assign(this, props);
  }
}

export interface IPokemonQueryRankMove {
  data: IPokemonQueryMove[];
  maxOff?: number;
  maxDef?: number;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonQueryRankMove implements IPokemonQueryRankMove {
  data: IPokemonQueryMove[] = [];
  maxOff?: number;
  maxDef?: number;

  constructor({ ...props }: IPokemonQueryRankMove) {
    Object.assign(this, props);
  }
}

export interface IPokemonQueryCounter {
  pokemon_id: number;
  pokemon_name: string;
  pokemon_forme: string | null;
  releasedGO: boolean;
  dps: number;
  fmove: ICombat;
  cmove: ICombat;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonQueryCounter implements IPokemonQueryCounter {
  // tslint:disable-next-line:variable-name
  pokemon_id: number = 0;
  // tslint:disable-next-line:variable-name
  pokemon_name: string = '';
  // tslint:disable-next-line:variable-name
  pokemon_forme: string | null = '';
  releasedGO: boolean = false;
  dps: number = 0;
  fmove: ICombat = new Combat();
  cmove: ICombat = new Combat();

  constructor({ ...props }: IPokemonQueryCounter) {
    Object.assign(this, props);
  }
}
