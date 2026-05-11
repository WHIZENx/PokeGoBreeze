import type pokemonStoreDataType from '../../data/pokemon.json';
import type textEngType from '../../data/text_english.json';
import { isInclude, isNotEmpty, safeObjectEntries, getValueOrDefault } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import { formArmor, formGalarian, formShadow } from '../../utils/helpers/options-context.helpers';
import { replacePokemonGoForm } from '../../utils/utils';

export let pokemonStoreData = {} as typeof pokemonStoreDataType;
export let textEng = {} as typeof textEngType;

let staticDataPromise: Promise<void> | undefined;

export const initializeStaticData = () => {
  if (!staticDataPromise) {
    staticDataPromise = Promise.all([import('../../data/pokemon.json'), import('../../data/text_english.json')]).then(
      ([pokemonMod, textMod]) => {
        pokemonStoreData = pokemonMod.default;
        textEng = textMod.default;
      }
    );
  }
  return staticDataPromise;
};

export const getTextWithKey = <T>(data: object, findKey: string | number) => {
  const result = safeObjectEntries(data).find(([key]) =>
    isInclude(key, findKey, IncludeMode.IncludeIgnoreCaseSensitive)
  );
  return result && isNotEmpty(result) ? (result[1] as T) : undefined;
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
