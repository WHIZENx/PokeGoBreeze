import { matchPath } from 'react-router-dom';
import APIService from './api.service';
import type { PokemonBundle } from '../core/models/API/pokemon-bundle.model';
import type { PvpPokemonApiResponse } from '../core/models/API/pvp-pokemon.model';
import type { ICombat } from '../core/models/combat.model';
import type { IPokemonTopMove } from '../utils/models/pokemon-top-move.model';
import type { IPokemonData } from '../core/models/pokemon.model';
import { toNumber } from '../utils/extension';
import { Params } from '../utils/constants';
import {
  defaultDamageConst,
  defaultDamageMultiply,
  defaultPokemonDefObj,
  defaultPokemonLevel,
  maxIv,
} from '../utils/helpers/options-context.helpers';

export type PreparedDetail<T> = { key: string } & ({ data: T; error?: never } | { data?: never; error: unknown });

export interface MoveApiResponse {
  data: { move: ICombat; topPokemon: IPokemonTopMove[] };
  meta: { total: number; resolvedType: string };
}

export const moveDetailsUrl = (query: Parameters<typeof APIService.getMoveDetails>[0]) =>
  APIService.getMoveDetails({
    iv: maxIv(),
    level: defaultPokemonLevel(),
    pokemonDefObj: defaultPokemonDefObj(),
    damageMultiply: defaultDamageMultiply(),
    damageConst: defaultDamageConst(),
    ...query,
  });

export const resolvePokemonRouteId = (key: string, pokemon: IPokemonData[]) => {
  const normalized = key.toLowerCase();
  return (
    toNumber(normalized) ||
    (pokemon.find(
      (entry) => entry.num > 0 && entry.pokemonId?.toString().replaceAll('_', '-').toLowerCase() === normalized
    )?.num ??
      0)
  );
};

export type RouteDetails = {
  pokemon?: PreparedDetail<PokemonBundle>;
  move?: PreparedDetail<MoveApiResponse>;
  pvp?: PreparedDetail<PvpPokemonApiResponse>;
};

async function prepareDetail<T>(key: string, request: Promise<T>): Promise<PreparedDetail<T>> {
  try {
    return { key, data: await request };
  } catch (error) {
    return { key, error };
  }
}

export async function prepareRouteDetails(
  location: { pathname: string; search: string },
  previousPath: string | undefined,
  pokemonId: (key: string) => number,
  signal: AbortSignal
): Promise<RouteDetails> {
  const pvp = matchPath('/pvp/:cp/:serie/:pokemon', location.pathname);
  if (pvp?.params.cp && /^\d+$/.test(pvp.params.cp)) {
    const { cp, serie, pokemon } = pvp.params;
    const type = (new URLSearchParams(location.search).get('leagueType') || 'overall').toLowerCase();
    const key = `${Number(cp)}:${serie}:${type}:${pokemon}`.toLowerCase();
    const url = APIService.getPvpPokemon({ series: serie, cp: Number(cp), type, name: pokemon });
    return {
      pvp: await prepareDetail(
        key,
        APIService.getFetchUrl<{ data: PvpPokemonApiResponse }>(url, { signal }).then(({ data }) => data.data)
      ),
    };
  }
  if (previousPath === location.pathname) {
    return {};
  }
  const pokemon = matchPath('/pokemon/:id', location.pathname);
  if (pokemon?.params.id) {
    const id = pokemonId(pokemon.params.id);
    if (id > 0) {
      return {
        pokemon: await prepareDetail(
          String(id),
          APIService.getPokemonBundle(id, { signal }).then(({ data }) => data.data)
        ),
      };
    }
  }
  const move = matchPath('/move/:id', location.pathname);
  if (move?.params.id) {
    const type = new URLSearchParams(location.search).get(Params.MoveType)?.toLowerCase();
    const url = moveDetailsUrl({
      key: move.params.id,
      type,
      released: true,
      match: false,
      q: '',
      sort: 'dps',
      order: 'desc',
      page: 1,
      limit: 10,
    });
    return {
      move: await prepareDetail(
        location.pathname + location.search,
        APIService.getFetchUrl<MoveApiResponse>(url, { signal }).then(({ data }) => data)
      ),
    };
  }
  return {};
}
