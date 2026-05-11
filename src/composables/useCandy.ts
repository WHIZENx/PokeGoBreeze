import { useCallback } from 'react';
import { IPokemonData } from '../core/models/pokemon.model';
import { PokemonType } from '../enums/type.enum';
import { isEqual, isNotEmpty } from '../utils/extension';
import { EqualMode } from '../utils/enums/string.enum';
import { APIUrl } from '../services/constants';
import APIService from '../services/api.service';
import candyColorData from '../data/pokemon_candy_color_data.json';
import useDataStore from './useDataStore';
import { ICandy, IFamilyMember, IUpstreamCandyData } from '../core/models/candy.model';

/**
 * useCandy — converts upstream Pokemon candy color data (PokeMiners format)
 * into the local format used by src/data/pokemon_candy_color_data.json.
 *
 * Upstream shape (PascalCase, flat — no family roster):
 *   { m_Name, CandyColors: [{ FamilyId, PrimaryColor, SecondaryColor }] }
 *
 * Local shape (camelCase, with derived familyGroup + familyName):
 *   [{ primaryColor, secondaryColor, familyGroup: [{id,name}], familyId, familyName }]
 *
 * Strategy:
 *   - For FamilyIds present in the existing local file, REUSE familyGroup + familyName
 *     (the upstream has no roster info, so we preserve what we already know).
 *     Colors are refreshed from upstream.
 *   - For NEW FamilyIds, DERIVE familyGroup by walking the evolution chain in
 *     pokemonsData (Redux store), and build familyName as `FAMILY_<POKEMON>`.
 */

const getPokemonIdString = (pokemon: IPokemonData): string => {
  if (typeof pokemon.pokemonId === 'string') {
    return pokemon.pokemonId.toUpperCase();
  }
  return pokemon.name?.toUpperCase() ?? '';
};

// Walk the evolution tree from a Pokemon (by pokedex number) and collect all
// members of the family as { id, name } entries.
const walkFamily = (startId: number, pokemons: IPokemonData[]): IFamilyMember[] => {
  const members: IFamilyMember[] = [];
  const visited = new Set<number>();

  const visit = (num: number) => {
    if (visited.has(num)) {
      return;
    }
    visited.add(num);

    // Use the Normal (base) form only — avoid pulling in Mega/Shadow/etc.
    const p = pokemons.find((x) => x.num === num && x.pokemonType === PokemonType.Normal);
    if (!p) {
      return;
    }

    members.push({ id: p.num, name: getPokemonIdString(p) });

    p.evos?.forEach((evoName) => {
      const evoPokemon = pokemons.find(
        (x) => isEqual(x.name, evoName, EqualMode.IgnoreCaseSensitive) && x.pokemonType === PokemonType.Normal
      );
      if (evoPokemon) {
        visit(evoPokemon.num);
      }
    });
  };

  visit(startId);
  return members.sort((a, b) => a.id - b.id);
};

export const useCandy = () => {
  const { pokemonsData } = useDataStore();
  const existingData = candyColorData as ICandy[];

  const convertCandyColorData = useCallback(
    (upstream: IUpstreamCandyData): ICandy[] => {
      if (!upstream || !isNotEmpty(upstream.CandyColors)) {
        return existingData;
      }

      const existingByFamilyId = new Map(existingData.map((c) => [c.familyId, c]));
      const result: ICandy[] = [];

      upstream.CandyColors.forEach((entry) => {
        const existing = existingByFamilyId.get(entry.FamilyId);
        if (existing) {
          // Known family: preserve roster + name, refresh colors from upstream
          result.push({
            ...existing,
            primaryColor: entry.PrimaryColor,
            secondaryColor: entry.SecondaryColor,
          });
          return;
        }

        // New family: derive roster + name from Pokemon data
        const leadPokemon = pokemonsData.find((p) => p.num === entry.FamilyId && p.pokemonType === PokemonType.Normal);
        const leadName = leadPokemon ? getPokemonIdString(leadPokemon) : `UNKNOWN_${entry.FamilyId}`;
        const familyGroup = isNotEmpty(pokemonsData)
          ? walkFamily(entry.FamilyId, pokemonsData)
          : [{ id: entry.FamilyId, name: leadName }];

        result.push({
          primaryColor: entry.PrimaryColor,
          secondaryColor: entry.SecondaryColor,
          familyGroup: isNotEmpty(familyGroup) ? familyGroup : [{ id: entry.FamilyId, name: leadName }],
          familyId: entry.FamilyId,
          familyName: `FAMILY_${leadName}`,
        });
      });

      return result;
    },
    [pokemonsData, existingData]
  );

  const fetchAndConvert = useCallback(async (): Promise<ICandy[]> => {
    const { data } = await APIService.getFetchUrl<IUpstreamCandyData>(APIUrl.CANDY_DATA);
    return convertCandyColorData(data);
  }, [convertCandyColorData]);

  return {
    candyData: existingData,
    convertCandyColorData,
    fetchAndConvert,
  };
};

export default useCandy;
