import { StatsPokemon } from '../../core/models/stats.model';

export interface ArrayStats {
  id: number;
  name: string;
  base_stats: StatsPokemon;
  baseStatsPokeGo: {
    attack: number;
    defense: number;
    stamina: number;
  };
  baseStatsProd: number;
}
