import { IPokemonData } from '../../../core/models/pokemon.model';
import { IMovePokemonRanking, RankingsPVP } from '../../../core/models/pvp.model';
import { IStyleData } from '../../../utils/models/util.model';
import { IPokemonBattleRanking } from './battle.model';

export interface HeaderComponent {
  data: IPokemonBattleRanking | undefined;
}

export interface BodyComponent {
  data: RankingsPVP | undefined;
  cp: string | undefined;
  serie: string | null | undefined;
  type: string | null | undefined;
  styleList: IStyleData[];
}

export interface TypeEffectiveComponent {
  types: string[] | undefined;
}

export interface OverAllStatsComponent {
  data: IPokemonBattleRanking | undefined;
  cp: string | undefined;
  type: string | null | undefined;
}

export interface MoveSetComponent {
  moves: IMovePokemonRanking | undefined;
  pokemon: IPokemonData | undefined;
}
