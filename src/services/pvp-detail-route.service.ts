import { matchPath } from 'react-router-dom';
import APIService from './api.service';
import type { PvpPokemonApiResponse } from '../core/models/API/pvp-pokemon.model';

export interface PreparedPvpDetail {
  requestKey: string;
  data: PvpPokemonApiResponse;
}

export const preparePvpDetailRoute = async (
  location: { pathname: string; search: string },
  signal: AbortSignal
): Promise<PreparedPvpDetail | undefined> => {
  const match = matchPath('/pvp/:cp/:serie/:pokemon', location.pathname);
  if (!match?.params.cp || !/^\d+$/.test(match.params.cp)) {
    return undefined;
  }
  const { cp, serie, pokemon } = match.params;
  const type = (new URLSearchParams(location.search).get('leagueType') || 'overall').toLowerCase();
  const [response] = await Promise.all([
    APIService.getFetchUrl<{ data: PvpPokemonApiResponse }>(
      APIService.getPvpPokemon({ series: serie, cp: Number(cp), type, name: pokemon }),
      { signal }
    ),
    import('../pages/PVP/Pokemon/Pokemon'),
  ]);
  return { requestKey: `${Number(cp)}:${serie}:${type}:${pokemon}`.toLowerCase(), data: response.data.data };
};
