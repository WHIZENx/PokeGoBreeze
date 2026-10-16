const GENERIC_FORMS = new Set(['', 'BASE', 'DEFAULT', 'NONE', 'NORMAL', 'ORDINARY', 'STANDARD']);
const normalizeIdentity = (value: string | undefined) =>
  (value ?? '').trim().replaceAll('-', '_').replaceAll(' ', '_').toUpperCase();
const formatIdentity = (value: string | undefined) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const formatBattleStatsPokemonName = (name: string | undefined, form: string | undefined) => {
  const pokemonName = formatIdentity(name);
  const formIdentity = normalizeIdentity(form);
  const pokemonIdentity = normalizeIdentity(name);
  if (GENERIC_FORMS.has(formIdentity) || formIdentity === pokemonIdentity) {
    return pokemonName;
  }

  const formName = formatIdentity(form);
  return normalizeIdentity(pokemonName).endsWith(`_${formIdentity}`) ? pokemonName : `${pokemonName} ${formName}`;
};
