import { IStatsPokemon, StatsPokemon } from '../../core/models/stats.model';

export interface IArrayStats {
  id: number;
  name: string;
  form: string;
  baseStats: IStatsPokemon;
  baseStatsPokeGo:
    | {
        attack: number;
        defense: number;
        stamina: number;
      }
    | undefined;
  baseStatsProd: number;
}

export class ArrayStats implements IArrayStats {
  id: number = 0;
  name: string = '';
  form: string = '';
  baseStats: IStatsPokemon = new StatsPokemon();
  baseStatsPokeGo:
    | {
        attack: number;
        defense: number;
        stamina: number;
      }
    | undefined;
  baseStatsProd: number = 0;

  constructor({ ...props }: IArrayStats) {
    Object.assign(this, props);
  }
}
