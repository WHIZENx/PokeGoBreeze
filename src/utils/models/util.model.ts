import { IStatsPokemon, IStatsPokemonGO, StatsPokemon, StatsPokemonGO } from '../../core/models/stats.model';
import { DynamicObj } from '../extension';

export interface IArrayStats {
  id: number;
  name: string;
  form: string;
  baseStats: IStatsPokemon;
  statsGO: IStatsPokemonGO;
}

export class ArrayStats implements IArrayStats {
  id = 0;
  name = '';
  form = '';
  baseStats = new StatsPokemon();
  statsGO = new StatsPokemonGO();

  constructor({ ...props }: IArrayStats) {
    Object.assign(this, props);
  }
}

export interface IStyleData {
  style: string;
  property: DynamicObj<string> | undefined;
}

export class StyleData implements IStyleData {
  style = '';
  property: DynamicObj<string> | undefined;

  constructor({ ...props }: IStyleData) {
    Object.assign(this, props);
  }
}
