import { IAsset } from '../../../core/models/asset.model';
import { ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { IMovePokemonRanking, RankingsPVP } from '../../../core/models/pvp.model';
import { IStatsRank } from '../../../core/models/stats.model';
import { IStyleData } from '../../../util/models/util.model';
import { IPokemonBattleRanking } from './battle.model';

export interface HeaderComponent {
  data: IPokemonBattleRanking | undefined;
}

export interface BodyComponent {
  assets: IAsset[];
  pokemonData: IPokemonData[];
  data: RankingsPVP | undefined;
  cp: string | undefined;
  type: string | undefined;
  styleList: IStyleData[];
}

export interface TypeEffectiveComponent {
  types: string[] | undefined;
}

export interface OverAllStatsComponent {
  data: IPokemonBattleRanking | undefined;
  statsRanking: IStatsRank | null;
  cp: string | undefined;
  type: string | undefined;
}

export interface MoveSetComponent {
  moves: IMovePokemonRanking | undefined;
  pokemon: IPokemonData | undefined;
  combatData: ICombat[];
}
