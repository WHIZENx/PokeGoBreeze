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
  PokemonSprit,
} from '../core/models/API/form.model';
import { PokemonType } from '../enums/type.enum';
import { versionList } from '../utils/constants';
import useDataStore from './useDataStore';
import { useCallback } from 'react';

export const usePokemon = () => {
  const { pokemonsData } = useDataStore();

  /**
   * Returns a filtered version of the pokemons data based on the provided filter function
   * @param filterFn - A function to filter the pokemons array
   * @returns The filtered array of IPokemonData
   */
  const getFilteredPokemons = useCallback(
    (filterFn?: (item: IPokemonData) => boolean) => {
      return pokemonsData.filter((item) => item.num > 0 && (filterFn?.(item) || true));
    },
    [pokemonsData]
  );

  const checkPokemonGO = (id: number, name: string | undefined) =>
    getFilteredPokemons().find((pokemon) => pokemon.num === id && isEqual(pokemon.fullName, name))?.releasedGO;

  const mappingPokemonName = useCallback(
    () =>
      getFilteredPokemons()
        .filter(
          (pokemon) =>
            pokemon.num > 0 &&
            (pokemon.form === formNormal() || (pokemon.baseForme && isEqual(pokemon.baseForme, pokemon.form)))
        )
        .map((pokemon) => new PokemonSearching(pokemon))
        .sort((a, b) => a.id - b.id),
    [pokemonsData]
  );

  const getPokemonById = (id: number) => {
    const result = getFilteredPokemons()
      .filter((pokemon) => pokemon.num === id)
      .find(
        (pokemon) =>
          isEqual(pokemon.form, formNormal(), EqualMode.IgnoreCaseSensitive) ||
          (pokemon.baseForme && isEqual(pokemon.baseForme, pokemon.form, EqualMode.IgnoreCaseSensitive))
      );
    if (!result) {
      return;
    }
    return new PokemonModel(result.num, result.name);
  };

  const checkPokemonIncludeShadowForm = (form: string) =>
    getFilteredPokemons().some(
      (p) => p.hasShadowForm && isEqual(convertPokemonAPIDataName(form), getValueOrDefault(String, p.fullName, p.name))
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
    getFilteredPokemons()
      .filter((pokemon) => pokemon.num === id)
      .forEach((pokemon) => {
        const isIncludeFormGO = formList.some((form) => isInclude(pokemon.form, form));
        if (!isIncludeFormGO) {
          index--;
          const pokemonGOModify = new PokemonFormModifyModel(
            id,
            name,
            pokemon.pokemonId?.replaceAll('_', '-')?.toLowerCase(),
            pokemon.form?.replaceAll('_', '-')?.toLowerCase(),
            pokemon.fullName?.replaceAll('_', '-')?.toLowerCase(),
            versionList[0].replace(' ', '-'),
            pokemon.types,
            new PokemonSprit(),
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
    const filterPokemons = getFilteredPokemons();
    if (isNotEmpty(filterPokemons)) {
      if (pokemonType === PokemonType.GMax) {
        return filterPokemons.find((item) => item.num === id && isEqual(item.form, formGmax()));
      }
      const resultFilter = filterPokemons.filter((item) => item.num === id);
      const pokemonForm = getValueOrDefault(
        String,
        form?.replaceAll('-', '_').toUpperCase().replace(`_${formStandard()}`, '').replace(formGmax(), formNormal()),
        formNormal()
      );
      const result = resultFilter.find(
        (item) => isEqual(item.fullName, pokemonForm) || isEqual(item.form, pokemonForm)
      );
      return PokemonData.copy(result ?? resultFilter[0]);
    }
  };

  const getPokemonDetails = (
    id: number | undefined,
    form: string | undefined,
    pokemonType = PokemonType.None,
    isDefault = false
  ) => {
    if (form) {
      const name = getPokemonFormWithNoneSpecialForm(
        form
          .replace(/10$/, 'TEN_PERCENT')
          .replace(/50$/, 'FIFTY_PERCENT')
          .replace(/UNOWN-/i, '')
          .replaceAll(' ', '-'),
        pokemonType
      );
      const filterPokemons = getFilteredPokemons();
      let pokemonForm = filterPokemons.find(
        (item) => item.num === id && isEqual(item.fullName, name, EqualMode.IgnoreCaseSensitive)
      );

      if (isDefault && !pokemonForm) {
        pokemonForm = filterPokemons.find(
          (item) =>
            item.num === id && (item.form === formNormal() || (item.baseForme && isEqual(item.baseForme, item.form)))
        );
      }
      return PokemonData.copyWithCreate(pokemonForm);
    }
    return new PokemonData();
  };

  return {
    getFilteredPokemons,
    checkPokemonGO,
    mappingPokemonName,
    getPokemonById,
    generatePokemonGoForms,
    retrieveMoves,
    getPokemonDetails,
    checkPokemonIncludeShadowForm,
  };
};

export default usePokemon;
