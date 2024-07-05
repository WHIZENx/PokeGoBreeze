import { IStatsPokemon } from '../../core/models/stats.model';

export interface ArrayStats {
  id: number;
  name: string;
  form: string;
  base_stats: IStatsPokemon;
  baseStatsPokeGo: {
    attack: number;
    defense: number;
    stamina: number;
  };
  baseStatsProd: number;
}
