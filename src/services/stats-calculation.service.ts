import { IStatsPokemonGO } from '../core/models/stats.model';
import { BattleBaseStats, IBattleBaseStats } from '../utils/models/calculate.model';
import {
  cpDiffRatio,
  maxIv,
  maxLevel,
  minCp,
  minIv,
  minLevel,
  stepLevel,
} from '../utils/helpers/options-context.helpers';
import APIService from './api.service';

class StatsCalculationService {
  async getTopRank(
    stats: IStatsPokemonGO | undefined,
    id: number,
    maxCp: number,
    level = maxLevel(),
    signal?: AbortSignal
  ) {
    const query = new URLSearchParams({
      atk: String(stats?.atk ?? 0),
      def: String(stats?.def ?? 0),
      sta: String(stats?.sta ?? 0),
      id: String(id),
      maxCp: String(maxCp),
      minCp: String(minCp()),
      minLevel: String(minLevel()),
      maxLevel: String(maxLevel()),
      level: String(level),
      step: String(stepLevel()),
      minIv: String(minIv()),
      maxIv: String(maxIv()),
      cpDiff: String(cpDiffRatio()),
    });
    const response = await APIService.getFetchUrl<{ data: IBattleBaseStats }>(APIService.getTopRank(query), {
      signal,
    });
    return BattleBaseStats.create(response.data.data);
  }
}

export default new StatsCalculationService();
