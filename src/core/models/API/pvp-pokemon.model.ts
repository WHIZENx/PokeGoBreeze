import { IPVPInfo } from '../pvp.model';
import { IPokemonBattleRanking } from '../../../pages/PVP/models/battle.model';

export interface PvpPokemonApiResponse extends IPokemonBattleRanking {
  league?: IPVPInfo;
}
