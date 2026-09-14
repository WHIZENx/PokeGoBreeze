import { getValueOrDefault, isEqual, isInclude, isNotEmpty } from '../utils/extension';
import { formGmax, formNormal, formStandard } from '../utils/helpers/options-context.helpers';
import { PokemonSearching } from '../core/models/pokemon-searching.model';
import { EqualMode } from '../utils/enums/string.enum';
import { IPokemonData, PokemonData, PokemonModel } from '../core/models/pokemon.model';
import { convertPokemonAPIDataName, getPokemonFormWithNoneSpecialForm } from '../utils/utils';
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
  const pokemonByIdAndForm = useMemo(() => {
    const result = new Map<string, IPokemonData>();
    validPokemons.forEach((pokemon) => {
      result.set(`${pokemon.num}:${pokemon.form?.toUpperCase() ?? formNormal()}`, pokemon);
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
  const pokemonBySlug = useMemo(
    () => new Map(validPokemons.flatMap((pokemon) => (pokemon.slug ? [[pokemon.slug.toLowerCase(), pokemon]] : []))),
    [validPokemons]
  );
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
      return id === undefined ? undefined : pokemonsById.get(id)?.[0];
    },
    [pokemonsById]
  );

  const findPokemonBySlug = useCallback(
    (name: string | undefined) => {
      return name ? pokemonBySlug.get(name.toLowerCase()) : undefined;
    },
    [pokemonBySlug]
  );

  const findPokemonByIdAndForm = useCallback(
    (id: number | undefined, form: string | undefined) => {
      if (id === undefined) {
        return undefined;
      }
      if (!form) {
        return pokemonsById.get(id)?.[0];
      }
      const normalizedForm = form?.replace(`_${formStandard()}`, '').toUpperCase() ?? formNormal();
      return pokemonByIdAndForm.get(`${id}:${normalizedForm}`);
    },
    [pokemonByIdAndForm, pokemonsById]
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
    const formList = dataFormList
      .flatMap((form) => form)
      .map((p) => convertPokemonAPIDataName(p.formName, formNormal()));
    (pokemonsById.get(id) ?? []).forEach((pokemon) => {
      const isIncludeFormGO = formList.some((form) => isInclude(pokemon.form, form));
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
          PokemonType.Normal,
          false
        );
        formListResult.push([pokemonGOModify]);
      }
    });

    return index;
  };

  const retrieveMoves = (id: number | undefined, form: string | undefined, pokemonType = PokemonType.None) => {
    const idPokemons = id === undefined ? [] : (pokemonsById.get(id) ?? []);
    if (isNotEmpty(idPokemons)) {
      if (pokemonType === PokemonType.GMax) {
        return idPokemons.find((item) => isEqual(item.form, formGmax()));
      }
      const pokemonForm = getValueOrDefault(
        String,
        form?.replaceAll('-', '_').toUpperCase().replace(`_${formStandard()}`, '').replace(formGmax(), formNormal()),
        formNormal()
      );
      const result = idPokemons.find((item) => isEqual(item.fullName, pokemonForm) || isEqual(item.form, pokemonForm));
      return PokemonData.copy(result ?? idPokemons[0]);
    }
  };

  const getPokemonDetails = useCallback(
    (id: number | undefined, form: string | undefined, pokemonType = PokemonType.None, isDefault = false) => {
      if (form) {
        const name = getPokemonFormWithNoneSpecialForm(
          form
            .replace(/10$/, 'TEN_PERCENT')
            .replace(/50$/, 'FIFTY_PERCENT')
            .replace(/UNOWN-/i, '')
            .replaceAll(' ', '-'),
          pokemonType
        );
        const idPokemons = id === undefined ? [] : (pokemonsById.get(id) ?? []);
        let pokemonForm = idPokemons.find((item) => isEqual(item.fullName, name, EqualMode.IgnoreCaseSensitive));

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
