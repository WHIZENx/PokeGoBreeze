import type pokemonStoreDataType from '../../data/pokemon.json';
import { isInclude, safeObjectEntries, getValueOrDefault } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import { formArmor, formGalarian, formShadow } from '../../utils/helpers/options-context.helpers';
import { replacePokemonGoForm } from '../../utils/utils';
import APIService from '../../services/api.service';
import { APIUrl } from '../../services/constants';

export let pokemonStoreData = {} as typeof pokemonStoreDataType;
export let textEng: Record<string, string> = {};

let staticDataPromise: Promise<void> | undefined;

// Case-insensitive lookup Map built once after textEng is loaded
let _textEngMap: Map<string, string> | null = null;

const getTextEngMap = (data: Record<string, string>): Map<string, string> => {
  if (!_textEngMap || data !== textEng) {
    _textEngMap = new Map(Object.entries(data).map(([k, v]) => [k.toLowerCase(), v]));
  }
  return _textEngMap;
};

const getTextFileUrl = (lang: string) => `${APIUrl.TEXTFILE}i18n_${lang}.json`;

export const initializeStaticData = (lang = 'english') => {
  if (!staticDataPromise) {
    staticDataPromise = Promise.all([
      import('../../data/pokemon.json'),
      APIService.getFetchUrl<Record<string, string>>(getTextFileUrl(lang)),
    ]).then(([pokemonMod, textRes]) => {
      pokemonStoreData = pokemonMod.default;
      textEng = textRes.data;
      _textEngMap = null;
    });
  }
  return staticDataPromise;
};

export const getTextWithKey = <T>(data: object, findKey: string | number) => {
  const map = getTextEngMap(data as Record<string, string>);
  const needle = String(findKey).toLowerCase();
  // Fast path: direct match
  if (map.has(needle)) {
    return map.get(needle) as T;
  }
  // Slow path: substring match (isInclude semantics)
  for (const [key, value] of map) {
    if (isInclude(key, needle, IncludeMode.IncludeIgnoreCaseSensitive)) {
      return value as T;
    }
  }
  return undefined;
};

export const convertAndReplaceNameGO = (name: string | number, defaultName = ''): string => {
  const formName = getValueOrDefault(String, name.toString());
  let result = formName.replace(`${replacePokemonGoForm(defaultName)}_`, '');
  const formReplacements: Record<string, string> = {
    '^S$': formShadow(),
    '^A$': formArmor(),
    GALARIAN_STANDARD: formGalarian(),
  };

  safeObjectEntries(formReplacements).forEach(([pattern, replacement]) => {
    result = result.replace(new RegExp(pattern, 'gi'), replacement);
  });

  return result;
};
