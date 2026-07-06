import { getValueOrDefault, isEqual, isIncludeList, isNotEmpty, toNumber } from '../../utils/extension';
import { formNormal } from '../../utils/helpers/options-context.helpers';
import { convertPokemonDataName } from '../../utils/utils';
import { PokemonDataGM } from '../models/options.model';
import { pokemonStoreData } from './_shared';

type PokemonStoreEntry = (typeof pokemonStoreData)[keyof typeof pokemonStoreData];

// Lazily built on first call — pokemonStoreData is populated after initializeStaticData() resolves
let _pokemonLookupCache: Map<string, PokemonStoreEntry> | null = null;

const getPokemonLookupMap = () => {
  if (!_pokemonLookupCache) {
    _pokemonLookupCache = new Map();
    for (const pokemon of Object.values(pokemonStoreData)) {
      const defaultKey = `${pokemon.num}|${convertPokemonDataName(pokemon.slug)}`;
      _pokemonLookupCache.set(defaultKey, pokemon);
      if (pokemon.baseFormeSlug && pokemon.baseFormeSlug !== pokemon.slug) {
        const formKey = `${pokemon.num}|${convertPokemonDataName(pokemon.baseFormeSlug)}`;
        _pokemonLookupCache.set(formKey, pokemon);
      }
    }
  }
  return _pokemonLookupCache;
};

export const invalidatePokemonLookupCache = () => {
  _pokemonLookupCache = null;
};

export const findPokemonData = (id: number, name: string, isDefault = false) => {
  const map = getPokemonLookupMap();
  const key = `${id}|${name}`;
  const hit = map.get(key);
  if (hit) {
    const slugToCompare = isDefault ? hit.slug : (hit.baseFormeSlug ?? hit.slug);
    if (isEqual(name, convertPokemonDataName(slugToCompare))) {
      return hit;
    }
  }
  // Fallback for edge cases not covered by the map keys
  return Object.values(pokemonStoreData).find((pokemon) => {
    const slugToCompare = isDefault ? pokemon.slug : (pokemon.baseFormeSlug ?? pokemon.slug);
    return pokemon.num === id && isEqual(name, convertPokemonDataName(slugToCompare));
  });
};

export const optionFormNoneSpecial = (data: PokemonDataGM[], result: string[] = []) => {
  for (const item of data) {
    if (/^FORMS_V\d{4}_POKEMON_*/g.test(item.templateId) && isNotEmpty(item.data.formSettings.forms)) {
      for (const f of item.data.formSettings.forms) {
        if (f.form && !f.isCostume && !f.assetBundleSuffix) {
          result.push(f.form);
        }
      }
    }
  }
  return result;
};

export const checkDefaultStats = (defaultPokemonMap: Map<string, PokemonDataGM>, pokemon: PokemonDataGM) => {
  const id = toNumber(getValueOrDefault(Array, pokemon.templateId.match(/\d{4}/g))[0]);
  const key = `V${id.toString().padStart(4, '0')}_POKEMON_`;
  const defaultPokemon = defaultPokemonMap.get(key);
  return (
    defaultPokemon &&
    defaultPokemon.data.pokemonSettings.stats &&
    pokemon.data.pokemonSettings.stats &&
    (pokemon.data.pokemonSettings.stats.baseAttack !== defaultPokemon.data.pokemonSettings.stats.baseAttack ||
      pokemon.data.pokemonSettings.stats.baseDefense !== defaultPokemon.data.pokemonSettings.stats.baseDefense ||
      pokemon.data.pokemonSettings.stats.baseStamina !== defaultPokemon.data.pokemonSettings.stats.baseStamina)
  );
};

export const applyPokemonReleasedGO = (
  defaultPokemonMap: Map<string, PokemonDataGM>,
  pokemon: PokemonDataGM,
  forms: string[]
) => {
  const isReleaseGO =
    !isIncludeList(forms, pokemon.data.pokemonSettings.form) && checkDefaultStats(defaultPokemonMap, pokemon);
  if (isReleaseGO) {
    pokemon.data.pokemonSettings.isForceReleaseGO = true;
  }
  return isReleaseGO;
};

export const pokemonDefaultForm = (data: PokemonDataGM[]) => {
  const forms = optionFormNoneSpecial(data);
  const formsSet = new Set(forms);

  // Pre-build map of default (no-form) pokemon templates keyed by "V####_POKEMON_" prefix
  const defaultPokemonMap = new Map<string, PokemonDataGM>();
  for (const item of data) {
    if (/^V\d{4}_POKEMON_/g.test(item.templateId) && item.data.pokemonSettings && !item.data.pokemonSettings.form) {
      const prefix = item.templateId.slice(0, 14); // "V####_POKEMON_" is 14 chars
      defaultPokemonMap.set(prefix, item);
    }
  }

  const formNormalSuffix = formNormal();
  return data.filter((item) => {
    if (!/^V\d{4}_POKEMON_/g.test(item.templateId) || !item.data.pokemonSettings) {
      return false;
    }
    const form = item.data.pokemonSettings.form?.toString();
    if (form?.endsWith(formNormalSuffix)) {
      return false;
    }
    if (!form) {
      return true;
    }
    if (formsSet.has(form)) {
      return true;
    }
    return applyPokemonReleasedGO(defaultPokemonMap, item, forms);
  });
};
