import { PokemonType } from '../enums/type.enum';

interface PokemonFormRoutingConfig {
  formGalarian?: string;
  formGmax?: string;
  formHisuian?: string;
  formMega?: string;
  formNormal?: string;
  formPrimal?: string;
  formPurified?: string;
  formShadow?: string;
}

const config = JSON.parse(process.env.REACT_APP_CONFIG ?? '{}') as PokemonFormRoutingConfig;
const formGalarian = () => config.formGalarian ?? 'GALARIAN';
const formGmax = () => config.formGmax ?? 'GMAX';
const formHisuian = () => config.formHisuian ?? 'HISUIAN';
const formMega = () => config.formMega ?? 'MEGA';
const formNormal = () => config.formNormal ?? 'NORMAL';
const formPrimal = () => config.formPrimal ?? 'PRIMAL';
const formPurified = () => config.formPurified ?? 'PURIFIED';
const formShadow = () => config.formShadow ?? 'SHADOW';

const includesIgnoreCase = (value: string | number | null | undefined, search: string) =>
  String(value ?? '')
    .toLowerCase()
    .includes(search.toLowerCase());

const convertPokemonApiDataName = (text: string | undefined | null, defaultName = '') => {
  if (!text) {
    return defaultName;
  }
  return text
    .toUpperCase()
    .replaceAll('-', '_')
    .replace(/_PURIFIED$/, '')
    .replace(/_SHADOW$/, '')
    .replace(/^PURIFIED$/, '')
    .replace(/^SHADOW$/, '')
    .replace(/_MALE$/, '')
    .replace(/GALAR$/, formGalarian())
    .replace(/HISUI$/, formHisuian())
    .replace(/GALAR_/, `${formGalarian()}_`)
    .replace(/GALARIAN_STANDARD/, formGalarian())
    .replace(/_CAP$/, '')
    .replace(/PALDEA_COMBAT_BREED$/, 'PALDEA_COMBAT')
    .replace(/PALDEA_BLAZE_BREED$/, 'PALDEA_BLAZE')
    .replace(/PALDEA_AQUA_BREED$/, 'PALDEA_AQUA')
    .replace(/_NORMAL$/, '')
    .replace(/_POWER_CONSTRUCT$/, '')
    .replace(/_BATTLE_BOND$/, '')
    .replace(/_HISUI$/, `_${formHisuian()}`);
};

const isSpecialFormType = (pokemonType: PokemonType | undefined) =>
  pokemonType === PokemonType.Shadow || pokemonType === PokemonType.Purified;

const isPokemonNoneSpecialForm = (form: string | undefined, pokemonType = PokemonType.None) =>
  !isSpecialFormType(pokemonType) &&
  !(includesIgnoreCase(form, formShadow()) || includesIgnoreCase(form, formPurified()));

export const getPokemonType = (formName?: string | number | null, isMega = false, isShadow = true): PokemonType => {
  if (includesIgnoreCase(formName, formNormal())) {
    return PokemonType.Normal;
  }
  if (includesIgnoreCase(formName, formShadow()) && isShadow) {
    return PokemonType.Shadow;
  }
  if (includesIgnoreCase(formName, formPurified()) && isShadow) {
    return PokemonType.Purified;
  }
  if (includesIgnoreCase(formName, formGmax())) {
    return PokemonType.GMax;
  }
  if (includesIgnoreCase(formName, formPrimal())) {
    return PokemonType.Primal;
  }
  if (includesIgnoreCase(formName, formMega()) || isMega) {
    return PokemonType.Mega;
  }
  return PokemonType.None;
};

export const getPokemonFormWithNoneSpecialForm = (form: string | undefined, pokemonType = PokemonType.None) => {
  let normalizedForm = form?.toUpperCase().replaceAll('-', '_');
  if (isSpecialFormType(pokemonType)) {
    const modifier = PokemonType[pokemonType]?.toUpperCase();
    if (modifier) {
      normalizedForm = normalizedForm
        ?.replace(new RegExp(`_${modifier}$`), '')
        .replace(new RegExp(`^${modifier}$`), '');
    }
    return convertPokemonApiDataName(normalizedForm || formNormal());
  }
  return isPokemonNoneSpecialForm(normalizedForm, pokemonType)
    ? convertPokemonApiDataName(normalizedForm || formNormal())
    : normalizedForm;
};

export const generateParamForm = (form: string | undefined, pokemonType = PokemonType.None, prefix = '?') => {
  const specialForm = isSpecialFormType(pokemonType);
  const formType = PokemonType[pokemonType]?.toLowerCase();
  const normalizedForm = getPokemonFormWithNoneSpecialForm(form, pokemonType);
  const formParam = normalizedForm?.toLowerCase().replaceAll('_', '-');
  const hasBaseForm = Boolean(formParam) && formParam?.toLowerCase() !== formNormal().toLowerCase();

  if (specialForm) {
    const params = [...(hasBaseForm ? [`form=${formParam}`] : []), ...(formType ? [`formType=${formType}`] : [])];
    return params.length ? `${prefix}${params.join('&')}` : '';
  }
  return hasBaseForm ? `${prefix}form=${formParam}` : '';
};
