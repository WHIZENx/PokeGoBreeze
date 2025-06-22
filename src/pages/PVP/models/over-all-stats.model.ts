import { BattleBaseStats, IBattleBaseStats } from '../../../utils/models/calculate.model';

export interface IPokemonAllStats {
  id: number;
  prevCurrentStats: IBattleBaseStats;
  currentStats: IBattleBaseStats;
  maxCP: number;
  level: number;
}

export class PokemonAllStats implements IPokemonAllStats {
  id = 0;
  prevCurrentStats = new BattleBaseStats();
  currentStats = new BattleBaseStats();
  maxCP = 0;
  level = 0;

  static create(value: IPokemonAllStats) {
    const obj = new PokemonAllStats();
    Object.assign(obj, value);
    return obj;
  }
}
