import { IStatsPokemon, StatsPokemon } from '../../core/models/stats.model';

interface IBaseStatsPokeGo {
  attack: number;
  defense: number;
  stamina: number;
}

export class BaseStatsPokeGo implements IBaseStatsPokeGo {
  attack = 0;
  defense = 0;
  stamina = 0;

  constructor({ ...props }: IBaseStatsPokeGo) {
    Object.assign(this, props);
  }
}

export interface IArrayStats {
  id: number;
  name: string;
  form: string;
  baseStats: IStatsPokemon;
  baseStatsPokeGo: IBaseStatsPokeGo | undefined;
  baseStatsProd: number;
}

// tslint:disable-next-line:max-classes-per-file
export class ArrayStats implements IArrayStats {
  id = 0;
  name = '';
  form = '';
  baseStats = new StatsPokemon();
  baseStatsPokeGo: IBaseStatsPokeGo | undefined;
  baseStatsProd = 0;

  constructor({ ...props }: IArrayStats) {
    Object.assign(this, props);
  }
}
