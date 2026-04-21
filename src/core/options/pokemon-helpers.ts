import { getValueOrDefault, isEqual, isIncludeList, isNotEmpty, toNumber } from '../../utils/extension';
import { formNormal } from '../../utils/helpers/options-context.helpers';
import { convertPokemonDataName } from '../../utils/utils';
import { PokemonDataGM } from '../models/options.model';
import { pokemonStoreData } from './_shared';

export const findPokemonData = (id: number, name: string, isDefault = false) =>
  Object.values(pokemonStoreData).find((pokemon) => {
    const slugToCompare = isDefault ? pokemon.slug : (pokemon.baseFormeSlug ?? pokemon.slug);
    const convertedSlug = convertPokemonDataName(slugToCompare);
    return pokemon.num === id && isEqual(name, convertedSlug);
  });

export const optionFormNoneSpecial = (data: PokemonDataGM[], result: string[] = []) => {
  data
    .filter((item) => /^FORMS_V\d{4}_POKEMON_*/g.test(item.templateId) && isNotEmpty(item.data.formSettings.forms))
    .forEach((item) => {
      item.data.formSettings.forms.forEach((f) => {
        if (f.form && !f.isCostume && !f.assetBundleSuffix) {
          result.push(f.form);
        }
      });
    });

  return result;
};

export const checkDefaultStats = (data: PokemonDataGM[], pokemon: PokemonDataGM) => {
  const id = toNumber(getValueOrDefault(Array, pokemon.templateId.match(/\d{4}/g))[0]);
  const defaultPokemon = data.find(
    (item) =>
      item.data.pokemonSettings &&
      !item.data.pokemonSettings.form &&
      item.templateId.startsWith(`V${id.toString().padStart(4, '0')}_POKEMON_`)
  );
  return (
    defaultPokemon &&
    defaultPokemon.data.pokemonSettings.stats &&
    pokemon.data.pokemonSettings.stats &&
    (pokemon.data.pokemonSettings.stats.baseAttack !== defaultPokemon.data.pokemonSettings.stats.baseAttack ||
      pokemon.data.pokemonSettings.stats.baseDefense !== defaultPokemon.data.pokemonSettings.stats.baseDefense ||
      pokemon.data.pokemonSettings.stats.baseStamina !== defaultPokemon.data.pokemonSettings.stats.baseStamina)
  );
};

export const applyPokemonReleasedGO = (data: PokemonDataGM[], pokemon: PokemonDataGM, forms: string[]) => {
  const isReleaseGO = !isIncludeList(forms, pokemon.data.pokemonSettings.form) && checkDefaultStats(data, pokemon);
  if (isReleaseGO) {
    pokemon.data.pokemonSettings.isForceReleaseGO = true;
  }
  return isReleaseGO;
};

export const pokemonDefaultForm = (data: PokemonDataGM[]) => {
  const forms = optionFormNoneSpecial(data);
  return data.filter(
    (item) =>
      /^V\d{4}_POKEMON_*/g.test(item.templateId) &&
      item.data.pokemonSettings &&
      (!item.data.pokemonSettings.form ||
        applyPokemonReleasedGO(data, item, forms) ||
        isIncludeList(forms, item.data.pokemonSettings.form)) &&
      !item.data.pokemonSettings.form?.toString().endsWith(formNormal())
  );
};
