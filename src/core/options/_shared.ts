import type pokemonStoreDataType from '../../data/pokemon.json';
import type textEngType from '../../data/text_english.json';
import { isInclude, safeObjectEntries, getValueOrDefault } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import { formArmor, formGalarian, formShadow } from '../../utils/helpers/options-context.helpers';
import { replacePokemonGoForm } from '../../utils/utils';

export let pokemonStoreData = {} as typeof pokemonStoreDataType;
export let textEng = {} as typeof textEngType;

let staticDataPromise: Promise<void> | undefined;

// Case-insensitive lookup Map built once after textEng is loaded
let _textEngMap: Map<string, unknown> | null = null;

const getTextEngMap = (data: object): Map<string, unknown> => {
  if (!_textEngMap || data !== textEng) {
    _textEngMap = new Map(safeObjectEntries(data).map(([k, v]) => [k.toLowerCase(), v]));
  }
  return _textEngMap;
};

export const initializeStaticData = () => {
  if (!staticDataPromise) {
    staticDataPromise = Promise.all([import('../../data/pokemon.json'), import('../../data/text_english.json')]).then(
      ([pokemonMod, textMod]) => {
        pokemonStoreData = pokemonMod.default;
        textEng = textMod.default;
        _textEngMap = null; // Invalidate cache when data reloads
      }
    );
  }
  return staticDataPromise;
};

export const getTextWithKey = <T>(data: object, findKey: string | number) => {
  const map = getTextEngMap(data);
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
