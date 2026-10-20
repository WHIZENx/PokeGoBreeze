interface OriginSoundCry {
  cries?: Record<string, string | undefined>;
}

export const getAvailableOriginSoundCries = <T extends OriginSoundCry>(cries: T[]) =>
  cries.filter((cry) => Object.values(cry.cries ?? {}).some((url) => Boolean(url?.trim())));

export const getPokemonGoCryFormLabel = (form: string, path: string) => {
  // Legacy PokeMiners files only expose numeric variant slots. Do not present
  // those slots as a verified form identity when the source does not name one.
  const legacyVariant = path.match(/(?:^|\/)pv\d+_(3\d)$/i)?.[1];
  return legacyVariant
    ? `Variant ${legacyVariant}`
    : form
        .split('_')
        .filter(Boolean)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
        .join(' ');
};
