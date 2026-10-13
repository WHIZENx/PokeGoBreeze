import { getValueOrDefault, isEqual, isNotEmpty } from '../utils/extension';
import { formNormal, formStandard } from '../utils/helpers/options-context.helpers';
import { PokemonSearching } from '../core/models/pokemon-searching.model';
import { EqualMode } from '../utils/enums/string.enum';
import { IPokemonData, PokemonData, PokemonModel } from '../core/models/pokemon.model';
import { convertPokemonAPIDataName, getAllMoves, getPokemonFormWithNoneSpecialForm } from '../utils/utils';
import {
  IPokemonFormDetail,
  IPokemonFormModify,
  PokemonFormModifyModel,
  PokemonSprite,
} from '../core/models/API/form.model';
import { PokemonType } from '../enums/type.enum';
import { versionList } from '../utils/constants';
import useDataStore from './useDataStore';
import { useCallback, useMemo } from 'react';

const pvpokeSpeciesAliases: Readonly<Record<string, string>> = {
  AEGISLASH_SHIELD: 'AEGISLASH',
  CALYREX_ICE: 'CALYREX_ICE_RIDER',
  CALYREX_SHADOW: 'CALYREX_SHADOW_RIDER',
  CLODSIRESB: 'CLODSIRE',
  DARMANITAN_GALARIAN_STANDARD: 'DARMANITAN_GALARIAN',
  GOLISOPODSH: 'GOLISOPOD',
  LANTURNW: 'LANTURN',
  MEWTWO_ARMORED: 'MEWTWO_ARMOR',
  TAUROS_AQUA: 'TAUROS_PALDEA_AQUA',
  TAUROS_BLAZE: 'TAUROS_PALDEA_BLAZE',
  TAUROS_COMBAT: 'TAUROS_PALDEA_COMBAT',
  UNOWN: 'A',
  ZACIAN_CROWNED: 'ZACIAN_CROWNED_SWORD',
  ZAMAZENTA_CROWNED: 'ZAMAZENTA_CROWNED_SHIELD',
  ZYGARDE_10: 'ZYGARDE_TEN_PERCENT',
};

const normalizePvpokeSpeciesId = (speciesId: string) =>
  speciesId
    .trim()
    .replaceAll('-', '_')
    .toUpperCase()
    .replace(/_ALOLAN$/, '_ALOLA')
    .replace(/_PALDEAN$/, '_PALDEA');

const normalizePokemonForm = (value: string | undefined) =>
  (value ?? '').trim().replaceAll('-', '_').replaceAll(' ', '_').toUpperCase();

const getPokemonFormCandidates = (pokemons: IPokemonData[], form: string, pokemonType: PokemonType) => {
  const candidates = new Set([
    normalizePokemonForm(form).replace(`_${formStandard()}`, ''),
    normalizePokemonForm(getPokemonFormWithNoneSpecialForm(form, pokemonType)).replace(`_${formStandard()}`, ''),
  ]);
  const id = pokemons[0]?.num;
  [...candidates].forEach((candidate) => {
    if (id === 422 || id === 423) {
      candidates.add(candidate.replace(/_EAST$/, '_EAST_SEA').replace(/_WEST$/, '_WEST_SEA'));
      candidates.add(candidate.replace(/^EAST$/, 'EAST_SEA').replace(/^WEST$/, 'WEST_SEA'));
    } else if (id === 718) {
      candidates.add(candidate.replace(/_10$/, '_TEN_PERCENT').replace(/_50$/, '_FIFTY_PERCENT'));
      candidates.add(candidate.replace(/^10$/, 'TEN_PERCENT').replace(/^50$/, 'FIFTY_PERCENT'));
    } else if (id === 741) {
      candidates.add(candidate.replace(/POM_POM$/, 'POMPOM'));
    } else if (id === 801) {
      candidates.add(candidate.replace(/_ORIGINAL$/, '_ORIGINAL_COLOR').replace(/^ORIGINAL$/, 'ORIGINAL_COLOR'));
    } else if (id === 888) {
      candidates.add(candidate.replace(/_CROWNED$/, '_CROWNED_SWORD').replace(/^CROWNED$/, 'CROWNED_SWORD'));
    } else if (id === 889) {
      candidates.add(candidate.replace(/_CROWNED$/, '_CROWNED_SHIELD').replace(/^CROWNED$/, 'CROWNED_SHIELD'));
    } else if (id === 898) {
      candidates.add(candidate.replace(/_ICE$/, '_ICE_RIDER').replace(/^ICE$/, 'ICE_RIDER'));
      candidates.add(candidate.replace(/_SHADOW$/, '_SHADOW_RIDER').replace(/^SHADOW$/, 'SHADOW_RIDER'));
    } else if (id === 716) {
      candidates.add(candidate.replace(/_ACTIVE$/, '').replace(/^ACTIVE$/, formNormal()));
    }
  });
  return candidates;
};

export const resolvePokemonForm = (
  pokemons: IPokemonData[],
  form: string | undefined,
  pokemonType = PokemonType.None
) => {
  if (!form) {
    return pokemons.find(
      (pokemon) =>
        isEqual(pokemon.form, formNormal(), EqualMode.IgnoreCaseSensitive) ||
        (isNotEmpty(pokemon.baseForme) && isEqual(pokemon.baseForme, pokemon.form, EqualMode.IgnoreCaseSensitive))
    );
  }
  const requestedForms = getPokemonFormCandidates(pokemons, form, pokemonType);
  return pokemons.find(
    (pokemon) =>
      requestedForms.has(normalizePokemonForm(pokemon.fullName)) ||
      requestedForms.has(normalizePokemonForm(pokemon.form))
  );
};

export const usePokemon = () => {
  const { pokemonsData } = useDataStore();
  const validPokemons = useMemo(() => pokemonsData.filter((pokemon) => pokemon.num > 0), [pokemonsData]);
  const pokemonsById = useMemo(() => {
    const result = new Map<number, IPokemonData[]>();
    validPokemons.forEach((pokemon) => {
      const matches = result.get(pokemon.num);
      if (matches) {
        matches.push(pokemon);
      } else {
        result.set(pokemon.num, [pokemon]);
      }
    });
    return result;
  }, [validPokemons]);
  const evolutionParents = useMemo(() => {
    const result = new Map<string, IPokemonData[]>();
    validPokemons.forEach((pokemon) => {
      pokemon.evoList?.forEach((evolution) => {
        const key = `${evolution.evoToId}:${evolution.evoToForm?.toUpperCase() ?? formNormal()}`;
        const parents = result.get(key);
        if (parents) {
          parents.push(pokemon);
        } else {
          result.set(key, [pokemon]);
        }
      });
    });
    return result;
  }, [validPokemons]);
  const pokemonBySlug = useMemo(() => {
    const result = new Map<string, IPokemonData>();
    validPokemons.forEach((pokemon) => {
      if (!pokemon.slug) {
        return;
      }

      const slug = pokemon.slug.toLowerCase();
      const current = result.get(slug);
      const pokemonPriority = Number(pokemon.releasedGO) * 2 + Number(getAllMoves(pokemon).length > 0);
      const currentPriority = current ? Number(current.releasedGO) * 2 + Number(getAllMoves(current).length > 0) : -1;
      if (!current || pokemonPriority > currentPriority) {
        result.set(slug, pokemon);
      }
    });
    return result;
  }, [validPokemons]);
  const pokemonByPvpokeSpeciesId = useMemo(() => {
    const result = new Map<string, IPokemonData>();
    validPokemons.forEach((pokemon) => {
      if (pokemon.fullName) {
        result.set(pokemon.fullName.toUpperCase(), pokemon);
      }
    });
    return result;
  }, [validPokemons]);
  const defaultPokemons = useMemo(
    () =>
      validPokemons
        .filter(
          (pokemon) =>
            pokemon.form === formNormal() || (isNotEmpty(pokemon.baseForme) && isEqual(pokemon.baseForme, pokemon.form))
        )
        .sort((a, b) => a.num - b.num),
    [validPokemons]
  );
  const pokemonNames = useMemo(
    () => defaultPokemons.map((pokemon) => new PokemonSearching(pokemon)),
    [defaultPokemons]
  );

  /**
   * Returns a filtered version of the pokemons data based on the provided filter function
   * @param filterFn - A function to filter the pokemons array
   * @returns The filtered array of IPokemonData
   */
  const getFilteredPokemons = useCallback(
    (filterFn?: (item: IPokemonData) => boolean | undefined) => {
      return filterFn ? validPokemons.filter(filterFn) : validPokemons;
    },
    [validPokemons]
  );

  /**
   * Returns a find version of the pokemons data based on the provided find function
   * @param findFn - A function to find the pokemons array
   * @returns The IPokemonData
   */
  const getFindPokemon = useCallback(
    (findFn?: (item: IPokemonData) => boolean | undefined) => {
      return findFn ? validPokemons.find(findFn) : validPokemons[0];
    },
    [validPokemons]
  );

  const findPokemonById = useCallback(
    (id: number | undefined) => {
      return id === undefined ? undefined : resolvePokemonForm(pokemonsById.get(id) ?? [], undefined);
    },
    [pokemonsById]
  );

  const findPokemonBySlug = useCallback(
    (name: string | undefined) => {
      return name ? pokemonBySlug.get(name.toLowerCase()) : undefined;
    },
    [pokemonBySlug]
  );

  const findPokemonByPvpokeSpeciesId = useCallback(
    (speciesId: string | undefined) => {
      if (!speciesId) {
        return undefined;
      }
      const findExact = (key: string) =>
        pokemonByPvpokeSpeciesId.get(pvpokeSpeciesAliases[key] ?? '') ?? pokemonByPvpokeSpeciesId.get(key);
      const key = normalizePvpokeSpeciesId(speciesId);
      return findExact(key) ?? findExact(key.replace(/_XS$/, '')) ?? findExact(key.replace(/_SHADOW$/, ''));
    },
    [pokemonByPvpokeSpeciesId]
  );

  const isPvpokeShadowPokemon = useCallback(
    (speciesId: string | undefined) => {
      if (!speciesId) {
        return false;
      }
      const key = normalizePvpokeSpeciesId(speciesId);
      if (!key.endsWith('_SHADOW')) {
        return false;
      }
      const findExact = (candidate: string) =>
        pokemonByPvpokeSpeciesId.has(candidate) || pokemonByPvpokeSpeciesId.has(pvpokeSpeciesAliases[candidate] ?? '');
      return !findExact(key) && findExact(key.replace(/_SHADOW$/, ''));
    },
    [pokemonByPvpokeSpeciesId]
  );

  const findPokemonByIdAndForm = useCallback(
    (id: number | undefined, form: string | undefined) => {
      if (id === undefined) {
        return undefined;
      }
      return resolvePokemonForm(pokemonsById.get(id) ?? [], form);
    },
    [pokemonsById]
  );

  const getEvolutionParents = useCallback(
    (id: number | undefined, form: string | undefined) => {
      if (id === undefined) {
        return [];
      }
      const normalizedForm = form?.replace(`_${formStandard()}`, '').toUpperCase() ?? formNormal();
      return evolutionParents.get(`${id}:${normalizedForm}`) ?? [];
    },
    [evolutionParents]
  );

  const checkPokemonGO = useCallback(
    (id: number, name: string | undefined) =>
      pokemonsById.get(id)?.find((pokemon) => isEqual(pokemon.fullName, name))?.releasedGO,
    [pokemonsById]
  );

  const getDefaultPokemons = useCallback(() => defaultPokemons, [defaultPokemons]);

  const mappingPokemonName = useCallback(() => pokemonNames, [pokemonNames]);

  const getPokemonById = useCallback(
    (id: number) => {
      const result = pokemonsById
        .get(id)
        ?.find(
          (pokemon) =>
            isEqual(pokemon.form, formNormal(), EqualMode.IgnoreCaseSensitive) ||
            (isNotEmpty(pokemon.baseForme) && isEqual(pokemon.baseForme, pokemon.form, EqualMode.IgnoreCaseSensitive))
        );
      if (!result) {
        return;
      }
      return new PokemonModel(result.num, result.name);
    },
    [pokemonsById]
  );

  const checkPokemonIncludeShadowForm = useCallback(
    (form: string) =>
      validPokemons.some(
        (p) =>
          p.hasShadowForm && isEqual(convertPokemonAPIDataName(form), getValueOrDefault(String, p.fullName, p.name))
      ),
    [validPokemons]
  );

  const generatePokemonGoForms = (
    dataFormList: IPokemonFormDetail[][],
    formListResult: IPokemonFormModify[][],
    id: number,
    name: string,
    index = 0
  ) => {
    const apiForms = dataFormList.flatMap((form) => form);
    (pokemonsById.get(id) ?? []).forEach((pokemon) => {
      const isDefaultPokemonGoForm =
        isEqual(pokemon.form, formNormal(), EqualMode.IgnoreCaseSensitive) ||
        (isNotEmpty(pokemon.baseForme) && isEqual(pokemon.baseForme, pokemon.form, EqualMode.IgnoreCaseSensitive));
      const isIncludeFormGO =
        (isDefaultPokemonGoForm && apiForms.some((form) => form.isDefault)) ||
        apiForms.some(
          (form) => resolvePokemonForm([pokemon], form.formName, pokemon.pokemonType)?.fullName === pokemon.fullName
        );
      if (!isIncludeFormGO) {
        index--;
        const pokemonGOModify = new PokemonFormModifyModel(
          id,
          name,
          pokemon.pokemonId?.toString().replaceAll('_', '-')?.toLowerCase(),
          pokemon.form?.replaceAll('_', '-')?.toLowerCase(),
          pokemon.fullName?.replaceAll('_', '-')?.toLowerCase(),
          versionList[0].replace(' ', '-'),
          pokemon.types,
          new PokemonSprite(),
          index,
          pokemon.pokemonType,
          false
        );
        formListResult.push([pokemonGOModify]);
      }
    });

    return index;
  };

  const retrieveMoves = useCallback(
    (id: number | undefined, form: string | undefined, pokemonType = PokemonType.None) => {
      const idPokemons = id === undefined ? [] : (pokemonsById.get(id) ?? []);
      if (isNotEmpty(idPokemons)) {
        const result = resolvePokemonForm(idPokemons, form, pokemonType);
        return result ? PokemonData.copy(result) : undefined;
      }
    },
    [pokemonsById]
  );

  const getPokemonDetails = useCallback(
    (id: number | undefined, form: string | undefined, pokemonType = PokemonType.None, isDefault = false) => {
      if (form) {
        const name = getPokemonFormWithNoneSpecialForm(form.replace(/UNOWN-/i, '').replaceAll(' ', '-'), pokemonType);
        const idPokemons = id === undefined ? [] : (pokemonsById.get(id) ?? []);
        let pokemonForm = resolvePokemonForm(idPokemons, name, pokemonType);

        if (isDefault && !pokemonForm) {
          pokemonForm = idPokemons.find(
            (item) => item.form === formNormal() || (isNotEmpty(item.baseForme) && isEqual(item.baseForme, item.form))
          );
        }
        return PokemonData.copyWithCreate(pokemonForm);
      }
      return new PokemonData();
    },
    [pokemonsById]
  );

  return {
    getFilteredPokemons,
    getFindPokemon,
    findPokemonById,
    findPokemonBySlug,
    findPokemonByPvpokeSpeciesId,
    isPvpokeShadowPokemon,
    findPokemonByIdAndForm,
    getEvolutionParents,
    checkPokemonGO,
    getDefaultPokemons,
    mappingPokemonName,
    getPokemonById,
    generatePokemonGoForms,
    retrieveMoves,
    getPokemonDetails,
    checkPokemonIncludeShadowForm,
  };
};

export default usePokemon;
